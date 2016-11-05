import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'login',
  templateUrl: '/app/user/login.component.html',
  styleUrls: ['../../app/user/login.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class LoginComponent { }