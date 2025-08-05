export interface Paper {
  id: string;
  subjectId: string;
  subjectName: string;
  branch: 'FE' | 'CS' | 'IT' | 'Civil' | 'Mechanical';
  year?: 'SE' | 'TE' | 'BE';
  semester: number;
  pattern: '2019' | '2024';
  paperType: 'Insem' | 'Endsem';
  paperName: string;
  resourceId: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'book' | 'notes' | 'video' | 'decodes' | 'other';
  subjectCode: string;
  subjectName: string;
  branch: 'FE' | 'CS' | 'IT' | 'Civil' | 'Mechanical';
  year: 'SE' | 'TE' | 'BE' | '';
  semester: number;
  pattern: '2019' | '2024';
  resourceId: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  contentId: string;
  type: 'Paper' | 'Resource';
  paperType: 'Insem' | 'Endsem' | null;
  resourceType: 'book' | 'notes' | 'video' | 'decodes' | 'other' | null;
  title: string;
  name: string;
  description: string;
  resourceId: string;
  createdAt: string;
}

export type Priority = 'low' | 'medium' | 'high';

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