import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { Resource } from "../types/content";

export interface ResourceFilterValues {
  branch: string;
  year: string;
  semester: number | "";
  pattern: string;
  type: "book" | "notes" | "video" | "decodes" | "other" | "";
  subjectName: string;
  searchString: string;
}

export interface QuickFilter {
  id: string;
  values: ResourceFilterValues;
}

class ResourcesService {
  async getResources() {
    const resourcesRef = collection(db, "resources");
    const q = query(resourcesRef, orderBy("uploadedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Resource[];
  }

  async getQuickFilters(userId: string) {
    const q = query(
      collection(db, "resourceQuickFilters"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      values: {
        branch: d.data().branch,
        year: d.data().year,
        pattern: d.data().pattern,
        type: d.data().type,
        subjectName: d.data().subjectName,
      },
    })) as QuickFilter[];
  }

  async saveQuickFilter(
    filterData: Omit<QuickFilter["values"], "id"> & { userId: string }
  ) {
    return await addDoc(collection(db, "resourceQuickFilters"), filterData);
  }

  async deleteQuickFilter(filterId: string) {
    return await deleteDoc(doc(db, "resourceQuickFilters", filterId));
  }

  filterResources(resources: Resource[], filters: ResourceFilterValues) {
    let filtered = [...resources];

    if (filters.searchString) {
      filtered = filtered.filter((resource) => {
        const targetString =
          `${resource.title} ${resource.subjectName} ${resource.subjectCode} ${resource.branch} ${resource.year} ${resource.semester} ${resource.pattern} ${resource.type}`.toLowerCase();
        return targetString.includes(filters.searchString.toLowerCase());
      });
    }

    if (filters.branch) {
      filtered = filtered.filter(
        (resource) => resource.branch === filters.branch
      );
    }

    if (filters.year) {
      filtered = filtered.filter((resource) => resource.year === filters.year);
    }

    if (filters.semester) {
      filtered = filtered.filter(
        (resource) => resource.semester == filters.semester
      );
    }

    if (filters.pattern) {
      filtered = filtered.filter(
        (resource) => resource.pattern === filters.pattern
      );
    }

    if (filters.type) {
      filtered = filtered.filter((resource) => resource.type == filters.type);
    }

    if (filters.subjectName) {
      filtered = filtered.filter((resource) =>
        resource.subjectName
          .toLowerCase()
          .includes(filters.subjectName.toLowerCase())
      );
    }

    return filtered;
  }

  getAvailableSubjects(
    resources: Resource[],
    filters: Partial<ResourceFilterValues>
  ) {
    let list = resources;
    if (filters.branch) list = list.filter((r) => r.branch === filters.branch);
    if (filters.branch !== "FE" && filters.year)
      list = list.filter((r) => r.year === filters.year);
    if (filters.pattern)
      list = list.filter((r) => r.pattern === filters.pattern);
    if (filters.type)
      list = list.filter(
        (r) => r.type.toLowerCase() === filters.type?.toLowerCase()
      );

    const subjects = list.map((r) => ({
      name: r.subjectName,
      code: r.subjectCode,
    }));
    return Array.from(new Set(subjects.map((s) => JSON.stringify(s)))).map(
      (s) => JSON.parse(s)
    );
  }
}

export const resourcesService = new ResourcesService();
