import { Component } from '@angular/core';
import { BudgetService } from './../budget.service';
import { TaxType, DeductionOrCredit } from './../budget.enums';
import { CustomCurrencyPipe } from './../custom-currency.pipe';
import { LabelAndCurrencyRow } from './label-and-currency-row.model';
import { States } from './states.model';

const TaxYear = 2017;

@Component({
    moduleId: module.id,
    selector: 'taxes',
    templateUrl: '/app/budget/taxes/taxes.component.html',
    styleUrls: ['../../../app/budget/taxes/taxes.component.css'], //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
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

    private _federalTaxBrackets;

    private _stateTaxBrackets;
    get stateTaxBrackets() {
        let stateAbbr: string = this.States[this.State];

        if (!this._stateTaxBrackets) {
            this._stateTaxBrackets = {};
        }

        if (!this._stateTaxBrackets.hasOwnProperty(stateAbbr)) {

            this._stateTaxBrackets[stateAbbr] = "Loading"; //Set this so multiple loading attempts won't fire if one is unsuccessful

            //State brackets not loaded for selected state, load them.
            this.budgetService.getStateTaxBrackets(TaxYear, this.States[this.State])
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

    public FilingStatus: number = 0; //Default to "Single"
    public Exemptions: number = 1; //Default to 1 exemption
    public State: number = 0; //Index in States.ListOfStates. Defaulting to first state in list

    public FederalDeductions: LabelAndCurrencyRow[] = [];
    public FederalCredits: LabelAndCurrencyRow[] = [];
    public StateDeductions: LabelAndCurrencyRow[] = [];
    public StateCredits: LabelAndCurrencyRow[] = [];

    public AdditionalTaxes: LabelAndCurrencyRow[] = [];

    public get IncomeMinusPreTax(): number {
        return this.budgetService.getIncomeMinusPreTax();
    }

    public get States(): string[] {
        return States.ListOfStateAbbreviations;
    }

    public get StateTaxableIncome(): number {
        return this.getTaxableIncome(TaxType.State);
    }

    public get FederalTaxableIncome(): number {
        return this.getTaxableIncome(TaxType.Federal);
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

    public get TaxesSum(): number {
        let taxesSum: number;
         
         taxesSum = this.FederalTax + this.StateTax + this.FICATax;

         for (let tax of this.AdditionalTaxes) {
             taxesSum += tax.getAmount();
         }

         return taxesSum;
    }

    constructor(private budgetService: BudgetService) { 
        this.budgetService.TaxesComponent = this;
    }

    ngOnInit(): void {
        this.budgetService.loadTaxes()
            .subscribe(
                loadedData => {
                    this.FilingStatus = loadedData.FilingStatus;
                    this.Exemptions = loadedData.Exemptions;
                    this.State = loadedData.State;
                    this.FederalDeductions = loadedData.FederalDeductions;
                    this.FederalCredits = loadedData.FederalCredits;
                    this.StateDeductions = loadedData.StateDeductions;
                    this.StateCredits = loadedData.StateCredits;
                    this.AdditionalTaxes = loadedData.AdditionalTaxes;
                },
                error => console.log(<any>error)
                );

        this.budgetService.getFederalTaxBrackets(TaxYear)
            .subscribe(
            brackets => this._federalTaxBrackets = brackets,
            error => console.log(<any>error)
            );
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

    getTaxableIncome(taxType: TaxType): number {
        let brackets: any = null;
        let deductions: LabelAndCurrencyRow[] = null;
        let exemptionAmount: number = 0;

        if (taxType === TaxType.Federal) {
            brackets = this.getBracketsForFilingStatus(this.FilingStatus, this._federalTaxBrackets);
            deductions = this.FederalDeductions;

            if (brackets !== null) {
                exemptionAmount = brackets["exemptions"][0]["exemption_amount"];
            }
        }
        else if (taxType === TaxType.State) {
            brackets = this.getBracketsForFilingStatus(this.FilingStatus, this.stateTaxBrackets);
            deductions = this.StateDeductions;
        }

        if (brackets === null) {
            return null;
        }

        //Initially set at sum of Incomes minus pre-tax expenses/savings
        let taxableIncome: number = this.IncomeMinusPreTax;

        //Subtract deductions
        let deductionsSum = 0;
        for (let deduction of deductions) {
            deductionsSum += deduction.getAmount();
        }
        taxableIncome -= deductionsSum;

        //Subtract exceptions
        taxableIncome -= this.Exemptions * exemptionAmount;

        return taxableIncome;
    }

    getTax(taxType: TaxType): number {
        let brackets: any = null;
        let taxableIncome: number = 0;
        let credits: LabelAndCurrencyRow[];
        let useMoreBrackets: boolean = true;
        let marginalAmount: number;
        let marginalRate: number;
        let tax: number = 0;

        if (taxType === TaxType.Federal) {
            brackets = this.getBracketsForFilingStatus(this.FilingStatus, this._federalTaxBrackets);
            taxableIncome = this.FederalTaxableIncome;
            credits = this.FederalCredits;
        }
        else if (taxType === TaxType.State) {
            brackets = this.getBracketsForFilingStatus(this.FilingStatus, this.stateTaxBrackets);
            taxableIncome = this.StateTaxableIncome;
            credits = this.StateCredits;
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

    deleteLabelAndCurrencyRow(array: LabelAndCurrencyRow[], row?: LabelAndCurrencyRow): void {
        let index = array.indexOf(row);
        array.splice(index, 1);
    }

    insertLabelAndCurrencyRow(array: LabelAndCurrencyRow[], row: LabelAndCurrencyRow): void {
        let index: number = array.indexOf(row);
        let newRow: LabelAndCurrencyRow = new LabelAndCurrencyRow(null, 0);

        if (index === array.length - 1) {
            //Selected row is last row. Add new row to end.
            array.push(newRow)
        }
        else {
            //Add new row after selected row
            array.splice(index + 1, 0, newRow);
        }
    }

    getDataToSave(): Object {
        let data: any = {};

        data["FilingStatus"] = this.FilingStatus;
        data["Exemptions"] = this.Exemptions;
        data["State"] = this.State;

        //Deductions and Credits
        data["DeductionsAndCredits"] = [];
        
        for(let rowIdx in this.FederalDeductions) {
            let dataRow = this.FederalDeductions[rowIdx].getDataToSave();
            dataRow["RowNum"] = rowIdx;
            dataRow["FederalOrState"] = TaxType.Federal;
            dataRow["DeductionOrCredit"] = DeductionOrCredit.Deduction;
            data["DeductionsAndCredits"].push(dataRow);
        }

        for(let rowIdx in this.FederalCredits) {
            let dataRow = this.FederalCredits[rowIdx].getDataToSave();
            dataRow["RowNum"] = rowIdx;
            dataRow["FederalOrState"] = TaxType.Federal;
            dataRow["DeductionOrCredit"] = DeductionOrCredit.Credit;
            data["DeductionsAndCredits"].push(dataRow);
        }

        for(let rowIdx in this.StateDeductions) {
            let dataRow = this.StateDeductions[rowIdx].getDataToSave();
            dataRow["RowNum"] = rowIdx;
            dataRow["FederalOrState"] = TaxType.State;
            dataRow["DeductionOrCredit"] = DeductionOrCredit.Deduction;
            data["DeductionsAndCredits"].push(dataRow);
        }

        for(let rowIdx in this.StateCredits) {
            let dataRow = this.StateCredits[rowIdx].getDataToSave();
            dataRow["RowNum"] = rowIdx;
            dataRow["FederalOrState"] = TaxType.State;
            dataRow["DeductionOrCredit"] = DeductionOrCredit.Credit;
            data["DeductionsAndCredits"].push(dataRow);
        }

        //Additional Taxes
        data["AdditionalTaxes"] = [];

        for(let rowIdx in this.AdditionalTaxes) {
            let dataRow = this.AdditionalTaxes[rowIdx].getDataToSave();
            dataRow["RowNum"] = rowIdx;
            data["AdditionalTaxes"].push(dataRow);
        }

        return data;
    }
}

