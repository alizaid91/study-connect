import { db } from '../config/firebase';
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
} from 'firebase/firestore';
import { ChatSession, ChatMessage } from '../types/chat';
import { authService } from './authService';
import { setStreamedResponse, addMessage } from '../store/slices/chatSlice';
import { store } from '../store';
import { UserProfile } from '../types/user';

const AI_URL = import.meta.env.VITE_AI_SERVICE_URL;

export const chatService = {
  async sendMessage(userId: string, sessionId: string, content: string): Promise<void> {

    try {
      // Add user message to Firestore
      const messageRef = collection(db, `chatSessions/${sessionId}/messages`);
      const userMessage = {
        sessionId,
        sender: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      await addDoc(messageRef, userMessage);

      const tempAIMessage: ChatMessage = {
        id: 'ai-streaming',
        sessionId,
        sender: 'ai',
        content: '',
        timestamp: new Date().toISOString(),
      };
      store.dispatch(addMessage({ sessionId, message: tempAIMessage }));
      
      // Send to AI server
      const response = await fetch(`${AI_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: content }),
      });
      if (!response.ok) {
        throw new Error(`AI service responded with status ${response.status}`);
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      try {
        while (true) {
          const { done, value } = await reader?.read() || {};

          if (done || !value || value.length === 0) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;

          store.dispatch(setStreamedResponse({ sessionId, chunk }));
        }
      } catch (err) {
        console.error("❌ Stream error:", err);
      }

      const aiMessage = {
        sessionId,
        sender: 'ai',
        content: fullText,
        timestamp: new Date().toISOString(),
      };
      await addDoc(messageRef, aiMessage);
      authService.updateUserProfile(userId, await authService.getUserProfile(userId).then(profile => ({
        ...profile,
        aiPromptUsage: {
          date: profile?.aiPromptUsage?.date || new Date().toLocaleDateString('en-GB'),
          count: (profile?.aiPromptUsage?.count || 0) + 1,
        },
      } as UserProfile)));
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw new Error('Failed to get response from AI service');
    }
  },

  async sendMessageToDappier(userId: string, sessionId: string, content: string): Promise<void> {
    // Add user message to Firestore
    const messageRef = collection(db, `chatSessions/${sessionId}/messages`);
    const userMessage = {
      sessionId,
      sender: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    await addDoc(messageRef, userMessage);

    // Send to AI server
    try {
      const tempAIMessage: ChatMessage = {
        id: 'ai-streaming',
        sessionId,
        sender: 'ai',
        content: '',
        timestamp: new Date().toISOString(),
      };
      store.dispatch(addMessage({ sessionId, message: tempAIMessage }));

      const options = {
        method: 'POST',
        headers: { Authorization: 'Bearer ak_01jyyb9jmjf77r4x49ghd63m58', 'Content-Type': 'application/json' },
        body: `{"query":"${content}"}`
      };

      const response = await fetch('https://api.dappier.com/app/aimodel/am_01jyy98ycrezy9zrzbsdv57jgd', options);
      const data = await response.json();
      let fullText = data.message;

      const aiMessage = {
        sessionId,
        sender: 'ai',
        content: fullText,
        timestamp: new Date().toISOString(),
      };
      await addDoc(messageRef, aiMessage);
      authService.updateUserProfile(userId, await authService.getUserProfile(userId).then(profile => ({
        ...profile,
        aiPromptUsage: {
          date: profile?.aiPromptUsage?.date || new Date().toLocaleDateString('en-GB'),
          count: (profile?.aiPromptUsage?.count || 0) + 1,
        },
      }) as UserProfile));
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw new Error('Failed to get response from AI service');
    }
  },

  async createSession(userId: string, title: string): Promise<string> {
    const sessionRef = collection(db, 'chatSessions');
    const session = {
      userId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(sessionRef, session);
    return docRef.id;
  },

  async listenToSessions(userId: string, onChange: (sessions: ChatSession[]) => void) {
    const q = query(
      collection(db, 'chatSessions'),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((session: any) => session.userId === userId) as ChatSession[];
      onChange(sessions);
    });
  },

  async listenToMessages(sessionId: string, onChange: (messages: ChatMessage[]) => void) {
    const q = query(collection(db, `chatSessions/${sessionId}/messages`), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatMessage[];
      onChange(messages);
    });
  },

  async renameSession(sessionId: string, newTitle: string): Promise<void> {
    const sessionRef = doc(db, 'chatSessions', sessionId);
    await updateDoc(sessionRef, {
      title: newTitle,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteSession(sessionId: string): Promise<void> {
    // Delete all messages in the session
    const messagesRef = collection(db, `chatSessions/${sessionId}/messages`);
    const messagesSnapshot = await getDocs(messagesRef);
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete the session document
    const sessionRef = doc(db, 'chatSessions', sessionId);
    await deleteDoc(sessionRef);
  },
}; 