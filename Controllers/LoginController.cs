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
   
    public partial class LoginController : ControllerBase
    {
        // url: '/api/Login/LoginCheck' + "?UserName=" + UserName_id + "&Role=" + Role_id + "&BusinessValue=''",  /*You URL to post*/
        
        [Route("api/Login/LoginCheck")]
        [HttpPost]
        public IEnumerable<CustomerModel> LoginCheck(string UserName,string Role,string BusinessValue)
        {
            OrdersDataLayer order = new OrdersDataLayer();


            return order.LoginCheck(UserName, Role);
        }
    }
}
