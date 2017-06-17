using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    public interface IUserRepository
    {
        bool CreateAccount(User user);
        bool ValidateUser(User user);
        int GetUserId(string username);
    }
}
