import { Component } from '@angular/core';
import { BudgetService } from './../budget.service';
import { PopupDialogService } from './../../popup-dialog/popup-dialog.service';
import { TaxType, DeductionOrCredit } from './../budget.enums';
import { CustomCurrencyPipe } from './../custom-currency.pipe';
import { LabelAndCurrencyRow } from './label-and-currency-row.model';
import { States } from './states.model';

@Component({
    selector: 'taxes',
    templateUrl: './taxes.component.html',
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

    public readonly TaxYears: number[] = [
        2018,
        2017, 
        2016, 
        2015
    ];

    public _federalTaxBrackets: any;
    get federalTaxBrackets() {
        if (!this._federalTaxBrackets) {
            this._federalTaxBrackets = {};
        }
        
        if (!this._federalTaxBrackets.hasOwnProperty(this.TaxYear)) {

            this._federalTaxBrackets[this.TaxYear] = "Loading"; //Set this so multiple loading attempts won't fire if one is unsuccessful

            //Federal brackets not loaded for selected tax year, load them.
            this.budgetService.loadFederalTaxBrackets(this._federalTaxBrackets, this.TaxYear)
        }
        else {
            //Federal brackets already loaded, return them
            return this._federalTaxBrackets[this.TaxYear];
        }
    }

    private _stateTaxBrackets: any;
    get stateTaxBrackets() {
        let stateAbbr: string = this.States[this.State];

        if (!this._stateTaxBrackets) {
            this._stateTaxBrackets = {};
        }
        
        if (!this._stateTaxBrackets.hasOwnProperty(this.TaxYear + "-" + stateAbbr)) {

            this._stateTaxBrackets[this.TaxYear + "-" + stateAbbr] = "Loading"; //Set this so multiple loading attempts won't fire if one is unsuccessful

            //State brackets not loaded for selected year and state, load them.
            this.budgetService.loadStateTaxBrackets(this._stateTaxBrackets, this.TaxYear, stateAbbr);
        }
        else {
            //State brackets already loaded, return them
            return this._stateTaxBrackets[this.TaxYear + "-" + stateAbbr];
        }
    }

    public TaxTypeEnum: any = TaxType; //Create property for enum so html can use

    public FilingStatus: number = 0; //Default to "Single"
    public Exemptions: number = 1; //Default to 1 exemption
    public TaxYear: number = this.TaxYears[0] //Default to most recent year
    public State: number = 0; //Index in States.ListOfStates. Defaulting to first state in list

    public FederalDeductions: LabelAndCurrencyRow[] = [];
    public FederalCredits: LabelAndCurrencyRow[] = [];
    public StateDeductions: LabelAndCurrencyRow[] = [];
    public StateCredits: LabelAndCurrencyRow[] = [];

    public AdditionalTaxes: LabelAndCurrencyRow[] = [];

    public get IncomeMinusNoTaxAndPreTax(): number {
        return this.budgetService.getIncomeMinusNoTaxAndPreTax();
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

    public get FederalTax(): number {
        return this.getTax(TaxType.Federal);
    }

    public get StateTax(): number {
        return this.getTax(TaxType.State);
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
        if (incomeSubjectToFICA <= medicareExtraThreshold) {
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

    public get isStateStandardDeduction(): boolean {
        let brackets: any = this.getBracketsForFilingStatus(this.FilingStatus, this.stateTaxBrackets);

        if (brackets === null 
        || !brackets.hasOwnProperty("deductions") 
        || !(brackets["deductions"].length > 0)
        || !brackets["deductions"][0].hasOwnProperty("deduction_name") 
        || !brackets["deductions"][0].hasOwnProperty("deduction_amount")) {
            return false;
        }
        else {
            return true;
        }
    }

    public get addStateStardardDeductionBtnLabel(): string {
        if (this.isStateStandardDeduction) {
            return "Add Custom";
        }
        else {
            return "Add";
        }
    }

    constructor(private budgetService: BudgetService, private popupDialogService: PopupDialogService) {
        this.budgetService.TaxesComponent = this;
    }

    ngOnInit(): void {
        this.budgetService.loadTaxes(this);
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
            brackets = this.getBracketsForFilingStatus(this.FilingStatus, this.federalTaxBrackets);
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
        let taxableIncome: number = this.IncomeMinusNoTaxAndPreTax;

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
            brackets = this.getBracketsForFilingStatus(this.FilingStatus, this.federalTaxBrackets);
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

    insertStandardDeduction(array: LabelAndCurrencyRow[], taxType: TaxType): void {
        let brackets: any = null;
        let standardDeductionRow: LabelAndCurrencyRow;
        let label: string;
        let amount: number;
        
        if (taxType === TaxType.Federal) {
            brackets = this.getBracketsForFilingStatus(this.FilingStatus, this.federalTaxBrackets);
        }
        else { //State
            brackets = this.getBracketsForFilingStatus(this.FilingStatus, this.stateTaxBrackets);
        }

        if (brackets === null 
        || !brackets.hasOwnProperty("deductions") 
        || !(brackets["deductions"].length > 0)
        || !brackets["deductions"][0].hasOwnProperty("deduction_name") 
        || !brackets["deductions"][0].hasOwnProperty("deduction_amount")) {
            return null;
        }

        label = brackets["deductions"][0]["deduction_name"];
        amount = brackets["deductions"][0]["deduction_amount"];

        standardDeductionRow = new LabelAndCurrencyRow(label, amount);
        array.push(standardDeductionRow);
    }

    getDataToSave(): Object {
        let data: any = {};

        data["FilingStatus"] = this.FilingStatus;
        data["Exemptions"] = this.Exemptions;
        data["TaxYear"] = this.TaxYear;
        data["State"] = this.State;

        //Deductions and Credits
        data["DeductionsAndCredits"] = [];

        for (let rowIdx in this.FederalDeductions) {
            let dataRow = this.FederalDeductions[rowIdx].getDataToSave();
            dataRow["RowNum"] = rowIdx;
            dataRow["FederalOrState"] = TaxType.Federal;
            dataRow["DeductionOrCredit"] = DeductionOrCredit.Deduction;
            data["DeductionsAndCredits"].push(dataRow);
        }

        for (let rowIdx in this.FederalCredits) {
            let dataRow = this.FederalCredits[rowIdx].getDataToSave();
            dataRow["RowNum"] = rowIdx;
            dataRow["FederalOrState"] = TaxType.Federal;
            dataRow["DeductionOrCredit"] = DeductionOrCredit.Credit;
            data["DeductionsAndCredits"].push(dataRow);
        }

        for (let rowIdx in this.StateDeductions) {
            let dataRow = this.StateDeductions[rowIdx].getDataToSave();
            dataRow["RowNum"] = rowIdx;
            dataRow["FederalOrState"] = TaxType.State;
            dataRow["DeductionOrCredit"] = DeductionOrCredit.Deduction;
            data["DeductionsAndCredits"].push(dataRow);
        }

        for (let rowIdx in this.StateCredits) {
            let dataRow = this.StateCredits[rowIdx].getDataToSave();
            dataRow["RowNum"] = rowIdx;
            dataRow["FederalOrState"] = TaxType.State;
            dataRow["DeductionOrCredit"] = DeductionOrCredit.Credit;
            data["DeductionsAndCredits"].push(dataRow);
        }

        //Additional Taxes
        data["AdditionalTaxes"] = [];

        for (let rowIdx in this.AdditionalTaxes) {
            let dataRow = this.AdditionalTaxes[rowIdx].getDataToSave();
            dataRow["RowNum"] = rowIdx;
            data["AdditionalTaxes"].push(dataRow);
        }

        return data;
    }

    showFilingStatusHelpInfo(): void {
        let title: string = "Filing Status";
        let message: string = "Filing status is based on marital status and family situation. You will fall into one of five possible categories: single, married filing jointly, married filing separately, head of household, or qualifying widow(er) with dependent children.";
        let link = "https://www.irs.gov/publications/p501/ar02.html#en_US_2016_publink1000220721";
        let linkMessage = "More Info";
        this.popupDialogService.display(title,message,link,linkMessage);
    }

    showExemptionsHelpInfo(): void {
        let title: string = "Exemptions";
        let message: string = "Exemptions reduce the amount of tax owed. If you are not a dependent of another taxpayer, you can claim one exemption plus an additional exemption for each dependent you have.";
        let link = "https://www.irs.gov/publications/p501/ar02.html#en_US_2016_publink1000220844";
        let linkMessage = "More Info";
        this.popupDialogService.display(title,message,link,linkMessage);
    }

    showFederalDeductionsHelpInfo(): void {
        let title: string = "Federal Deductions";
        let message: string = "Federal deductions reduce the amount of tax owed at the federal level. If you're unsure of what to enter, just click the Add Standard button.";
        let link = "https://www.irs.gov/publications/p501/ar02.html#en_US_2016_publink1000221051";
        let linkMessage = "More Info";
        this.popupDialogService.display(title,message,link,linkMessage);
    }

    showFederalCreditsHelpInfo(): void {
        let title: string = "Federal Credits";
        let message: string = "Federal credits reduce the amount of tax owed at the federal level. If you're unsure of what to enter, don't enter anything.";
        let link = "https://www.irs.gov/credits-deductions/individuals";
        let linkMessage = "More Info";
        this.popupDialogService.display(title,message,link,linkMessage);
    }

    showStateDeductionsHelpInfo(): void {
        let title: string = "State Deductions";
        let message: string = "State deductions reduce the amount of tax owed at the state level. If you're unsure of what to enter, just click the Add Standard button if it exists for your state, otherwise don't enter anything.";
        let link = "http://www.google.com/search?q=" + this.States[this.State] + "+state+tax+deductions";
        let linkMessage = "More Info";
        this.popupDialogService.display(title,message,link,linkMessage);
    }

    showStateCreditsHelpInfo(): void {
        let title: string = "State Credits";
        let message: string = "State credits reduce the amount of tax owed at the state level. If you're unsure of what to enter, don't enter anything.";
        let link = "http://www.google.com/search?q=" + this.States[this.State] + "+state+tax+credits";
        let linkMessage = "More Info";
        this.popupDialogService.display(title,message,link,linkMessage);
    }
}

