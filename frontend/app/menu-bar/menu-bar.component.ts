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

  constructor(
    private userService: UserService
  ) {
    this.isLoggedIn = userService.isLoggedIn();
    this._subscription = userService.loggedInChange.subscribe((value) => { this.isLoggedIn = value; console.log("updated: " + value); })
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  logOut(): void {
    this.userService.logout();
  }

}