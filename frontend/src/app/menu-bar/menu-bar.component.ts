import { Component } from '@angular/core';

import { BudgetService } from './../budget/budget.service';
import { ConfirmDialogService } from './../confirm-dialog/confirm-dialog.service';
import { UserService } from './../user/user.service';

@Component({
  selector: 'menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['../../app/menu-bar/menu-bar.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class MenuBarComponent {
  public ShowSignupForm: boolean;
  public ShowLoginForm: boolean;

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get hasUnsavedChanges(): boolean {
    return this.budgetService.hasUnsavedChanges();
  }

  get tooltip(): string {
    if (this.hasUnsavedChanges) {
      return "There are unsaved changes";
    }
    else {
      return "All changes saved";
    }
  }

  constructor(
    private budgetService: BudgetService,
    private confirmDialogService: ConfirmDialogService,
    private userService: UserService
  ) { }

  toggleSignupForm(): void {
    if (this.ShowSignupForm === true) {
      //Currently open, let's close it
      this.ShowSignupForm = false;
    }
    else {
      //Currently closed, let's open it. Be sure login is closed.
      this.ShowLoginForm = false;
      this.ShowSignupForm = true;
    }
  }

  toggleLoginForm(): void {
    if (this.ShowLoginForm === true) {
      //Currently open, let's close it
      this.ShowLoginForm = false;
    }
    else {
      //Currently closed, let's open it. Be sure signup is closed.
      this.ShowSignupForm = false;
      this.ShowLoginForm = true;
    }
  }

  save(): void {
    this.budgetService.save();
  }

  logOut(): void {
    if (this.budgetService.hasUnsavedChanges()) {
      this.confirmDialogService
        .confirm("Logout with unsaved changes", "Are you sure you want to log out without saving changes?")
        .subscribe(response => {
          if (response) {
            this.userService.logout();
            this.budgetService.reload();
          }
        });
    }
    else {
      this.userService.logout();
    }
  }
}