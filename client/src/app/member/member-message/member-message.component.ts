import { NgForm } from '@angular/forms';
import { AccountService } from './../../_services/account.service';
import { MessageService } from './../../_services/message.service';
import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Pagination } from 'src/app/_models/Pagination';
import { Message } from 'src/app/_models/Message';
import { User } from 'src/app/_models/User';
import { take } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-member-message',
  templateUrl: './member-message.component.html',
  styleUrls: ['./member-message.component.scss']
})
export class MemberMessageComponent implements OnInit {
  @ViewChild('messageForm') messageForm: NgForm;
  @ViewChild('scrollMe') private scrollContainer: ElementRef;
  @Input() messages: Message[];
  @Input() userName: string;
  content: string;
  loading = false;

  constructor(public messageService: MessageService) { }

  ngOnInit(): void {
    this.scrollToBottom();
  }

  sendMessage() {
    this.loading = true;
    this.messageService.sendMessage(this.userName, this.content).then(() => {
      this.messageForm.reset();
    }).finally(() => this.loading = false);
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight - this.scrollContainer.nativeElement.clientHeight;
    }
  }

}
