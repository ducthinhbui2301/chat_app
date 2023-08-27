import { ObjectId } from "mongodb";
import { RoomModel } from "./room_model";

export interface UserModel {
  id?: string;
  email?: string;
  name?: string;
  password?: string;
  roomList?: RoomModel[] | string[] | ObjectId[];
  roomInvitedList?: RoomModel[] | string[] | ObjectId[];
  avatar_url?: string;
}