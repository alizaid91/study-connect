export interface Paper {
  id: string;

  paperType: "Insem" | "Endsem";
  branch: "FE" | "CS" | "IT" | "Civil" | "Mechanical";
  pattern: "2019" | "2024";
  year?: "SE" | "TE" | "BE";
  semester: number;
  subjectName: string;
  subjectId: string;

  paperName: string;

  paperDOKey: string;

  metadata: {
    pages: number;
    size: number;
    type: string;
  };

  uploadedBy: string;

  uploadedAt: string;
}

export interface Resource {
  id: string;

  type: "book" | "notes" | "video" | "decodes" | "other";
  branch: "FE" | "CS" | "IT" | "Civil" | "Mechanical";
  pattern: "2019" | "2024";
  year: "SE" | "TE" | "BE" | "";
  semester: number;
  subjectName: string;
  subjectCode: string;

  title: string;
  description: string;

  resourceDOKey: string;

  metadata: {
    pages: number;
    size: number;
    type: string;
  };

  uploadedBy: string;

  uploadedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Bookmark {
  id: string;
  userId: string;

  contentId: string; //specific paper or study-resource id

  type: "Paper" | "Resource";
  paperType: "Insem" | "Endsem" | null;
  resourceType: "book" | "notes" | "video" | "decodes" | "other" | null;

  title: string;
  name: string;
  description: string;

  resourceDOKey: string;

  metadata: {
    pages: number;
    size: number;
    type: string;
  };

  createdAt: string;
}

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  listId: string;
  boardId: string;
  priority: Priority;
  dueDate?: string;
  userId: string;
  position: number;
  attachments?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  title: string;
  boardId: string;
  userId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  title: string;
  userId: string;
  isDefault: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskForm {
  title: string;
  description?: string;
  listId: string;
  boardId: string;
  priority: Priority;
  dueDate?: string;
  position?: number;
  attachments?: string;
  completed?: boolean;
}

export interface ListForm {
  title: string;
  boardId: string;
  position?: number;
}
