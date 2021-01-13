import { Component, OnInit } from '@angular/core';
import { MessageModel, NewMessageModel } from '../../models/chat.model';
import { SocketService } from "../../../services/socket.service";
import { HelperService } from "../../../services/helper.service";
import { ProfileService } from "../profile/profile.service";

declare let $: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  public chatData: Array<MessageModel>;   // contains user's current active chat
  private userId: string;     // contains user's id
  public userName: string = null;   // contains user name

  public messageData: NewMessageModel;      // contains chat message information 

  constructor(private socketService: SocketService, private helperService: HelperService, private profileService: ProfileService) {
    this.userId = localStorage.getItem('id');
    this.helperService.user$.subscribe(userInfo => {
      if (userInfo) {
        this.userName = userInfo.firstName;
        this.messageData = this.getDefaultMessageValue();
      }
    })
    this.getChatHistory();
  }

  ngOnInit(): void {
    this.helperService.scrollTop();
    this.socketService.message$.subscribe(message => {
      if (message) {
        this.chatData.push(message);
        this.scrollToBottom();
      }
    })
  }

  // returns default message values
  private getDefaultMessageValue(): NewMessageModel {
    return {
      userId: this.userId,
      message: '',
      sentBy: 'USER',
      userName: this.userName
    };
  }

  // get's chat history
  public getChatHistory(): void {
    this.profileService.getChatHistory().subscribe((res: any) => {
      this.chatData = res.response_data;
      this.scrollToBottom();
    });
  }

  // sends message
  public sendsMessage(): void {
    if (this.messageData.message.length === 0) {
      return;
    }
    this.socketService.sendMessageToTheStore(this.messageData);
    this.chatData.push({
      userId: this.messageData.userId,
      message: this.messageData.message,
      updatedAt: '',
      _id: '',
      sentBy: this.messageData.sentBy
    });
    this.messageData = this.getDefaultMessageValue();
    this.scrollToBottom();
  }

  // automatically scrolls to bottom
  private scrollToBottom() {
    $(document).ready(function () {
      $('#chat-section').animate({
        scrollTop: $('#chat-section').get(0).scrollHeight
      }, 2000);
    });
  }

}
