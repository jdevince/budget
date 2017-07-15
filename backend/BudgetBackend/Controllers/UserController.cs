using BudgetBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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
        public UserController(IUserRepository userRepository, ILogger<UserController> log)
        {
            this._userRepository = userRepository;
            this._log = log;
            this._tokenProvider = InitTokenProvider();
        }

        private IUserRepository _userRepository { get; set; }
        readonly ILogger<UserController> _log;
        private TokenProvider _tokenProvider;

        [HttpPost("create")]
        public IActionResult CreateAccount([FromBody] User user)
        {
            bool created;

            if (user == null)
            {
                return BadRequest();
            }
           
            created = _userRepository.CreateAccount(user);

            return Ok(created);
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
            string secretKey = Security.GetCaptchaSecretKey();
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
            string secretKey = Security.GetJWTSecretKey();

            var signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey));
            var options = new TokenProviderOptions
            {
                Audience = "BudgetAudience",
                Issuer = "BudgetApp",
                SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256),
            };

            TokenProvider tokenProvider = new TokenProvider(Options.Create(options));

            return tokenProvider;
        }
    }
}