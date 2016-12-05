using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetBackend.Models
{
    public class BudgetRepository : IBudgetRepository
    {
        public JsonResult Load(string username, string type)
        {
            List<InputSectionRow> rows = new List<InputSectionRow>();

            SqliteDbContext db = new SqliteDbContext();
            var query = from isr in db.InputSectionRows
                        join u in db.Users on isr.userId equals u.id
                        where isr.type == type && u.username == username
                        select isr;

            foreach(InputSectionRow row in query)
            {
                rows.Add(row);
            }

            return new JsonResult(rows);
        }
    }
}
