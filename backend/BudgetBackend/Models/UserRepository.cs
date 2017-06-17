using BudgetBackend.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Cryptography;

namespace BudgetBackend.Models
{
    public class UserRepository : IUserRepository
    {
        public bool CreateAccount(User user)
        {
            BudgetDbContext db = new BudgetDbContext();

            //Check if username is already taken
            if (db.Users.Any(u => u.Username == user.Username))
            {
                return false;
            }
            else
            {
                //Set defaults
                user.BudgetInputRows = BudgetInputRow.GetDefaults();
                user.TaxInfo = TaxInfo.GetDefaults();

                //Encrypt password
                user.Salt = Security.GetSalt();
                user.Password = Security.GetHash(user.Password, user.Salt);

                //Save user to db
                db.Users.Add(user);
                db.SaveChanges();

                return true;
            }
        }

        public bool ValidateUser(User user)
        {
            if (user == null)
            {
                return false;
            }

            BudgetDbContext db = new BudgetDbContext();
            var query = from u in db.Users
                        where u.Username == user.Username && ValidatePassword(user.Password, u)
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

        private bool ValidatePassword(string enteredPassword, User savedUser)
        {
            bool isValid;
            string salt = savedUser.Salt;
            isValid = savedUser.Password == Security.GetHash(enteredPassword, salt);
            return isValid;
        }
    }
}
