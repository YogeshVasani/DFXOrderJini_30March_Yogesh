using DFXB2BOMS.Models;
using DFXB2BOMS.Repository;
using DocumentFormat.OpenXml.Drawing.Charts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Specialized;

namespace DFXB2BOMS.Controllers
{
    public partial class SalesOrderController : Controller
    {
        // GET: SalesOrderController
        public ActionResult Index()
        {
            return View();
        }
        // GET: SalesOrderController/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }
        
        // GET: SalesOrderController/Create
        public ActionResult Create()
        {
            return View();
        }
        public ActionResult OrderHistory()
        {
            return View();
        }
        public ActionResult OrderDetails()
        {
            return View();
        }
        public IActionResult OrderCreation()
        {
           
           // TempData["DealerCode"] = DealerCode.Trim().ToString();
            return View();
        }
        public IActionResult Invoice()
        {

            // TempData["DealerCode"] = DealerCode.Trim().ToString();
            return View();
        }
        [Route("api/SalesOrder/OrderCreate")]
        [HttpGet]
        public  string OrderCreate(string ItemName, string Grade, string Density, string PrimaryUOM, string Lmax, string Wmax,string Tmax,
            string QTY, string Pieces, string LDPE, string DealerCode,string Volume,string Weight,string STANDARD_ORDER, string OrderPlacedby,string OrderID
            ,string CreatedBy)
        {
            
            OrderCreationModel Order = new OrderCreationModel();
            Order.ItemName = ItemName;
            Order.Grade = Grade;
            Order.Density = Density;
            Order.PrimaryUOM= PrimaryUOM;
            Order.Lmax= Lmax;
            Order.Wmax= Wmax;
            Order.Tmax= Tmax;
            Order.QTY= QTY;
            Order.Pieces= Pieces;
            Order.LDPE= LDPE;
            Order.Volume= Volume;
            Order.OrderPlacedBy= OrderPlacedby;
            Order.CRD_Date= Convert.ToDateTime("01/01/1900"); 
            Order.DealerCode= DealerCode.Trim().ToString();
            Order.Flag = "S";
            Order.Weight = Weight;
            Order.StandardOrder = STANDARD_ORDER;
            Order.OrderID = OrderID;
            Order.CreatedBy = CreatedBy;
          
            OrdersDataLayer order = new OrdersDataLayer();
            
            string msg = "";

            return msg=order.Foam_OrderCreation(Order);
        }
        [Route("api/SalesOrder/OrderItemUpdate")]
        [HttpPost]
        public string OrderItemUpdate(string Cust_Ref, string Comments, string VehicleCode, string PlantCode, string CRD_Date, string Wmax, string Tmax,
            string QTY, string Pieces, string LDPE, string DealerCode, string OrderID, string Volume, string Weight,string FTL_TRUCK, string Delivery_Location)
        {

            OrderCreationModel Order = new OrderCreationModel();

            if (Tmax == "ItemConfirm")
            {
               // Order.ItemName = Cust_Ref;
                Order.Cust_Comments = Comments;
                Order.Cust_Ref = Cust_Ref;
                Order.PlantCode = PlantCode;
                Order.CRD_Date = Convert.ToDateTime(CRD_Date);
                Order.VEHICLE_CODE = VehicleCode.Substring(0, 4); 
                Order.Flag = "U";
                Order.Status = "Confirmed";
                Order.Weight = Weight;

            }
            else if (Tmax == "ItemSave")
            {
               // Order.ItemName = Cust_Ref;
                Order.Cust_Comments = Comments;
                Order.Cust_Ref = Cust_Ref;
                Order.PlantCode = PlantCode;
                Order.CRD_Date = Convert.ToDateTime(CRD_Date);
                Order.VEHICLE_CODE = VehicleCode.Substring(0, 4);
                Order.Flag = "SaveItem";
                Order.Weight = Weight;

            }
            // Order.Lmax = Lmax;
            //Order.Wmax = Wmax;
            //Order.Tmax = Tmax;
            else if (Tmax == "Itemupdate")
            {

                Order.QTY = QTY;
                Order.Pieces = Pieces;
                Order.Volume = Volume;
                Order.ID = Convert.ToInt32(Wmax);
                Order.Flag = "UpdateItem";
                Order.Weight = Weight;

            }
            //else if (Tmax == "ItemSave")
            //{

            //    Order.QTY = QTY;
            //    Order.Pieces = Pieces;
            //    Order.Volume = Volume;
            //    Order.ID = Convert.ToInt32(Wmax);
            //    Order.Flag = "SaveItem";
            //}

            //Order.LDPE = LDPE;
            //Order.Volume = Volume;
            Order.OrderID = OrderID;
            Order.FTL_TRUCK = FTL_TRUCK;
            Order.DealerCode = DealerCode.Trim().ToString();
            Order.Delivery_Location = Delivery_Location;
            OrdersDataLayer orderlay = new OrdersDataLayer();

            string msg = "";
            return msg = orderlay.Foam_OrderCreation(Order);
        }
        public IActionResult OrderItems(string OrderItems)
        {
            return View();
        }
        // POST: SalesOrderController/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(IFormCollection collection)
        {
            try
            {
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }
        // GET: SalesOrderController/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }
        // POST: SalesOrderController/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(int id, IFormCollection collection)
        {
            try
            {
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }
        // GET: SalesOrderController/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }
        // POST: SalesOrderController/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Delete(int id, IFormCollection collection)
        {
            try
            {
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }
    }
}
