import { Component, QueryList, ViewChildren } from '@angular/core';
import { InputSectionComponent } from './../input-section/input-section.component';
import { BudgetService } from './../budget.service';

@Component({
  moduleId: module.id,
  selector: 'budget',
  templateUrl: '/app/budget/budget/budget.component.html',
  styleUrls: ['../../../app/budget/budget/budget.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class BudgetComponent {
    
    constructor(
        private budgetService: BudgetService
      ) {}

    @ViewChildren(InputSectionComponent)
    private inputSections: QueryList<InputSectionComponent>

    ngAfterViewInit() {
      this.budgetService.InputSections = this.inputSections.toArray();
    }

    save() {
      let success: boolean;
      this.budgetService.save()
                            .subscribe(
                                result    =>  success = result,
                                error   =>  console.log(<any>error)
                            );
    }
 }