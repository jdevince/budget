import { Component, QueryList, ViewChildren, HostListener } from '@angular/core';
import { InputSectionComponent } from './../input-section/input-section.component';
import { BudgetService } from './../budget.service';
import { WindowService } from './../../window/window.service';

@Component({
  moduleId: module.id,
  selector: 'budget',
  templateUrl: '/app/budget/budget/budget.component.html',
  styleUrls: ['../../../app/budget/budget/budget.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class BudgetComponent {
    
    private screenWidth: number;

    constructor(
        private budgetService: BudgetService,
        private windowService: WindowService
      ) {
        this.screenWidth = windowService.nativeWindow.innerWidth;
      }

    @ViewChildren(InputSectionComponent)
    private inputSections: QueryList<InputSectionComponent>

    ngAfterViewInit() {
      this.budgetService.InputSections = this.inputSections.toArray();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.screenWidth = event.target.innerWidth; 
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