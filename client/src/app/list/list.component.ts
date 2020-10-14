import { MembersService } from './../_services/members.service';
import { Component, OnInit } from '@angular/core';
import { Member } from '../_models/Member';
import { Pagination } from '../_models/Pagination';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  members: Partial<Member[]>;
  predicate = 'liked';
  pageNumber = 1;
  pageSize = 5;
  pagination: Pagination;

  constructor(private memberService: MembersService) { }

  ngOnInit(): void {
    this.getLikes();
  }

  getLikes() {
    this.memberService.likedMembers(this.predicate, this.pageNumber, this.pageSize).subscribe(response => {
      this.members = response.result;
      this.pagination = response.pagination;
    })
  }

  pageChanged(event: any) {
    this.pageNumber = event.page;
    this.getLikes();
  }

}
