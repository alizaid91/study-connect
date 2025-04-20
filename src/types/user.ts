export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  gender: 'male' | 'female' | 'other' | 'prefer not to say';
  branch: 'FE' | 'CS' | 'IT' | 'Civil' | 'Mechanical';
  year: 'FE' | 'SE' | 'TE' | 'BE';
  collegeName: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_AVATAR = {
  male: 'https://img.freepik.com/premium-vector/cute-boy-smiling-cartoon-kawaii-boy-illustration-boy-avatar-happy-kid_1001605-3447.jpg',
  female: 'https://static.vecteezy.com/system/resources/previews/004/773/704/non_2x/a-girl-s-face-with-a-beautiful-smile-a-female-avatar-for-a-website-and-social-network-vector.jpg',
  other: 'https://img.freepik.com/premium-vector/cute-boy-smiling-cartoon-kawaii-boy-illustration-boy-avatar-happy-kid_1001605-3447.jpg',
  'prefer not to say': 'https://img.freepik.com/premium-vector/cute-boy-smiling-cartoon-kawaii-boy-illustration-boy-avatar-happy-kid_1001605-3447.jpg'
}; 