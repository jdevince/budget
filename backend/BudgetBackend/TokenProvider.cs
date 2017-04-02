using BudgetBackend.Models;
using Microsoft.Extensions.Options;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace BudgetBackend
{
    public class TokenProvider
    {
        private readonly TokenProviderOptions _options;

        public TokenProvider(
            IOptions<TokenProviderOptions> options)
        {
            _options = options.Value;
        }

        public TokenResponse GenerateToken(User user)
        {
            var username = user.Username;
            var password = user.Password;

            var now = DateTime.UtcNow;
            var nowOffset = new DateTimeOffset(now);

            // Specifically add the jti (random nonce), iat (issued timestamp), and sub (subject/user) claims.
            // You can add other claims here, if you want:
            var claims = new Claim[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, nowOffset.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            // Create the JWT and write it to a string
            var jwt = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims,
                notBefore: now,
                expires: now.Add(_options.Expiration),
                signingCredentials: _options.SigningCredentials);
            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            TokenResponse tokenResponse = new TokenResponse(encodedJwt, (int)_options.Expiration.TotalSeconds);

            return tokenResponse;
        }
    }
}