import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';

import { Row } from './row';
import { UserService } from '../user/user.service';

@Injectable()
export class InputSectionService {

    constructor(
        private userService: UserService,
        private http: Http
    ) {}

    getRows(type: string): Observable<Array<Row>> {

        let rows = new Array<Row>();

        if (!this.userService.isLoggedIn()) {
            //If user not logged in, return default values
            switch (type) {
                case "Incomes":
                    rows.push(new Row("Primary Job", 9750));
                    rows.push(new Row("Secondary Job", 1000));
                    break;
                case "Expenses":
                    rows.push(new Row("Groceries", 200, false));
                    rows.push(new Row("Health Insurance", 100, true));
                    break;
                case "Savings":
                    rows.push(new Row("401k", 500, true));
                    rows.push(new Row("Roth IRA", 300, false));
                    rows.push(new Row("Car", 100, false));
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
console.log("called");
            return this.http
                  .get(requestURL, options)
                  .map(this.extractRows)
                  //.catch(this.handleError);
        }        
    }

    extractRows(res: any): Row[] {
        console.log("extractRows");
        console.log(res);
        let rows = new Array<Row>();
        let data = res.json().value;
        data.forEach(element => {
            let label = element.label;
            let monthly = element.monthly;
            let preTax = element.preTax

            let row = new Row(label, monthly, preTax)
            rows.push(row);
        });
        return rows;
    }
}