import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';

import { InputSectionComponent } from './input-section.component';
import { InputSectionRow } from './InputSectionRow';
import { TaxesComponent } from './taxes.component';
import { UserService } from '../user/user.service';

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

        if (!this.userService.isLoggedIn()) {
            //If user not logged in, return default values

            let rows: Array<InputSectionRow> = [];

            switch (type) {
                case "Incomes":
                    rows.push(new InputSectionRow("Primary Job", 9750));
                    rows.push(new InputSectionRow("Secondary Job", 1000));
                    break;                   
                case "Expenses":
                    rows.push(new InputSectionRow("Groceries", 200, false));
                    rows.push(new InputSectionRow("Health Insurance", 100, true));
                    break;
                case "Savings":
                    rows.push(new InputSectionRow("401k", 500, true));
                    rows.push(new InputSectionRow("Roth IRA", 300, false));
                    rows.push(new InputSectionRow("Car", 100, false));
                    break;
            }

            return Observable.of(rows);
        }
        else {
            //If user is logged in, return user's saved data

            //Load from server
            let requestURL = 'http://localhost:5000/api/budget/load?type=' + type; 
            let headers = new Headers({ 'Content-Type': 'application/json' });
            headers.append('Authorization', 'Bearer ' + this.userService.getAccessToken());
            let options = new RequestOptions({ headers: headers });

            return this.http
                        .get(requestURL, options)
                        .map(this.extractRows);
        }    
    }

    loadTaxes(): Observable<TaxesComponent> {

        if (this.userService.isLoggedIn()) {
            //If user is logged in, return user's saved data

            //Load from server
            let requestURL = 'http://localhost:5000/api/budget/load?type=Taxes'; 
            let headers = new Headers({ 'Content-Type': 'application/json' });
            headers.append('Authorization', 'Bearer ' + this.userService.getAccessToken());
            let options = new RequestOptions({ headers: headers });

            return this.http
                    .get(requestURL, options)
                    .map(this.extractTaxesComponent);
        }    

        return Observable.of(null);
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

    extractTaxesComponent(res: any): TaxesComponent {
        console.log(res.json());
        return null;
    }

    getJSONForSave(): string {
        let data = { 
            "Incomes": [],
            "Expenses": [],
            "Savings": [], 
            "Taxes": {} 
        };

        //Input Sections (Income, Expenses, Savings)
        for (let inputSection of this.InputSections) {
            data[inputSection.type] = inputSection.getDataToSave();
        }

        //Taxes
        data.Taxes = this.TaxesComponent.getDataToSave();
        
        return JSON.stringify(data);
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