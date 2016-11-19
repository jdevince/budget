import { Injectable } from '@angular/core';
import { Row } from './row';

@Injectable()
export class InputSectionService {

    getRows(type: string) {

        //Determine if preTaxCheckbox should be shown
        let preTaxCheckbox: boolean;
        switch (type) {
            case "Incomes":
                preTaxCheckbox = false;
                break;
            case "Expenses":
            case "Savings":
                preTaxCheckbox = true;
                break;
            default:
                preTaxCheckbox = false;
        }

        
        


        let rows = new Array<Row>();
        rows.push(new Row("Primary Job", 9750, true));
        rows.push(new Row("Secondary Job", 1000, true));
        return rows;
    }
        
}