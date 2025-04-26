export interface Paper {
  id: string;
  subjectId: string;
  subjectName: string;
  branch: 'FE' | 'CS' | 'IT' | 'Civil' | 'Mechanical';
  year: 'FE' | 'SE' | 'TE' | 'BE';
  pattern: '2019' | '2024';
  paperType: 'Insem' | 'Endsem';
  paperName: string;
  driveLink: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'Book' | 'Notes' | 'Video' | 'Decodes' | 'Other';
  subjectCode: string;
  subjectName: string;
  branch: 'FE' | 'CS' | 'IT' | 'Civil' | 'Mechanical';
  year: 'FE' | 'SE' | 'TE' | 'BE';
  pattern: '2019' | '2024';
  driveLink: string;
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
  resourceType: 'Book' | 'Notes' | 'Video' | 'Decodes' | 'Other' | null;
  title: string;
  name: string;
  description: string;
  link: string;
  createdAt: string;
} 