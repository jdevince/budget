import { Component } from '@angular/core';
import { BudgetService } from './budget.service';
import { CustomCurrencyPipe } from './custom-currency.pipe';
import { LabelAndCurrencyRow } from './LabelAndCurrencyRow';
import { States } from './states';

const TaxYear = 2017;

enum TaxType {
    Federal,
    State,
    FICA
}

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
        "Married Filing Separately"
        //"Widow(er) with Dependent Child" //Future enhancement: Taxee doesn't have data for this status.
    ];

    get States(): string[] {
        return States.ListOfStateAbbreviations;
    }

    private _federalTaxBrackets;

    private _stateTaxBrackets;
    get stateTaxBrackets() {
        let stateAbbr: string = this.States[this.state];

        if (!this._stateTaxBrackets) {
            this._stateTaxBrackets = {};
        }

        if (!this._stateTaxBrackets.hasOwnProperty(stateAbbr)) {

            this._stateTaxBrackets[stateAbbr] = "Loading"; //Set this so multiple loading attempts won't fire if one is unsuccessful

            //State brackets not loaded for selected state, load them.
            this.budgetService.getStateTaxBrackets(TaxYear, this.States[this.state])
                .subscribe(
                brackets => {
                    this._stateTaxBrackets[stateAbbr] = brackets;
                    return this._stateTaxBrackets[stateAbbr];
                },
                error => console.log(<any>error)
                );
        }
        else {
            //State brackets already loaded, return them
            return this._stateTaxBrackets[stateAbbr];
        }
    }

    public filingStatus: number = 0; //Default to "Single"
    public exemptions: number = 1; //Default to 1 exemption
    public state: number = 0; //Index in States.ListOfStates. Defaulting to first state in list

    public federalDeductions: LabelAndCurrencyRow[] = [];
    public federalCredits: LabelAndCurrencyRow[] = [];
    public stateDeductions: LabelAndCurrencyRow[] = [];
    public stateCredits: LabelAndCurrencyRow[] = [];

    public additionalTaxes: LabelAndCurrencyRow[] = [];

    public ficaTax: string;
    public stateTax: string;
    public localTax: string;
    public totalTax: string;

    constructor(
        private budgetService: BudgetService
    ) { }

    ngOnInit(): void {
        this.budgetService.getFederalTaxBrackets(TaxYear)
            .subscribe(
            brackets => this._federalTaxBrackets = brackets,
            error => console.log(<any>error)
            );
    }

    public get incomeMinusPreTax(): number {
        return this.budgetService.getIncomeMinusPreTax();
    }

    getBracketsForFilingStatus(filingStatus: number, bracketsToChooseFrom: any): any {
        let bracketsForStatus: any = null;

        if (!bracketsToChooseFrom || !bracketsToChooseFrom["single"]) {
            //Bracket isn't loaded or isn't loaded correctly
            return null;
        }

        switch (+filingStatus) {
            case 0: {
                //Single
                bracketsForStatus = bracketsToChooseFrom["single"];
                break;
            }
            case 1: {
                //Married Filing Jointly
                bracketsForStatus = bracketsToChooseFrom["married"];
                break;
            }
            case 2: {
                //Head of Household
                bracketsForStatus = bracketsToChooseFrom["head_of_household"];
                break;
            }
            case 3: {
                //Married Filing Separately
                bracketsForStatus = bracketsToChooseFrom["married_separately"];
                break;
            }
            case 4: {
                //Widow(er) with Dependent Child
                //Future enhancement: Taxee doesn't have data for this status.
            }
        }

        return bracketsForStatus;
    }

    public get StateTaxableIncome(): number {
        return this.getTaxableIncome(TaxType.State);
    }

    public get FederalTaxableIncome(): number {
        return this.getTaxableIncome(TaxType.Federal);
    }

    getTaxableIncome(taxType: TaxType): number {
        let brackets: any = null;
        let deductions: LabelAndCurrencyRow[] = null;
        let exemptionAmount: number = 0;

        if (taxType === TaxType.Federal) {
            brackets = this.getBracketsForFilingStatus(this.filingStatus, this._federalTaxBrackets);
            deductions = this.federalDeductions;

            if (brackets !== null) {
                exemptionAmount = brackets["exemptions"][0]["exemption_amount"];
            }
        }
        else if (taxType === TaxType.State) {
            brackets = this.getBracketsForFilingStatus(this.filingStatus, this.stateTaxBrackets);
            deductions = this.stateDeductions;
        }

        if (brackets === null) {
            return null;
        }

        //Initially set at sum of Incomes minus pre-tax expenses/savings
        let taxableIncome: number = this.incomeMinusPreTax;

        //Subtract deductions
        let deductionsSum = 0;
        for (let deduction of deductions) {
            deductionsSum += deduction.getAmount();
        }
        taxableIncome -= deductionsSum;

        //Subtract exceptions
        taxableIncome -= this.exemptions * exemptionAmount;

        return taxableIncome;
    }

    public get StateTax(): number {
        return this.getTax(TaxType.State);
    }

    public get FederalTax(): number {
        return this.getTax(TaxType.Federal);
    }

    public get FICATax(): number {
        //FICA Tax consists of Social Secuity tax and Medicare Tax
        //Social Security: 6.2% on income up to $127,000. No tax on marginal income higher than this.
        //Medicare: 1.45% on income up to $200,000. Extra 0.9% on marginal income higher than this.
        //Source:https://www.irs.gov/taxtopics/tc751.html

        let socialSecurityTax: number;
        let socialSecurityRate = 0.062; //6.2%
        let socialSecurityLimit = 127000;

        let medicareTax: number;
        let medicareRate = 0.0145; //1.45%
        let medicareExtraThreshold = 200000;
        let medicareExtraRate = 0.009 //0.9% - Added to medicareRate for income above threshold

        let incomeSubjectToFICA = this.budgetService.getIncomeSubjectToFICA();

        //Calculate Social Security tax
        if (incomeSubjectToFICA <= socialSecurityLimit) {
            socialSecurityTax = incomeSubjectToFICA * socialSecurityRate;
        }
        else {
            socialSecurityTax = socialSecurityLimit * socialSecurityRate;
        }

        //Calculate Medicare tax
        if (incomeSubjectToFICA <= medicareExtraThreshold)
        {
            medicareTax = incomeSubjectToFICA * medicareRate;
        }
        else {
            medicareTax = (medicareExtraThreshold * medicareRate) + ((incomeSubjectToFICA - medicareExtraThreshold) * (medicareRate + medicareExtraRate));
        }

        return socialSecurityTax + medicareTax;
    }

    public getTax(taxType: TaxType): number {
        let brackets: any = null;
        let taxableIncome: number = 0;
        let credits: LabelAndCurrencyRow[];
        let useMoreBrackets: boolean = true;
        let marginalAmount: number;
        let marginalRate: number;
        let tax: number = 0;

        if (taxType === TaxType.Federal) {
            brackets = this.getBracketsForFilingStatus(this.filingStatus, this._federalTaxBrackets);
            taxableIncome = this.FederalTaxableIncome;
            credits = this.federalCredits;
        }
        else if (taxType === TaxType.State) {
            brackets = this.getBracketsForFilingStatus(this.filingStatus, this.stateTaxBrackets);
            taxableIncome = this.StateTaxableIncome;
            credits = this.stateCredits;
        }

        if (brackets === null || !brackets.hasOwnProperty("income_tax_brackets")) {
            return null;
        }

        let incomeTaxBrackets = brackets["income_tax_brackets"];

        let bracketIndex = 0;

        while (useMoreBrackets) {

            if (bracketIndex === incomeTaxBrackets.length - 1 || taxableIncome <= incomeTaxBrackets[bracketIndex + 1]["bracket"]) {
                //Highest bracket or income not high enough to need next bracket
                marginalAmount = taxableIncome - incomeTaxBrackets[bracketIndex]["bracket"];
                useMoreBrackets = false;
            }
            else {
                //Add amount for this bracket to total tax, then move on to next higher bracket
                marginalAmount = incomeTaxBrackets[bracketIndex + 1]["bracket"] - incomeTaxBrackets[bracketIndex]["bracket"];               
            }

            marginalRate = incomeTaxBrackets[bracketIndex]["marginal_rate"];
            tax += marginalAmount * (marginalRate * 0.01);
            bracketIndex++;
        }

        //Subtract credits
        for (let row of credits) {
            tax -= row.getAmount();
        }

        return tax;
    }

    public get TaxesSum(): number {
        let taxesSum: number;
         
         taxesSum = this.FederalTax + this.StateTax + this.FICATax;

         for (let tax of this.additionalTaxes) {
             taxesSum += tax.getAmount();
         }

         return taxesSum;
    }

    addLabelAndCurrencyRow(array: LabelAndCurrencyRow[]): void {
        let newRow = new LabelAndCurrencyRow("Label", 0);
        array.push(newRow);
    }

    deleteLabelAndCurrencyRow(array: LabelAndCurrencyRow[], row: LabelAndCurrencyRow): void {
        let index = array.indexOf(row);
        array.splice(index, 1);
    }
}

