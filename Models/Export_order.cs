using DFXB2BOMS.Interface;
using System.Net.Mail;
using System;

namespace DFXB2BOMS.Models
{
    public class Export_order
    {
        public string? ID { get; set; }
        public string? DATE_ADDED { get; set; }
        public string? ORDERID { get; set; }
        public string? DEALERCODE { get; set; }
        public string? DEALERNAME { get; set; }
        public string? DEALERPHONE { get; set; }
        public string? DEALER_ADDRESS { get; set; }
        public string? ITEMCODE { get; set; }
        public string? PRODUCT { get; set; }
        public string? QUANTITY { get; set; }
        public string? CGST { get; set; }
        public string? SGST { get; set; }
        public string? IGST { get; set; }
        public string? MRP { get; set; }
        public string? ORDERMRP { get; set; }
        public string? TOTAL { get; set; }
        public string? ORDERTOTAL { get; set; }
        public string? SALESORDERNUMBER { get; set; }
        public string? INVOICE_NUMBER1 { get; set; }
        public string? INVOICE_NUMBER2 { get; set; }
        public string? INVOICE_NUMBER3 { get; set; }
        public string? ADVANCE_AMOUNT { get; set; }
        public string? ADVANCE_PAID { get; set; }
        public string? SITE_CODE { get; set; }
        public string? SITE_NAME { get; set; }
        public string? PAYMENT_TYPE { get; set; }
        public string? COMMENT { get; set; }
        public string? ORDER_PLACED_BY { get; set; }
        public string? SALESPERSON { get; set; }
        public string? CREATED_BY_NAME { get; set; }
        public string? CREATED_BY_ROLE { get; set; }
        public string? STOCKIST_NAME1 { get; set; }
        public string? STOCKIST_NAME2 { get; set; }
        public string? STOCKIST_PHONE1 { get; set; }
        public string? STOCKIST_PHONE2 { get; set; }
        public string? STOCKIST_AREA { get; set; }
        public string? BILLING_ADDRESS { get; set; }
        public string? SHIPPING_ADDRESS { get; set; }
        public string? FULFILLER { get; set; }
        public string? AREA { get; set; }
        public string? STATUS { get; set; }
        public string? LATITUDE { get; set; }
        public string? LONGITUDE { get; set; }
        public string? FREIGHT_CHARGES { get; set; }
        public string? TYPE { get; set; }
        public string? SOURCE { get; set; }
        public string? WAREHOUSE { get; set; }
        public string? CLOUDINARYURL { get; set; }
        public string? ATTACHMENTS { get; set; }

    }
}

