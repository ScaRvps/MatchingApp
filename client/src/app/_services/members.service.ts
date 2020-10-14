import { AccountService } from './account.service';
import { UserParams } from './../_models/UserParams';
import { PaginatedResult } from './../_models/Pagination';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { Member } from '../_models/Member';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { User } from '../_models/User';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[];
  memberCache = new Map();
  user: User;
  userParams: UserParams;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user;
      this.userParams = new UserParams(user);
    });
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  resetUserParams() {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams) {
    let key = Object.values(userParams).join('-');
    const response = this.memberCache.get(key);
    if (response) return of(response);

    let params = new HttpParams();

    params = this.getPaginationHeaderParams(userParams.pageNumber, userParams.pageSize);
    params = params.append("minAge", userParams.minAge.toString());
    params = params.append("maxAge", userParams.maxAge.toString());
    params = params.append("gender", userParams.gender);
    params = params.append("orderBy", userParams.orderBy);

    return this.getPaginatedResults<Member[]>(this.baseUrl + 'users', params).pipe(
      map(response => {
        this.memberCache.set(key, response);
        return response;
      })
    )
  }

  addLike(username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  likedMembers(predicate: string, pageNumber, pageSize) {
    let params = this.getPaginationHeaderParams(pageNumber, pageSize);
    params = params.append("predicate", predicate);
    return this.getPaginatedResults<Partial<Member[]>>(this.baseUrl + 'likes', params);
  }

  getMember(username: string) {
    const member = [...this.memberCache.values()].reduce((arr, elem) => arr.concat(elem.result), []).find((member: Member) => member.userName === username);
    if (member) return of(member);
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    )
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  private getPaginationHeaderParams(pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append("pageNumber", pageNumber.toString());
    params = params.append("pageSize", pageSize.toString());

    return params;
  }

  private getPaginatedResults<T>(url: string, params: HttpParams) {
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();
    return this.http.get<T>(url, { observe: 'response', params }).pipe(
      map(response => {
        paginatedResult.result = response.body;
        if (response.headers.get("Pagination") !== null) {
          paginatedResult.pagination = JSON.parse(response.headers.get("Pagination"));
        }
        return paginatedResult;
      })
    );
  }

}
