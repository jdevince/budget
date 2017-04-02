using BudgetBackend.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace BudgetBackend.Models
{
    public class UserRepository : IUserRepository
    {
        public void CreateAccount(User user)
        {
            BudgetDbContext db = new BudgetDbContext();

            //Set defaults
            user.BudgetInputRows = BudgetInputRow.GetDefaults();
            user.TaxInfo = TaxInfo.GetDefaults();

            db.Users.Add(user);
            db.SaveChanges();
        }

        public bool ValidateUser(User user)
        {
            if (user == null)
            {
                return false;
            }

            BudgetDbContext db = new BudgetDbContext();
            var query = from u in db.Users
                        where u.Username == user.Username && u.Password == user.Password
                        select u;
            try
            {
                query.Single();
            }
            catch
            {
                return false;
            }

            return true;
        }

        public int GetUserId(string username)
        {
            BudgetDbContext db = new BudgetDbContext();
            var query = from u in db.Users
                        where u.Username == username
                        select u;
            return query.Single().Id;
        }
    }
}
