import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { InputSectionRow } from './input-section/input-section-row.model';
import { LabelAndCurrencyRow } from './taxes/label-and-currency-row.model';

import { TaxType, DeductionOrCredit } from './budget.enums';

@Injectable()
export class BudgetServerAPIService {

    constructor(
        private http: Http
    ) { }

    save(JSONDataToSave: string, accessToken: string): Observable<boolean> {
        let saveURL = "http://localhost:5000/api/budget/save"
        let headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Authorization", "Bearer " + accessToken);
        let body = JSONDataToSave;
        let options = new RequestOptions({ headers: headers });

        return this.http
            .post(saveURL, body, options)
            .map(response => response.ok);
    }

    loadInputSection(type: string, accessToken: string): Observable<Array<InputSectionRow>> {
        let requestURL = 'http://localhost:5000/api/budget/load?type=' + type;
        let headers = new Headers({ 'Content-Type': 'application/json' });

        if (accessToken) {
            headers.append('Authorization', 'Bearer ' + accessToken);
        }

        let options = new RequestOptions({ headers: headers });

        return this.http
            .get(requestURL, options)
            .map(this.extractInputSectionRows);
    }

    loadTaxes(accessToken: string): Observable<any> {
        let requestURL = 'http://localhost:5000/api/budget/load?type=Taxes';
        let headers = new Headers({ 'Content-Type': 'application/json' });

        if (accessToken) {
            headers.append('Authorization', 'Bearer ' + accessToken);
        }

        let options = new RequestOptions({ headers: headers });

        return this.http
            .get(requestURL, options)
            .map(this.extractTaxesComponent);
    }

    loadFederalTaxBrackets(year: number): Observable<Object> {
        let url = "http://localhost:5000/api/budget/federalTaxBrackets/" + year.toString();
        return this.http
            .get(url)
            .map(response => response.json());
    }

    loadStateTaxBrackets(year: number, stateAbbr: string): Observable<Object> {
        let url = "http://localhost:5000/api/budget/stateTaxBrackets/" + year.toString() + "/" + stateAbbr;
        return this.http
            .get(url)
            .map(response => response.json());
    }

    private extractInputSectionRows(res: any): InputSectionRow[] {
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

    private extractTaxesComponent(res: any): any {
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
}