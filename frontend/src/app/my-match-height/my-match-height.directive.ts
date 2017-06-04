// Inspired by: https://scotch.io/tutorials/responsive-equal-height-with-angular-directive

import { Directive, ElementRef, AfterViewChecked, Input, HostListener } from '@angular/core';
import { WindowService } from './../window/window.service';

@Directive({
    selector: '[myMatchHeight]'
})
export class MyMatchHeightDirective implements AfterViewChecked {

    @Input('myMatchHeight')
    matchHeightClass: any;

    constructor(
        private el: ElementRef,
        private windowService: WindowService
        ) { }

    ngAfterViewChecked() {
        // call our matchHeight function here later
        this.matchHeights(this.el.nativeElement, this.matchHeightClass);
    }

    @HostListener('window:resize')
    onResize() {
        // call our matchHeight function here later
        this.matchHeights(this.el.nativeElement, this.matchHeightClass);
    }

    matchHeights(parent: HTMLElement, className: string) {
        // match height logic here
        
        if (!parent) return;
        let children: Element[] = Array.from(parent.getElementsByClassName(className));
        
        if (!children) return;

        // reset all children height
        children.forEach((x: HTMLElement) => {
            x.style.height = 'initial';
        })

        //Find number of columns in a row
        let classes: string[] = children[0].className.split(" "); //Assumes all children have same bootstrap classes
        let screenWidth: number = this.windowService.nativeWindow.innerWidth;
        let numCols: number = this.getColumnsInRow(classes, screenWidth); 

        for (let i = numCols; i <= children.length; i = i + numCols) {
            let childrenInRow: Element[] = children.slice(i - numCols, i)
            
            this.matchHeightsInRow(childrenInRow);
        }
    }

    matchHeightsInRow(elements: Element[]) {      
       // gather all heights
        const itemHeights = elements.map(x => x.getBoundingClientRect().height);

        // find max height
        const maxHeight = itemHeights.reduce((prev, curr) => {
            return curr > prev ? curr : prev;
        }, 0);
        
        // apply max height
        elements.forEach((x: HTMLElement) => x.style.height = `${maxHeight}px`);
    }

    getColumnsInRow(classes: string[], screenWidth: number): number {
        //Returns the number of columns in a row based on the current screen width and bootstrap 3 classes
        //Only works for equal width columns

        let className: string | null;
        let colWidth: number;

        if (screenWidth >= 1200) {
            //Large (lg)
            className = this.findLgClass(classes);
        }
        else if (screenWidth >= 992) {
            //Medium (md)
            className = this.findMdClass(classes);
        }
        else if (screenWidth >= 768) {
            //Small (sm)
            className = this.findSmClass(classes);
        }
        else {
            //Extra small(xs)
            className = this.findXsClass(classes);
        }

        if (className !== null) {
            colWidth = Number(className.split("-")[2]);
            return 12 / colWidth;
        }
        else {
            return 1;
        }   
    }

    findLgClass(classes: string[]): string | null {
        let tmpClassName = classes.find( className => className.startsWith("col-lg"));
        if (tmpClassName) {
            return tmpClassName;
        }
        else {
            return this.findMdClass(classes);
        }
    }

    findMdClass(classes: string[]): string | null {
        let tmpClassName = classes.find( className => className.startsWith("col-md"));
        if (tmpClassName) {
            return tmpClassName;
        }
        else {
            return this.findSmClass(classes);
        }
    }

    findSmClass(classes: string[]): string | null {
        let tmpClassName = classes.find( className => className.startsWith("col-sm"));
        if (tmpClassName) {
            return tmpClassName;
        }
        else {
            return this.findXsClass(classes);
        }
    }

    findXsClass(classes: string[]): string | null {
        let tmpClassName = classes.find( className => className.startsWith("col-xs"));
        if (tmpClassName) {
            return tmpClassName;
        }
        else {
            return null;
        }
    }
}