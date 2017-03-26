using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BudgetBackend.Enums;

namespace BudgetBackend.Models
{
    public class BudgetRepository : IBudgetRepository
    {
        const string TaxeeToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBUElfS0VZX01BTkFHRVIiLCJodHRwOi8vdGF4ZWUuaW8vdXNlcl9pZCI6IjU4NTVkZTMwZTUzOTlmNjdkNDU3MmE1ZCIsImh0dHA6Ly90YXhlZS5pby9zY29wZXMiOlsiYXBpIl0sImlhdCI6MTQ4MjAyMjQ0OH0.xg8Suu1SKhc_JZFdQHqG564mAnsE5jKilXp_I0vs_fE";

        public JsonResult LoadInputSection(string username, InputSectionTypes inputSectionType)
        {
            SqliteDbContext db = new SqliteDbContext();

            var query = from isr in db.IncomesExpensesAndSavings
                        join u in db.Users on isr.userId equals u.id
                        where isr.type == inputSectionType && u.username == username
                        orderby isr.rowNum
                        select isr;

            return new JsonResult(query.ToArray<InputSectionRow>());
        }

        public JsonResult LoadTaxes(string username)
        {
            SqliteDbContext db = new SqliteDbContext();

            //Taxes
            var query = from t in db.Taxes
                        join u in db.Users on t.userId equals u.id
                        where u.username == username
                        select t;

            if (query.Count() != 1)
            {
                return new JsonResult(new Taxes());
            }

            Taxes taxes = query.Single();

            //DeductionsAndCredits
            taxes.FederalDeductions = LoadDeductionsAndCredits(db, username, FederalOrState.Federal, Enums.DeductionOrCredit.Deduction);
            taxes.FederalCredits = LoadDeductionsAndCredits(db, username, FederalOrState.Federal, Enums.DeductionOrCredit.Credit);
            taxes.StateDeductions = LoadDeductionsAndCredits(db, username, FederalOrState.State, Enums.DeductionOrCredit.Deduction);
            taxes.StateCredits = LoadDeductionsAndCredits(db, username, FederalOrState.State, Enums.DeductionOrCredit.Credit);

            //AdditionalTaxes
            taxes.AdditionalTaxes = LoadAdditionalTaxes(db, username);

            return new JsonResult(taxes);
        }

        private DeductionOrCredit[] LoadDeductionsAndCredits(SqliteDbContext db, string username, FederalOrState federalOrState, Enums.DeductionOrCredit deductionOrCredit)
        {
            var query = from dac in db.DeductionsAndCredits
                        join u in db.Users on dac.userId equals u.id
                        where u.username == username && dac.federalOrState == federalOrState && dac.deductionOrCredit == deductionOrCredit
                        select dac;

            return query.ToArray<DeductionOrCredit>();
        }

        private LabelAndCurrencyRow[] LoadAdditionalTaxes(SqliteDbContext db, string username)
        {
            var query = from at in db.AdditionalTaxes
                        join u in db.Users on at.userId equals u.id
                        where u.username == username
                        select at;

            return query.ToArray<LabelAndCurrencyRow>();
        }

        public bool Save(int userId, BudgetModel budgetModel)
        {
            bool needToSave = false;
            SqliteDbContext db = new SqliteDbContext();

            //Incomes, Expenses, and Savings
            if (UpdateDBIncomesExpensesAndSavings(db, userId, budgetModel.Incomes)
                || UpdateDBIncomesExpensesAndSavings(db, userId, budgetModel.Expenses)
                || UpdateDBIncomesExpensesAndSavings(db, userId, budgetModel.Savings))
            {
                needToSave = true;
            }

            //Taxes
            if (UpdateDBTaxes(db, userId, budgetModel.Taxes))
            {
                needToSave = true;
            }

            if (needToSave)
            {
                db.SaveChanges();
            }

            return true;
        }

        private bool UpdateDBTaxes(SqliteDbContext db, int userId, Taxes taxes)
        {
            bool needToSave = false;

            //Taxes table
            var query = from t in db.Taxes
                        join u in db.Users on t.userId equals u.id
                        where u.id == userId
                        select t;

            Taxes dbTaxes = query.Single();

            if (dbTaxes.FilingStatus != taxes.FilingStatus)
            {
                dbTaxes.FilingStatus = taxes.FilingStatus;
                needToSave = true;
            }

            if (dbTaxes.Exemptions != taxes.Exemptions)
            {
                dbTaxes.Exemptions = taxes.Exemptions;
                needToSave = true;
            }

            if (dbTaxes.State != taxes.State)
            {
                dbTaxes.State = taxes.State;
                needToSave = true;
            }

            //DeductionsAndCredits table
            if (UpdateDBDeductionsAndCredits(db, userId, taxes.FederalDeductions, FederalOrState.Federal, Enums.DeductionOrCredit.Deduction)
                || UpdateDBDeductionsAndCredits(db, userId, taxes.FederalCredits, FederalOrState.Federal, Enums.DeductionOrCredit.Credit)
                || UpdateDBDeductionsAndCredits(db, userId, taxes.FederalDeductions, FederalOrState.State, Enums.DeductionOrCredit.Deduction)
                || UpdateDBDeductionsAndCredits(db, userId, taxes.FederalDeductions, FederalOrState.State, Enums.DeductionOrCredit.Credit))
            {
                needToSave = true;
            }

            //AdditionalTaxes table
            if (UpdateDBAdditionalTaxes(db, userId, taxes.AdditionalTaxes))
            {
                needToSave = true;
            }

            return needToSave;
        }

        private bool UpdateDBDeductionsAndCredits(SqliteDbContext db, int userId, DeductionOrCredit[] rowsToSave, FederalOrState federalOrState, Enums.DeductionOrCredit deductionOrCredit)
        {
            bool needToSave = false;
            List<int> checkedIds = new List<int>();

            foreach (DeductionOrCredit row in rowsToSave)
            {
                var query = from dac in db.DeductionsAndCredits
                            where dac.userId == userId && dac.federalOrState == federalOrState && dac.deductionOrCredit == deductionOrCredit && dac.rowNum == row.rowNum
                            select dac;

                int count = query.Count();

                if (count == 0)
                {
                    //Row is new, add it
                    row.userId = userId;
                    row.federalOrState = federalOrState;
                    row.deductionOrCredit = deductionOrCredit;
                    db.DeductionsAndCredits.Add(row);
                    needToSave = true;
                }
                else
                {
                    //Row exists, check if it was modified
                    DeductionOrCredit dbRow = query.Single();

                    if (dbRow.label != row.label)
                    {
                        dbRow.label = row.label;
                        needToSave = true;
                    }

                    if (dbRow.amount != row.amount)
                    {
                        dbRow.amount = row.amount;
                        needToSave = true;
                    }

                    checkedIds.Add(dbRow.id);
                }
            }

            //Delete any rows that no longer exist
            var delQuery = from dac in db.DeductionsAndCredits
                           where !checkedIds.Contains(dac.id)
                           select dac;
            if (delQuery.Count() > 0)
            {
                db.DeductionsAndCredits.RemoveRange(delQuery);
                needToSave = true;
            }

            return needToSave;
        }

        private bool UpdateDBAdditionalTaxes(SqliteDbContext db, int userId, LabelAndCurrencyRow[] rowsToSave)
        {
            bool needToSave = false;
            List<int> checkedIds = new List<int>();

            foreach (LabelAndCurrencyRow row in rowsToSave)
            {
                var query = from at in db.AdditionalTaxes
                            where at.userId == userId && at.rowNum == row.rowNum
                            select at;

                int count = query.Count();

                if (count == 0)
                {
                    //Row is new, add it
                    row.userId = userId;
                    db.AdditionalTaxes.Add(row);
                    needToSave = true;
                }
                else
                {
                    //Row exists, check if it was modified
                    LabelAndCurrencyRow dbRow = query.Single();

                    if (dbRow.label != row.label)
                    {
                        dbRow.label = row.label;
                        needToSave = true;
                    }

                    if (dbRow.amount != row.amount)
                    {
                        dbRow.amount = row.amount;
                        needToSave = true;
                    }

                    checkedIds.Add(dbRow.id);
                }
            }

            //Delete any rows that no longer exist
            var delQuery = from at in db.AdditionalTaxes
                           where !checkedIds.Contains(at.id)
                           select at;
            if (delQuery.Count() > 0)
            {
                db.AdditionalTaxes.RemoveRange(delQuery);
                needToSave = true;
            }

            return needToSave;
        }

        private bool UpdateDBIncomesExpensesAndSavings(SqliteDbContext db, int userId, InputSectionRow[] rowsToSave)
        {
            bool needToSave = false;
            List<int> checkedIds = new List<int>();

            foreach (InputSectionRow row in rowsToSave)
            {
                var query = from isr in db.IncomesExpensesAndSavings
                            where isr.userId == userId && isr.type == row.type && isr.rowNum == row.rowNum
                            select isr;

                int count = query.Count();

                if (count == 0)
                {
                    //Row is new, add it
                    row.userId = userId;
                    db.IncomesExpensesAndSavings.Add(row);
                    needToSave = true;
                }
                else
                {
                    //Row exists, check if it was modified
                    InputSectionRow dbRow = query.Single();

                    if (dbRow.label != row.label)
                    {
                        dbRow.label = row.label;
                        needToSave = true;
                    }

                    if (dbRow.monthly != row.monthly)
                    {
                        dbRow.monthly = row.monthly;
                        needToSave = true;
                    }

                    if (dbRow.preTax != row.preTax)
                    {
                        dbRow.preTax = row.preTax;
                        needToSave = true;
                    }

                    checkedIds.Add(dbRow.id);
                }
            }

            //Delete any rows that no longer exist
            var delQuery = from ies in db.IncomesExpensesAndSavings
                           where !checkedIds.Contains(ies.id)
                           select ies;
            if (delQuery.Count() > 0)
            {
                db.IncomesExpensesAndSavings.RemoveRange(delQuery);
                needToSave = true;
            }

            return needToSave;
        }

        public string GetFederalTaxBrackets(int year)
        {
            //TODO: Load from DB
            string url = @"https://taxee.io/api/v2/federal/" + year.ToString();

            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", TaxeeToken);

            try
            {
                return httpClient.GetStringAsync(url).Result;
            }
            catch
            {
                return "ERROR";
            }
        }

        public string GetStateTaxBrackets(int year, string stateAbbr)
        {
            //TODO: Load from DB
            string url = @"https://taxee.io/api/v2/state/" + year.ToString() + "/" + stateAbbr;

            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", TaxeeToken);

            try
            {
                return httpClient.GetStringAsync(url).Result;
            }
            catch
            {
                return "ERROR";
            }
        }
    }
}
