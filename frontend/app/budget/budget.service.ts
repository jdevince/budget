import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';

import { TaxType, DeductionOrCredit, PreOrPostTax } from './budget.enums';
import { InputSectionComponent } from './input-section/input-section.component';
import { InputSectionRow } from './input-section/input-section-row.model';
import { TaxesComponent } from './taxes/taxes.component';
import { UserService } from '../user/user.service';
import { LabelAndCurrencyRow } from './taxes/label-and-currency-row.model';

@Injectable()
export class BudgetService {
    public InputSections: InputSectionComponent[];
    public TaxesComponent: TaxesComponent;

    constructor(
        private userService: UserService,
        private http: Http
    ) {}

    //Send data to server
    save(): Observable<boolean> {
        if (this.userService.isLoggedIn()) {
            let saveURL = "http://localhost:5000/api/budget/save"
            let headers = new Headers({ "Content-Type": "application/json" });
            headers.append("Authorization", "Bearer " + this.userService.getAccessToken());
            let body = this.getJSONForSave();
            let options = new RequestOptions({ headers: headers });

            return this.http
                        .post(saveURL,body,options)
                        .map(response => response.ok);
        }

        return Observable.of(false);
    }

    //Send data to server helper functions
    getJSONForSave(): string {
        let user = { 
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

    //Load data from server
    loadInputSection(type: string): Observable<Array<InputSectionRow>> {
        let requestURL = 'http://localhost:5000/api/budget/load?type=' + type; 
        let headers = new Headers({ 'Content-Type': 'application/json' });

        let authToken: string = this.userService.getAccessToken();
        if (authToken) {
            headers.append('Authorization', 'Bearer ' + this.userService.getAccessToken());
        }
        
        let options = new RequestOptions({ headers: headers });

        return this.http
                    .get(requestURL, options)
                    .map(this.extractRows);  
    }

    loadTaxes(): Observable<any> {
        let requestURL = 'http://localhost:5000/api/budget/load?type=Taxes'; 
        let headers = new Headers({ 'Content-Type': 'application/json' });

        let authToken: string = this.userService.getAccessToken();
        if (authToken) {
            headers.append('Authorization', 'Bearer ' + this.userService.getAccessToken());
        }

        let options = new RequestOptions({ headers: headers });

        return this.http
                .get(requestURL, options)
                .map(this.extractTaxesComponent);  
    }

    //Load data from server helper functions
    extractRows(res: any): InputSectionRow[] {
        let rows = new Array<InputSectionRow>();
        let data = res.json().value;
        data.forEach(element => {
            let label = element.label;
            let monthly = element.monthly;
            let preTax = element.preTax

            let row = new InputSectionRow(label, monthly, preTax)
            rows.push(row);
        });
        return rows;
    }

    extractTaxesComponent(res: any): any {
        let taxInfo: any = {}

        taxInfo.FilingStatus = res.json().value.filingStatus;
        taxInfo.Exemptions = res.json().value.exemptions;
        taxInfo.State = res.json().value.state;

        let federalDeductions: LabelAndCurrencyRow[] = [];
        let federalCredits: LabelAndCurrencyRow[] = [];
        let stateDeductions: LabelAndCurrencyRow[] = [];
        let stateCredits: LabelAndCurrencyRow[] = [];

        for (let row of res.json().value.deductionsAndCredits) {
            if (row.federalOrState === TaxType.Federal) {
                if (row.deductionOrCredit === DeductionOrCredit.Deduction) {
                    //Federal Deduction
                    federalDeductions.push(new LabelAndCurrencyRow(row.label, row.amount));
                }
                else {
                    //Federal Credit
                    federalCredits.push(new LabelAndCurrencyRow(row.label, row.amount));
                }
            }
            else {
                if (row.deductionOrCredit === DeductionOrCredit.Deduction) {
                    //State Deduction
                    stateDeductions.push(new LabelAndCurrencyRow(row.label, row.amount));
                }
                else {
                    //State Credit
                    stateCredits.push(new LabelAndCurrencyRow(row.label, row.amount));
                }
            }
        }

        taxInfo.FederalDeductions = federalDeductions;
        taxInfo.FederalCredits = federalCredits;
        taxInfo.StateDeductions = stateDeductions;
        taxInfo.StateCredits = stateCredits;

        let additionalTaxes: LabelAndCurrencyRow[] = [];
        for (let row of res.json().value.additionalTaxes) {
            additionalTaxes.push(new LabelAndCurrencyRow(row.label, row.amount));
        }
        taxInfo.AdditionalTaxes = additionalTaxes;
    
        return taxInfo;
    }

    //Get functions
    getFederalTaxBrackets(year: number): Observable<Object> {
        let url = "http://localhost:5000/api/budget/federalTaxBrackets/" + year.toString();
        return this.http
                        .get(url)
                        .map(response => response.json());
    }

    getStateTaxBrackets(year: number, stateAbbr: string): Observable<Object> {
        let url = "http://localhost:5000/api/budget/stateTaxBrackets/" + year.toString() + "/" + stateAbbr;
        return this.http
                        .get(url)
                        .map(response => response.json());
    }

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
}