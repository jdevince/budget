import { Component, Input } from '@angular/core';
import { InputSectionRow } from './input-section-row.model';
import { CustomCurrencyPipe } from './../custom-currency.pipe';
import { BudgetService } from './../budget.service';

@Component({
  moduleId: module.id,
  selector: 'input-section',
  templateUrl: '/app/budget/input-section/input-section.component.html',
  styleUrls: ['../../../app/budget/input-section/input-section.component.css'], //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
  providers: [CustomCurrencyPipe]
})

export class InputSectionComponent {
    showPreTaxCheckbox: boolean = false;
    rows: InputSectionRow[] = [];

    @Input() type: string;
    
    @Input()
    set enablePreTaxCheckbox(enablePreTaxCheckbox: string) {
        this.showPreTaxCheckbox = (enablePreTaxCheckbox === "true");
    }

    constructor(private budgetService: BudgetService) { }

    ngOnInit() : void {
        this.budgetService.loadInputSection(this.type)
                                    .subscribe(
                                        rows    =>  this.rows = rows,
                                        error   =>  console.log(<any>error)
                                    );
    }

    addRow(): void {
        let preTaxDefault: boolean = this.showPreTaxCheckbox ? false : null;
        let newRow = new InputSectionRow(null, 0, preTaxDefault);
        this.rows.push(newRow);
    }

    deleteRow(row: InputSectionRow): void {
        let index = this.rows.indexOf(row);
        this.rows.splice(index, 1);
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
            let row = { };
            row["Type"] = this.type;
            row["RowNum"] = rowNum;
            row["Label"] = this.rows[rowNum].label;
            row["Monthly"] = this.rows[rowNum].getMonthlyNumber();
            row["PreTax"] = this.rows[rowNum].preTax;
            data.push(row);
        }

        return data;
    }
 }