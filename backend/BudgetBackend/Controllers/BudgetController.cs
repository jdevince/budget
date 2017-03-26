using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BudgetBackend.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Primitives;
using BudgetBackend.Enums;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace BudgetBackend.Controllers
{
    [Route("api/[controller]")]
    public class BudgetController : Controller
    {
        public BudgetController(IBudgetRepository budgetRepository, IUserRepository userRepository)
        {
            this._budgetRepository = budgetRepository;
            this._userRepository = userRepository;
        }

        private IBudgetRepository _budgetRepository;
        private IUserRepository _userRepository;

        //GET: api/budget/load
        [HttpGet("load")]
        public IActionResult Load()
        {
            InputSectionTypes inputSectionType;
            string loadType = this.Request.Query["type"];
            string authHeader = this.Request.Headers["Authorization"];
            string username = getUsername(authHeader);

            if (username != null)
            {
                if (loadType == "Taxes")
                {
                    return Ok(_budgetRepository.LoadTaxes(username));
                }
                else if (Enum.TryParse<InputSectionTypes>(loadType, out inputSectionType))
                {
                    return Ok(_budgetRepository.LoadInputSection(username, inputSectionType));
                } 
            }

            return Unauthorized();
        }

        //GET: api/budget/federalTaxBrackets/year
        [HttpGet("federalTaxBrackets/{year}")]
        public IActionResult FederalTaxBrackets(int year)
        {
            string bracketsJSON = _budgetRepository.GetFederalTaxBrackets(year);

            if (bracketsJSON == "ERROR")
            {
                return BadRequest();
            }
            else
            {
                return Ok(bracketsJSON);
            }
        }

        //GET: api/budget/stateTaxBrackets/year/stateAbbr
        [HttpGet("stateTaxBrackets/{year}/{stateAbbr}")]
        public IActionResult StateTaxBrackets(int year, string stateAbbr)
        {
            string bracketsJSON = _budgetRepository.GetStateTaxBrackets(year, stateAbbr);

            if (bracketsJSON == "ERROR")
            {
                return BadRequest();
            }
            else
            {
                return Ok(bracketsJSON);
            }
        }

        //POST: api/budget/save
        [HttpPost("save")]
        public IActionResult Save([FromBody] BudgetModel budgetModel)
        {
            bool success;
            string authHeader = this.Request.Headers["Authorization"];
            string username = getUsername(authHeader);
            int userId = _userRepository.GetUserId(username);

            success = _budgetRepository.Save(userId, budgetModel);

            return Ok();
        }

        private string getUsername(string authHeader)
        {
            string username = null;

            if (authHeader != null && authHeader.StartsWith("Bearer"))
            {
                string jwtTokenString = authHeader.Substring("Bearer ".Length).Trim();

                JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

                JwtSecurityToken jwtToken = tokenHandler.ReadJwtToken(jwtTokenString);
                username = jwtToken.Subject;
            }

            return username;
        }
    }
}
