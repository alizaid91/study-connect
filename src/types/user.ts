export interface UserProfile {
  uid: string;

  accountType: "student" | "educator";
  role: "free" | "premium";

  email: string;
  fullName: string;
  username: string;
  gender?: "male" | "female" | "other" | "prefer not to say" | "";
  avatarUrl: string;

  collegeName?: string | "";
  branch?: "FE" | "CS" | "IT" | "Civil" | "Mechanical" | "";
  pattern?: 2019 | 2024 | "";
  semester?: number;
  year?: "SE" | "TE" | "BE" | "";

  inviteCode?: string;
  designation?: string;
  subjectsHandled?: string[];
  qualifications?: string[];

  subscriptionProcessing: boolean;

  quotas: {
    aiCredits: number;
    taskBoards: number;
    chatSessions: number;
    promptsPerDay: number;
  };

  usage: {
    aiCreditsUsed: number;
    boardCount: number;
    chatSessionCount: number;
    aiPromptUsage: {
      date: string;
      count: number;
    };
  };

  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_AVATAR = {
  male: "https://img.freepik.com/premium-vector/cute-boy-smiling-cartoon-kawaii-boy-illustration-boy-avatar-happy-kid_1001605-3447.jpg",
  maleEducator: "https://static.vecteezy.com/system/resources/previews/042/891/253/non_2x/professional-teacher-avatar-illustration-for-education-concept-vector.jpg",
  female:
    "https://static.vecteezy.com/system/resources/previews/004/773/704/non_2x/a-girl-s-face-with-a-beautiful-smile-a-female-avatar-for-a-website-and-social-network-vector.jpg",
  femaleEducator: "https://img.freepik.com/premium-vector/teacher-school-education-illustration-classroom-knowledge-happy-design-concept-student-vec_1013341-213105.jpg?w=1060",
  other:
    "https://img.freepik.com/premium-vector/cute-boy-smiling-cartoon-kawaii-boy-illustration-boy-avatar-happy-kid_1001605-3447.jpg",
  "prefer not to say":
    "https://img.freepik.com/premium-vector/cute-boy-smiling-cartoon-kawaii-boy-illustration-boy-avatar-happy-kid_1001605-3447.jpg",
};
