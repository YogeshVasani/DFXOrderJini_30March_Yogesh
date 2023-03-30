using DFXB2BOMS.Interface;
using Microsoft.CodeAnalysis;
using System.IO;
using System;
namespace DFXB2BOMS.Models
{
    public class ExportOrders
    {


        public string? OrderType { get; set; }
        public string? SoldtoParty { get; set; }
        public string? ShiptoParty { get; set; }
        public string? DeliveryLocation { get; set; }
        
        public string? OrderJiniDate { get; set; }
        public string? OrderJiniNumber { get; set; }
        public decimal? LineItemNo { get; set; }
        public string? CustomerReferenceDate { get; set; }
        public string? Material { get; set; }
        public decimal? Quantity { get; set; }
        public string? Plant { get; set; }
        public string? Covers { get; set; }
        public string? Remarks { get; set; }
        public string? CustRefNo { get; set; }
     

    }
}
