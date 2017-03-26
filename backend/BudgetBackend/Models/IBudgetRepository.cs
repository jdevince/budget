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
        JsonResult LoadInputSection(string username, InputSectionTypes inputSectionType);
        JsonResult LoadTaxes(string username);
        bool Save(int userId, BudgetModel budgetModel);
        string GetFederalTaxBrackets(int year);
        string GetStateTaxBrackets(int year, string stateAbbr);
    }
}
