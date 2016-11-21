import { Component } from '@angular/core';
import { UserService } from '../user/user.service';

@Component({
  moduleId: module.id,
  selector: 'menu-bar',
  providers: [UserService],
  templateUrl: '/app/menu-bar/menu-bar.component.html',
  styleUrls: ['../../app/menu-bar/menu-bar.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class MenuBarComponent {

  constructor(
    private userService: UserService
  ) {}

  get userLoggedIn(): boolean {
    console.log(this.userService.isLoggedIn());
    return this.userService.isLoggedIn();
  }

  logOut(): void {
    this.userService.logout();
  }

}