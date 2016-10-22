import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'menu-bar',
  templateUrl: '/app/menu-bar/menu-bar.component.html',
  styleUrls: ['../../app/menu-bar/menu-bar.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class MenuBarComponent { }