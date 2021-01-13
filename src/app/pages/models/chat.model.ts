export interface MessageModel {
  message: string;
  sentBy: string;
  updatedAt: string;
  userId: string;
  _id?: string;
}

export interface NewMessageModel {
  userId: string;
  userName: string;
  message: string;
  sentBy: string;
}
