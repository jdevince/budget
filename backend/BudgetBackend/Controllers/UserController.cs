using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using BudgetBackend.Models;
using Microsoft.AspNetCore.Cors;

namespace BudgetBackend.Controllers
{
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        public UserController(IUserRepository user)
        {
            NewUser = user;
        }
        public IUserRepository NewUser { get; set; }

        [HttpPost]
        public IActionResult CreateAccount([FromBody] User user)
        {
            if (user == null)
            {
                return BadRequest();
            }
           
            NewUser.CreateAccount(user);
            return CreatedAtRoute("CreateAccount", new { id = user.username }, user);
        }

        [HttpGet]
        public string GetAllUsers()
        {
            string result = "";
            SqliteDbContext db = new SqliteDbContext();
            foreach (User user in db.Users)
            {
                result += user.username + ", ";
            }
            return result;
        }
    }
}