using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Text;
using System.Threading.Tasks;
using DFXB2BOMS.Models;

namespace DFXB2BOMS.Interface
{
    public partial interface IOrders
    {
        IList<OrderCreationModel> GetOrders(string DealerCode, string SearchName);
        IList<CustomerModel> GetCustomers(string DealerName, string SearchName);
        IList<CustomerModel> Create_RepeatOrder(string DealerName, string SearchName);
        IList<CustomerModel> GetDealersDetails(string DealerCode, string Name);
        IList<OrderCreationModel> GetProductItems(string DealerCode);
        IList<OrderCreationModel> GetProductGrade(string Flag, string Coloumn, string Search1, string Search2, string Search3, string Search4, string DealerCode);
    }
}