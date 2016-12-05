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
    [Table("InputSections")]
    public class InputSectionRow
    {
        [Key]
        public int id { get; set; }
        [ForeignKey("User")]
        public int userId { get; set; }
        public string type { get; set; }

        [DataMember]
        public string label { get; set; }
        [DataMember]
        public double monthly { get; set; }
        [DataMember]
        public bool? preTax { get; set; }
    }
}
