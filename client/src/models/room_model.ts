import { MessageModel } from "./message_model";
import { UserModel } from "./user_model";

export interface RoomModel {
  id?: string;
  name?: string;
  userList?: UserModel[] | string[];
  adminID?: string;
  messageList?: MessageModel[]
}