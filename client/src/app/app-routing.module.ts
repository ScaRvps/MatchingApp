import { AdminGuard } from './_guards/admin.guard';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { MemberDetailedResolver } from './_resolvers/member-detailed.resolver';
import { PreventUnsavedChangesGuard } from './_guards/prevent-unsaved-changes.guard';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { AuthGuard } from './_guards/auth.guard';
import { MessageComponent } from './message/message.component';
import { ListComponent } from './list/list.component';
import { MemberListComponent } from './member/member-list/member-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MemberDetailComponent } from './member/member-detail/member-detail.component';
import { MemberEditComponent } from './member/member-edit/member-edit.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    children: [
      { path: 'members', component: MemberListComponent },
      { path: 'members/:username', component: MemberDetailComponent, resolve: { member: MemberDetailedResolver } },
      {
        path: 'member/edit',
        component: MemberEditComponent,
        canDeactivate: [PreventUnsavedChangesGuard],
      },
      { path: 'list', component: ListComponent },
      { path: 'messages', component: MessageComponent },
      { path: 'admin', component: AdminPanelComponent, canActivate: [AdminGuard] },
    ],
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
