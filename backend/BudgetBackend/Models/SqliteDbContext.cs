using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using Microsoft.EntityFrameworkCore;

namespace BudgetBackend.Models
{
    public class SqliteDbContext : DbContext
    {
        public DbSet<LabelAndCurrencyRow> AdditionalTaxes { get; set; }
        public DbSet<DeductionOrCredit> DeductionsAndCredits { get; set; }
        public DbSet<InputSectionRow> IncomesExpensesAndSavings  { get; set; }
        public DbSet<Taxes> Taxes { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite("Filename=./budget.db");
        }
    }
}
