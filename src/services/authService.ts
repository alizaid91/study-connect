import { auth, db } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    User,
    signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, DEFAULT_AVATAR } from '../types/user';

export interface AuthFormData {
    email: string;
    password: string;
    confirmPassword?: string;
    fullName?: string;
}

class AuthService {
    async signInWithEmail(email: string, password: string) {
        return await signInWithEmailAndPassword(auth, email, password);
    }

    async signUpWithEmail(formData: AuthFormData) {
        if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Create user profile in Firestore
        const userProfile: Omit<UserProfile, 'uid'> = {
            email: formData.email,
            fullName: formData.fullName || '',
            avatarUrl: DEFAULT_AVATAR.male,
            username: '',
            gender: '',
            branch: '',
            year: '',
            collegeName: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
        return userCredential;
    }

    async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user profile exists
        const userDoc = await doc(db, 'users', user.uid);
        const userData = await getDoc(userDoc);

        if (!userData.exists()) {
            // Create user profile for Google sign-in
            const userProfile: Omit<UserProfile, 'uid'> = {
                email: user.email || '',
                fullName: user.displayName || '',
                username: user.email?.split('@')[0] || '',
                avatarUrl: user.photoURL || DEFAULT_AVATAR.male,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'users', user.uid), userProfile);
        }

        return result;
    }

    onAuthStateChange(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, callback);
    }

    async signOut() {
        return await signOut(auth);
    }

    async getUserProfile(userId: string) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }
        return null;
    }

    async updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
        const updatedProfile = {
            ...profileData,
            updatedAt: new Date().toISOString(),
        };
        await updateDoc(doc(db, 'users', userId), updatedProfile);
        return updatedProfile;
    }

    async updateUserAvatar(userId: string, imageUrl: string) {
        const updatedProfile = {
            avatarUrl: imageUrl,
            updatedAt: new Date().toISOString(),
        };
        await updateDoc(doc(db, 'users', userId), updatedProfile);
        return updatedProfile;
    }
}

export const authService = new AuthService(); 