export interface IUser {
  id: string;
  email: string | null;
  passwordHash: string | null;
  fullName: string;
  avatarUrl: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
