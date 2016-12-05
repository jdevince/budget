using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BudgetBackend.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Primitives;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace BudgetBackend.Controllers
{
    [Route("api/[controller]")]
    public class BudgetController : Controller
    {
        public BudgetController(IBudgetRepository budgetRepository)
        {
            this._budgetRepository = budgetRepository;
        }

        private IBudgetRepository _budgetRepository;

        // GET: api/budget/load
        [HttpGet("load")]
        public IActionResult Get()
        {
            string username= null;
            string type = this.Request.Query["type"];
            string authHeader = this.Request.Headers["Authorization"];

            if (authHeader != null && authHeader.StartsWith("Bearer"))
            {
                string jwtTokenString = authHeader.Substring("Bearer ".Length).Trim();

                JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

                JwtSecurityToken jwtToken = tokenHandler.ReadJwtToken(jwtTokenString);
                username = jwtToken.Subject;

                return Ok(_budgetRepository.Load(username, type));
            }

            return Unauthorized();
        }
    }
}
