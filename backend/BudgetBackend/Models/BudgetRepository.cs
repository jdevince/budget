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

        public BudgetInputRow[] LoadBudgetInputs(string username, BudgetInputTypes budgetInputType)
        {
            BudgetDbContext db = new BudgetDbContext();

            var user = db.Users
                            .Include(u => u.BudgetInputRows)
                            .Where(u => u.Username == username)
                            .Single();

            return user.BudgetInputRows.Where(bir => bir.Type == budgetInputType).ToArray();
        }

        public TaxInfo LoadTaxInfo(string username)
        {
            BudgetDbContext db = new BudgetDbContext();

            User user = db.Users
                                .Include(u => u.TaxInfo)
                                    .ThenInclude(ti => ti.DeductionsAndCredits)
                                .Include(u => u.TaxInfo)
                                    .ThenInclude(ti => ti.AdditionalTaxes)
                                .Where(u => u.Username == username)
                                .Single();

            return user.TaxInfo;
        }

        public bool Save(int userId, List<BudgetInputRow> budgetInputRows, TaxInfo taxInfo)
        {
            BudgetDbContext db = new BudgetDbContext();

            User user = db.Users
                            .Include(u => u.BudgetInputRows)
                            .Include(u => u.TaxInfo)
                                .ThenInclude(ti => ti.DeductionsAndCredits)
                            .Include(u => u.TaxInfo)
                                .ThenInclude(ti => ti.AdditionalTaxes)
                            .Where(u => u.Id == userId)
                            .Single();

            UpdateBudgetInputRows(user.BudgetInputRows, budgetInputRows);
            UpdateTaxInfo(user.TaxInfo, taxInfo);
            
            db.SaveChanges();

            return true;
        }

        private void UpdateTaxInfo(TaxInfo dbTaxInfo, TaxInfo clientTaxInfo)
        {
            //Update singular properties
            if (dbTaxInfo.FilingStatus != clientTaxInfo.FilingStatus)
            {
                dbTaxInfo.FilingStatus = clientTaxInfo.FilingStatus;
            }

            if (dbTaxInfo.Exemptions != clientTaxInfo.Exemptions)
            {
                dbTaxInfo.Exemptions = clientTaxInfo.Exemptions;
            }

            if (dbTaxInfo.TaxYear != clientTaxInfo.TaxYear)
            {
                dbTaxInfo.TaxYear = clientTaxInfo.TaxYear;
            }

            if (dbTaxInfo.State != clientTaxInfo.State)
            {
                dbTaxInfo.State = clientTaxInfo.State;
            }

            //Update DeductionsAndCredits
            UpdateDeductionsAndCredits(dbTaxInfo.DeductionsAndCredits, clientTaxInfo.DeductionsAndCredits);

            //Update AdditionalTaxes
            UpdateAdditionalTaxes(dbTaxInfo.AdditionalTaxes, clientTaxInfo.AdditionalTaxes);
        }

        private void UpdateAdditionalTaxes(List<AdditionalTaxRow> dbRows, List<AdditionalTaxRow> clientRows)
        {
            //Make db rows match rows sent from client
            for (int rowIdx = 0; rowIdx < clientRows.Count; rowIdx++)
            {
                AdditionalTaxRow clientRow = clientRows[rowIdx];
                if (rowIdx < dbRows.Count)
                {
                    //Potentially modified row

                    AdditionalTaxRow dbRow = dbRows[rowIdx];

                    //Go through each relevant property, so we only change what's different
                    if (dbRow.Amount != clientRow.Amount)
                    {
                        dbRow.Amount = clientRow.Amount;
                    }

                    if (dbRow.Label != clientRow.Label)
                    {
                        dbRow.Label = clientRow.Label;
                    }

                    if (dbRow.RowNum != clientRow.RowNum)
                    {
                        dbRow.RowNum = clientRow.RowNum;
                    }
                }
                else
                {
                    //Added row
                    dbRows.Add(clientRow);
                }
            }

            //Remove any additional rows from db
            int numToRemove = dbRows.Count - clientRows.Count;
            if (numToRemove > 0)
            {
                dbRows.RemoveRange(clientRows.Count, numToRemove);
            }
        }

        private void UpdateDeductionsAndCredits(List<DeductionOrCreditRow> dbRows, List<DeductionOrCreditRow> clientRows)
        {
            //Make db rows match rows sent from client
            for (int rowIdx = 0; rowIdx < clientRows.Count; rowIdx++)
            {
                DeductionOrCreditRow clientRow = clientRows[rowIdx];

                if (rowIdx < dbRows.Count)
                {
                    //Potentially modified row

                    DeductionOrCreditRow dbRow = dbRows[rowIdx];

                    //Go through each relevant property, so we only change what's different
                    if (dbRow.Amount != clientRow.Amount)
                    {
                        dbRow.Amount = clientRow.Amount;
                    }

                    if (dbRow.DeductionOrCredit != clientRow.DeductionOrCredit)
                    {
                        dbRow.DeductionOrCredit = clientRow.DeductionOrCredit;
                    }

                    if (dbRow.FederalOrState != clientRow.FederalOrState)
                    {
                        dbRow.FederalOrState = clientRow.FederalOrState;
                    }

                    if (dbRow.Label != clientRow.Label)
                    {
                        dbRow.Label = clientRow.Label;
                    }

                    if (dbRow.RowNum != clientRow.RowNum)
                    {
                        dbRow.RowNum = clientRow.RowNum;
                    }
                }
                else
                {
                    //Added row
                    dbRows.Add(clientRow);
                }
            }

            //Remove any additional rows from db
            int numToRemove = dbRows.Count - clientRows.Count;
            if (numToRemove > 0)
            {
                dbRows.RemoveRange(clientRows.Count, numToRemove);
            }
        }

        private void UpdateBudgetInputRows(List<BudgetInputRow> dbRows, List<BudgetInputRow> clientRows)
        {
            //Make db rows match rows sent from client
            for (int rowIdx = 0; rowIdx < clientRows.Count; rowIdx++)
            {
                BudgetInputRow clientRow = clientRows[rowIdx];

                if (rowIdx < dbRows.Count)
                {
                    //Potentially modified row

                    BudgetInputRow dbRow = dbRows[rowIdx];

                    //Go through each relevant property, so we only change what's different
                    if (dbRow.Label != clientRow.Label)
                    {
                        dbRow.Label = clientRow.Label;
                    }

                    if (dbRow.Monthly != clientRow.Monthly)
                    {
                        dbRow.Monthly = clientRow.Monthly;
                    }

                    if (dbRow.PreTax != clientRow.PreTax)
                    {
                        dbRow.PreTax = clientRow.PreTax;
                    }

                    if (dbRow.IncomeNotTaxed != clientRow.IncomeNotTaxed)
                    {
                        dbRow.IncomeNotTaxed = clientRow.IncomeNotTaxed;
                    }

                    if (dbRow.RowNum != clientRow.RowNum)
                    {
                        dbRow.RowNum = clientRow.RowNum;
                    }

                    if (dbRow.Type != clientRow.Type)
                    {
                        dbRow.Type = clientRow.Type;
                    }
                }
                else
                {
                    //Added row
                    dbRows.Add(clientRow);
                }   
            }

            //Remove any additional rows from db
            int numToRemove = dbRows.Count - clientRows.Count;
            if (numToRemove > 0)
            {
                dbRows.RemoveRange(clientRows.Count, numToRemove);
            }

        }

        public string GetFederalTaxBrackets(int year)
        {
            //TODO: Load from DB or locally to remove dependence on Taxee
            string url = @"https://taxee.io/api/v2/federal/" + year.ToString();

            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", TaxeeToken);

            try
            {
                return httpClient.GetStringAsync(url).Result;
            }
            catch (Exception e)
            {
                return "ERROR: " + e.Message;
            }
        }

        public string GetStateTaxBrackets(int year, string stateAbbr)
        {
            //TODO: Load from DB or locally to remove dependence on Taxee
            string url = @"https://taxee.io/api/v2/state/" + year.ToString() + "/" + stateAbbr;

            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", TaxeeToken);

            try
            {
                return httpClient.GetStringAsync(url).Result;
            }
            catch (Exception e)
            {
                return "ERROR: " + e.Message;
            }
        }
    }
}
