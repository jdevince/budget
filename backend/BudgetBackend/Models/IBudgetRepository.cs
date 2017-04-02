using BudgetBackend.Enums;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    public interface IBudgetRepository
    {
        BudgetInputRow[] LoadBudgetInputs(string username, BudgetInputTypes inputSectionType);
        TaxInfo LoadTaxInfo(string username);
        bool Save(int userId, List<BudgetInputRow> budgetInputRows, TaxInfo taxInfo);
        string GetFederalTaxBrackets(int year);
        string GetStateTaxBrackets(int year, string stateAbbr);
    }
}
