import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
  onSnapshot,
  deleteField,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { UserProfile, DEFAULT_AVATAR } from "../types/user";
import { setProfile } from "../store/slices/authSlice";
import { store } from "../store/index";
import { apiService } from "./apiService";

export interface AuthFormData {
  fullName?: string;
  email: string;
  username: string;
  password: string;
  confirmPassword?: string;
}

class AuthService {
  async signInWithEmail(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  async signUpWithEmail(
    formData: AuthFormData,
    accountType: "student" | "educator",
    inviteCode?: string
  ) {
    if (formData.password !== formData.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Validate username before creating account
    const usernameValidation = await apiService.validateUsername(formData.username);
    if (!usernameValidation.success) {
      const errorMessage = usernameValidation.errors?.[0]?.message || "Invalid username";
      throw new Error(errorMessage);
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    const user = userCredential.user;

    // Create user profile in Firestore
    const studentProfile: Omit<UserProfile, "uid"> = {
      accountType: accountType,
      role: "free",

      email: formData.email,
      fullName: formData.fullName || "",
      username: usernameValidation.data?.username || formData.username,
      avatarUrl: DEFAULT_AVATAR.male,
      gender: "",

      collegeName: "",
      branch: "",
      year: "",
      semester: 0,
      pattern: "",

      subscriptionProcessing: false,

      quotas: {
        aiCredits: 0,
        taskBoards: 2,
        chatSessions: 2,
        promptsPerDay: 5,
      },

      usage: {
        aiCreditsUsed: 0,
        boardCount: 0,
        chatSessionCount: 0,
        aiPromptUsage: {
          date: new Date().toLocaleDateString("en-GB"),
          count: 0,
        },
      },

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const educatorProfile: Omit<UserProfile, "uid"> = {
      accountType: accountType,
      inviteCode: inviteCode,
      role: "free",

      email: formData.email,
      fullName: formData.fullName || "",
      avatarUrl: DEFAULT_AVATAR.male,
      username: usernameValidation.data?.username || formData.username,
      gender: "",

      collegeName: "",
      branch: "",
      designation: "",
      subjectsHandled: [],
      qualifications: [],

      subscriptionProcessing: false,

      quotas: {
        aiCredits: 0,
        taskBoards: 2,
        chatSessions: 2,
        promptsPerDay: 5,
      },

      usage: {
        aiCreditsUsed: 0,
        boardCount: 0,
        chatSessionCount: 0,
        aiPromptUsage: {
          date: new Date().toLocaleDateString("en-GB"),
          count: 0,
        },
      },

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (accountType === "educator") {
      await setDoc(doc(db, "users", user.uid), educatorProfile);
    } else {
      await setDoc(doc(db, "users", user.uid), studentProfile);
    }
    return userCredential;
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  async signOut() {
    return await signOut(auth);
  }

  async getUserProfile(userId: string) {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  }

  listenUserProfile(userId: string) {
    const userDocRef = doc(db, "users", userId);
    return onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        store.dispatch(setProfile({ ...profile, uid: userId }));
      } else {
        console.warn(`Profile not found for userId: ${userId}`);
      }
    });
  }

  async updateUserProfile(userId: string, profileData: UserProfile) {
    const updatedProfile = {
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
    updateDoc(doc(db, "users", userId), updatedProfile);
  }

  async updateUserPassword(
    email: string,
    oldPassword: string,
    newPassword: string
  ) {
    if (!auth.currentUser) {
      throw new Error("No authenticated user.");
    }
    const credential = EmailAuthProvider.credential(email, oldPassword);
    try {
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        throw new Error("Old password is incorrect.");
      }
      if (error.code === "auth/weak-password") {
        throw new Error("New password is too weak.");
      }
      throw new Error(error.message || "Failed to update password.");
    }
  }

  async sendPasswordResetEmail(email: string) {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send password reset email.");
    }
  }

  async handleSubscribe(userId: string, email: string, fullName: string) {
    const { subscriptionId, razorpayKey } =
      await apiService.getSubscriptionDetails(userId);

    const options = {
      key: razorpayKey,
      subscription_id: subscriptionId,
      name: "Study Connect",
      description: "Premium Plan",
      handler: function () {
        alert("Payment success! You will be upgraded shortly.");
      },
      prefill: {
        email: email,
        name: fullName,
      },
      notes: {
        userId: userId,
      },
      theme: {
        color: "#6366f1",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  async addFieldToCollection(
    collectionName: string,
    newFieldName: string,
    defaultValue: any
  ) {
    const colRef = collection(db, collectionName);

    try {
      const querySnapshot = await getDocs(colRef);

      const updatePromises = querySnapshot.docs.map(async (document) => {
        const docRef = doc(db, collectionName, document.id);
        await updateDoc(docRef, {
          [newFieldName]: defaultValue,
        });
      });

      await Promise.all(updatePromises);
      console.log(
        `Field '${newFieldName}' added to all documents in collection '${collectionName}'.`
      );
    } catch (error) {
      console.error("Error adding field to collection:", error);
    }
  }

  async migrateUserProfiles() {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    for (const docSnap of snapshot.docs) {
      const userData = docSnap.data();
      const uid = docSnap.id;

      // Assign quotas based on role
      const defaultQuotas =
        userData.role === "premium"
          ? {
              aiCredits: 0,
              taskBoards: 5,
              chatSessions: 10,
              promptsPerDay: 50,
            }
          : {
              aiCredits: 0,
              taskBoards: 2,
              chatSessions: 2,
              promptsPerDay: 5,
            };

      // Migrate existing fields into `usage`
      const usage = {
        aiCreditsUsed: 0,
        aiPromptUsage: {
          date: new Date().toLocaleDateString("en-GB"),
          count: userData.usage.aiPromptUsage.count.count || 0,
        },
        boardCount: userData.boardCount || 0,
        chatSessionCount: userData.chatSessionCount || 0,
      };

      // Prepare update payload
      const updates: any = {
        accountType: userData.accountType || "student",
        updatedAt: new Date().toISOString(),
      };

      // // Optional: remove old flat fields
      // const fieldsToRemove = [
      //   "aiPromptUsage",
      // ];

      // for (const field of fieldsToRemove) {
      //   if (userData.hasOwnProperty(field)) {
      //     updates[field] = deleteField(); // Mark for deletion
      //   }
      // }

      try {
        await updateDoc(doc(db, "users", uid), updates);
        console.log(`✅ Updated user: ${uid}`);
      } catch (err) {
        console.error(`❌ Failed to update user: ${uid}`, err);
      }
    }
  }

  async deleteDocsFromCollection(collectionName: string) {
    const colRef = collection(db, collectionName);
    const querySnapshot = await getDocs(query(colRef));

    const deletePromises = querySnapshot.docs.map((docSnap) => {
      return deleteDoc(doc(db, collectionName, docSnap.id));
    });

    await Promise.all(deletePromises);
    console.log(`Deleted documents from ${collectionName}`);
  }
}

export const authService = new AuthService();
