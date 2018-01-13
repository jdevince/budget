using BudgetBackend.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    [Table("BudgetInputs")]
    public class BudgetInputRow : IEquatable<BudgetInputRow>
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public BudgetInputTypes Type { get; set; }
        public int RowNum { get; set; }

        public string Label { get; set; }
        public double Monthly { get; set; }
        [Column("PreTax")] //Not changing DB column name because SQLite can't do it easily
        public bool NoTaxPreTaxCheckbox { get; set; }

        public bool Equals(BudgetInputRow other)
        {
            if (this.Type != other.Type
                || this.RowNum != other.RowNum
                || this.Label != other.Label
                || this.Monthly != other.Monthly
                || this.NoTaxPreTaxCheckbox != other.NoTaxPreTaxCheckbox)
            {
                return false;
            }

            return true;
        }

        internal static List<BudgetInputRow> GetDefaults()
        {
            List<BudgetInputRow> rows = new List<BudgetInputRow>();

            rows.AddRange(GetDefaults(BudgetInputTypes.Incomes));
            rows.AddRange(GetDefaults(BudgetInputTypes.Expenses));
            rows.AddRange(GetDefaults(BudgetInputTypes.Savings));

            return rows;
        }

        internal static List<BudgetInputRow> GetDefaults(BudgetInputTypes type)
        {
            List<BudgetInputRow> rows = new List<BudgetInputRow>() { new BudgetInputRow(), new BudgetInputRow() };

            switch (type)
            {
                case BudgetInputTypes.Incomes:
                    //Default first row
                    rows[0].Type = type;
                    rows[0].RowNum = 0;
                    rows[0].Label = "Salary";
                    rows[0].Monthly = 3000;
                    rows[0].NoTaxPreTaxCheckbox = false;

                    //Default second row
                    rows[1].Type = type;
                    rows[1].RowNum = 1;
                    rows[1].Label = "Employeer 401k match";
                    rows[1].Monthly = 1000;
                    rows[1].NoTaxPreTaxCheckbox = true;

                    break;

                case BudgetInputTypes.Expenses:
                    //Default first row
                    rows[0].Type = type;
                    rows[0].RowNum = 0;
                    rows[0].Label = "Groceries";
                    rows[0].Monthly = 200;
                    rows[0].NoTaxPreTaxCheckbox = false;

                    //Default second row
                    rows[1].Type = type;
                    rows[1].RowNum = 1;
                    rows[1].Label = "Health Insurance";
                    rows[1].Monthly = 100;
                    rows[1].NoTaxPreTaxCheckbox = true;
                    break;

                case BudgetInputTypes.Savings:
                    //Default first row
                    rows[0].Type = type;
                    rows[0].RowNum = 0;
                    rows[0].Label = "401K";
                    rows[0].Monthly = 500;
                    rows[0].NoTaxPreTaxCheckbox = true;

                    //Default second row
                    rows[1].Type = type;
                    rows[1].RowNum = 1;
                    rows[1].Label = "House downpayment";
                    rows[1].Monthly = 500;
                    rows[1].NoTaxPreTaxCheckbox = false;
                    break;
            }

            return rows;
        }
    }
}
