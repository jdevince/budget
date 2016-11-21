using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend
{
    public class TokenResponse
    {
        public string accessToken;
        public int expiresIn;

        public TokenResponse(string accessToken, int expiresIn)
        {
            this.accessToken = accessToken;
            this.expiresIn = expiresIn;
        }
    }
}
