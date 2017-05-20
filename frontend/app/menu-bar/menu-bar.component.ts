import { Component } from '@angular/core';
import { UserService } from '../user/user.service';

@Component({
  moduleId: module.id,
  selector: 'menu-bar',
  templateUrl: '/app/menu-bar/menu-bar.component.html',
  styleUrls: ['../../app/menu-bar/menu-bar.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class MenuBarComponent {
  private isLoggedIn: boolean;
  private _subscription;

  public ShowSignupForm: boolean;
  public ShowLoginForm: boolean;

  constructor(
    private userService: UserService
  ) {
    this.isLoggedIn = userService.isLoggedIn();
    this._subscription = userService.loggedInChange.subscribe((value) => { this.isLoggedIn = value; console.log("updated: " + value); })
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

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

  logOut(): void {
    this.userService.logout();
  }

}