import { ObjectId } from "mongodb";
import { UserModel } from "./user_model";

export interface MessageModel {
  id?: string;
  content?: string;
  file?: Uint8Array[];
  fileName?: string;
  senderId?: string | ObjectId;
  readerList?: UserModel[] | string[] | ObjectId[];
  likeList?: UserModel[] | string[] | ObjectId[];
  heartList?: UserModel[] | string[] | ObjectId[];
  createAt?: number;
  isRemoved?: boolean;
  replyToMessage?: string | ObjectId;
  roomId?: string | ObjectId;
}