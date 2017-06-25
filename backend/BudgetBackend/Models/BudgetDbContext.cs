using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using Microsoft.EntityFrameworkCore;

namespace BudgetBackend.Models
{
    public class BudgetDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<KeyValuePair> KeyValuePairs { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite("Data Source=budget.db");
        }
    }
}
