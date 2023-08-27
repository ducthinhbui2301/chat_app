import { ObjectId } from "mongodb";
import { UserModel } from "./user_model";

export interface RoomModel {
  id?: string;
  name?: string;
  userList?: UserModel[] | string[] | ObjectId[];
  adminID?: string | ObjectId;
}