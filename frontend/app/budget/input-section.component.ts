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
    rows: Row[];

    @Input() type: string;
    
    @Input()
    set enablePreTaxCheckbox(enablePreTaxCheckbox: string) {
        this.showPreTaxCheckbox = (enablePreTaxCheckbox === "true");
    }

    constructor(private inputSectionService: InputSectionService) { }

    ngOnInit() : void {
        this.rows = this.inputSectionService.getRows(this.type);
    }

    addRow() {
        let newRow = new Row(null, 0, false);
        this.rows.push(newRow);
    }

    getMonthlyTotal() {
        let total = 0;

        for (let row of this.rows) {
            total += row.getMonthlyNumber();
        }

        return total;
    }

    getAnnuallyTotal() {
        return this.getMonthlyTotal() * 12
    }
 }