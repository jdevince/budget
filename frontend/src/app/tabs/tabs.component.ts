import { Component, Input } from '@angular/core';
import { Tab } from './tab.component';

@Component({
    selector: 'tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['../../app/tabs/tabs.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})
export class Tabs {
    tabs: Tab[] = [];

    selectTab(tab: Tab) {
        this.tabs.forEach((tab) => {
            tab.active = false;
        });
        tab.active = true;
    }

    addTab(tab: Tab) {
        if (this.tabs.length === 0) {
            tab.active = true;
        }
        this.tabs.push(tab);
    }
}