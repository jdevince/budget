﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BudgetBackend.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Primitives;
using BudgetBackend.Enums;
using Microsoft.Extensions.Logging;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace BudgetBackend.Controllers
{
    [Route("api/[controller]")]
    public class BudgetController : Controller
    {
        public BudgetController(IBudgetRepository budgetRepository, IUserRepository userRepository, ILogger<BudgetController> log)
        {
            this._budgetRepository = budgetRepository;
            this._userRepository = userRepository;
            this._log = log;
        }

        private IBudgetRepository _budgetRepository;
        private IUserRepository _userRepository;
        readonly ILogger<BudgetController> _log;

        //GET: api/budget/load
        [HttpGet("load")]
        public IActionResult Load()
        {
            JsonResult jsonResult;
            BudgetInputTypes inputSectionType;
            string loadType = this.Request.Query["type"];
            string authHeader = this.Request.Headers["Authorization"];
            
            if (authHeader == null)
            {
                //User not logged in. Load defaults.
                if (loadType == "Taxes")
                {
                    TaxInfo taxInfo = TaxInfo.GetDefaults();
                    jsonResult = new JsonResult(taxInfo);
                    return Ok(jsonResult);
                }
                else if (Enum.TryParse<BudgetInputTypes>(loadType, out inputSectionType))
                {
                    List<BudgetInputRow> budgetInputRows = BudgetInputRow.GetDefaults(inputSectionType);
                    jsonResult = new JsonResult(budgetInputRows);
                    return Ok(jsonResult);
                }
            }
            else
            {
                //User is logged in. Load from database.
                string username = getUsername(authHeader);

                if (loadType == "Taxes")
                {
                    TaxInfo taxInfo = _budgetRepository.LoadTaxInfo(username);
                    jsonResult = new JsonResult(taxInfo);
                    return Ok(jsonResult);
                }
                else if (Enum.TryParse<BudgetInputTypes>(loadType, out inputSectionType))
                {
                    BudgetInputRow[] budgetInputRows = _budgetRepository.LoadBudgetInputs(username, inputSectionType);
                    jsonResult = new JsonResult(budgetInputRows);
                    return Ok(jsonResult);
                } 
            }

            return Unauthorized();
        }

        //GET: api/budget/federalTaxBrackets/year
        [HttpGet("federalTaxBrackets/{year}")]
        public IActionResult FederalTaxBrackets(int year)
        {
            string bracketsJSONResponse = _budgetRepository.GetFederalTaxBrackets(year);

            if (bracketsJSONResponse.StartsWith("ERROR"))
            {
                _log.LogInformation(bracketsJSONResponse);
                return BadRequest();
            }
            else
            {
                return Ok(bracketsJSONResponse);
            }
        }

        //GET: api/budget/stateTaxBrackets/year/stateAbbr
        [HttpGet("stateTaxBrackets/{year}/{stateAbbr}")]
        public IActionResult StateTaxBrackets(int year, string stateAbbr)
        {
            string bracketsJSONResponse = _budgetRepository.GetStateTaxBrackets(year, stateAbbr);

            if (bracketsJSONResponse.StartsWith("ERROR"))
            {
                _log.LogInformation(bracketsJSONResponse);
                return BadRequest();
            }
            else
            {
                return Ok(bracketsJSONResponse);
            }
        }

        //POST: api/budget/save
        [HttpPost("save")]
        public IActionResult Save([FromBody] User user)
        {
            bool success;
            string authHeader = this.Request.Headers["Authorization"];
            string username = getUsername(authHeader);
            int userId = _userRepository.GetUserId(username);

            success = _budgetRepository.Save(userId, user.BudgetInputRows, user.TaxInfo);

            return Ok();
        }

        private string getUsername(string authHeader)
        {
            string username = null;

            if (authHeader != null && authHeader.StartsWith("Bearer"))
            {
                string jwtTokenString = authHeader.Substring("Bearer ".Length).Trim();

                JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

                try
                {
                    JwtSecurityToken jwtToken = tokenHandler.ReadJwtToken(jwtTokenString);
                    username = jwtToken.Subject;
                }
                catch
                {
                    username = null;
                }
            }

            return username;
        }
    }
}
