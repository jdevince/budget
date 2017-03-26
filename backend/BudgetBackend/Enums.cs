using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend.Enums
{
    public enum InputSectionTypes
    {
        Incomes,
        Expenses,
        Savings
    }

    public enum FederalOrState
    {
        Federal,
        State
    }

    public enum DeductionOrCredit
    {
        Deduction,
        Credit
    }
}
