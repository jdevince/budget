using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    public interface IUserRepository
    {
        void CreateAccount(User user);
    }
}
