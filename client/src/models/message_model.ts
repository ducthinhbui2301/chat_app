import { UserModel } from "./user_model";

export interface MessageModel {
  id?: string;
  content?: string;
  file?: Uint8Array[];
  fileName?: string;
  senderId?: string;
  readerList?: UserModel[] | string[];
  likeList?: UserModel[] | string[];
  heartList?: UserModel[] | string[];
  createAt?: number;
  isRemoved?: boolean;
  replyToMessage?: string;
  roomId?: string;
}