export interface NewRoomEventData {
  roomId?: string;
  roomName?: string;
  userId?: string;
  userName?: string;
}

export interface NewInvitationEventData {
  roomId?: string;
  roomName?: string;
  userId?: string;
  userName?: string;
}

export interface MessageReadEventData {
  senderId?: string;
  roomId?: string;
  message?: string;
}

export interface FileMetadata {
  filename: string,
  total_buffer_size: number,
  buffer_size: number
}
