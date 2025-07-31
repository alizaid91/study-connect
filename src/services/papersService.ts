import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Paper } from "../types/content";
import { CS_SUBJECTS, FE_SUBJECTS, IT_SUBJECTS } from "../types/Subjects";

export interface QuickFilter {
  id: string;
  values: {
    branch: string;
    year: string;
    semester: number;
    pattern: string;
    paperType: string;
    subjectName: string;
    subjectCode: string;
    isReadyMade: boolean;
  };
}

class PapersService {
  async getPapers() {
    const papersSnapshot = await getDocs(collection(db, "papers"));
    return papersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Paper[];
  }

  async getQuickFilters(userId: string) {
    const q = query(
      collection(db, "quickFilters"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      values: {
        branch: d.data().branch,
        year: d.data().year,
        semester: d.data().semester,
        pattern: d.data().pattern,
        paperType: d.data().paperType,
        subjectName: d.data().subjectName,
        subjectCode: d.data().subjectCode,
        isReadyMade: d.data().isReadyMade,
      },
    })) as QuickFilter[];
  }

  async saveQuickFilter(
    filterData: Omit<QuickFilter["values"], "id"> & { userId: string }
  ) {
    return await addDoc(collection(db, "quickFilters"), filterData);
  }

  async saveReadyMadeFilters(filterData: Omit<QuickFilter["values"], "id">) {
    return await addDoc(collection(db, "readyMadeFilters"), filterData);
  }

  createReadymadeFilters(
    branch: string,
    pattern: string,
    year?: string,
    semester?: number
  ) {
    let filters: QuickFilter[] = [];
    if (branch === "FE") {
      filters = FE_SUBJECTS[
        pattern == "2024" ? "2024Pattern" : "2019Pattern"
      ].map((subject) => ({
        id: `rdmad${branch}-${pattern}-${year || ""}-${semester || ""}-${
          subject.code
        }`,
        values: {
          branch,
          year: year || "",
          semester: semester || 1,
          pattern,
          paperType: "Endsem",
          subjectName: subject.name,
          subjectCode: subject.code,
          isReadyMade: true,
        },
      }));
    } else if (branch === "IT") {
      filters = IT_SUBJECTS[pattern == "2024" ? "2024Pattern" : "2019Pattern"][
        year as "SE" | "TE" | "BE"
      ]
        .map((subject) => {
          let Endsem = {
            id: `endrdmad${branch}-${pattern}-${year || ""}-${semester || ""}-${
              subject.code
            }`,
            values: {
              branch,
              year: year || "",
              semester: subject.semester,
              pattern,
              paperType: "Endsem",
              subjectName: subject.name,
              subjectCode: subject.code,
              isReadyMade: true,
            },
          };
          let Insem = {
            id: `inrdmad${branch}-${pattern}-${year || ""}-${semester || ""}-${
              subject.code
            }`,
            values: {
              branch,
              year: year || "",
              semester: subject.semester,
              pattern,
              paperType: "Insem",
              subjectName: subject.name,
              subjectCode: subject.code,
              isReadyMade: true,
            },
          };
          return [Endsem, Insem];
        })
        .flat()
        .filter((f) => f.values.semester == semester);
    }else if (branch === "CS") {
      filters = CS_SUBJECTS[pattern == "2024" ? "2024Pattern" : "2019Pattern"][
        year as "SE" | "TE" | "BE"
      ]
        .map((subject) => {
          let Endsem = {
            id: `endrdmad${branch}-${pattern}-${year || ""}-${semester || ""}-${
              subject.code
            }`,
            values: {
              branch,
              year: year || "",
              semester: subject.semester,
              pattern,
              paperType: "Endsem",
              subjectName: subject.name,
              subjectCode: subject.code,
              isReadyMade: true,
            },
          };
          let Insem = {
            id: `inrdmad${branch}-${pattern}-${year || ""}-${semester || ""}-${
              subject.code
            }`,
            values: {
              branch,
              year: year || "",
              semester: subject.semester,
              pattern,
              paperType: "Insem",
              subjectName: subject.name,
              subjectCode: subject.code,
              isReadyMade: true,
            },
          };
          return [Endsem, Insem];
        })
        .flat()
        .filter((f) => f.values.semester == semester);
    }
    return filters;
  }

  async deleteQuickFilter(filterId: string) {
    return await deleteDoc(doc(db, "quickFilters", filterId));
  }

  filterPapers(papers: Paper[], filters: QuickFilter["values"]) {
    let filtered = [...papers];

    if (filters.branch) {
      filtered = filtered.filter((paper) => paper.branch === filters.branch);
    }

    if (filters.year) {
      filtered = filtered.filter((paper) => paper.year === filters.year);
    }

    if (filters.semester) {
      filtered = filtered.filter(
        (paper) => paper.semester === filters.semester
      );
    }

    if (filters.pattern) {
      filtered = filtered.filter((paper) => paper.pattern === filters.pattern);
    }

    if (filters.paperType) {
      filtered = filtered.filter(
        (paper) => paper.paperType === filters.paperType
      );
    }

    if (filters.subjectName) {
      filtered = filtered.filter(
        (paper) => paper.subjectName === filters.subjectName
      );
    }

    return filtered;
  }

  getAvailableSubjects(
    papers: Paper[],
    filters: Partial<QuickFilter["values"]>
  ) {
    const subjects = papers
      .filter(
        (paper) =>
          (!filters.branch || paper.branch === filters.branch) &&
          (!filters.year || paper.year === filters.year) &&
          (!filters.semester || paper.semester === filters.semester)
      )
      .map((paper) => ({
        name: paper.subjectName,
        code: paper.subjectId,
      }));

    return Array.from(new Set(subjects.map((s) => JSON.stringify(s)))).map(
      (s) => JSON.parse(s)
    );
  }
}

export const papersService = new PapersService();
