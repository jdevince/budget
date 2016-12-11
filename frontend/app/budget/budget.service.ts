import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';

import { InputSectionComponent } from './input-section.component';
import { UserService } from '../user/user.service';

@Injectable()
export class BudgetService {

    constructor(
        private userService: UserService,
        private http: Http
    ) {}

    save(inputSections: InputSectionComponent[]): Observable<boolean> {
        if (this.userService.isLoggedIn()) {
            let saveURL = "http://localhost:5000/api/budget/save"
            let headers = new Headers({ 'Content-Type': 'application/json' });
            headers.append('Authorization', 'Bearer ' + this.userService.getAccessToken());
            let body = this.getJSONForSave(inputSections);
            let options = new RequestOptions({ headers: headers });
console.log(body)
            return this.http
                        .post(saveURL,body,options)
                        .map(response => response.ok);
        }

        return Observable.of(false);
    }

    getJSONForSave(inputSections: InputSectionComponent[]): string {
        let array = [];
        let jsonString: string;

        for (let inputSection of inputSections) {
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
}