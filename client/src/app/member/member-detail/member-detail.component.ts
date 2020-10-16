import { AccountService } from './../../_services/account.service';
import { MessageService } from './../../_services/message.service';
import { MembersService } from './../../_services/members.service';
import { Member } from 'src/app/_models/Member';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NgxGalleryAnimation,
  NgxGalleryImage,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Message } from 'src/app/_models/Message';
import { Pagination } from 'src/app/_models/Pagination';
import { User } from 'src/app/_models/User';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs', { static: true }) memberTabs: TabsetComponent;
  member: Member;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  messages: Message[] = [];
  activeTab: TabDirective;
  messageTabId = 3;
  user: User;


  constructor(
    private memberService: MembersService,
    private router: ActivatedRoute,
    private messageService: MessageService,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => this.user = user);
  }

  ngOnInit() {
    this.router.data.subscribe(data => {
      this.member = data.member;
    })

    this.router.queryParams.subscribe(params => {
      params.tab ? this.selectTab(params.tab) : this.selectTab(0);
    })

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 80,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false,
      },
    ];

    this.galleryImages = this.getImages();
  }

  getImages(): NgxGalleryImage[] {
    const imageUrls = [];
    for (const photo of this.member.photos) {
      imageUrls.push({
        small: photo.url,
        medium: photo.url,
        large: photo.url,
      });
    }
    return imageUrls;
  }


  loadMessageThread() {
    this.messageService.getMessageThread(this.member.userName).subscribe(response => {
      this.messages = response;
    });
  }

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
  }

  OnTabActivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading == 'Messages' && this.messages.length == 0) {
      this.loadMessageThread();
    }
  }

}
