using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace StudentRecordManagementSystem.Utility
{
    public static class ConnectionString
    {
        private static string cName = "Data Source=172.16.0.149;  Initial Catalog=DFXB2BOMS;User ID=canopus;Password=India@123";
        public static string CName { get => cName; }

        private static string DuroFlex_cName = "Data Source=172.16.0.149;  Initial Catalog=Dev_DFXPortalQuality;User ID=canopus;Password=India@123";
        public static string DuroFlex_CName { get => DuroFlex_cName; }

        public static string DBCon()
        {
            var configuation = GetConfiguration();

            return configuation.GetSection("ConnectionStrings").GetSection("DFXB2BOMS").Value;
        }

        public static IConfigurationRoot GetConfiguration()
        {
            var builder = new ConfigurationBuilder().SetBasePath(Directory.GetCurrentDirectory()).AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            return builder.Build();
        }

    }
}
