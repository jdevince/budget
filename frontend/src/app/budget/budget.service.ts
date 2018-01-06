import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { TaxType, DeductionOrCredit, PreOrPostTax } from './budget.enums';
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
        
        this.budgetServerAPIService.loadInputSection(inputSection.type, this.userService.getAccessToken())
            .subscribe(
            rows => {
                inputSection.rows = rows;
                this._JSONDataInDatabase = this.getJSONDataToSave();
            },
            error => console.log(<any>error)
            );
    }

    loadTaxes(taxesComponent: TaxesComponent): void {
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

                this._JSONDataInDatabase = this.getJSONDataToSave();
            },
            error => console.log(<any>error)
            );
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
    getIncomeMinusPreTax(): number {
        return this.getInputSectionAnnualTotal("Incomes") - this.getInputSectionAnnualTotal("Expenses", PreOrPostTax.PreTaxOnly) - this.getInputSectionAnnualTotal("Savings", PreOrPostTax.PreTaxOnly)
    }

    getInputSectionAnnualTotal(inputSectionType: string, preOrPostTax = PreOrPostTax.EitherPreOrPostTax): number {
        ///Returns the sum of annual amounts for the given type and pre/post tax status
        ///If getPreTax === false, returns only non-preTax. If getPreTax === true, retuns only preTax.

        if (this.InputSections === undefined) {
            return 0;
        }

        let total: number = 0;

        for (let inputSection of this.InputSections) {
            if (inputSection.type === inputSectionType) {
                for (let row of inputSection.rows) {
                    if ((preOrPostTax === PreOrPostTax.EitherPreOrPostTax)
                        || (preOrPostTax === PreOrPostTax.PreTaxOnly && row.preTax === true)
                        || (preOrPostTax === PreOrPostTax.PostTaxOnly && row.preTax === false)) {
                        total += row.getAnnuallyNumber();
                    }
                }
            }
        }

        return total;
    }

    getAfterTaxes(): number {
        return this.getIncomeMinusPreTax() - this.TaxesComponent.TaxesSum;
    }

    getAfterSavings(): number {
        return this.getAfterTaxes() - this.getInputSectionAnnualTotal("Savings", PreOrPostTax.PostTaxOnly);
    }

    getAfterExpenses(): number {
        return this.getAfterSavings() - this.getInputSectionAnnualTotal("Expenses", PreOrPostTax.PostTaxOnly);
    }

    getTotalSavings(): number {
        return this.getInputSectionAnnualTotal("Savings") + this.getAfterExpenses();
    }

    getIncomeSubjectToFICA(): number {
        //Returns sum of all rows in Incomes section. 
        //Future enhancement: Only add "Earned Income" (i.e. salary, but not dividends)

        return this.getInputSectionAnnualTotal("Incomes");
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