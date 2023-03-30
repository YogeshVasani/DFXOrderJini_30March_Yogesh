using DFXB2BOMS.Models;
using DFXB2BOMS.Repository;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net.Mail;
using System.Net;
using System.Text;
using Microsoft.CodeAnalysis;
using System.IO;
using System;
using System.Security.Cryptography.Xml;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using DFXB2BOMS.Interface;

using System.Data;

using ClosedXML.Excel;
using Microsoft.Extensions.Configuration;



namespace DFXB2BOMS.Controllers
{
    public partial class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
     
        public HomeController(ILogger<HomeController> logger)
        {
           
                _logger = logger;
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult UserLogin()
        {
            return View();
        }
        public IActionResult AccessDenied()
        {
            return View();
        }
        [HttpPost]
        public IActionResult FoamOrderCreation(OrderCreationModel Order)
        {
           
            try

            {

                OrdersDataLayer order = new OrdersDataLayer();


                order.Foam_OrderCreation(Order);

            }

            catch (Exception)

            {

                

            }



            return View();
        }
        public IActionResult UserProfile()
        {
            return View();
        }
        public IActionResult CustomersList()
        {

            return View();
        }
        public IActionResult Privacy()
        {
            return View();
        }
        public IActionResult OrderCreation()
        {
            return View();
        }
        public IActionResult OrderItems()
        {
            return View();
        }
        public IActionResult OrderDetails()
        {
            return View();
        }
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [Route("api/Orders/SendEmail")]
        [HttpPost]
        public ActionResult SendEmail(string receiver, string subject, string message)
        {
            try
            {
                receiver = "jobsbalaji87@gmail.com";
                subject = "Order Approval & Reject";
                message = "hi balaji";
                if (ModelState.IsValid)
                {
                    var senderEmail = new MailAddress("balaji71187@gmail.com", "Balaji");
                    var receiverEmail = new MailAddress(receiver, "Receiver");
                    var password = "Diyacharvi@0210";
                    var sub = subject;
                    var body = message;
                    var smtp = new SmtpClient
                    {
                        Host = "smtp.office365.com",
                        Port = 587,
                        EnableSsl = true,
                        DeliveryMethod = SmtpDeliveryMethod.Network,
                        UseDefaultCredentials = false,
                        Credentials = new NetworkCredential(senderEmail.Address, password)
                    };
                    using (var mess = new MailMessage(senderEmail, receiverEmail)
                    {
                        Subject = subject,
                        Body = body
                    })


                    {
                        smtp.Send(mess);
                    }
                    return View();
                }
            }
            catch (Exception)
            {
                ViewBag.Error = "Some Error";
            }
            return View();
        }
      
      
    }
}