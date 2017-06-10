import { Component, HostListener, QueryList, ViewChildren } from '@angular/core';
import { InputSectionComponent } from './../input-section/input-section.component';
import { BudgetService } from './../budget.service';
import { UserService } from './../../user/user.service';

@Component({
  moduleId: module.id,
  selector: 'budget',
  templateUrl: '/app/budget/budget/budget.component.html',
  styleUrls: ['../../../app/budget/budget/budget.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class BudgetComponent {

  constructor(
    private budgetService: BudgetService,
    private userService: UserService
  ) { }

  @ViewChildren(InputSectionComponent)
  private inputSections: QueryList<InputSectionComponent>

  ngAfterViewInit() {
    this.budgetService.InputSections = this.inputSections.toArray();
  }

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload($event: any) {
    if (this.userService.isLoggedIn() && this.budgetService.hasUnsavedChanges()) {
      $event.returnValue = 'Are you sure you want to leave without saving changes?'; //To show confim dialog before exiting. Message doesn't actually show in modern browsers.
    }
  }
}