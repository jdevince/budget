using System;
using Microsoft.IdentityModel.Tokens;

namespace BudgetBackend
{
    public class TokenProviderOptions
    {
        public string Path { get; set; } = "/api/user/login";

        public string Issuer { get; set; }

        public string Audience { get; set; }

        public TimeSpan Expiration { get; set; } = TimeSpan.FromMinutes(5);

        public SigningCredentials SigningCredentials { get; set; }
    }
}
