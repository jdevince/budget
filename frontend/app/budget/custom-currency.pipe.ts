import { Pipe, PipeTransform } from "@angular/core";

const PADDING = "000000";

@Pipe({ name: "customCurrency" })
export class CustomCurrencyPipe implements PipeTransform {

  private SYMBOL: string
  private DECIMAL_SEPARATOR: string;
  private THOUSANDS_SEPARATOR: string;

  constructor() {
    // TODO comes from configuration settings
    this.SYMBOL = "$ ";
    this.DECIMAL_SEPARATOR = ".";
    this.THOUSANDS_SEPARATOR = ",";
  }

  transform(value: number | string, fractionSize: number = 2): string {
    let [ integer, fraction = "" ] = (value || "").toString()
      .split(this.DECIMAL_SEPARATOR);

    fraction = fractionSize > 0
      ? this.DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize)
      : "";

    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.THOUSANDS_SEPARATOR);

    return this.SYMBOL + integer + fraction;
  }

  parse(value: string, fractionSize: number = 2): number {
    value = value.replace(this.SYMBOL,"");
    let [ integer, fraction = "" ] = (value || "").split(this.DECIMAL_SEPARATOR);

    integer = integer.replace(new RegExp(this.THOUSANDS_SEPARATOR, "g"), "");

    fraction = parseInt(fraction, 10) > 0 && fractionSize > 0
      ? this.DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize)
      : "";

    return parseFloat(integer + fraction);
  }

}