using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Web;
namespace DFXB2BOMS.Models
{
    public partial class Invoice
    {
        ///<summary>
        /// Gets or sets Name.
        ///</summary>
    
        public string? Bill_Date { get; set; }
        public string? Bill_Doc { get; set; }
        public string? Sales_Doc { get; set; }
        public string? Cust_Ref { get; set; }
        public string? ZJINI_NO { get; set; }
        public string? Sold_to_Party { get; set; }
        public string? Cust_Name { get; set; }
        public string? Bill_Type { get; set; }
        public string? Net_Value { get; set; }
        public string? Tax_Amt { get; set; }
    }
}