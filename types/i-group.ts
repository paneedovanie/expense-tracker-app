import { IGroupMember } from "./i-group-member";

export interface IGroup {
  id: string;
  name: string;
  description?: string;
  avatarUrl: string;
  createdByUserId: string;
  members: IGroupMember[];
}
