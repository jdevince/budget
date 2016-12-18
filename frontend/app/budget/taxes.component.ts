import { Component } from '@angular/core';
import { BudgetService } from './budget.service';

@Component({
  moduleId: module.id,
  selector: 'taxes',
  templateUrl: '/app/budget/taxes.component.html',
  styleUrls: ['../../app/budget/taxes.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class TaxesComponent {
    public readonly FilingStatusOptions: string[] = [
        "Single",
        "Married Filing Jointly",
        "Head of Household",
        "Married Filing Separately",
        "Widow(er) with Dependent Child"
    ]
    public filingStatus: number = 0; //Default to "Single"

    public exemptions: number = 1;

    public readonly PrimaryDeductionTypes: string[] = [
        "Standard Deduction",
        "Itemized Deductions"
    ]
    public primaryDeductionType: number = 0;

    public deductions: [string, number][] = [[this.PrimaryDeductionTypes[this.primaryDeductionType], 6300]]

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

