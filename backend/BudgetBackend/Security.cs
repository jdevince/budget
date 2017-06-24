using BudgetBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace BudgetBackend
{
    public static class Security
    {
        public static string GetHash(string originalString, string salt)
        {
            byte[] hash = SHA256.Create().ComputeHash(Encoding.UTF8.GetBytes(originalString + salt));
            return BitConverter.ToString(hash);
        }

        public static string GetSalt()
        {
            byte[] salt = new byte[128 / 8];
            RandomNumberGenerator.Create().GetBytes(salt);
            return BitConverter.ToString(salt);
        }

        public static string GetJWTSecretKey()
        {
            return GetValueFromKeyValuePairs("JsonWebToken");
        }

        public static string GetCaptchaSecretKey()
        {
            return GetValueFromKeyValuePairs("CaptchaSecretKey");
        }

        private static string GetValueFromKeyValuePairs(string key)
        {
            BudgetDbContext db = new BudgetDbContext();
            var query = from kvp in db.KeyValuePairs
                        where kvp.Key == key
                        select kvp;
            try
            {
                return query.Single().Value;
            }
            catch
            {
                return null;
            }
        }
    }
}
