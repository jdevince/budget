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
        [Key]
        public int id { get; set; }
        [ForeignKey("User")]
        public int userId { get; set; }

        public int rowNum { get; set; }

        public string label;
        public double amount;
    }
}
