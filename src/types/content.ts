export interface Paper {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  year: string;
  semester: 'Summer' | 'Winter';
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'book' | 'notes' | 'video' | 'other';
  subjectCode: string;
  subjectName: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
} 