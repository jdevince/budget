import { Component, Input } from '@angular/core';
import { InputSectionRow } from './input-section-row.model';
import { CustomCurrencyPipe } from './../custom-currency.pipe';
import { BudgetService } from './../budget.service';

@Component({
    selector: 'input-section',
    templateUrl: './input-section.component.html',
    styleUrls: ['../../../app/budget/input-section/input-section.component.css'], //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
    providers: [CustomCurrencyPipe]
})

export class InputSectionComponent {
    rows: InputSectionRow[] = [];

    @Input() type: string;

    constructor(private budgetService: BudgetService) { }

    ngOnInit(): void {
        this.budgetService.loadInputSection(this);
    }

    insertRow(row: InputSectionRow): void {
        let index: number = this.rows.indexOf(row);
        let newRow = new InputSectionRow(null, 0, false);

        if (index === this.rows.length - 1) {
            //Selected row is last row. Add new row to end.
            this.rows.push(newRow)
        }
        else {
            //Add new row after selected row
            this.rows.splice(index + 1, 0, newRow);
        }
    }

    deleteRow(row: InputSectionRow): void {
        let index = this.rows.indexOf(row);
        this.rows.splice(index, 1);
    }

    getCheckboxLabel(): string {
        let label: string;
        if (this.type === "Incomes") {
            label = "No Tax";
        }
        else {
            //Expenses + Savings
            label = "Pre Tax";
        }
        return label;
    }

    getMonthlyTotal(): number {
        let total = 0;

        if (this.rows !== undefined) {
            for (let row of this.rows) {
                total += row.getMonthlyNumber();
            }
        }

        return total;
    }

    getAnnuallyTotal(): number {
        return this.getMonthlyTotal() * 12
    }

    getDataToSave(): any {
        let data: Object[] = [];

        for (let rowNum in this.rows) {
            let row = {};
            row["Type"] = this.type;
            row["RowNum"] = rowNum;
            row["Label"] = this.rows[rowNum].label;
            row["Monthly"] = this.rows[rowNum].getMonthlyNumber();
            row["PreTax"] = this.rows[rowNum].checkbox;

            data.push(row);
        }

        return data;
    }
}