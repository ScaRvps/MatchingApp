import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { error } from 'protractor';
import { User } from 'src/app/_models/User';
import { ToastrService } from 'ngx-toastr';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();


  constructor(private toastr: ToastrService, private router: Router) { }

  createConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build()

    this.hubConnection
      .start()
      .catch(error => console.log(error))

    this.hubConnection.on("UserIsOnline", username => {
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        this.onlineUsersSource.next([...usernames, username]);
      })
    })

    this.hubConnection.on("UserIsOffline", username => {
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        this.onlineUsersSource.next([...usernames.filter(x => x != username)]);
      })
    })

    this.hubConnection.on("GetUsersOnline", (userNames: string[]) => {
      this.onlineUsersSource.next(userNames);
    })

    this.hubConnection.on('NewMessageReceived', ({ userName, nickName }) => {
      this.toastr.info(nickName + " has sent you a message!")
        .onTap
        .pipe(take(1))
        .subscribe(() => this.router.navigateByUrl('/members/' + userName + '?tab=3'))
    });
  }

  stopHubConnection() {
    this.hubConnection.stop().catch(error => console.log(error));
  }



}
