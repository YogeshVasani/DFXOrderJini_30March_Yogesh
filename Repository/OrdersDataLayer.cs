using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using StudentRecordManagementSystem.Utility;
using Microsoft.ApplicationBlocks.Data;
using System.Xml.Linq;
using Newtonsoft.Json;
using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using DFXB2BOMS.Models;
using DFXB2BOMS.Interface;
using Microsoft.Extensions.Configuration;
using System.IO;
using Microsoft.Extensions.Configuration;

using DFXB2BOMS.Controllers;
using DFXB2BOMS.Repository;

namespace DFXB2BOMS.Repository
{
    public partial class OrdersDataLayer : IOrders
    {
        #region private Attributes
        private string _DealerName;
        private string _name;
        private string _NSearch;
        private int _result;
        private string _Flag;
        #endregion
        #region Public Attributes
        DataTable dt = new DataTable();
        DataSet ds = new DataSet();


        string CS = ConnectionString.DBCon();

        public string DealerName { get { return _DealerName; } set { _DealerName = value; } }
        public string name { get { return _name; } set { _name = value; } }
        public string NSearch { get { return _NSearch; } set { _NSearch = value; } }
        public int result { get { return _result; } set { _result = value; } }
        public string Flag { get { return _Flag; } set { _Flag = value; } }
        IFormatProvider provider = new System.Globalization.CultureInfo("en-US", true);
        #endregion
        #region UserLogin
        public IList<CustomerModel> LoginCheck(string UserName, string Role)
        {
            List<CustomerModel> lstemployee = new List<CustomerModel>();
            try
            {
                
                SqlParameter[] param = new SqlParameter[5];
                param[0] = new SqlParameter("@UserName", UserName);
                param[1] = new SqlParameter("@Flag", Role);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[3] = new SqlParameter("@MStatus", SqlDbType.NVarChar, 1000);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "Check_UserProfileLogin", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                
                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new CustomerModel()
                               {
                                   ResultErrorMsg = dr["ResultErrorMsg"].ToString(),
                                   MUserName = param[3].Value.ToString(),
                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        #endregion
        #region Insert & Update & Get
        //To View all employees details
        public IList<CustomerModel> GetCustomers(string DealerName,string SearchName)
        {
            List<CustomerModel> lstemployee = new List<CustomerModel>();
            try
            {
                name = "AllCustomer";
                SqlParameter[] param = new SqlParameter[5];
                param[0] = new SqlParameter("@DealerName", DealerName);
                param[1] = new SqlParameter("@name", SearchName);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetCustomerMaster", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new CustomerModel()
                               {

                                   DealerName = dr["DealerName"].ToString(),
                                   Phone = dr["Phone"].ToString(),
                                   City = dr["City"].ToString(),
                                   Area = dr["Area"].ToString(),
                                   Dealercode = dr["DealerCode"].ToString(),
                                   Address = dr["Address"].ToString(),
                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<CustomerModel> GetDealersDetails(string DealerCode,string Name)
        {
            List<CustomerModel> lstemployee = new List<CustomerModel>();
            try
            {
               // name = "Dealer";
                SqlParameter[] param = new SqlParameter[5];
                param[0] = new SqlParameter("@DealerName", DealerCode);
                param[1] = new SqlParameter("@name", Name);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetCustomerMaster", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new CustomerModel()
                               {

                                   DealerName = dr["DealerName"].ToString(),
                                   Phone = dr["Phone"].ToString(),
                                   City = dr["City"].ToString(),
                                   Area = dr["Area"].ToString(),
                                   Dealercode = dr["DealerCode"].ToString(),
                                   Delivery_Location = dr["Delivery_Location"].ToString(),

                                   BillingAddress = dr["BillingAddress"].ToString(),
                                   ShippingAddress = dr["ShippingAddress"].ToString(),
                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<CustomerModel> GetPlantDetails(string orderid)
        {
            List<CustomerModel> lstemployee = new List<CustomerModel>();
            try
            {
                name = "CustomerPlant";
                SqlParameter[] param = new SqlParameter[5];
                param[0] = new SqlParameter("@DealerName", "");
                param[1] = new SqlParameter("@name", name);
                param[2] = new SqlParameter("@NSearch", orderid);
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetCustomerMaster", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new CustomerModel()
                               {

                                   Plant = dr["Plantcode"].ToString(),

                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<CustomerModel> GetVehicleDetails(string DealerCode)
        {
            List<CustomerModel> lstemployee = new List<CustomerModel>();
            try
            {
                name = "VehicleCode";
                SqlParameter[] param = new SqlParameter[5];
                param[0] = new SqlParameter("@DealerName", DealerCode);
                param[1] = new SqlParameter("@name", name);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetCustomerMaster", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new CustomerModel()
                               {

                                   VehicleCode = dr["VehicleCode"].ToString(),
                                   VehicleType = dr["VehicleType"].ToString(),

                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<CustomerModel> ChangePlantByAdmin(string DealerCode, string PlantCode)
        {
            List<CustomerModel> lstemployee = new List<CustomerModel>();
            try
            {
                name = "ChangePlantByAdmin";
                SqlParameter[] param = new SqlParameter[5];
                param[0] = new SqlParameter("@DealerName", DealerCode);
                param[1] = new SqlParameter("@name", PlantCode);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetCustomerMaster", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                result = 1;
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<CustomerModel> RemoveOrderItems(string DealerCode, int ItemID)
        {
            List<CustomerModel> lstemployee = new List<CustomerModel>();
            try
            {
                name = "Delete_Items";
                SqlParameter[] param = new SqlParameter[10];
                param[0] = new SqlParameter("@DealerName", DealerCode);
                param[1] = new SqlParameter("@name", name);
                param[2] = new SqlParameter("@NSearch", NSearch);

                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;

                param[5] = new SqlParameter("@ItemID", ItemID);

                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "DeleteOrder_ItemDetails", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                result = 1;
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<OrderCreationModel> UpdateApproval_Reject(string Approve, string ApprovedBy, string orderid)
        {
            List<OrderCreationModel> lstemployee = new List<OrderCreationModel>();
            try
            {
                
                SqlParameter[] param = new SqlParameter[10];
                param[0] = new SqlParameter("@DealerName", Approve);
                param[1] = new SqlParameter("@name", "Approval");
                param[2] = new SqlParameter("@NSearch", ApprovedBy);
                param[5] = new SqlParameter("@NSearch1", orderid);
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetOrderDetails", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                string d = param[4].Value.ToString();
                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new OrderCreationModel()
                               {
                                  Status =  dr["Status"].ToString(),
                                 
                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<OrderCreationModel> GetOrders(string DealerCode, string SearchName)
        {
            List<OrderCreationModel> lstemployee = new List<OrderCreationModel>();
            try
            {

                SqlParameter[] param = new SqlParameter[10];
                param[0] = new SqlParameter("@DealerName", DealerCode);
                param[1] = new SqlParameter("@name", SearchName);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[5] = new SqlParameter("@NSearch1", "");
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetOrderDetails", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                string d = param[4].Value.ToString();
                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new OrderCreationModel()
                               {
                                   ID = Convert.ToInt32(dr["ID"]),
                                   OrderID = dr["OrderID"].ToString(),
                                   Cust_Ref = dr["Cust_Ref"].ToString(),
                                   SalesPerson = dr["SellerName"].ToString(),
                                   DealerCode = dr["DealerCode"].ToString(),
                                   OrderDate =Convert.ToDateTime(dr["Order_Date"]).ToString("dd/MM/yyyy"),
                                   Status = dr["Status"].ToString(),
                                   OrderPlacedBy = dr["OrderPlacedBy"].ToString(),
                                   StandardOrder = dr["StandardOrder"].ToString().Replace("Yes", "SA").Replace("No", "NSA"),
                                   CRDDate = dr["CRDDATE"].ToString(),
                                   ItemCount = dr["itemcountsds"].ToString(),
                                   DealerName = dr["DealerName"].ToString(),


                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<Invoice> GetInvoice_Details(string DealerCode, string SearchName)
        {
            List<Invoice> lstemployee = new List<Invoice>();
            try
            {

                SqlParameter[] param = new SqlParameter[10];
                param[0] = new SqlParameter("@DealerName", DealerCode);
                param[1] = new SqlParameter("@name", SearchName);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[5] = new SqlParameter("@NSearch1", "");
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetInvoice_Details", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                string d = param[4].Value.ToString();
                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new Invoice()
                               {

                                   Bill_Date = dr["Bill_Date"].ToString(),
                                   Bill_Doc = dr["Bill_Doc"].ToString(),
                                   Sales_Doc = dr["Sales_Doc"].ToString(),
                                   Cust_Ref = dr["Cust_Ref"].ToString(),
                                   ZJINI_NO = dr["ZJINI_NO"].ToString(),
                                   Sold_to_Party = dr["Sold_to_Party"].ToString(),
                                   Cust_Name = dr["Cust_Name"].ToString(),
                                   Bill_Type = dr["Bill_Type"].ToString(),

                                   Net_Value = dr["Net_Value"].ToString(),
                                   Tax_Amt = dr["Tax_Amt"].ToString(),


                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<OrderCreationModel> GetOrdersid(string DealerCode,string OrderId)
        {
            List<OrderCreationModel> lstemployee = new List<OrderCreationModel>();
            try
            {
                name = "OrdersId";
                SqlParameter[] param = new SqlParameter[10];
                param[0] = new SqlParameter("@DealerName", DealerCode);
                param[1] = new SqlParameter("@name", name);
                param[2] = new SqlParameter("@NSearch", OrderId);
                param[5] = new SqlParameter("@NSearch1", "");
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetOrderDetails", param);
                result = Convert.ToInt32(param[3].Value.ToString());
                string fdfs = param[4].Value.ToString();
                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new OrderCreationModel()
                               {
                                   ID = Convert.ToInt32(dr["ID"]),
                                   OrderID = dr["OrderID"].ToString(),
                                   Cust_Ref = dr["Cust_Ref"].ToString(),
                                   Cust_Comments = dr["Cust_Comments"].ToString(),
                                   SalesPerson = dr["SalesPerson"].ToString(),
                                   DealerCode = dr["DealerCode"].ToString(),
                                   OrderDate = dr["Order_Date"].ToString(),
                                   Status = dr["Status"].ToString().Trim(),
                                   CRD_Date = Convert.ToDateTime(Dtcheck(dr["CRDDATE"].ToString()))
                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<CustomerModel> Create_RepeatOrder(string DealerName, string SearchName)
        {
            List<CustomerModel> lstemployee = new List<CustomerModel>();
            try
            {
                name = "RepeatOrder";
                SqlParameter[] param = new SqlParameter[10];
                param[0] = new SqlParameter("@DealerName", DealerName);
                param[1] = new SqlParameter("@name", name);
                param[2] = new SqlParameter("@NSearch", SearchName);
                param[5] = new SqlParameter("@NSearch1", "");
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetOrderDetails", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                string resgfult = param[4].Value.ToString();

                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new CustomerModel()
                               {
                                   ResultErrorMsg = dr["ResultErrorMsg"].ToString(),
                                   Orderid = dr["Orderid"].ToString(),
                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<CustomerModel> GetCRD_Date_HolidayList(string Orderdate, string plant)
        {
            List<CustomerModel> lstemployee = new List<CustomerModel>();
            try
            {
                //name = "RepeatOrder";
                SqlParameter[] param = new SqlParameter[5];
                param[0] = new SqlParameter("@orddt",Convert.ToDateTime("01/01/1900"));
                param[1] = new SqlParameter("@plant", plant);
              // param[2] = new SqlParameter("@NSearch", SearchName);
                //param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                //param[3].Direction = ParameterDirection.Output;
                //param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                //param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "p_CrdDate", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new CustomerModel()
                               {
                                   ResultErrorMsg = dr["pdate"].ToString(),
                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public string Dtcheck(string dt)
        {
            if (dt == null || dt == "" || string.IsNullOrWhiteSpace(dt))
            {
                dt = "01/01/1900";
            }
            return dt;

        }
        public IList<OrderCreationModel> GetItems(string DealerCode, string ProfileName,string OrderId)
        {
            List<OrderCreationModel> lstemployee = new List<OrderCreationModel>();
            try
            {
               // name = "Items";
                SqlParameter[] param = new SqlParameter[10];
                param[0] = new SqlParameter("@DealerName", DealerCode);
                param[1] = new SqlParameter("@name", ProfileName);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[5] = new SqlParameter("@NSearch1", OrderId);
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetOrderDetails", param);
                string result = param[4].Value.ToString();
                string fd = param[4].Value.ToString();
                
                    lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                                   select new OrderCreationModel()
                                   {

                                       ID = Convert.ToInt32(dr["ID"].ToString()),
                                       OrderID = dr["OrderID"].ToString(),
                                       DealerCode = dr["DealerCode"].ToString(),
                                       ItemName = dr["ItemName"].ToString(),
                                       MaterialID = dr["MaterialId"].ToString(),
                                       Lmax = dr["Lmax"].ToString(),
                                       Wmax = dr["Wmax"].ToString(),
                                       Tmax = dr["Tmax"].ToString(),
                                       QTY = dr["Qty"].ToString(),
                                       LDPE = dr["Ldpe"].ToString(),
                                       Pieces = dr["pieces"].ToString(),
                                       PrimaryUOM = dr["PrimaryUOM"].ToString(),
                                       Volume = dr["Volume"].ToString(),
                                       Item_Name = dr["Item_Name"].ToString(),
                                       Density = dr["Density"].ToString(),
                                       Grade = dr["Grade"].ToString(),
                                       Status = dr["Status"].ToString(),



                                       OrderDate = dr["Order_Date"].ToString(),
                                       OrderPlacedBy = dr["OrderPlacedBy"].ToString(),
                                       SalesPerson = dr["SalesPerson"].ToString(),
                                       PlantCode = dr["PlantCode"].ToString(),
                                       FTL_TRUCK = dr["FTL_TRUCK"].ToString(),




                                   }).ToList();
               
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }

        public IList<OrderCreationModel> GetOrderHistory_Items(string OrderId, string ProfileName)
        {
            List<OrderCreationModel> lstemployee = new List<OrderCreationModel>();
            try
            {
                 name = "Item_Orderid";
                SqlParameter[] param = new SqlParameter[10];
                param[0] = new SqlParameter("@DealerName", OrderId);
                param[1] = new SqlParameter("@name", name);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[5] = new SqlParameter("@NSearch1", "");
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetOrderDetails", param);
                // result = Convert.ToInt32(param[3].Value.ToString());
                string fd = param[4].Value.ToString();

                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new OrderCreationModel()
                               {

                                   ID = Convert.ToInt32(dr["ID"].ToString()),
                                   OrderID = dr["OrderID"].ToString(),
                                   DealerCode = dr["DealerCode"].ToString(),
                                   ItemName = dr["ItemName"].ToString(),
                                   MaterialID = dr["MaterialId"].ToString(),
                                   Lmax = dr["Lmax"].ToString(),
                                   Wmax = dr["Wmax"].ToString(),
                                   Tmax = dr["Tmax"].ToString(),
                                   QTY = dr["Qty"].ToString(),
                                   LDPE = dr["Ldpe"].ToString(),
                                   Pieces = dr["pieces"].ToString(),
                                   Density = dr["Density"].ToString(),
                                   Grade = dr["Grade"].ToString(),
                                   PrimaryUOM = dr["PrimaryUOM"].ToString(),
                                   Volume = dr["Volume"].ToString(),
                                   Item_Name = dr["Item_Name"].ToString(),



                                   OrderDate = dr["Order_Date"].ToString(),
                                   OrderPlacedBy = dr["OrderPlacedBy"].ToString(),
                                   SalesPerson = dr["SalesPerson"].ToString(),
                                   PlantCode = dr["PlantCode"].ToString(),
                                   Status = dr["Status"].ToString(),
                                   VEHICLE_CODE = dr["VEHICLE_CODE"].ToString(),
                                   FTL_TRUCK = dr["FTL_TRUCK"].ToString(),




                               }).ToList();

            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<OrderCreationModel> LoadVehicleDetails(string DealerCode,string orderid)
        {
            List<OrderCreationModel> lstemployee = new List<OrderCreationModel>();
            try
            {
                name = "VehicleDetails";
                SqlParameter[] param = new SqlParameter[10];
                param[0] = new SqlParameter("@DealerName", DealerCode);
                param[1] = new SqlParameter("@name", name);
                param[2] = new SqlParameter("@NSearch", orderid);
                param[5] = new SqlParameter("@NSearch1", "");
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetOrderDetails", param);
                 string  resuflt = param[4].Value.ToString();
                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new OrderCreationModel()
                               {

                                 
                                   VehiTypedesc = dr["VehiTypedesc"].ToString()
                                  

                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        #endregion
        #region Get All Master Details
        public IList<OrderCreationModel> GetProductItems(string Dealercode)
        {
            List<OrderCreationModel> ListData = new List<OrderCreationModel>();
            try
            {
                ListData = (from DataRow dr in ProductItems("SelectItem", string.Empty, string.Empty, string.Empty, string.Empty, Dealercode).Tables[0].Rows
                            select new OrderCreationModel()
                            {
                                ProductItems = dr["L5"].ToString(),
                                ID = Convert.ToInt32(dr["ID"].ToString()),
                            }).ToList();
            }
            catch
            {
                throw;
            }
            return ListData;
        }
        public IList<OrderCreationModel> GetProductGrade(string Item, string Dealercode)
        {
            List<OrderCreationModel> ListData = new List<OrderCreationModel>();
            try
            {
                ListData = (from DataRow dr in ProductItems("SelectGrade", Item, string.Empty, string.Empty, string.Empty, Dealercode).Tables[0].Rows
                            select new OrderCreationModel()
                            {
                                ProductItems = dr["grade"].ToString(),
                            }).ToList();
            }
            catch
            {
                throw;
            }
            return ListData;
        }
        public IList<OrderCreationModel> GetProductGrade(string Flag, string Coloumn, string Search1, string Search2, string Search3, string Search4, string Dealercode)
        {
            List<OrderCreationModel> ListData = new List<OrderCreationModel>();
            try
            {
                if (Flag == "SelectTotalpieces")
                {
                    ListData = (from DataRow dr in ProductItems(Flag, Search1, Search2, Search3, Search4, Dealercode).Tables[0].Rows
                                select new OrderCreationModel()
                                {
                                    ProductItems = dr[Coloumn].ToString(),
                                    bundleheight = dr["MM_Per_Bundle"].ToString(),
                                    primarys = dr["primarys"].ToString()
                                }).ToList();
                }
                
                else
                {
                    ListData = (from DataRow dr in ProductItems(Flag, Search1, Search2, Search3, Search4,  Dealercode).Tables[0].Rows
                                select new OrderCreationModel()
                                {
                                    ProductItems = dr[Coloumn].ToString(),
                                    
                                }).ToList();
                }
            }
            catch
            {
                throw;
            }
            return ListData;
        }
        public DataSet ProductItems(string names, string NSearch, string DealerName, string SearchName1, string @SearchName2, string Dealercode)
        {
            try
            {
                SqlParameter[] param = new SqlParameter[10];
                param[0] = new SqlParameter("@SearchName", DealerName);
                param[1] = new SqlParameter("@name", names);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                param[5] = new SqlParameter("@SearchName1", SearchName1);
                param[6] = new SqlParameter("@SearchName2", SearchName2);
                param[7] = new SqlParameter("@DealerCode", Dealercode);
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "GetAllMasterSearch", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                if (ds.Tables.Count > 0)
                {
                    if (ds.Tables[0].Rows.Count > 0)
                    {
                    }
                    else
                        ds.Tables.Add(dt);
                }
                else
                    ds.Tables.Add(dt);
            }
            catch
            {
                throw;
            }
            return ds;
        }
        public DataSet CheckRecord(DataSet ds)
        {
            if (ds.Tables.Count > 0)
            {
                if (ds.Tables[0].Rows.Count > 0)
                {
                }
                else
                    ds.Tables.Add(dt);
            }
            else
                ds.Tables.Add(dt);
            return ds;
        }
        public IList<OrderCreationModel> LoadShippingAddress(string Dealercode)
        {
            List<OrderCreationModel> ListData = new List<OrderCreationModel>();
            try
            {
                ListData = (from DataRow dr in ProductItems("Load_ShippingAddress", string.Empty, string.Empty, string.Empty, string.Empty, Dealercode).Tables[0].Rows
                            select new OrderCreationModel()
                            {
                                Address = dr["Address"].ToString(),
                                AddressName = dr["AddressName"].ToString(),
                                DeliveryLocation = dr["DeliveryLocation"].ToString(),
                                DealerCode = dr["Dealercode"].ToString(),
                                ShipToCode = dr["ShipToCode"].ToString(),

                            }).ToList();
            }
            catch
            {
                throw;
            }
            return ListData;
        }
        public IList<OrderCreationModel> ChangeShippingAddress(string Item, string Item1, string DealerCode)
        {
            List<OrderCreationModel> ListData = new List<OrderCreationModel>();
            try
            {
                
                ListData = (from DataRow dr in ProductItems("ChangeShippingAddress", Item, Item1, string.Empty, string.Empty, DealerCode).Tables[0].Rows
                            select new OrderCreationModel()
                            {
                                Address = dr["ShippingAddress"].ToString()
                                

                            }).ToList();
            }
            catch
            {
                throw;
            }
            return ListData;
        }
        public IList<OrderCreationModel> Orderstatus(string Item, string Item1, string DealerCode)
        {
            List<OrderCreationModel> ListData = new List<OrderCreationModel>();
            try
            {

                ListData = (from DataRow dr in ProductItems("Orderstatus", Item, Item1, string.Empty, string.Empty, DealerCode).Tables[0].Rows
                            select new OrderCreationModel()
                            {
                                LOT_Status = dr["LOT_Status"].ToString(),
                                Status = dr["Status"].ToString(),
                                Ship_Status = dr["Ship_Status"].ToString(),
                                Ship_Details = dr["Ship_Details"].ToString(),


                            }).ToList();
            }
            catch
            {
                throw;
            }
            return ListData;
        }
        #endregion
        #region Order Details
        public string OrderCreation(OrderCreationModel Order)
        {
            int result = 0;
            try
            {
                Flag = "S";
                Order.resultErrorMsg = Foam_OrderCreation(Order);
            }
            catch
            {
                throw;
            }
            return Order.resultErrorMsg;
        }
        public string Foam_OrderCreation(OrderCreationModel Order)
        {
            string msg = "";
            List<OrderCreationModel> lstemployee = new List<OrderCreationModel>();
            try
            {
                SqlParameter[] param = new SqlParameter[50];
                param[0] = new SqlParameter("@ID", Order.ID);
                param[1] = new SqlParameter("@OrderPlacedBy", Order.OrderPlacedBy);
                param[2] = new SqlParameter("@DealerCode", Order.DealerCode);
                param[3] = new SqlParameter("@ShippingAddress", Order.ShippingAddress);
                param[4] = new SqlParameter("@PlantCode", Order.PlantCode);
                param[5] = new SqlParameter("@Cust_Ref", Order.Cust_Ref);
                param[6] = new SqlParameter("@Cust_Comments", Order.Cust_Comments);
                param[7] = new SqlParameter("@CRD_Date", Order.CRD_Date == null ? (object)"01/01/1900" : Order.CRD_Date);
                
                param[8] = new SqlParameter("@OrderID", Order.OrderID);
                //param[9] = new SqlParameter("@OrderDate", Order.OrderDate);
                param[10] = new SqlParameter("@OrderStatus", Order.OrderStatus);
                param[11] = new SqlParameter("@StandardOrder", Order.StandardOrder);
                param[12] = new SqlParameter("@SalesPerson", Order.SalesPerson);
                param[13] = new SqlParameter("@PrimaryUOM", Order.PrimaryUOM);
                param[14] = new SqlParameter("@ApprovedBy", Order.ApprovedBy);
                param[15] = new SqlParameter("@Status", Order.Status);
                //param[16] = new SqlParameter("@CREATED_ON", Order.CREATED_ON);
                param[17] = new SqlParameter("@MODIFIEDBY", Order.MODIFIEDBY);
                //param[18] = new SqlParameter("@MODIFIED_ON", Order.MODIFIED_ON);
                param[19] = new SqlParameter("@MFLAG", Order.Flag);
                param[20] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[20].Direction = ParameterDirection.Output;
                param[21] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[21].Direction = ParameterDirection.Output;
                param[22] = new SqlParameter("@Update_Id", SqlDbType.Int, 1);
                param[22].Direction = ParameterDirection.Output;
                //--------------------//
                param[23] = new SqlParameter("@ItemName", Order.ItemName);
                param[24] = new SqlParameter("@MaterialID", Order.MaterialID);
                param[25] = new SqlParameter("@Wmax", Order.Wmax);
                param[26] = new SqlParameter("@Tmax", Order.Tmax);
                param[27] = new SqlParameter("@QTY", Order.QTY);
                param[28] = new SqlParameter("@Lmax", Order.Lmax);
                param[29] = new SqlParameter("@Pieces", Order.Pieces);
                param[30] = new SqlParameter("@LDPE", Order.LDPE ==null ? DBNull.Value : Order.LDPE.Substring(0, 1));
                param[31] = new SqlParameter("@Grade", Order.Grade);
                param[32] = new SqlParameter("@Density", Order.Density);
                param[33] = new SqlParameter("@ITEMTYPE", Order.ITEMTYPE);
                param[34] = new SqlParameter("@Volume", Order.Volume);
                param[36] = new SqlParameter("@Weight", Order.Weight);
                param[37] = new SqlParameter("@FTL_TRUCK", Order.FTL_TRUCK);
                param[38] = new SqlParameter("@CreatedBy", Order.CreatedBy); 
                param[39] = new SqlParameter("@Delivery_Location", Order.Delivery_Location); 

                param[35] = new SqlParameter("@VEHICLE_CODE", Order.VEHICLE_CODE == null ? (object)DBNull.Value : Order.VEHICLE_CODE.Substring(0, 4));
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "FOAMORDER_INSERT_UPDATE", param);
                  result = Convert.ToInt32(param[20].Value.ToString());
                Order.resultErrorMsg = param[21].Value.ToString();
                //result = 1;
            }
            catch
            {
                throw;
            }
            return Order.resultErrorMsg;
        }

        public IList<ExportOrders> ExportOrerDeatils(string DealerCode, string SearchName)
        {
            List<ExportOrders> lstemployee = new List<ExportOrders>();
            try
            {

                SqlParameter[] param = new SqlParameter[5];
                param[0] = new SqlParameter("@DealerName", DealerCode);
                param[1] = new SqlParameter("@name", SearchName);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "ExportOrderDetails", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                string d = param[4].Value.ToString();

               

                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new ExportOrders()
                               {
                                   OrderType = dr["OrderType"].ToString(),
                                   SoldtoParty = dr["SoldtoParty"].ToString(),
                                   ShiptoParty = dr["ShiptoParty"].ToString(),
                                   DeliveryLocation = dr["DeliveryLocation"].ToString(),
                                   OrderJiniDate = dr["OrderJiniDate"].ToString(),
                                   OrderJiniNumber = dr["OrderJiniNumber"].ToString(),
                                   LineItemNo = Convert.ToInt32(dr["LineItemNo"].ToString()),
                                   CustomerReferenceDate = dr["CustomerReferenceDate"].ToString(),
                                   Material = dr["Material"].ToString(),
                                   Quantity = Convert.ToDecimal(dr["Quantity"].ToString()),
                                   Plant = dr["Plant"].ToString(),
                                   Remarks = dr["Remarks"].ToString(),
                                   Covers = dr["Covers"].ToString(),
                                   CustRefNo = dr["CustRefNo"].ToString(),
                                 


                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }
        public IList<Export_order> Export_OrerDeatils(string DealerCode, string SearchName)
        {
            List<Export_order> lstemployee = new List<Export_order>();
            try
            {

                SqlParameter[] param = new SqlParameter[5];
                param[0] = new SqlParameter("@DealerName", DealerCode);
                param[1] = new SqlParameter("@name", SearchName);
                param[2] = new SqlParameter("@NSearch", NSearch);
                param[3] = new SqlParameter("@MStatus", SqlDbType.Int, 1);
                param[3].Direction = ParameterDirection.Output;
                param[4] = new SqlParameter("@ErrorMsg", SqlDbType.NVarChar, 1000);
                param[4].Direction = ParameterDirection.Output;
                ds = SqlHelper.ExecuteDataset(CS, CommandType.StoredProcedure, "Export_OrderDetails", param);
                //result = Convert.ToInt32(param[3].Value.ToString());
                string d = param[4].Value.ToString();



                lstemployee = (from DataRow dr in CheckRecord(ds).Tables[0].Rows
                               select new Export_order()
                               {


                                   ID = dr["ID"].ToString(),
                                   DATE_ADDED = dr["DATE_ADDED"].ToString(),
                                   ORDERID = dr["ORDERID"].ToString(),
                                   DEALERCODE = dr["DEALERCODE"].ToString(),
                                   DEALERNAME = dr["DEALERNAME"].ToString(),
                                   DEALERPHONE = dr["DEALERPHONE"].ToString(),
                                   DEALER_ADDRESS = dr["DEALER_ADDRESS"].ToString(),
                                   ITEMCODE = dr["ITEMCODE"].ToString(),
                                   PRODUCT = dr["PRODUCT"].ToString(),
                                   QUANTITY = dr["QUANTITY"].ToString(),
                                   CGST = dr["CGST"].ToString(),
                                   SGST = dr["SGST"].ToString(),
                                   IGST = dr["IGST"].ToString(),
                                   MRP = dr["MRP"].ToString(),
                                   ORDERMRP = dr["ORDERMRP"].ToString(),
                                   TOTAL = dr["TOTAL"].ToString(),
                                   ORDERTOTAL = dr["ORDERTOTAL"].ToString(),
                                   SALESORDERNUMBER = dr["SALESORDERNUMBER"].ToString(),
                                   INVOICE_NUMBER1 = dr["INVOICE_NUMBER1"].ToString(),
                                   INVOICE_NUMBER2 = dr["INVOICE_NUMBER2"].ToString(),
                                   INVOICE_NUMBER3 = dr["INVOICE_NUMBER3"].ToString(),
                                   ADVANCE_AMOUNT = dr["ADVANCE_AMOUNT"].ToString(),
                                   ADVANCE_PAID = dr["ADVANCE_PAID"].ToString(),
                                   SITE_CODE = dr["SITE_CODE"].ToString(),
                                   SITE_NAME = dr["SITE_NAME"].ToString(),
                                   PAYMENT_TYPE = dr["PAYMENT_TYPE"].ToString(),
                                   COMMENT = dr["COMMENT"].ToString(),
                                   ORDER_PLACED_BY = dr["ORDER_PLACED_BY"].ToString(),
                                   SALESPERSON = dr["SALESPERSON"].ToString(),
                                   CREATED_BY_NAME = dr["CREATED_BY_NAME"].ToString(),
                                   CREATED_BY_ROLE = dr["CREATED_BY_ROLE"].ToString(),
                                   STOCKIST_NAME1 = dr["STOCKIST_NAME1"].ToString(),
                                   STOCKIST_NAME2 = dr["STOCKIST_NAME2"].ToString(),
                                   STOCKIST_PHONE1 = dr["STOCKIST_PHONE1"].ToString(),
                                   STOCKIST_PHONE2 = dr["STOCKIST_PHONE2"].ToString(),
                                   STOCKIST_AREA = dr["STOCKIST_AREA"].ToString(),
                                   BILLING_ADDRESS = dr["BILLING_ADDRESS"].ToString(),
                                   SHIPPING_ADDRESS = dr["SHIPPING_ADDRESS"].ToString(),
                                   FULFILLER = dr["FULFILLER"].ToString(),
                                   AREA = dr["AREA"].ToString(),
                                   STATUS = dr["STATUS"].ToString(),
                                   LATITUDE = dr["LATITUDE"].ToString(),
                                   LONGITUDE = dr["LONGITUDE"].ToString(),
                                   FREIGHT_CHARGES = dr["FREIGHT_CHARGES"].ToString(),
                                   TYPE = dr["TYPE"].ToString(),
                                   SOURCE = dr["SOURCE"].ToString(),
                                   WAREHOUSE = dr["WAREHOUSE"].ToString(),
                                   CLOUDINARYURL = dr["CLOUDINARYURL"].ToString(),
                                   ATTACHMENTS = dr["ATTACHMENTS"].ToString(),



                               }).ToList();
            }
            catch
            {
                throw;
            }
            return lstemployee;
        }

        public void WriteToCSV(DataTable dtDataTable, string strFilePath)
        {
            strFilePath= Path.Combine((string)AppDomain.CurrentDomain.GetData("ContentRootPath"), "wwwroot/ExportCSVFile/Mbj_dd278a.csv");
           // strFilePath = (string)AppDomain.CurrentDomain.GetData("ContentRootPath"), "wwwroot/ExportCSVFile/Mbj_dd278a.csv";

            StreamWriter sw = new StreamWriter(strFilePath, false);
            //headers    
            for (int i = 0; i < dtDataTable.Columns.Count; i++)
            {
                sw.Write(dtDataTable.Columns[i]);
                if (i < dtDataTable.Columns.Count - 1)
                {
                    sw.Write(",");
                }
            }
            sw.Write(sw.NewLine);
            foreach (DataRow dr in dtDataTable.Rows)
            {
                for (int i = 0; i < dtDataTable.Columns.Count; i++)
                {
                    if (!Convert.IsDBNull(dr[i]))
                    {
                        string value = dr[i].ToString();
                        if (value.Contains(','))
                        {
                            value = String.Format("\"{0}\"", value);
                            sw.Write(value);
                        }
                        else
                        {
                            sw.Write(dr[i].ToString());
                        }
                    }
                    if (i < dtDataTable.Columns.Count - 1)
                    {
                        sw.Write(",");
                    }
                }
                sw.Write(sw.NewLine);
            }
            sw.Close();
        }
        #endregion


    }
    
}
