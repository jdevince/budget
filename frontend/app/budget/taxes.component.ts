import { Component } from '@angular/core';
import { BudgetService } from './budget.service';

@Component({
  moduleId: module.id,
  selector: 'taxes',
  templateUrl: '/app/budget/taxes.component.html',
  styleUrls: ['../../app/budget/taxes.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class TaxesComponent {
    public zipcode: string;
    public federalTax: string;
    public ficaTax: string;
    public stateTax: string;
    public localTax: string;
    public totalTax: string;

    constructor(
        private budgetService: BudgetService
    ) {}

    public get incomeMinusPreTax(): number {
        return this.budgetService.getIncomeMinusPreTax();
    }

    public calculateTaxes(): void {
        
    }

}