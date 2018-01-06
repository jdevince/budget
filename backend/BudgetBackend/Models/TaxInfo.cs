using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    public class TaxInfo
    {
        public int Id { get; set; }
        public int FilingStatus { get; set; }
        public int Exemptions { get; set; }
        public int TaxYear { get; set; }
        public int State { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public List<DeductionOrCreditRow> DeductionsAndCredits { get; set; }
        public List<AdditionalTaxRow> AdditionalTaxes { get; set; }

        internal static TaxInfo GetDefaults()
        {
            TaxInfo taxInfo = new TaxInfo();

            taxInfo.FilingStatus = 0;
            taxInfo.Exemptions = 1;
            taxInfo.TaxYear = 2017;
            taxInfo.State = 0;
            taxInfo.DeductionsAndCredits = new List<DeductionOrCreditRow>();
            taxInfo.AdditionalTaxes = new List<AdditionalTaxRow>();

            return taxInfo;
        }
    }
}
