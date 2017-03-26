using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    [DataContract]
    public class Taxes
    {
        [Key]
        public int id { get; set; }
        [ForeignKey("User")]
        public int userId { get; set; }

        [DataMember]
        public int FilingStatus;
        [DataMember]
        public int Exemptions;
        [DataMember]
        public int State;

        public DeductionOrCredit[] FederalDeductions;
        public DeductionOrCredit[] FederalCredits;
        public DeductionOrCredit[] StateDeductions;
        public DeductionOrCredit[] StateCredits;

        public LabelAndCurrencyRow[] AdditionalTaxes;
    }
}
