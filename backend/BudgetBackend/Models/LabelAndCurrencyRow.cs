using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    public class LabelAndCurrencyRow
    {
        public int Id { get; set; }
        public int RowNum { get; set; }
        public string Label { get; set; }
        public double Amount { get; set; }
    }
}
