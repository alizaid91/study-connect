import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { setError } from "../store/slices/authSlice";
import { db } from "../config/firebase";
import { Paper, Resource } from "../types/content";
import { setPapers } from "../store/slices/papersSlice";
import { setResources } from "../store/slices/resourceSlice";

export const adminService = {
    async deletePapaper(paperId: string, papers: Paper[]) {
        try {
            await deleteDoc(doc(db, 'papers', paperId));
            setPapers(papers.filter((paper: Paper) => paper.id !== paperId));
        } catch (err) {
            setError('Failed to delete paper');
            console.error('Error deleting paper:', err);
        }
    },

    async deleteResource(resourceId: string, resources: Resource[]) {
        try {
            await deleteDoc(doc(db, 'resources', resourceId));
            setResources(resources.filter((resource: Resource) => resource.id !== resourceId));
        } catch (err) {
            setError('Failed to delete resource');
            console.error('Error deleting resource:', err);
        }
    },

    async addPaper(paperData: Omit<Paper, 'id'>) {
        return await addDoc(collection(db, 'papers'), paperData);
    },

    async addResource(resourceData: Omit<Resource, 'id'>) {
        return await addDoc(collection(db, 'resources'), resourceData);
    }
}