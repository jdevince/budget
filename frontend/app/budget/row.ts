import { CustomCurrencyPipe } from './custom-currency.pipe';

export class Row {
    private _monthly: number;
    private _currencyPipe: CustomCurrencyPipe;

    label: string;
    preTax: boolean;

    get monthly() : string {
        return this._currencyPipe.transform(this._monthly);
    }

    set monthly(amount: string) {
        if (amount === "") {
            this._monthly = 0;
        }
        else {
            this._monthly = parseFloat(amount);
        }
    }

    get annually() : string {
        return this._currencyPipe.transform(this._monthly * 12);
    }

    set annually(amount: string) {
        if (amount === "") {
            this._monthly = 0;
        }
        else {
            this._monthly = parseFloat(amount) / 12;
        }
    }

    constructor(label: string, monthly: number, preTax: boolean = null) {
        this.label = label;
        this._monthly = monthly;
        this.preTax = preTax;

        this._currencyPipe = new CustomCurrencyPipe();
    }

    getMonthlyNumber() : number {
        return this._monthly;
    }
}