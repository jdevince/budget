import { Component, Input } from '@angular/core';
import { Row } from './row';

@Component({
  moduleId: module.id,
  selector: 'input-section',
  templateUrl: '/app/budget/input-section.component.html',
  styleUrls: ['../../app/budget/input-section.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class InputSectionComponent {
    showPreTaxCheckbox: boolean = false;
    rows: Row[];

    @Input() type: string;
    
    @Input()
    set enablePreTaxCheckbox(enablePreTaxCheckbox: string) {
        this.showPreTaxCheckbox = (enablePreTaxCheckbox === "true");
    }

    ngOnInit() : void {
        //TODO: Replace with service
        this.rows = new Array<Row>();
        this.rows.push(new Row("Primary Job", 8750, true));
        this.rows.push(new Row("Secondary Job", 1000, true));
    }
 }