import { Injectable } from "@angular/core";
import Socket = SocketIOClient.Socket;
import { MessageModel, NewMessageModel } from "../pages/models/chat.model";
import * as io from "socket.io-client";
import { environment } from "../../environments/environment";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public socket: Socket;        // contains id of logged in user
  public userId: string = null;      // contains id if logged in user

  constructor() {
    this.userId = localStorage.getItem('id');
  }

  private messageSubject = new BehaviorSubject<MessageModel>(null);      // contains user's new incoming messages
  public message$ = this.messageSubject.asObservable();

  // connects to socket
  public establishSocketConnection(): void {
    this.socket = io.connect(environment.API_ENDPOINT);
    this.socket.on('connect', () => {
      console.log('SOCKET CONNECTED');
      this.listenToIncomingMessages();
    });
    this.socket.on('disconnect', () => {
      console.log('SOCKET DISCONNECTED');
    });
  }

  // listens to incoming messages
  public listenToIncomingMessages(): void {
    this.userId = localStorage.getItem('id');
    this.socket.on(`message-user-${this.userId}`, (data) => {
      this.messageSubject.next(data);
    })
  }

  // send's message to the store
  public sendMessageToTheStore(messageData: NewMessageModel): void {
    this.socket.emit('message-user-to-store', messageData);
  }
}
