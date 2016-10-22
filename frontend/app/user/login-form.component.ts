import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'login-form',
  templateUrl: '/app/user/login-form.component.html',
  styleUrls: ['../../app/user/login-form.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class LoginFormComponent { }