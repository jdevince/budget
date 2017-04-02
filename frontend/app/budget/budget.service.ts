import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';

import { InputSectionComponent } from './input-section.component';
import { InputSectionRow } from './InputSectionRow';
import { TaxesComponent } from './taxes.component';
import { UserService } from '../user/user.service';
import { LabelAndCurrencyRow } from './LabelAndCurrencyRow';

@Injectable()
export class BudgetService {
    public InputSections: InputSectionComponent[];
    public TaxesComponent: TaxesComponent;

    constructor(
        private userService: UserService,
        private http: Http
    ) {}

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
            console.log(row);
            if (row.FederalOrState === "Federal") {
                if (row.DeductionOrCredit === "Deduction") {
                    //Federal Deduction
                    federalDeductions.push(new LabelAndCurrencyRow(row.Label, row.Amount));
                }
                else {
                    //Federal Credit
                    federalCredits.push(new LabelAndCurrencyRow(row.Label, row.Amount));
                }
            }
            else {
                if (row.DeductionOrCredit === "Deduction") {
                    //State Deduction
                    stateDeductions.push(new LabelAndCurrencyRow(row.Label, row.Amount));
                }
                else {
                    //State Credit
                    stateCredits.push(new LabelAndCurrencyRow(row.Label, row.Amount));
                }
            }
        }

        taxInfo.FederalDeductions = federalDeductions;
        taxInfo.FederalCredits = federalCredits;
        taxInfo.StateDeductions = stateDeductions;
        taxInfo.StateCredits = stateCredits;

        let additionalTaxes: LabelAndCurrencyRow[] = [];
        for (let row of res.json().value.additionalTaxes) {
            additionalTaxes.push(new LabelAndCurrencyRow(row.Label, row.Amount));
        }
        taxInfo.AdditionalTaxes = additionalTaxes;
    
        return taxInfo;
    }

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
        if (this.InputSections === undefined) {
            return 0;
        }

        let incomeMinusPreTax: number = 0;

        for (let inputSection of this.InputSections) {
            for (let row of inputSection.rows) {
                if (inputSection.type === "Incomes") {
                    //Add all incomes
                    incomeMinusPreTax += row.getAnnuallyNumber();
                }
                else if (row.preTax) {
                    //Subtract pre-tax expenses and savings
                    incomeMinusPreTax -= row.getAnnuallyNumber();
                }
            }
        }

        return incomeMinusPreTax;
    }

    getIncomeSubjectToFICA(): number {
        //Returns sum of all rows in Incomes section. 
        //Future enhancement: Only add "Earned Income" (i.e. salary, but not dividends)

        if (this.InputSections === undefined) {
            return 0;
        }

        let income: number = 0;

        for (let inputSection of this.InputSections) {
            if (inputSection.type === "Incomes") {
                for (let row of inputSection.rows) {
                    income += row.getAnnuallyNumber();
                }
            }
        }

        return income;
    }
}