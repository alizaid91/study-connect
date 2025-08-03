import { db } from "../config/firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import { ChatSession, ChatMessage } from "../types/chat";
import {
  addMessage,
  setLoadingAi,
  updateMessageContent,
} from "../store/slices/chatSlice";
import { store } from "../store";
import { UserProfile } from "../types/user";
import { apiService } from "./apiService";

// Utility to generate safe unique IDs
const generateId = (prefix: string = "msg") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const chatService = {
  async sendMessage(
    userId: string,
    sessionId: string,
    content: string
  ): Promise<void> {
    const userMessageId = generateId("user");
    const aiMessageId = generateId("ai");

    // === Step 1: Add temporary user message to UI ===
    // console.log("Adding temporary user message to UI");
    const tempUserMessage: ChatMessage = {
      id: userMessageId,
      sessionId,
      sender: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    store.dispatch(addMessage({ sessionId, message: tempUserMessage }));

    // === Step 2: Add temporary AI message to UI (empty content, will stream) ===
    const tempAIMessage: ChatMessage = {
      id: aiMessageId,
      sessionId,
      sender: "ai",
      content: "",
      timestamp: new Date().toISOString(),
    };
    store.dispatch(addMessage({ sessionId, message: tempAIMessage }));

    // === Step 3: Send to AI Server with timeout ===
    const { reader, decoder } = await apiService.askAI(content);

    let fullText = "";
    let chunkCount = 0;
    while (true) {
      chunkCount++;
      const { done, value } = await reader.read();
      if (done || !value) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      // console.log(`Chunk ${chunkCount}:`, chunk);

      store.dispatch(
        updateMessageContent({
          sessionId,
          id: aiMessageId,
          chunk,
        })
      );
    }
    store.dispatch(setLoadingAi(false));

    // === Step 4: Batch Firestore write of user message ===
    // console.log("Writing user message to Firestore");
    const messageRef = collection(db, `chatSessions/${sessionId}/messages`);
    const batch = writeBatch(db);
    const userDocRef = doc(messageRef);
    batch.set(userDocRef, tempUserMessage);
    await batch.commit();

    // === Step 6: Save final AI message in Firestore ===
    // console.log("Saving final AI message to Firestore");
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      sessionId,
      sender: "ai",
      content: fullText,
      timestamp: new Date().toISOString(),
    };
    const aiDocRef = doc(messageRef);
    await writeBatch(db).set(aiDocRef, aiMessage).commit();

    // === Step 7: Update usage count in transaction ===
    // console.log("Updating AI usage count in transaction");
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", userId);
      const userSnap = await transaction.get(userRef);
      const profile = userSnap.data() as UserProfile;

      const today = new Date().toLocaleDateString("en-GB");
      const currentUsage = profile?.usage?.aiPromptUsage || {
        date: today,
        count: 0,
      };

      const updatedUsage = {
        ...profile.usage,
        aiPromptUsage: {
          date: currentUsage.date === today ? today : today,
          count: currentUsage.date === today ? currentUsage.count + 1 : 1,
        },
      };

      transaction.update(userRef, { usage: updatedUsage });
    });
    // console.log("Message sent successfully");
  },

  async createSession(userId: string, title: string): Promise<string> {
    const sessionRef = collection(db, "chatSessions");
    const session = {
      userId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(sessionRef, session);
    return docRef.id;
  },

  async listenToSessions(
    userId: string,
    onChange: (sessions: ChatSession[]) => void
  ) {
    const q = query(
      collection(db, "chatSessions"),
      orderBy("updatedAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          error: null,
        }))
        .filter((session: any) => session.userId === userId) as ChatSession[];
      onChange(sessions);
    });
  },

  async fetchMessages(sessionId: string): Promise<ChatMessage[]> {
    const messagesQuery = query(
      collection(db, `chatSessions/${sessionId}/messages`),
      orderBy("timestamp", "asc")
    );
    const snapshot = await getDocs(messagesQuery);

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];

    return messages;
  },

  async renameSession(sessionId: string, newTitle: string): Promise<void> {
    const sessionRef = doc(db, "chatSessions", sessionId);
    await updateDoc(sessionRef, {
      title: newTitle,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteSession(sessionId: string): Promise<void> {
    // Delete all messages in the session
    const messagesRef = collection(db, `chatSessions/${sessionId}/messages`);
    const messagesSnapshot = await getDocs(messagesRef);
    const deletePromises = messagesSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);

    // Delete the session document
    const sessionRef = doc(db, "chatSessions", sessionId);
    await deleteDoc(sessionRef);
  },
};
