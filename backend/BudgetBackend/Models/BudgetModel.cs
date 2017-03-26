using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    public class BudgetModel
    {
        public InputSectionRow[] Incomes;
        public InputSectionRow[] Expenses;
        public InputSectionRow[] Savings;
        public Taxes Taxes;
    }
}
