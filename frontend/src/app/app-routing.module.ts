import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BudgetComponent }      from './budget/budget/budget.component';

const routes: Routes = [
  { path: '', component: BudgetComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
