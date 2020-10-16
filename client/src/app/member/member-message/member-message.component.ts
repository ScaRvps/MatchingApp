import { NgForm } from '@angular/forms';
import { AccountService } from './../../_services/account.service';
import { MessageService } from './../../_services/message.service';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Pagination } from 'src/app/_models/Pagination';
import { Message } from 'src/app/_models/Message';
import { User } from 'src/app/_models/User';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-member-message',
  templateUrl: './member-message.component.html',
  styleUrls: ['./member-message.component.scss']
})
export class MemberMessageComponent implements OnInit {
  @ViewChild('messageForm') messageForm: NgForm;
  @Input() messages: Message[];
  @Input() userName: string;
  content: string;

  constructor(private messageService: MessageService) {
  }

  ngOnInit(): void {
  }

  sendMessage() {
    this.messageService.sendMessage(this.userName, this.content).subscribe(message => {
      this.messages.push(message);
      this.messageForm.reset();
    })
  }

}
