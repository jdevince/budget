import { Component } from '@angular/core';

import './rxjs-operators';

import { UserService } from './user/user.service';
import { BudgetService } from './budget/budget.service';
import { BudgetServerAPIService } from './budget/budgetServerAPI.service';
import { ConfirmDialogService } from './confirm-dialog/confirm-dialog.service';
import { WindowService } from './window/window.service';

@Component({
  selector: 'budget-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', String('../custom_bootstrap/css/bootstrap.min.css')],
  providers: [UserService, BudgetService, BudgetServerAPIService, ConfirmDialogService, WindowService]
})

export class AppComponent {
  
  constructor(
    private userService: UserService
  ) {} 
   
}
