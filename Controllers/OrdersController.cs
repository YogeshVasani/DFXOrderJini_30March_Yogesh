using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Drawing;
using DFXB2BOMS.Models;
using DFXB2BOMS.Repository;
using System.Reflection;
using Newtonsoft.Json;
using NuGet.Protocol.Plugins;

namespace DFXB2BOMS.Controllers
{
    [Produces("application/json")]

    [ApiController]
    public partial class OrdersController : ControllerBase
    {
        [Route("api/Orders/GetCRD_Date_HolidayList")]
        [HttpPost]
        public IEnumerable<CustomerModel> GetCRD_Date_HolidayList(string Orderdate, string plant)
        {
            OrdersDataLayer order = new OrdersDataLayer();


            return order.GetCRD_Date_HolidayList(Orderdate, plant);
        }

        [Route("api/Orders/GetCustomers")]
        [HttpPost]
        public IEnumerable<CustomerModel> GetCustomers(string DealerName, string SearchName)
        {
            OrdersDataLayer order = new OrdersDataLayer();


            return order.GetCustomers(DealerName.Trim().ToString(), SearchName);
        }
        [Route("api/Orders/GetPlantDetails")]
        [HttpPost]
        public IEnumerable<CustomerModel> GetPlantDetails(string orderid)
        {
            OrdersDataLayer order = new OrdersDataLayer();


            return order.GetPlantDetails(orderid.Trim().ToString());
        }
        [Route("api/Orders/ChangePlantByAdmin")]
        [HttpPost]
        public IEnumerable<CustomerModel> ChangePlantByAdmin(string DealerCode, string PlantCode)
        {
            OrdersDataLayer order = new OrdersDataLayer();


            return order.ChangePlantByAdmin(DealerCode.Trim().ToString(), PlantCode);
        }
        [Route("api/Orders/GetDealersDetails")]
        [HttpPost]
        public IEnumerable<CustomerModel> GetDealersDetails(string DealerCode,string Name)
        {
            OrdersDataLayer order = new OrdersDataLayer();


            return order.GetDealersDetails(DealerCode.Trim().ToString(), Name);
        }
        [Route("api/Orders/Create_RepeatOrder")]
        [HttpPost]
        public IEnumerable<CustomerModel> Create_RepeatOrder(string DealerName, string SearchName)
        {
            OrdersDataLayer order = new OrdersDataLayer();


            return order.Create_RepeatOrder(DealerName, SearchName);
        }
        [Route("api/Orders/GetOrders")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetOrders(string DealerCode,string SearchName)
        {
            OrdersDataLayer order = new OrdersDataLayer();
           
            List<OrderCreationModel> saleList = order.GetOrders(DealerCode.Trim().ToString(), SearchName).ToList<OrderCreationModel>();
            
            return saleList;
        }
        [Route("api/Orders/GetInvoice_Details")]
        [HttpPost]
        public IEnumerable<Invoice> GetInvoice_Details(string DealerCode, string SearchName)
        {
            OrdersDataLayer order = new OrdersDataLayer();

            List<Invoice> saleList = order.GetInvoice_Details(DealerCode.Trim().ToString(), SearchName).ToList<Invoice>();

            return saleList;
        }
        [Route("api/Orders/UpdateApproval_Reject")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> UpdateApproval_Reject(string Approve, string ApprovedBy, string orderid)
        {
            OrdersDataLayer order = new OrdersDataLayer();

            List<OrderCreationModel> saleList = order.UpdateApproval_Reject(Approve, ApprovedBy, orderid).ToList<OrderCreationModel>();

            return saleList;
        }
        [Route("api/Orders/GetOrdersId")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetOrdersId(string DealerCode, string OrderId)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            List<OrderCreationModel> saleList = order.GetOrdersid(DealerCode.Trim().ToString(), OrderId).ToList<OrderCreationModel>();

            return saleList;
        }
        [Route("api/Orders/GetItems")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetItems(string DealerCode,string ProfileName,string OrderId)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            List<OrderCreationModel> saleList = order.GetItems(DealerCode.Trim().ToString(), ProfileName, OrderId).ToList<OrderCreationModel>();

            return saleList;
        }

        [Route("api/Orders/GetOrderHistory_Items")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetOrderHistory_Items(string OrderId, string ProfileName)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            List<OrderCreationModel> saleList = order.GetOrderHistory_Items(OrderId.Trim().ToString(), ProfileName).ToList<OrderCreationModel>();

            return saleList;
        }
        [Route("api/Orders/RemoveOrderItems")]
        [HttpPost]
        public IEnumerable<CustomerModel> RemoveOrderItems(string DealerCode, int ItemID)
        {
            OrdersDataLayer order = new OrdersDataLayer();


            return order.RemoveOrderItems(DealerCode.Trim().ToString(), ItemID);
        }
        [Route("api/Orders/GetVehicleDetails")]
        [HttpPost]
        public IEnumerable<CustomerModel> GetVehicleDetails(string DealerCode)
        {
            OrdersDataLayer order = new OrdersDataLayer();


            return order.GetVehicleDetails(DealerCode.Trim().ToString());
        }
        [Route("api/Orders/LoadVehicleDetails")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> LoadVehicleDetails(string DealerCode,string orderid)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            List<OrderCreationModel> saleList = order.LoadVehicleDetails(DealerCode.Trim().ToString(), orderid).ToList<OrderCreationModel>();

            return saleList;
        }
        [Route("api/Orders/GetProductItems")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetProductMaster_Items(string DealerCode)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.GetProductItems(DealerCode.Trim().ToString());
        }
        [Route("api/Orders/GetProductGrade")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetProductGrade(string Item, string DealerCode)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.GetProductGrade("SelectGrade", "grade", Item, "", "","", DealerCode.Trim().ToString());
        }
        [Route("api/Orders/GetProductDensity")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetProductDensity(string Item, string Item1, string DealerCode)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.GetProductGrade("SelectDensity", "Density", Item, Item1, "","", DealerCode.Trim().ToString());
        }
        [Route("api/Orders/GetProductPrimaryUOM")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetProductPrimaryUOB(string Item, string Item1)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.GetProductGrade("SelectDisplayUOM", "UOM", Item, Item1, "","","");
        }
        [Route("api/Orders/GetProductLenth")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetProductLenth(string Item, string Item1)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.GetProductGrade("SelectLength", "Lmax", Item, Item1, "","","");
        }
        [Route("api/Orders/GetProductWidth")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetProductWidth(string Item, string Item1)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.GetProductGrade("SelectWidth", "WMax", Item, Item1, "","","");
        }
        [Route("api/Orders/GetProductThickness")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetProductThickness(string Item, string Item1, string Item2)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.GetProductGrade("SelectThickness", "Thickness", Item, Item1, Item2,"","");
        }
        [Route("api/Orders/GetBundleCalculatepieces")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetBundleCalculatepieces(string Item, string Item1, string Item2, string Item3)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.GetProductGrade("SelectTotalpieces", "Total_pieces", Item.Trim(), Item1.Trim(), Item2.Trim(), Item3.Trim(), "");
        }
        [Route("api/Orders/GetPufDensity")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> GetPufDensity(string Item)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.GetProductGrade("PUFDENSITY", "density", "", "", "", "", Item);
        }
        [Route("api/Orders/LoadShippingAddress")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> LoadShippingAddress(string DealerCode)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.LoadShippingAddress(DealerCode.Trim().ToString());
        }
        [Route("api/Orders/ChangeShippingAddress")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> ChangeShippingAddress(string Item1, string Item, string DealerCode)
        {
            OrdersDataLayer order = new OrdersDataLayer();
           
            return order.ChangeShippingAddress( Item, Item1, DealerCode.Trim().ToString());
        }
        [Route("api/Orders/Orderstatus")]
        [HttpPost]
        public IEnumerable<OrderCreationModel> Orderstatus(string Orderid)
        {
            OrdersDataLayer order = new OrdersDataLayer();

            return order.Orderstatus("", "", Orderid.Trim().ToString());
        }
        [Route("api/Orders/Custom_ExportCSV")]
        [HttpPost]
        public IEnumerable<ExportOrders> Custom_ExportCSV(string DealerCode, string SearchName)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.ExportOrerDeatils(DealerCode, SearchName);
        }
        [Route("api/Orders/ExportCSV")]
        [HttpPost]
        public IEnumerable<Export_order> ExportCSV(string DealerCode, string SearchName)
        {
            OrdersDataLayer order = new OrdersDataLayer();
            return order.Export_OrerDeatils(DealerCode, SearchName);
        }

    }
}
