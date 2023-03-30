using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Web;
namespace DFXB2BOMS.Models
{
    public partial class OrderCreationModel
    {
        ///<summary>
        /// Gets or sets Name.
        ///</summary>
        public int ID { get; set; }
        public string? OrderPlacedBy { get; set; }
        public string? DealerCode { get; set; }
        public string? ShippingAddress { get; set; }
        public string? PlantCode { get; set; }
        public string? Cust_Ref { get; set; }
        public string? Cust_Comments { get; set; }
        public DateTime? CRD_Date { get; set; }
        public string? CRDDate { get; set; }
        public string? OrderID { get; set; }
        public string? OrderDate { get; set; }
        public string? OrderStatus { get; set; }
        public string? StandardOrder { get; set; }
        public string? SalesPerson { get; set; }
        public string? PrimaryUOM { get; set; }
        public string? ApprovedBy { get; set; }
        public string? Status { get; set; }
        public string? ProductItems { get; set; }
        public string? ProductGrade { get; set; }
        public string? CREATED_ON { get; set; }
        public string? MODIFIEDBY { get; set; }
        public string? MODIFIED_ON { get; set; }
        public string? ItemName { get; set; }
        public string? MaterialID { get; set; }
        public string? Wmax { get; set; }
        public string? Tmax { get; set; }
        public string? QTY { get; set; }
        public string? Lmax { get; set; }
        public string? Pieces { get; set; }
        public string? LDPE { get; set; }
        public string? Grade { get; set; }
        public string? Density { get; set; }
        public string? Volume { get; set; }
        public string? Item_Name { get; set; }
        public string? ITEMTYPE { get; set; }
        public string? VehicleType { get; set; }
        public string? VehiTypedesc { get; set; }
        public string? Flag { get; set; }
        public string? VEHICLE_CODE { get; set; }

        public string? Address { get; set; }
        public string? AddressName { get; set; }

        public string? DeliveryLocation { get; set; }
       
        public string? ShipToCode { get; set; }
        public string? Weight { get; set; }
        public string? ItemCount { get; set; }
        public string? DealerName { get; set; }
        public string? resultErrorMsg { get; set; }
        public string? bundleheight { get; set; }
        public string? primarys { get; set; }
        public string? LOT_Status { get; set; }
    
        public string? Ship_Status { get; set; }
        public string? Ship_Details { get; set; }
        public string? FTL_TRUCK { get; set; }
        public string? CreatedBy { get; set; }
        public string? Delivery_Location { get; set; }

        


    }
}
