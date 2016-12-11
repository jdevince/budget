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
                        orderby isr.rowNum
                        select isr;

            foreach(InputSectionRow row in query)
            {
                rows.Add(row);
            }

            return new JsonResult(rows);
        }

        public bool Save(int userId, InputSectionRow[] rows)
        {
            bool changes = false;
            SqliteDbContext db = new SqliteDbContext();
            List<int> checkedIds = new List<int>();
            
            foreach(InputSectionRow row in rows)
            {
                var query = from isr in db.InputSectionRows
                            join u in db.Users on isr.userId equals u.id
                            where u.id == userId && isr.type == row.type && isr.rowNum == row.rowNum
                            select isr;

                int count = query.Count();

                if (count == 0)
                {
                    //Row is new, add it
                    row.userId = userId;
                    db.InputSectionRows.Add(row);
                    changes = true;
                }
                else
                {
                    //Row exists, check if it was modified
                    InputSectionRow dbRow = query.Single();

                    if (dbRow.label != row.label)
                    {
                        dbRow.label = row.label;
                        changes = true;
                    }

                    if (dbRow.monthly != row.monthly)
                    {
                        dbRow.monthly = row.monthly;
                        changes = true;
                    }

                    if (dbRow.preTax != row.preTax)
                    {
                        dbRow.preTax = row.preTax;
                        changes = true;
                    }

                    checkedIds.Add(dbRow.id);
                }
            }

            //Delete any rows that no longer exist
            var delQuery = from isr in db.InputSectionRows
                           where !checkedIds.Contains(isr.id)
                           select isr;
            if (delQuery.Count() > 0)
            {
                db.InputSectionRows.RemoveRange(delQuery);
                changes = true;
            }
            
            if (changes)
            {
                db.SaveChanges();
            }

            return true;
        }
    }
}
