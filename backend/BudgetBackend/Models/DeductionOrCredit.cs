using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using BudgetBackend.Enums;

namespace BudgetBackend.Models
{
    [Table("DeductionsAndCredits")]
    public class DeductionOrCredit : LabelAndCurrencyRow
    {
        public FederalOrState federalOrState;
        public Enums.DeductionOrCredit deductionOrCredit;
    }
}
