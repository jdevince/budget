export class Row {
    label: string;
    monthly: number;
    preTax: boolean;

    get annually() : number {
        return this.monthly * 12;
    }

    constructor(label: string, monthly: number, preTax: boolean) {
        this.label = label;
        this.monthly = monthly;
        this.preTax = preTax;
    }
}