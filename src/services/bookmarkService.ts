import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Bookmark } from '../types/content';

class BookmarkService {
    async getBookmarks(userId: string) {
        const bookmarksRef = collection(db, 'bookmarks');
        const q = query(bookmarksRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Bookmark[];
    }

    async addBookmark(bookmark: Omit<Bookmark, 'id'>) {
        const docRef = await addDoc(collection(db, 'bookmarks'), bookmark);
        return { id: docRef.id, ...bookmark };
    }

    async removeBookmark(bookmarkId: string) {
        await deleteDoc(doc(db, 'bookmarks', bookmarkId));
        return bookmarkId;
    }

    async toggleBookmark(userId: string, contentId: string, type: 'Paper' | 'Resource', bookmarkData: Omit<Bookmark, 'id' | 'userId' | 'contentId' | 'type'>) {
        const bookmarksRef = collection(db, 'bookmarks');
        const q = query(bookmarksRef, 
            where('userId', '==', userId),
            where('contentId', '==', contentId),
            where('type', '==', type)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const bookmarkDoc = querySnapshot.docs[0];
            await this.removeBookmark(bookmarkDoc.id);
            return null;
        } else {
            return await this.addBookmark({
                userId,
                contentId,
                type,
                ...bookmarkData
            });
        }
    }
}

export const bookmarkService = new BookmarkService(); 