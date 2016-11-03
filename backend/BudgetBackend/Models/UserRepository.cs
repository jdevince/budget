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
    }
}
