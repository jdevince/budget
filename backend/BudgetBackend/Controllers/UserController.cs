using BudgetBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Linq;
using System.Net.Http;
using System.Text;

namespace BudgetBackend.Controllers
{
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        public UserController(IUserRepository userRepository)
        {
            this._userRepository = userRepository;
            this._tokenProvider = InitTokenProvider();
        }

        private IUserRepository _userRepository { get; set; }
        private TokenProvider _tokenProvider;

        [HttpPost("create")]
        public IActionResult CreateAccount([FromBody] User user)
        {
            if (user == null)
            {
                return BadRequest();
            }
           
            _userRepository.CreateAccount(user);
            return Ok(user);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] User user)
        {
            if (_userRepository.ValidateUser(user))
            {
                TokenResponse tokenResponse = this._tokenProvider.GenerateToken(user);
                return Ok(tokenResponse);
            }
            else
            {
                return Ok(false); //Invalid credentials
            }
        }

        [HttpPost("validateCaptcha")]
        public IActionResult ValidateCaptcha(string captchaResponse)
        {
            string secretKey = "6Lc2RSIUAAAAAM0mEM_0hIF97BEnfOSWYCfuSb10"; //TODO: securely load
            string validateCaptchaUrl = string.Format("https://www.google.com/recaptcha/api/siteverify?secret={0}&response={1}",secretKey,captchaResponse);

            using (HttpClient httpClient = new HttpClient())
            {
                HttpResponseMessage httpResponse = httpClient.PostAsync(validateCaptchaUrl, null).Result;
                bool validated = (bool)JObject.Parse(httpResponse.Content.ReadAsStringAsync().Result)["success"];
                if (validated)
                {
                    return Ok(true);
                }
                else
                {
                    return Ok(false);
                }
            }
        }

        private TokenProvider InitTokenProvider()
        {
            // The secret key every token will be signed with.
            // In production, you should store this securely in environment variables
            // or a key management tool. Don't hardcode this into your application!
            string secretKey = "mysupersecret_secretkey!123"; //TODO

            var signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey));
            var options = new TokenProviderOptions
            {
                Audience = "ExampleAudience",
                Issuer = "ExampleIssuer",
                SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256),
            };

            TokenProvider tokenProvider = new TokenProvider(Options.Create(options));

            return tokenProvider;
        }
    }
}