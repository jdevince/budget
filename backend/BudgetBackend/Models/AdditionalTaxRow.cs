using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    [Table("AdditionalTaxes")]
    public class AdditionalTaxRow : LabelAndCurrencyRow
    {
        public int TaxInfoId { get; set; }
        public TaxInfo TaxInfo { get; set; }
    }
}
