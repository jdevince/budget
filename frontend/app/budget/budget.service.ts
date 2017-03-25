import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';

import { InputSectionComponent } from './input-section.component';
import { UserService } from '../user/user.service';

@Injectable()
export class BudgetService {
    public inputSections: InputSectionComponent[];

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

    getJSONForSave(): string {
        let array = [];
        let jsonString: string;

        for (let inputSection of this.inputSections) {
            for (let rowNum in inputSection.rows) {
                let row = { };
                row["type"] = inputSection.type;
                row["rowNum"] = rowNum;
                row["label"] = inputSection.rows[rowNum].label;
                row["monthly"] = inputSection.rows[rowNum].getMonthlyNumber();
                row["preTax"] = inputSection.rows[rowNum].preTax;
                array.push(row);
            }
        }
        return JSON.stringify(array);
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
        if (this.inputSections === undefined) {
            return 0;
        }

        let incomeMinusPreTax: number = 0;

        for (let inputSection of this.inputSections) {
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

        if (this.inputSections === undefined) {
            return 0;
        }

        let income: number = 0;

        for (let inputSection of this.inputSections) {
            if (inputSection.type === "Incomes") {
                for (let row of inputSection.rows) {
                    income += row.getAnnuallyNumber();
                }
            }
        }

        return income;
    }
}