import { RoomModel } from "./room_model";

export interface UserModel {
  id?: string;
  email?: string;
  name?: string;
  password?: string;
  roomList?: RoomModel[] | string[];
  roomInvitedList?: RoomModel[] | string[];
  avatar_url?: string;
}