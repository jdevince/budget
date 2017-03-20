import { Component } from '@angular/core';
import { BudgetService } from './budget.service';
import { CustomCurrencyPipe } from './custom-currency.pipe';
import { DeductOrCreditRow } from './deductOrCreditRow';

@Component({
  moduleId: module.id,
  selector: 'taxes',
  templateUrl: '/app/budget/taxes.component.html',
  styleUrls: ['../../app/budget/taxes.component.css'], //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
  providers: [CustomCurrencyPipe]
})

export class TaxesComponent {
    public readonly FilingStatusOptions: string[] = [
        "Single",
        "Married Filing Jointly",
        "Head of Household",
        "Married Filing Separately",
        "Widow(er) with Dependent Child"
    ];
    private readonly exemptionAmounts = {
        2015: 4000,
        2016: 4050,
        2017: 4050
    };

    private federalTaxBrackets;

    public filingStatus: number = 0; //Default to "Single"

    public exemptions: number = 1;

    public readonly PrimaryDeductionTypes: string[] = [
        "Standard Deduction",
        "Itemized Deductions"
    ]
    public primaryDeductionType: number = 0;

    public federalDeductions: DeductOrCreditRow[] = [];
    public federalCredits: DeductOrCreditRow[] = [];
    public stateDeductions: DeductOrCreditRow[] = [];
    public stateCredits: DeductOrCreditRow[] = [];

    public zipcode: string;
    public ficaTax: string;
    public stateTax: string;
    public localTax: string;
    public totalTax: string;

    constructor(
        private budgetService: BudgetService
    ) {}

    ngOnInit(): void {
        this.budgetService.getFederalTaxBrackets(2017)
                                        .subscribe(
                                            brackets    =>  this.federalTaxBrackets = brackets,
                                            error   =>  console.log(<any>error)
                                        );
    }

    public get incomeMinusPreTax(): number {
        return this.budgetService.getIncomeMinusPreTax();
    }

    public get taxableIncome(): number {
        //Initially set at sum of Incomes minus pre-tax expenses/savings
        let taxableIncome: number = this.incomeMinusPreTax;
        console.log(this.federalDeductions);
        //Subtract deductions
        let deductionsSum = 0;
        for (let deduction of this.federalDeductions) {
            deductionsSum += deduction.getAmount();
        }
        taxableIncome -= deductionsSum;

        //Subtract exceptions
        taxableIncome -= this.exemptions * this.exemptionAmounts[2017];

        return taxableIncome;
    }

    public get federalTax(): number {
        if (this.federalTaxBrackets === undefined) {
            return null; //Tax brackets not loaded yet
        }
        
        let brackets: Object[];

        //Determine which tax bracket data we should use
        switch(+this.filingStatus) {
            case 0: {
                //Single
                brackets = this.federalTaxBrackets["single"]["income_tax_brackets"];
                break;
            }
            case 1: {
                //Married Filing Jointly
                brackets = this.federalTaxBrackets["married"]["income_tax_brackets"];
                break;
            }
            case 2: {
                //Head of Household
                brackets = this.federalTaxBrackets["head_of_household"]["income_tax_brackets"];
                break;
            }
            case 3: {
                //Married Filing Separately
                brackets = this.federalTaxBrackets["married_separately"]["income_tax_brackets"];
                break;
            }
            case 4: {
                //Widow(er) with Dependent Child
                return; //TODO: Contribute this filing status data to Taxee open source project
            }
        }

        for (let bracketIndex in brackets) {
            if (+bracketIndex === brackets.length - 1 || this.taxableIncome < brackets[+bracketIndex + 1]["bracket"]) {
                //This is the appropriate bracket if it's the highest bracket or the taxable income is less than the next higher bracket
                let minTierAmount = brackets[bracketIndex]["bracket"];
                let taxAmountForMinTier = brackets[bracketIndex]["amount"];
                let marginalRate = brackets[bracketIndex]["marginal_rate"];

                let credits = 0;
                for (let row of this.federalCredits) {
                    credits+= row.getAmount();
                }

                let tax = taxAmountForMinTier + ((this.taxableIncome - minTierAmount) * (marginalRate * 0.01)) - credits;
                return tax;
            }
        }

        return null; //Shouldn't happen. Indicates an error
    }

    addDeductionOrCreditRow(array: DeductOrCreditRow[]): void {
        let newRow = new DeductOrCreditRow(null, 0);
        array.push(newRow);
    }

    deleteDeductionOrCreditRow(array: DeductOrCreditRow[], row: DeductOrCreditRow): void {
        let index = array.indexOf(row);
        array.splice(index, 1);
    }
}

