import { CustomCurrencyPipe } from './../custom-currency.pipe';

export class LabelAndCurrencyRow {
    private _amount: number;
    private _currencyPipe: CustomCurrencyPipe;

    label: string;

    constructor(label: string, amount: number) {
        this.label = label;
        this._amount = amount;
        this._currencyPipe = new CustomCurrencyPipe();
    }

    get amount(): string {
        return this._currencyPipe.transform(this._amount);
    }

    set amount(amount: string) {
        if (amount === "") {
            this._amount = 0;
        }
        else {
            this._amount = parseFloat(amount);
        }
    }

    getAmount(): number {
        return this._amount;
    }

    getDataToSave(): any {
        let data: any = {};

        data["Label"] = this.label;
        data["Amount"] = this._amount;

        return data;
    }
}