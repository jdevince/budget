import { Component, QueryList, ViewChildren } from '@angular/core';
import { InputSectionComponent } from './input-section.component';
import { BudgetService } from './budget.service';

@Component({
  moduleId: module.id,
  selector: 'budget',
  templateUrl: '/app/budget/budget.component.html',
  styleUrls: ['../../app/budget/budget.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class BudgetComponent {
    
    constructor(
        private budgetService: BudgetService
      ) {}

    @ViewChildren(InputSectionComponent)
    private inputSections: QueryList<InputSectionComponent>

    save() {
      let success: boolean;
      console.log(this.inputSections);
      this.budgetService.save(this.inputSections.toArray())
                                    .subscribe(
                                        result    =>  success = result,
                                        error   =>  console.log(<any>error)
                                    );
    }
 }