import { IGroup } from "./i-group";
import { IUser } from "./i-user";

export interface IGroupMember {
  id: string;
  userId: string;
  groupId: string;
  user: IUser;
  group: IGroup;
}
