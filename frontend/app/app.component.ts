import { Component } from '@angular/core';

import './rxjs-operators';


@Component({
  selector: 'budget-app',
  templateUrl: '/app/app.component.html',
  styleUrls: ['../app/app.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class AppComponent { }
