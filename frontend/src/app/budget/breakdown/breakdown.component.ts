import { Component } from '@angular/core';
import { BudgetService } from './../budget.service';
import { CustomCurrencyPipe } from './../custom-currency.pipe';

@Component({
    selector: 'breakdown',
    templateUrl: './breakdown.component.html',
    styleUrls: ['../../../app/budget/breakdown/breakdown.component.css'], //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
    providers: [CustomCurrencyPipe]
})

export class BreakdownComponent {

    constructor(private budgetService: BudgetService) { }

    public get TotalIncome(): number {
        return this.budgetService.getInputSectionAnnualTotal("Incomes");
    }

    public get AfterTaxes(): number {
        return this.budgetService.getAfterTaxes();
    }

    public get AfterExpenses(): number {
        return this.budgetService.getAfterExpenses();
    }

    public get AfterSavings(): number {
        return this.budgetService.getAfterSavings();
    }

    public get AdditionalSavings(): number {
        return this.AfterSavings;
    }
}