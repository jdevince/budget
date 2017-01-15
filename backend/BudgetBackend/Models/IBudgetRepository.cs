using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    public interface IBudgetRepository
    {
        JsonResult Load(string username, string type);
        bool Save(int userId, InputSectionRow[] rows);
        string GetFederalTaxBrackets(int year);
    }
}
