import { CustomCurrencyPipe } from './custom-currency.pipe';

export class Row {
    private _monthly: number;
    private _currencyPipe: CustomCurrencyPipe;

    label: string;
    preTax: boolean;

    get monthly() : string {
        if (this._monthly !== undefined && this._monthly !==null) {
            return this._currencyPipe.transform(this._monthly);
        }
        else {
            return null;
        }
    }

    set monthly(amount: string) {
        this._monthly = parseFloat(amount);
    }

    get annually() : string {
        if (this._monthly !== undefined && this._monthly !==null) {
            return this._currencyPipe.transform(this._monthly * 12);
        }
        else {
            return null;
        }
    }

    set annually(amount: string) {
        this._monthly = parseFloat(amount) / 12;
    }

    constructor(label: string, monthly: number, preTax: boolean) {
        this.label = label;
        this._monthly = monthly;
        this.preTax = preTax;

        this._currencyPipe = new CustomCurrencyPipe();
    }

    getMonthlyNumber() : number {
        return this._monthly;
    }
}