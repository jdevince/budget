import { Directive, HostListener, ElementRef, OnInit } from "@angular/core";
import { CustomCurrencyPipe } from "./custom-currency.pipe";

@Directive({ selector: "[customCurrencyFormatter]" })
export class CustomCurrencyFormatterDirective implements OnInit {

  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private currencyPipe: CustomCurrencyPipe
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.el.value = this.currencyPipe.transform(this.el.value);
  }

  @HostListener("focus", ["$event.target.value"])
  onFocus(value) {
    let parsedValue = this.currencyPipe.parse(value); 
    this.el.value = (parsedValue > 0) ? parsedValue.toString() : "";
  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value) {
    this.el.value = this.currencyPipe.transform(value);
  }

}