import { User } from 'src/app/_models/User';
import { take } from 'rxjs/operators';
import { AccountService } from './../_services/account.service';
import { Directive, TemplateRef, ViewContainerRef, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string[];
  user: User;

  constructor(private viewContianerRef: ViewContainerRef, private templateRef: TemplateRef<any>, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user;
    })
  }

  ngOnInit(): void {
    if (!this.user?.roles || this.user === null) {
      this.viewContianerRef.clear();
      return;
    }

    if (this.user?.roles.some(r => this.appHasRole.includes(r))) {
      this.viewContianerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContianerRef.clear();
    }
  }

}
