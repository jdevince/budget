import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomepageComponent }   from './homepage/homepage.component';
import { BudgetComponent }      from './budget/budget/budget.component';
import { LoginComponent }  from './user/login.component';
import { SignUpComponent }  from './user/signup.component';

const routes: Routes = [
  { path: '',  component: HomepageComponent },
  { path: 'budget', component: BudgetComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
