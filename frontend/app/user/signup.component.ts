import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { User } from './user';
import { UserService } from './user.service';

@Component({
  moduleId: module.id,
  selector: 'signup',
  providers: [UserService],
  templateUrl: '/app/user/signup.component.html',
  styleUrls: ['../../app/user/signup.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class SignUpComponent { 

  constructor(
    private userService: UserService,
    private router: Router
  ) {}
  
  model = new User(null,null,null);

  onSubmit() { 
    this.createAcc(this.model.username, this.model.password);
  }

  private createAcc(username: string, password: string) {
    if ((!username)||(!password)) { 
      return; 
    }

    this.userService.createAcc(username, password)
                      .subscribe(
                        user  =>  { 
                          this.model; 
                          this.userService.login(this.model.username, this.model.password)
                          .subscribe((result) => {
                            if (result) {
                              this.router.navigate(['/budget']);
                            }
                          }); }, 
                        error =>  console.log(<any>error)
                      );             
  }
}