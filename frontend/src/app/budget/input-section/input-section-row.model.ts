import { CustomCurrencyPipe } from './../custom-currency.pipe';

export class InputSectionRow {
    private _monthly: number;
    private _currencyPipe: CustomCurrencyPipe;

    label: string;
    checkbox: boolean;

    constructor(label: string, monthly: number, checkbox: boolean) {
        this.label = label;
        this._monthly = monthly;
        this.checkbox = checkbox;

        this._currencyPipe = new CustomCurrencyPipe();
    }

    get monthly(): string {
        return this._currencyPipe.transform(this._monthly);
    }

    set monthly(amount: string) {
        if (amount === "") {
            this._monthly = 0;
        }
        else {
            this._monthly = this._currencyPipe.parse(amount);
        }
    }

    get annually(): string {
        return this._currencyPipe.transform(this._monthly * 12);
    }

    set annually(amount: string) {
        if (amount === "") {
            this._monthly = 0;
        }
        else {
            this._monthly = this._currencyPipe.parse(amount) / 12;
        }
    }

    getMonthlyNumber(): number {
        return this._monthly;
    }

    getAnnuallyNumber(): number {
        return this._monthly * 12;
    }
}