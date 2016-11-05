import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'homepage',
  templateUrl: '/app/homepage/homepage.component.html',
  styleUrls: ['../../app/homepage/homepage.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class HomepageComponent { }