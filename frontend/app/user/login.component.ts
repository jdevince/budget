import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { User } from './user';
import { UserService } from './user.service';

@Component({
  moduleId: module.id,
  selector: 'login',
  providers: [UserService],
  templateUrl: '/app/user/login.component.html',
  styleUrls: ['../../app/user/login.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class LoginComponent {
  
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
  
  model = new User(null,null,null);

  onSubmit() { 
    this.userService.login(this.model.username, this.model.password)
                      .subscribe((result) => {
                        if (result) {
                          this.router.navigate(['/budget']);
                        }
                      });
  }
}