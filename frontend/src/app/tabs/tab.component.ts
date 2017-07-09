import { Component, Input } from '@angular/core';
import { Tabs } from './tabs.component';

@Component({
    selector: 'tab',
    templateUrl: './tab.component.html',
    styleUrls: ['../../app/tabs/tab.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})
export class Tab {
    @Input() tabTitle: string;
    active: boolean = false;

    constructor(tabs: Tabs) {
        tabs.addTab(this);
    }
}