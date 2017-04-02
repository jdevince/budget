using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using BudgetBackend.Enums;

namespace BudgetBackend.Models
{
    [Table("DeductionsAndCredits")]
    public class DeductionOrCreditRow : LabelAndCurrencyRow
    {
        public FederalOrState FederalOrState { get; set; }
        public Enums.DeductionOrCredit DeductionOrCredit { get; set; }

        public int TaxInfoId { get; set; }
        public TaxInfo TaxInfo { get; set; }
    }
}
