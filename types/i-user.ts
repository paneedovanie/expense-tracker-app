export interface IUser {
  id: string;
  email: string | null;
  passwordHash: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
