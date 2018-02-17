import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { TaxType, DeductionOrCredit, CheckboxValues } from './budget.enums';
import { InputSectionComponent } from './input-section/input-section.component';
import { InputSectionRow } from './input-section/input-section-row.model';
import { TaxesComponent } from './taxes/taxes.component';
import { LabelAndCurrencyRow } from './taxes/label-and-currency-row.model';

import { UserService } from '../user/user.service';
import { BudgetServerAPIService } from './budgetServerAPI.service';

@Injectable()
export class BudgetService {
    public InputSections: InputSectionComponent[] = [];
    public TaxesComponent: TaxesComponent;

    private _JSONDataInDatabase: string; //Used to track if there are unsaved changes. It is set after a load from the server.

    constructor(
        private userService: UserService,
        private budgetServerAPIService: BudgetServerAPIService
    ) { }

    save(): boolean {
        if (!this.hasUnsavedChanges()) {
            return true; //No need to save. Return true to indicate no errors.
        }

        let success: boolean;
        let JSONDataToSave: string = this.getJSONDataToSave();

        this.budgetServerAPIService.save(JSONDataToSave, this.userService.getAccessToken())
            .subscribe(
            result => success = result,
            error => console.log(<any>error)
            );

        this._JSONDataInDatabase = JSONDataToSave;

        return success;
    }

    loadInputSection(inputSection: InputSectionComponent): void {
        
        if (this.userService.isLoggedIn()) {
            this.budgetServerAPIService.loadInputSection(inputSection.type, this.userService.getAccessToken())
            .subscribe(
            rows => {
                inputSection.rows = rows;

                //Cache database data so we can know when there is new unsaved data
                this._JSONDataInDatabase = this.getJSONDataToSave();
            },
            error => console.log(<any>error)
            );
        }
        else {
            inputSection.rows = new Array<InputSectionRow>();

            //If you update the defaults, also update in BudgetInputRow.cs
            switch (inputSection.type) {
                case "Incomes": {
                    inputSection.rows.push(new InputSectionRow("Salary", 4000, false));
                    inputSection.rows.push(new InputSectionRow("401k match", 100, true));
                    break;
                }
                case "Expenses": {
                    inputSection.rows.push(new InputSectionRow("Groceries", 200, false));
                    inputSection.rows.push(new InputSectionRow("Health insurance", 100, true));
                    break;
                }
                case "Savings": {
                    inputSection.rows.push(new InputSectionRow("401k", 500, true));
                    inputSection.rows.push(new InputSectionRow("House downpayment", 500, false));
                    break;
                }
            }

            //this._JSONDataInDatabase only needs to be loaded once, so it's loaded in loadTaxes
        }
    }

    loadTaxes(taxesComponent: TaxesComponent): void {
        if (this.userService.isLoggedIn()) {
            this.budgetServerAPIService.loadTaxes(this.userService.getAccessToken())
                .subscribe(
                loadedData => {
                    taxesComponent.FilingStatus = loadedData.FilingStatus;
                    taxesComponent.Exemptions = loadedData.Exemptions;
                    taxesComponent.TaxYear = loadedData.TaxYear;
                    taxesComponent.State = loadedData.State;
                    taxesComponent.FederalDeductions = loadedData.FederalDeductions;
                    taxesComponent.FederalCredits = loadedData.FederalCredits;
                    taxesComponent.StateDeductions = loadedData.StateDeductions;
                    taxesComponent.StateCredits = loadedData.StateCredits;
                    taxesComponent.AdditionalTaxes = loadedData.AdditionalTaxes;

                    //Cache database data so we can know when there is new unsaved data
                    this._JSONDataInDatabase = this.getJSONDataToSave();
                },
                error => console.log(<any>error)
                );
        }
        else {
            taxesComponent.FilingStatus = 0;
            taxesComponent.Exemptions = 1;
            taxesComponent.TaxYear = 2018;
            taxesComponent.State = 0;
            taxesComponent.FederalDeductions = new Array<LabelAndCurrencyRow>();
            taxesComponent.FederalCredits = new Array<LabelAndCurrencyRow>();
            taxesComponent.StateDeductions = new Array<LabelAndCurrencyRow>();
            taxesComponent.StateCredits = new Array<LabelAndCurrencyRow>();
            taxesComponent.AdditionalTaxes = new Array<LabelAndCurrencyRow>();

            //Cache database data so we can know when there is new unsaved data. Load directly from string because references to input sections may not be set up yet.
            this._JSONDataInDatabase = '{"BudgetInputRows":[{"Type":"Incomes","RowNum":"0","Label":"Salary","Monthly":4000,"PreTax":false},{"Type":"Incomes","RowNum":"1","Label":"401k match","Monthly":100,"PreTax":true},{"Type":"Expenses","RowNum":"0","Label":"Groceries","Monthly":200,"PreTax":false},{"Type":"Expenses","RowNum":"1","Label":"Health insurance","Monthly":100,"PreTax":true},{"Type":"Savings","RowNum":"0","Label":"401k","Monthly":500,"PreTax":true},{"Type":"Savings","RowNum":"1","Label":"House downpayment","Monthly":500,"PreTax":false}],"TaxInfo":{"FilingStatus":0,"Exemptions":1,"TaxYear":2018,"State":0,"DeductionsAndCredits":[],"AdditionalTaxes":[]}}';
        }
    }

    loadFederalTaxBrackets(federalTaxBrackets: any, year: number): void {      
        this.budgetServerAPIService.loadFederalTaxBrackets(year)
            .subscribe(
            loadedBrackets => federalTaxBrackets[year] = loadedBrackets,
            error => console.log(<any>error)
            );
    }

    loadStateTaxBrackets(stateTaxBrackets: any, year: number, stateAbbr: string): any {
        this.budgetServerAPIService.loadStateTaxBrackets(year, stateAbbr)
            .subscribe(
            loadedBrackets => stateTaxBrackets[year + "-" + stateAbbr] = loadedBrackets,
            error => console.log(<any>error)
            );
    }

    //Private functions
    private getJSONDataToSave(): string {
        if (!this.InputSections || !this.TaxesComponent) {
            //Not loaded yet
            return "";
        }

        let user: any = {
            "BudgetInputRows": [],
            "TaxInfo": {}
        };

        // Input Sections (Income, Expenses, Savings)
        for (let inputSection of this.InputSections) {
            user.BudgetInputRows = user.BudgetInputRows.concat(inputSection.getDataToSave());
        }

        //Taxes
        user.TaxInfo = this.TaxesComponent.getDataToSave();

        return JSON.stringify(user);
    }

    //Get functions
    getIncomeMinusNoTaxAndPreTax(): number {
        return this.getInputSectionAnnualTotal("Incomes",CheckboxValues.UncheckedOnly) - this.getInputSectionAnnualTotal("Expenses", CheckboxValues.CheckedOnly) - this.getInputSectionAnnualTotal("Savings", CheckboxValues.CheckedOnly);
    }

    getInputSectionAnnualTotal(inputSectionType: string, checkboxValues: CheckboxValues = CheckboxValues.BothCheckedAndUnchecked): number {
        ///Returns the sum of annual amounts for the given type and checkbox (NoTax/PreTax) status

        if (this.InputSections === undefined) {
            return 0;
        }

        let total: number = 0;

        for (let inputSection of this.InputSections) {
            if (inputSection.type === inputSectionType) {
                for (let row of inputSection.rows) {
                    if ((checkboxValues === CheckboxValues.BothCheckedAndUnchecked)
                        || (checkboxValues === CheckboxValues.CheckedOnly && row.checkbox === true)
                        || (checkboxValues === CheckboxValues.UncheckedOnly && row.checkbox === false)) {
                        total += row.getAnnuallyNumber();
                    }
                }
            }
        }

        return total;
    }

    getAfterTaxes(): number {
        return this.getInputSectionAnnualTotal("Incomes") - this.TaxesComponent.TaxesSum;
    }

    getAfterExpenses(): number {
        return this.getAfterTaxes() - this.getInputSectionAnnualTotal("Expenses");
    }

    getAfterSavings(): number {
        return this.getAfterExpenses() - this.getInputSectionAnnualTotal("Savings");
    }

    getTotalSavings(): number {
        return this.getInputSectionAnnualTotal("Savings") + this.getAfterSavings();
    }

    getIncomeSubjectToFICA(): number {
        return this.getInputSectionAnnualTotal("Incomes", CheckboxValues.UncheckedOnly);
    }

    //Miscellaneous functions
    reload() {
        for (let inputSection of this.InputSections) {
            this.loadInputSection(inputSection);
        }

        this.loadTaxes(this.TaxesComponent);
    }

    hasUnsavedChanges(): boolean {
        if (this.getJSONDataToSave() === this._JSONDataInDatabase) {
            return false;
        }
        else {
            return true;
        }
    }
}