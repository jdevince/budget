import { Component } from '@angular/core';
import { User } from './user';
import { UserService } from './user.service';

@Component({
  moduleId: module.id,
  selector: 'create-acc-form',
  providers: [UserService],
  templateUrl: '/app/user/create-acc-form.component.html',
  styleUrls: ['../../app/user/create-acc-form.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class CreateAccFormComponent { 

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