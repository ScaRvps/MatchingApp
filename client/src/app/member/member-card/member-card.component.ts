import { take } from 'rxjs/operators';
import { PresenceService } from './../../_services/presence.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MembersService } from './../../_services/members.service';
import { Component, Input, OnInit } from '@angular/core';
import { Member } from 'src/app/_models/Member';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss'],
})
export class MemberCardComponent implements OnInit {
  @Input() member: Member;

  constructor(private memberService: MembersService, private toastr: ToastrService, public presenceService: PresenceService) { }

  ngOnInit(): void {
  }

  likeMember(username: string) {
    this.memberService.addLike(username).subscribe(() => {
      this.toastr.success("You have liked " + username);
    })
  }
}
