import { Component } from '@angular/core';
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
    private userService: UserService
  ) {}
  
  model = new User("","");

  onSubmit() { 
    this.createAcc(this.model.username, this.model.password);
  }

  private createAcc(username: string, password: string) {
    if ((!username)||(!password)) { return; }
    this.userService.createAcc(username, password)
                      .subscribe(
                        error =>  console.log(<any>error)
                      )
  }
}