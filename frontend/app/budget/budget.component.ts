import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'budget',
  templateUrl: '/app/budget/budget.component.html',
  styleUrls: ['../../app/budget/budget.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class BudgetComponent { }