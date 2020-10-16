import { Message } from './../_models/Message';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { getPaginatedResults, getPaginationHeaderParams } from './PaginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMessages(pageNumber, pageSize, container) {
    let params = getPaginationHeaderParams(pageNumber, pageSize);
    params = params.append('Container', container);
    return getPaginatedResults<Message[]>(this.baseUrl + 'messages', params, this.http);
  }

  // getMessageThread(userName: string, pageNumber, pageSize) {
  //   let params = getPaginationHeaderParams(pageNumber, pageSize);
  //   return getPaginatedResults<Message[]>(this.baseUrl + 'messages/thread/' + userName, params, this.http);
  // }

  getMessageThread(userName: string) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + userName);
  }

  sendMessage(userName: string, content: string) {
    return this.http.post<Message>(this.baseUrl + 'messages', { recipientUserName: userName, content });
  }

  deleteMessage(id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
