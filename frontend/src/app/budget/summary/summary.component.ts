import { Component } from '@angular/core';
import { BudgetService } from './../budget.service';
import { CustomCurrencyPipe } from './../custom-currency.pipe';

@Component({
    moduleId: module.id,
    selector: 'summary',
    templateUrl: '/app/budget/summary/summary.component.html',
    styleUrls: ['../../../app/budget/summary/summary.component.css'], //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
    providers: [CustomCurrencyPipe]
})

export class SummaryComponent {

    constructor(private budgetService: BudgetService) { }

    public get Savings(): number {
        return this.budgetService.getTotalSavings();
    }

    public get SavingsRate(): number {
        //Savings / (Incomes - Taxes)
        return this.Savings / (this.budgetService.getInputSectionAnnualTotal("Incomes") - this.budgetService.TaxesComponent.TaxesSum);
    }

    public get EffectiveTaxRate(): number {
        //Taxes / Gross Income
        return this.budgetService.TaxesComponent.TaxesSum / this.budgetService.getInputSectionAnnualTotal("Incomes");
    }
}