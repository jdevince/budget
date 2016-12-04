using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    public class BudgetRepository : IBudgetRepository
    {
        public JsonResult Load(string username)
        {
            var t = new InputSectionRow();
            t.label = "label1";
            t.monthly = 100;
            t.preTax = true;

            List<InputSectionRow> x = new List<InputSectionRow>();
            x.Add(t);
            x.Add(t);

            return new JsonResult(x);
        }
    }
}
