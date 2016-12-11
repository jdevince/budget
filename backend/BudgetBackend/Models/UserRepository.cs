using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    public class UserRepository : IUserRepository
    {
        public void CreateAccount(User user)
        {
            SqliteDbContext db = new SqliteDbContext();
            db.Add(user);
            db.SaveChanges();
        }

        public bool ValidateUser(User user)
        {
            if (user == null)
            {
                return false;
            }

            SqliteDbContext db = new SqliteDbContext();
            var query = from u in db.Users
                        where u.username == user.username && u.password == user.password
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
            SqliteDbContext db = new SqliteDbContext();
            var query = from u in db.Users
                        where u.username == username
                        select u;
            return query.Single().id;
        }
    }
}
