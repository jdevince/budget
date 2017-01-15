import { Component, Input } from '@angular/core';
import { Row } from './row';
import { CustomCurrencyPipe } from './custom-currency.pipe';
import { InputSectionService } from './input-section.service';

@Component({
  moduleId: module.id,
  selector: 'input-section',
  templateUrl: '/app/budget/input-section.component.html',
  styleUrls: ['../../app/budget/input-section.component.css'], //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
  providers: [CustomCurrencyPipe, InputSectionService]
})

export class InputSectionComponent {
    showPreTaxCheckbox: boolean = false;
    rows: Row[] = [];

    @Input() type: string;
    
    @Input()
    set enablePreTaxCheckbox(enablePreTaxCheckbox: string) {
        this.showPreTaxCheckbox = (enablePreTaxCheckbox === "true");
    }

    constructor(private inputSectionService: InputSectionService) { }

    ngOnInit() : void {
        this.inputSectionService.getRows(this.type)
                                    .subscribe(
                                        rows    =>  this.rows = rows,
                                        error   =>  console.log(<any>error)
                                    );
    }

    addRow(): void {
        let preTaxDefault: boolean = this.showPreTaxCheckbox ? false : null;
        let newRow = new Row(null, 0, preTaxDefault);
        this.rows.push(newRow);
    }

    deleteRow(row: Row): void {
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
 }