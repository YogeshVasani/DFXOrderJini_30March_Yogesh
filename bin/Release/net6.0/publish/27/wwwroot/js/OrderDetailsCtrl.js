var app = angular.module('MyApp2', [])
    .controller('MyController2', function ($scope, $http, $window) {
        var Duroconnecturl = "https://www.dfxtest.com/Home/Navigation";
        //------------------------------------------------------------LOGIN PROFILE---------------------------//
        var UserId = localStorage["UserId"];
        var profile = localStorage["ProfileName"];
        $("#userid").text(UserId);
        $("#profileid").text(profile);
        $("#usersignoutid").text(profile);

        $scope.AdminProfileEnable = function () {
            //------------------------------------------------------------------------------------------------------------------//

            var UserId = localStorage["UserId"];
            var profile = localStorage["ProfileName"];
            $("#userid").text(UserId);
            $("#profileid").text(profile);
            $("#usersignoutid").text(profile);
            var url = $("#RedirectTologin").val();
            if (UserId == null || UserId == "") {
                //alert('Please Enter UserName! Login Failed');
                location.href = Duroconnecturl;
            }

            else if (profile == null || profile == "") {
                //alert('Please Enter RoleId! Login Failed');
                location.href = Duroconnecturl;
            }
            else {
                if (profile == "Admin") {
                    localStorage['UserId'] = UserId;

                    localStorage['ProfileNameRepeatorder'] = "";
                    localStorage['ProfileNameRepeatorder'] = "Repeatorder_Admin";
                    localStorage['ProfileNameItem'] = "";
                    localStorage['ProfileNameItem'] = "Item_Admin";

                    //location.href = url + "?UserName=" + UserName + "&Role=" + Role;
                    localStorage["UserId"] = "Admin";
                    localStorage["ProfileName"] = "Admin";
                    $("#CustomerMenu").show();
                    $("#MenuFoamId").show();
                    //  $("#btnCustom_Export").show();
                    localStorage["SearchName"] = "Admin";
                    //localStorage["DealerCode"] = UserId;

                    $("#PlantSel").prop("disabled", false)
                }
                else if (profile == "Customer") {
                    localStorage['UserId'] = UserId;

                    localStorage['ProfileNameRepeatorder'] = "";
                    localStorage['ProfileNameRepeatorder'] = "Repeatorder_Customer";
                    localStorage['ProfileNameItem'] = "";

                    localStorage['ProfileNameItem'] = "Item_Customer";

                    //location.href = url + "?UserName=" + UserName + "&Role=" + Role;
                    localStorage["DealerCode"] = UserId;

                    $("#CustomerMenu").hide();
                    $("#MenuFoamId").show();
                    localStorage["SearchName"] = "Orders";
                    // $("#btnCustom_Export").hide();

                    $("#PlantSel").prop("disabled", true);
                    //$("#edithide").show();
                    //  $('#Itemstbl').find('.editd').showsh
                    $('#Itemstbl').closest("tr").find(".editd").hide();
                    // $("#Itemstbl").closest("tr").find(".editd").show();
                }
                else if (profile == "FactoryAdmin") {
                    localStorage['UserId'] = UserId;

                    localStorage['ProfileNameRepeatorder'] = "";
                    localStorage['ProfileNameRepeatorder'] = "Repeatorder_FactoryAdmin";
                    localStorage['ProfileNameItem'] = "";

                    localStorage['ProfileNameItem'] = "Item_FactoryAdmin";

                    // location.href = url + "?UserName=" + UserName + "&Role=" + Role;
                    // localStorage["DealerCode"] = UserId;

                    $("#PlantSel").prop("disabled", true);
                    //$("#btnCustom_Export").show();

                    $("#CustomerMenu").show();
                    $("#MenuFoamId").hide();
                    localStorage["SearchName"] = "FactoryAdmin";
                }
                else if (profile == "SalesPerson") {
                    localStorage['UserId'] = UserId;

                    localStorage['ProfileNameRepeatorder'] = "";
                    localStorage['ProfileNameRepeatorder'] = "Repeatorder_SalesPerson";
                    localStorage['ProfileNameItem'] = "";

                    localStorage['ProfileNameItem'] = "Item_SalesPerson";

                    //location.href = url + "?UserName=" + UserName + "&Role=" + Role;
                    // $("#btnCustom_Export").hide();

                    $("#CustomerMenu").show();
                    $("#MenuFoamId").show();
                    localStorage["SearchName"] = "Orders";
                    $("#PlantSel").prop("disabled", true);
                    //localStorage["DealerCode"] = UserId;
                }
                //-----------------------------------------------------------------------------------------------------------------//
            }
            $scope.LoadPlant();
            //  $scope.Validate_ChangeAddress();
        }

        //------------------------------------------------------------LOGIN PROFILE---------------------------//
        var subjectSel = document.getElementById("subject");
        var topicSel = document.getElementById("topic");
        var DensitySel = document.getElementById("Density");
        var lblBundle = document.getElementById("lblBundle");
        var LengthSel = document.getElementById("LengthSel");
        var widthSel = document.getElementById("widthSel");
        var thicknessSel = document.getElementById("thicknessSel");
        $scope.IsVisible = false;
        $scope.GetAllData = function () {
            $scope.AdminProfileEnable();
            debugger;
            var customer = '{OrderID: "' + $scope.Prefix + '" }';

            if (localStorage['ProfileName'] == 'SalesPerson' || localStorage['ProfileName'] == 'FactoryAdmin') {
                var post = $http({
                    method: "POST",
                    url: "/api/Orders/GetOrders" + "?DealerCode=" + $("#userid").text() + "&SearchName=" + localStorage['ProfileName'],
                    dataType: 'json',
                    data: customer,
                    headers: { "Content-Type": "application/json" }
                });
            }

            else {
                var post = $http({
                    method: "POST",
                    url: "/api/Orders/GetOrders" + "?DealerCode=" + localStorage['DealerCode'] + "&SearchName=" + localStorage['ProfileName'],
                    dataType: 'json',
                    data: customer,
                    headers: { "Content-Type": "application/json" }
                });
            }
            post.success(function (response, status) {
                debugger;
                var fcustomer = '{OrderID: "' + $scope.Prefix + '" }';
                $scope.OrderDetails = response;
                debugger;
                $scope.IsVisible = true;
            });
            post.error(function (response, status) {
                //$window.alert(response.Message);
            });

            if (localStorage['ProfileName'] == 'SalesPerson' || localStorage['ProfileName'] == 'Customer') {
                $("#btnCustom_Export").hide();
            }
            else {
                $("#btnCustom_Export").show();
            }
        }
        //------------------------------------------------------------INVOICE DETAILS------------------------------------------------------------------//
        $scope.GetInvoice_Details = function () {
            $scope.AdminProfileEnable();
            $scope.InvoiceDetails = "";
            var customer = '{OrderID: "' + $scope.Prefix + '" }';
            var post = $http({
                method: "POST",
                url: "/api/Orders/GetInvoice_Details" + "?DealerCode=" + localStorage['DealerCode'] + "&SearchName=" + localStorage['ProfileName'],
                dataType: 'json',
                data: customer,
                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.InvoiceDetails = response;
            });
            post.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //-------------------------------------------------EXPORT INTO EXCEL CSV- ORDERS-----------------------------------------------------------------------//
        $scope.ExportCSV = function () {
            $scope.AdminProfileEnable();
            var DealerCode = localStorage['DealerCode'];
            var ProfileName = localStorage['ProfileName'];
            $scope.Export_OrderDetails = "";
            var customer = '{OrderID: "' + $scope.Prefix + '" }';
            var post = $http({
                method: "POST",
                url: "/api/Orders/ExportCSV" + "?DealerCode=" + DealerCode + "&SearchName=" + ProfileName,
                dataType: 'json',
                data: customer,
                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.Export_OrderDetails = response;
            });
            post.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        $scope.Custom_ExportCSV = function () {
            $scope.AdminProfileEnable();
            $scope.ExportOrderDetails = "";
            var DealerCode = localStorage['DealerCode'];
            if (DealerCode == undefined)
                DealerCode = "";
            var ProfileName = localStorage['ProfileName'];
            var customer = '{OrderID: "' + $scope.Prefix + '" }';

            var post = $http({
                method: "POST",
                url: "/api/Orders/Custom_ExportCSV" + "?DealerCode=" + localStorage['DealerCode'] + "&SearchName=" + localStorage['ProfileName'],
                dataType: 'json',
                data: customer,
                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.ExportOrderDetails = response;
            });
            post.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }

        //$scope.export_Data = function () {
        //    var blob = new Blob([document.getElementById('export_1').innerHTML], {
        //        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        //    });
        //    saveAs(blob, "Mbj_dd278ab3155f0ff2576fc19a90449c64_Orders.xls");

        //};
        //$scope.exportData3 = function () {
        //    var blob = new Blob([document.getElementById('export').innerHTML], {
        //        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        //    });
        //    var objectUrl = URL.createObjectURL(blob);
        //    saveAs(objectUrl, "Mbj_dd278a_custom.xls");

        //};

        $scope.exportData = function (type, fn, dl) {
            var elt = document.getElementById('ExportOrdrHistoryTbl');
            var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
            return dl ?
                XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
                XLSX.writeFile(wb, fn || ('Export_ConfirmOrders.' + (type || 'xlsx')));
        }
        $scope.export_Data = function (type, fn, dl) {
            var elt = document.getElementById('Export_OrdrHistoryTbl');
            var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
            return dl ?
                XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
                XLSX.writeFile(wb, fn || ('Export_Orders.' + (type || 'xlsx')));
        }
        //-------------------------------------------------------------------------------------------------------------------------------------//
        //This will hide the DIV by default.
        $scope.IsHidden = true;
        $scope.OrderFilterBy = function () {
            //If DIV is hidden it will be visible and vice versa.
            $scope.IsHidden = $scope.IsHidden ? false : true;
        }

        //-------------------------------------------------REPEAT ORDER-------------------------------------//
        $scope.RepeatOrder_History = function (Orderid, dealercode) {
            $scope.RepeatOrder(Orderid, dealercode);
        }

        $scope.RepeatOrder = function (Orderid, dealercode) {
            var customer = '{OrderID: "' + $scope.Prefix + '" }';
            var post = $http({
                method: "POST",
                url: "/api/Orders/Create_RepeatOrder" + "?DealerName=" + dealercode + "&SearchName=" + Orderid,
                dataType: 'json',

                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.RepeatOrderdetails = response;
                if ($scope.RepeatOrderdetails[0].resultErrorMsg == "Repeat Order Created Successfully!") {
                    alert($scope.RepeatOrderdetails[0].resultErrorMsg);
                    var url = $("#RedirectToOrderDetails").val();
                    $("#hdnordid").val($scope.RepeatOrderdetails[0].orderid);
                    localStorage["OrderHistoryId"] = "";
                    localStorage["OrderHistoryId"] = $scope.RepeatOrderdetails[0].orderid;
                    location.href = url + "?id=" + $scope.RepeatOrderdetails[0].orderid;
                }
                else {
                    alert($scope.RepeatOrderdetails[0].resultErrorMsg);
                }
            });
            post.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //-------------------------------------------------REPEAT ORDER-------------------------------------//
        //

        setTimeout(function () {
            $scope.GetCRD_Date_HolidayList();
        }, 1000)

        $(window).on('load', function () {
            //insert all your ajax callback code here.
            //Which will run only after page is fully loaded in background.
            //scope.GetCRD_Date_HolidayList();
        });
        //---------------------------------------------SEND EMAIL--------------------------------------------------------------//
        $scope.SendMail = function (msg) {
            var msg1 = "";
            var receiver = "jobsbalaji87@gmail.com";
            if (msg == "Approved") {
                msg = "Your Order has been Approved";
                msg1 = "Order Approval Status";
            }
            else {
                msg = "Your Order has been Rejected";
                msg1 = "Order Reject Status";
            }
            var post = $http({
                method: "POST",
                url: "/api/Orders/SendEmail" + "?receiver=" + receiver + "&subject=" + msg1 + "&message=" + msg,
                dataType: 'json',

                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.CRD_Date = response;
            });
            post.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //-----------------------------------------------------------------------------------------------------------//
        $scope.ConfirmEditBy_Role = function () {
            //var go = true;

            $("#addNewItemBtn").hide();
            $("#ItemUpdateSave").hide();
            $("#ItemUpdateConfirm").hide();
            var status = $("#hdnordstatus").val().trim();
            //alert(status.trim() + localStorage['ProfileName'])
            if (status == "Draft") {
                $("#ItemUpdateSave").show();
                $("#ItemUpdateConfirm").show();

                $("#addNewItemBtn").show();
                //var go = false;
            }
            else if (status == "Confirmed" && (localStorage['ProfileName'] == "Admin" || localStorage['ProfileName'] == "FactoryAdmin")) {
                $("#ItemUpdateSave").show();
                $("#ItemUpdateConfirm").show();

                $("#addNewItemBtn").show();
                // var go = false;
            }
            // return go;
        }
        $scope.EditBy_Role = function (role, status) {
            var go = true;
            role = localStorage['ProfileName'];

            //status = status.trim();
            if (role == "Admin" || role == "FactoryAdmin") {
                var go = false;
            }
            else if (role == "Customer" && (status == "Draft")) {
                var go = false;
            }
            else if (role == "SalesPerson" && (status == "Draft" || status == null)) {
                var go = false;
            }

            if (role == "Admin" || role == "FactoryAdmin") {
                $("#ftlchk").show();
            }
            return go;
        }
        $scope.UpdateApproveBy_Role = function (role, status, standardOrder) {
            var go = true;
            status = status.trim();

            if (role == "Admin" && (status == "" || status == null) && standardOrder == 'NS') {
                var go = true;
            }
            else {
                if (role == "Admin" && (status == "Confirmed" || status != "Approved") && standardOrder == 'NS') {
                    var go = false;
                }
                if (role == "Admin" && (status == "Confirmed" || status != "Rejected") && standardOrder == 'NS') {
                    var go = false;
                }
                if (role == "Admin" && status == "Approved" && standardOrder == 'NS') {
                    var go = true;
                }
                if (role == "Admin" && status == "Rejected" && standardOrder == 'NS') {
                    var go = true;
                }
            }

            return go;
        }
        $scope.RepeatOrder_Role = function (role, status, standardOrder) {
            var go = true;
            status = status.trim();

            if (status == "Confirmed" && standardOrder == 'SO') {
                var go = false;
            }
            if (status == "Confirmed" && standardOrder == 'NS') {
                var go = true;
            }
            if (status == "Approved" && standardOrder == 'NS') {
                var go = false;
            }
            if (status == "Rejected" && standardOrder == 'NS') {
                var go = true;
            }

            return go;
        }

        //----------------------------APPROVE REJECT-----------//
        $scope.GetApprove_Reject = function (input, orderid) {
            var post = $http({
                method: "POST",
                url: "/api/Orders/UpdateApproval_Reject" + "?Approve=" + input + "&ApprovedBy=" + localStorage['ProfileName'] + "&orderid=" + orderid,
                dataType: 'json',

                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.Approval_Reject = response;

                // $scope.GetAllData();
                location.reload();
                // $("#CRDDate").datepicker('option', 'minDate', dtt);
            });
            post.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //----------------------------APPROVE REJECT-----------//

        $scope.GetCRD_Date_HolidayList = function () {
            var PlantSel = $("#PlantSel").find("option:selected").text();

            var post = $http({
                method: "POST",
                url: "/api/Orders/GetCRD_Date_HolidayList" + "?Orderdate=" + PlantSel + "&plant=" + PlantSel,
                dataType: 'json',

                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.CRD_Date = response;
                $("#CRDDate").val($scope.CRD_Date[0].resultErrorMsg);
                localStorage["CRDDATE"] = "";
                localStorage["CRDDATE"] = $scope.CRD_Date[0].resultErrorMsg;

                // $("#CRDDate").datepicker('option', 'minDate', dtt);
            });
            post.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //-------------------------------CUSTOMERS----------------------------------------------------------//

        $scope.GetAllCustomers = function () {
            var customer = '{OrderID: "' + $scope.Prefix + '" }';
            var post = $http({
                method: "POST",
                url: "/api/Orders/GetCustomers" + "?DealerName=" + localStorage['UserId'] + "&SearchName=" + localStorage['ProfileName'],
                dataType: 'json',

                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.CustomerDetails = response;
                $scope.IsVisible = true;
            });
            post.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }

        $('#myTable').on('click', 'tr', function () {
            var text = $(this).find(".dcode").text()
            var url = $("#RedirectTo").val();
            location.href = url;
            //localStorage['DealerCode'] = "";
            // localStorage.clear();
            localStorage['DealerCode'] = text;
            //$scope.GetCustomersDetails();
        });
        //-----------------------------CUSTOMER-DEALERCODE-----------------------------------------------------------//

        //  post.error(function (response, status) {
        // //$window.alert(response.Message);
        // });
        //}
        //--------------------------------SHOWHIDE - Filter--------------------------------------------------------//

        //This will hide the DIV by default.
        $scope.IsHidden = true;
        $scope.OrderFilterBy = function () {
            //If DIV is hidden it will be visible and vice versa.
            $scope.IsHidden = $scope.IsHidden ? false : true;
        }
        //--------------------------------ONLOAD---------------------------------------------------------//

        $window.onload = function () {
            // //$scope.LoadVehicleDetails();
            //$scope.AdminProfileEnable();
        };
        //--------------------------------Load Category Items---------------------------------------------------------//

        $scope.SelectItems = [];

        var profilecode = localStorage['UserId'];
        if (profilecode == "Admin") {
            profilecode = profilecode;
        }
        else {
            profilecode = localStorage['DealerCode']
        }

        var items = $http(
            {
                method: 'POST',
                url: '/api/Orders/GetProductItems' + "?DealerCode=" + profilecode,  /*You URL to post*/
                dataType: 'json',
                headers: {
                    "Content-Type": "application/json"
                },
            });
        items.success(function (response, status) {
            $scope.SelectItems = response;
            for (var i = 1; i < $scope.SelectItems.length; i++) {
                subjectSel.options[subjectSel.options.length] = new Option($scope.SelectItems[i].productItems);
            }
            subjectSel.remove(1);
            $scope.IsVisible = true;
            //$scope.LoadVehicle();
            var OrderEdit = $scope.GetParameterValues('orderid');

            $("#AddEditOrderHistory").text(OrderEdit);
            $("#HdnAddEditOrderHistory").val(OrderEdit);
            localStorage["AddItems_OrderHistory"] = OrderEdit;
        });
        items.error(function (response, status) {
            //$window.alert(response.Message);
        });

        //-------------------------------------------Load Grades-------------------------------------------------------------------------//
        $scope.GetGrades = function (item) {
            $scope.SelectGrade = "";
            var postData = "?Item=" + item + "&DealerCode=" + profilecode;
            var Grade = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/GetProductGrade' + postData,  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            Grade.success(function (response, status) {
                $scope.SelectGrade = response;
                //empty Chapters- and Topics- dropdowns
                topicSel.length = 1;
                //display correct values
                //$('#topic').prop('selectedIndex', 0);
                for (var i = 0; i < $scope.SelectGrade.length; i++) {
                    topicSel.options[topicSel.options.length] = new Option($scope.SelectGrade[i].productItems);
                }
                //topicSel.remove(0);

                $scope.GetPrimaryUOM($("#subject").find("option:selected").text(), "");

                $scope.IsVisible = true;
            });
            Grade.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //-----------------------------------------LOAD DENSITY---------------------------------------------------------------------//
        $scope.GetDensity = function (item, item1) {
            $scope.SelectDensity = "";
            var postData = "?Item=" + item + "&Item1=" + item1;
            var Grade = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/GetProductDensity' + postData + "&DealerCode=" + profilecode,  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            Grade.success(function (response, status) {
                $scope.SelectDensity = response;
                //empty Chapters- and Topics- dropdowns
                DensitySel.length = 1;
                //display correct values
                //$('#topic').prop('selectedIndex', 0);
                for (var i = 0; i < $scope.SelectDensity.length; i++) {
                    DensitySel.options[DensitySel.options.length] = new Option($scope.SelectDensity[i].productItems);
                }
                //DensitySel.remove(0);
                $scope.IsVisible = true;
            });
            Grade.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //------------------------------------------DISPLAY PRIMARYOUM------------------//
        $scope.GetPrimaryUOM = function (item, item1) {
            $scope.SelectDensity = "";
            var postData = "?Item=" + item + "&Item1=1";
            var Grade = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/GetProductPrimaryUOM' + postData,  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            Grade.success(function (response, status) {
                $scope.SelectDensity = response;
                //empty Chapters- and Topics- dropdowns
                DensitySel.length = 1;
                //display correct values
                //$('#topic').prop('selectedIndex', 0);
                for (var i = 0; i < $scope.SelectDensity.length; i++) {
                    $("#lblBundle").text($scope.SelectDensity[i].productItems);
                    $("#QtyBundleName").text("IN " + $scope.SelectDensity[i].productItems);
                }
                if ($("#subject").find("option:selected").text() == "MF ROLLS" || $("#subject").find("option:selected").text() == "PUF ROLLS") {
                    $("#QtyBundleName").text("IN " + "Rolls");
                }
                $scope.IsVisible = true;
            });
            Grade.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //------------------------------------------LOAD LENGTH------------------------------------------------------------//
        $scope.GetLengthData = function (item, item1) {
            $scope.Selectlendth = "";
            var postData = "?Item=" + item + "&Item1=1";
            var Grade = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/GetProductLenth' + postData,  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            Grade.success(function (response, status) {
                $scope.Selectlendth = response;
                //empty Chapters- and Topics- dropdowns
                LengthSel.length = 1;
                //display correct values
                //$('#topic').prop('selectedIndex', 0);
                var subjectSel = $("#subject").find("option:selected").text();
                if (subjectSel == "CHIP FOAM SHEETS" || subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF SHEETS" || subjectSel == "PUF SHEETS") {
                    LengthSel.options[LengthSel.options.length] = new Option("Custom Length");
                }
                for (var i = 0; i < $scope.Selectlendth.length; i++) {
                    LengthSel.options[LengthSel.options.length] = new Option($scope.Selectlendth[i].productItems);
                }
                // LengthSel.remove(0);
                $scope.IsVisible = true;
            });
            Grade.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //-----------------------------------------LOAD WIDTH----------------------------------------------------------//
        $scope.GetWidthData = function (item, item1) {
            $scope.SelectWidth = "";
            var postData = "?Item=" + item + "&Item1=" + item1;
            var Grade = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/GetProductWidth' + postData,  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            Grade.success(function (response, status) {
                $scope.SelectWidth = response;
                //empty Chapters- and Topics- dropdowns
                widthSel.length = 1;
                //display correct values
                //$('#topic').prop('selectedIndex', 0);
                var subjectSel = $("#subject").find("option:selected").text();
                if (subjectSel == "CHIP FOAM SHEETS" || subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF SHEETS" || subjectSel == "PUF SHEETS") {
                    widthSel.options[widthSel.options.length] = new Option("Custom Width");
                }
                for (var i = 0; i < $scope.SelectWidth.length; i++) {
                    widthSel.options[widthSel.options.length] = new Option($scope.SelectWidth[i].productItems);
                }
                //widthSel.remove(0);
                $scope.IsVisible = true;
            });
            Grade.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //------------------------------LOAD THICKNES-----------------------------------------------------------------------------//
        $scope.GetThicknessData = function (item, item1, item2) {
            $scope.Selectthickness = "";
            var postData = "?Item=" + item + "&Item1=" + item1 + "&Item2=" + item2;
            var Grade = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/GetProductThickness' + postData,  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            Grade.success(function (response, status) {
                $scope.Selectthickness = response;
                //empty Chapters- and Topics- dropdowns
                thicknessSel.length = 1;
                //display correct values
                //$('#topic').prop('selectedIndex', 0);
                for (var i = 0; i < $scope.Selectthickness.length; i++) {
                    thicknessSel.options[thicknessSel.options.length] = new Option($scope.Selectthickness[i].productItems);
                }
                //thicknessSel.remove(1);
                $scope.IsVisible = true;
                var subjectSel = $("#subject").find("option:selected").text();

                if (subjectSel == "BLOCKS") {
                    thicknessSel.remove(0);
                }
            });
            Grade.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //-------------------------------------LOAD BUNDLES CALC-----------------------------------------------------------//
        $scope.GetBundleCalculatepieces = function (item, item1, item2, item3) {
            //---------------------------------------------------------------------------------//
            $scope.Selectthickness = "";
            var postData = "?Item=" + item + "&Item1=" + item1 + "&Item2=" + item2 + "&Item3=" + item3;
            var Grade = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/GetBundleCalculatepieces' + postData,  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            Grade.success(function (response, status) {
                $scope.Selectthickness = response;
                $("#pieces").text($scope.Selectthickness[0].productItems);
                $("#hdnprimary").text($scope.Selectthickness[0].primarys);
                $("#bundleheight").text($scope.Selectthickness[0].bundleheight);
                $scope.IsVisible = true;
            });
            Grade.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }

        $scope.selectedItems = function () {
            $scope.GetGrades($scope.selitem.productItems);
        }
        $scope.selectedGrade = function (item1, item2) {
            $scope.GetDensity(item1, item2);
        }
        $scope.selectedDensity = function (item1, item2) {
            $scope.GetLengthData(item1, item2);
            var subjectSel = $("#subject").find("option:selected").text();
            var topicSel = $("#topic").find("option:selected").text();
        }

        $("#subject").bind("click focus change", function () {
            var subjectSel = $("#subject").find("option:selected").text();
            if (subjectSel == "Select") {
                $("#Gradediv").hide();
            }
            else {
                $("#Gradediv").show();
            }
            $("#Densitydiv").hide();

            $("#Primuomdiv").hide();
            $("#Sizediv").hide();
            $("#Qtydiv").hide();

            $("#CalcualtePieces").val("");
            $("#Volume").text("");
            $("#piecescal").text("");

            $("#TCustomLength").text("");
            $("#TCustomwidth").text("");
            $("#tmaxatexid").text("");
            $("#tpuftexid").text("");
            $("#tmaxid").text("");
            $("#tmaxatexid").text("");
            $("#tpuftexid").text("");

            $("#IsFoamid").val("");
            $("#IsLatexsheetid").val("");
            $("#IsPufsheetid").val("");
            $("#thicknessSel").find("option").remove().end().append(
                '<option value = "Select">Select</option>');
        });
        $("#topic").bind("click focus change", function () {
            var subjectSel = $("#subject").find("option:selected").text();
            var topicSel = $("#topic").find("option:selected").text();
            var selectedValue = $(this).val();

            if (topicSel == "Select") {
                $("#Densitydiv").hide();
            }
            else {
                $scope.selectedGrade(subjectSel, topicSel);
                $scope.selectedDensity(subjectSel, topicSel);
                $("#Densitydiv").show();
            }
            $("#CalcualtePieces").val("");
            $("#Volume").text("");
            $("#piecescal").text("");

            $("#TCustomLength").text("");
            $("#TCustomwidth").text("");
            $("#tmaxatexid").text("");
            $("#tpuftexid").text("");
            $("#tmaxid").text("");
            $("#tmaxatexid").text("");
            $("#tpuftexid").text("");

            $("#IsFoamid").val("");
            $("#IsLatexsheetid").val("");
            $("#IsPufsheetid").val("");
            $("#Primuomdiv").hide();
            $("#Sizediv").hide();
            $("#IsBlockCuson").hide();
            $("#Qtydiv").hide();
            $("#LDPEdiv").hide();
            $("#Vehiclediv").hide();
            $("#CustomWidthId").hide();
            $("#CustomLengthId").hide();
            $("#IsMfrollslength").hide();
        });
        $("#Density").bind("click focus change", function () {
            var subjectSel = $("#subject").find("option:selected").text();

            var topicSel = $("#topic").find("option:selected").text();

            var selectedValue = $(this).val();

            $('input[type=text]').each(function () {
                $(this).val('');
            });
            $('input[type=number]').each(function () {
                $(this).val('');
            });
            $("#CalcualtePieces").val("");
            $("#Volume").text("");
            $("#piecescal").text("");

            $("#TCustomLength").text("");
            $("#TCustomwidth").text("");
            $("#tmaxatexid").text("");
            $("#tpuftexid").text("");
            $("#tmaxid").text("");
            $("#tmaxatexid").text("");
            $("#tpuftexid").text("");
            $("#CustomLengthId").val("");
            $("#CustomWidthId").val("");
            $("#IsFoamid").val("");
            $("#IsLatexsheetid").val("");
            $("#IsPufsheetid").val("");
            if (subjectSel == "MF ROLLS" || subjectSel == "PUF ROLLS") {
                $scope.GetWidthData(subjectSel, 0);
                var widthSel = $("#widthSel").prop("selectedIndex", 0).val();
                $scope.GetThicknessData(subjectSel, 0, widthSel);
            }
            else {
                var LengthSel = $("#LengthSel").prop("selectedIndex", 0).val();
                $scope.GetWidthData(subjectSel, LengthSel);
                var widthSel = $("#widthSel").prop("selectedIndex", 0).val();
                $scope.GetThicknessData(subjectSel, LengthSel, widthSel);
            }
            var Density = $("#Density").find("option:selected").text();
            if (Density == "Select") {
                $("#Primuomdiv").hide();
                $("#Sizediv").hide();
                $("#IsBlockCuson").hide();
                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
                $("#Vehiclediv").hide();
                $("#CustomWidthId").hide();
                $("#CustomLengthId").hide();
                $("#IsLatexsheet").hide();
                $("#IsMfrollslength").show();
                //$("#IsPufsheetid").hide();
                $("#IsPufxsheet").hide();
                $("#IsFoamSheet").hide();
            }
            else if (Density != "Select" && (subjectSel == "AYUSH CUSHIONS" || subjectSel == "BLOCKS" || subjectSel == "PUF CUSHIONS TOUCH" || subjectSel == "PUF SHEETS TOUCH" || subjectSel == "PUF DUSTERS")) {
                $("#Primuomdiv").show();
                $("#Sizediv").show();
                $("#IsBlockCuson").show();
                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
                $("#CustomWidthId").hide();
                $("#CustomLengthId").hide();
                $("#IsLatexsheet").hide();
                $("#IsMfrollslength").show();
                // $("#IsPufsheetid").hide();
                $("#IsPufxsheet").hide();
                $("#IsFoamSheet").hide();
            }
            else if (Density != "Select" && (subjectSel == "MF ROLLS" || subjectSel == "PUF ROLLS")) {
                $("#Primuomdiv").show();
                $("#Sizediv").show();
                $("#IsBlockCuson").show();
                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
                $("#CustomWidthId").hide();
                $("#CustomLengthId").hide();
                $("#IsLatexsheet").hide();
                $("#IsMfrollslength").hide();

                $("#IsFoamSheet").hide();
            }
            else if (Density != "Select" && (subjectSel == "CHIP FOAM SHEETS")) {
                $("#Primuomdiv").show();
                $("#Sizediv").show();
                $("#IsBlockCuson").hide();
                $("#IsFoamSheet").show();
                $("#IsLatexsheet").hide();
                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
                $("#CustomWidthId").hide();
                $("#CustomLengthId").hide();
                $("#IsMfrollslength").show();
            }
            else if (Density != "Select" && (subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF SHEETS" || subjectSel == "PUF CUSHIONS" || subjectSel == "MF CUSHIONS")) {
                $("#Primuomdiv").show();
                $("#Sizediv").show();
                $("#IsBlockCuson").hide();
                $("#IsFoamSheet").hide();
                $("#IsLatexsheet").show();

                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
                $("#CustomWidthId").hide();
                $("#CustomLengthId").hide();
                $("#IsMfrollslength").show();
            }
            else if (Density != "Select" && subjectSel == "PUF SHEETS") {
                $("#Primuomdiv").show();
                $("#Sizediv").show();
                $("#IsBlockCuson").hide();
                $("#IsFoamSheet").hide();

                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
                $("#CustomWidthId").hide();
                $("#CustomLengthId").hide();
                $("#IsMfrollslength").show();
                // $("#IsPufsheetid").show();
                $("#IsPufxsheet").show();
                $("#IsLatexsheet").hide();
            }
        });

        $("#IsFoamid").bind('keydown keyup change', function () {
            var char = $(this).val();
            var charLength = $(this).val();
            if (charLength < 15) {
                $('#tmaxid').text('Thickness is short, minimum ' + "15" + ' required.');
            } else if (charLength > 150) {
                $('#tmaxid').text('Thickness is not valid, maximum ' + "150" + ' allowed.');
                $(this).val(char.substring(0, "150"));
            } else {
                $('#tmaxid').text('');
                $("#Qtydiv").show();
                $("#LDPEdiv").show();
            }
        });
        $("#IsLatexsheetid").bind('keydown keyup change', function () {
            var char = $(this).val();
            var charLength = $(this).val();
            if (charLength < 25) {
                $('#tmaxatexid').text('Thickness is short, minimum ' + "25" + ' required.');
            } else if (charLength > 150) {
                $('#tmaxatexid').text('Thickness is not valid, maximum ' + "150" + ' allowed.');
                $(this).val(char.substring(0, "150"));
            } else {
                $('#tmaxatexid').text('');
                $("#Qtydiv").show();
                $("#LDPEdiv").show();
            }
        });

        $("#IsPufsheetid").bind('keydown keyup change', function () {
            var char = $(this).val();
            var charLength = $(this).val();
            if (charLength < 5) {
                $('#tpuftexid').text('Thickness is short, minimum ' + "5" + ' required.');
            } else if (charLength > 250) {
                $('#tpuftexid').text('Thickness is not valid, maximum ' + "250" + ' allowed.');
                $(this).val(char.substring(0, "250"));
            } else {
                $('#tpuftexid').text('');
                $("#Qtydiv").show();
                $("#LDPEdiv").show();
            }
        });

        $("#CustomWidthId").bind('keydown keyup change', function () {
            var subjectSel = $("#subject").find("option:selected").text();
            var min = 0;
            var max = 0;
            if (subjectSel == "CHIP FOAM SHEETS") {
                min = 30;
                max = 48;
            }
            if (subjectSel == "MF SHEETS") {
                min = 30;
                max = 72;
            }
            if (subjectSel == "LATEX LIKE FOAM SHEETS") {
                min = 30;
                max = 72;
            }
            if (subjectSel == "PUF SHEETS") {
                min = 24;
                max = 49;
            }

            var char = $(this).val();
            var charLength = $(this).val();
            if (charLength < min) {
                $('#TCustomwidth').text('Width is short, minimum ' + min + ' required.');
                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
            } else if (charLength > max) {
                $('#TCustomwidth').text('Width is not valid, maximum ' + max + ' allowed.');
                $(this).val(char.substring(0, max));
                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
            } else {
                $('#TCustomwidth').text('');
                $("#Qtydiv").show();
                $("#LDPEdiv").show();
            }
        });
        $("#CustomLengthId").bind('keydown keyup change', function () {
            var subjectSel = $("#subject").find("option:selected").text();
            var min = 0;
            var max = 0;
            if (subjectSel == "CHIP FOAM SHEETS" || subjectSel == "LATEX LIKE FOAM SHEETS") {
                min = 60;
                max = 78;
            }
            if (subjectSel == "PUF SHEETS") {
                min = 60;
                max = 84;
            }
            if (subjectSel == "MF SHEETS") {
                min = 72;
                max = 78;
            }

            var char = $(this).val();
            var charLength = $(this).val();
            if (charLength < min) {
                $('#TCustomLength').text('Length is short, minimum ' + min + ' required.');
                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
            } else if (charLength > max) {
                $('#TCustomLength').text('Length is not valid, maximum ' + max + ' allowed.');
                $(this).val(char.substring(0, max));
                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
            } else {
                $('#TCustomLength').text('');
                $("#Qtydiv").show();
                $("#LDPEdiv").show();
            }
        });
        $("#thicknessSel").bind("click focus change", function () {
            var LengthSel = $("#LengthSel").find("option:selected").text();
            var thicknessSel = $("#thicknessSel").find("option:selected").text();
            var subjectSel = $("#subject").find("option:selected").text();
            var widthSel = $("#widthSel").find("option:selected").text();

            if (thicknessSel == "Select") {
                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
                $("#Vehiclediv").hide();
            }
            else if (thicknessSel != "Select" && subjectSel == "AYUSH CUSHIONS" && widthSel != "Select" && LengthSel != "Select") {
                $("#Qtydiv").show();
                $("#LDPEdiv").show();
            }
            else if (thicknessSel != "Select" && subjectSel == "PUF SHEETS TOUCH" && widthSel != "Select" && LengthSel != "Select") {
                $("#Qtydiv").show();
                $("#LDPEdiv").show();
            }

            else if (thicknessSel != "Select" && widthSel != "Select" && LengthSel != "Select" && subjectSel == "BLOCKS") {
                $("#Qtydiv").show();
                $("#LDPEdiv").hide();
            }

            else if (thicknessSel != "Select" && widthSel != "Select" && subjectSel == "MF ROLLS") {
                $("#Qtydiv").show();
                $("#LDPEdiv").hide();
            }
            else if (thicknessSel != "Select" && widthSel != "Select" && subjectSel == "PUF ROLLS") {
                $("#Qtydiv").show();
                $("#LDPEdiv").hide();
            }
            else {
                $("#Qtydiv").show();
                $("#LDPEdiv").show();
            }
        });
        $("#widthSel").bind("click focus change", function () {
            var LengthSel = $("#LengthSel").find("option:selected").text();

            var widthSel = $("#widthSel").find("option:selected").text();
            var subjectSel = $("#subject").find("option:selected").text();
            var thicknessSel = $("#thicknessSel").find("option:selected").text();
            var CustomLengthId = $("#CustomLengthId").val();
            var CustomWidthId = $("#CustomWidthId").val();

            $scope.GetThicknessData(subjectSel, LengthSel, widthSel);
            if (widthSel == "Select") {
                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
            }
            else if (widthSel != "Select" && subjectSel == "AYUSH CUSHIONS" && thicknessSel != "Select" && LengthSel != "Select") {
                $("#Qtydiv").show();
                $("#LDPEdiv").show();
            }
            else if (thicknessSel != "Select" || subjectSel == "BLOCKS" && widthSel != "Select" && LengthSel != "Select"
                || subjectSel == "MF ROLLS" || subjectSel == "PUF DUSTERS" || subjectSel == "PUF ROLLS") {
                $("#Qtydiv").show();
                $("#LDPEdiv").hide();
            }

            else if (subjectSel == "CHIP FOAM SHEETS" || subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF SHEETS" || subjectSel == "PUF SHEETS") {
                if (widthSel == "Custom Width") {
                    $("#Qtydiv").show();
                    $("#LDPEdiv").hide();
                    $("#CustomWidthId").show();
                    $("#CustomWidthId").val("");
                    $("#TCustomwidth").text("");
                }

                else if (widthSel != "Custom Width" || widthSel != "Select") {
                    $("#Qtydiv").show();
                    $("#LDPEdiv").hide();
                    $("#CustomWidthId").hide();
                    $("#CustomWidthId").val("");
                    $("#TCustomwidth").text("");
                }

                if (CustomLengthId.length > 0 || CustomWidthId.length > 0) {
                    $("#Qtydiv").show();
                    $("#LDPEdiv").show();
                }
                else {
                    $("#Qtydiv").hide();
                    $("#LDPEdiv").hide();
                }
            }
        });
        $("#LengthSel").bind("click focus change", function () {
            // var widthSel = $("#widthSel").find("option:selected").text();

            var widthSel = $("#widthSel").find("option:selected").text();
            var LengthSel = $("#LengthSel").find("option:selected").text();
            var subjectSel = $("#subject").find("option:selected").text();
            var thicknessSel = $("#thicknessSel").find("option:selected").text();
            var CustomLengthId = $("#CustomLengthId").val();
            var CustomWidthId = $("#CustomWidthId").val();

            $scope.GetWidthData(subjectSel, LengthSel);
            $scope.GetThicknessData(subjectSel, LengthSel, widthSel);
            if (LengthSel == "Select") {
                $("#Qtydiv").hide();
                $("#LDPEdiv").hide();
                $("#CustomWidthId").hide();
                $("#CustomLengthId").hide();
            }
            else if (LengthSel != "Select" && subjectSel == "AYUSH CUSHIONS" && thicknessSel != "Select" && widthSel != "Select") {
                $("#Qtydiv").show();
                $("#LDPEdiv").show();
                $("#CustomWidthId").hide();
                $("#CustomLengthId").hide();
                $("#CustomLengthId").val("");
                $("#TCustomLength").text("");
            }
            else if (LengthSel != "Select" && subjectSel == "BLOCKS" && thicknessSel != "Select" && widthSel != "Select") {
                $("#Qtydiv").show();
                $("#LDPEdiv").hide();
                $("#CustomWidthId").hide();
                $("#CustomLengthId").hide();
                $("#CustomLengthId").val("");
                $("#TCustomLength").text("");
            }
            else if (LengthSel != "Select" && subjectSel == "MF ROLLS" && thicknessSel != "Select" && widthSel != "Select") {
                $("#Qtydiv").show();
                $("#LDPEdiv").hide();
                $("#CustomWidthId").hide();
                $("#CustomLengthId").hide();
            }
            else if (subjectSel == "CHIP FOAM SHEETS" || subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF SHEETS" || subjectSel == "PUF SHEETS") {
                if (LengthSel == "Custom Length") {
                    $("#Qtydiv").show();
                    $("#LDPEdiv").hide();
                    $("#CustomLengthId").show();
                    $("#TCustomLength").val("");
                }

                else if (LengthSel != "Custom Length" || LengthSel != "Select") {
                    $("#Qtydiv").show();
                    $("#LDPEdiv").hide();
                    $("#CustomLengthId").hide();
                    $("#TCustomLength").text("");
                }

                if (CustomLengthId.length > 0 || CustomWidthId.length > 0) {
                    $("#Qtydiv").show();
                    $("#LDPEdiv").show();
                }
                else {
                    $("#Qtydiv").hide();
                    $("#LDPEdiv").hide();
                }
            }
        });

        //----------------------------------------------------------ITEM CALCULATION--------------------------------------------------------------//
        $scope.BundleCalc = function (pieces, ChipThickness, widthSel, LengthSel, qty, Density) {
            if (qty > 0) {
                var btl = $("#bundleheight").text();
                var bundleheight = btl;

                var piec = (bundleheight / ChipThickness) * qty;

                $("#piecescal").text("Pieces : " + piec.toFixed(2));
                var KGs = ((widthSel * 0.0254) * (LengthSel * 0.0254) * (bundleheight / 1000)) * qty;
                var amt = KGs;
                var amt1 = amt.toFixed(2);
                $("#Volume").text("Volume : " + amt1);
                $("#volumecal").text(amt1);

                var Weight = ((widthSel * 0.0254) * (LengthSel * 0.0254) * (ChipThickness / 1000) * Density) * qty;
                $("#Weightid").text(Weight);

                //--------------------------------------EDIT CALC------------------------------------------------------//
                $("#pieces").text(piec.toFixed(2));
                //--------------------------------------EDIT CALC------------------------------------------------------//
            }
        }
        $scope.KGCalc = function (pieces, ChipThickness, widthSel, LengthSel, qty, Density) {
            if (qty > 0) {
                var KGs = (((widthSel * 0.0254) * (ChipThickness / 1000) * (Density)) * LengthSel) * qty
                var amt = KGs;
                var amt1 = amt.toFixed(2);
                $("#Volume").text("KGs : " + amt1);
                $("#volumecal").text(amt1);
                //--------------------------------------EDIT CALC------------------------------------------------------//
                $("#pieces").text("");
                //--------------------------------------EDIT CALC------------------------------------------------------//
            }
        }
        $scope.BlocksCalc = function (pieces, ChipThickness, widthSel, LengthSel, qty, Density) {
            if (qty > 0) {
                var piece = pieces * qty;
                $("#pieces").text(piece.toFixed(2));

                var KGs = ((widthSel * 0.0254) * (LengthSel * 0.0254) * (ChipThickness / 1000) * Density) * qty;
                var amt = parseFloat(KGs);
                var amt1 = amt.toFixed(2);
                $("#Volume").text("KGs : " + amt1);
                $("#volumecal").text(amt1);
            }
        }

        $scope.PufcushionmCalc = function (pieces, ChipThickness, widthSel, LengthSel, qty, Density) {
            if (qty > 0) {
                let bundleheight1 = pieces * ChipThickness;

                var btl = $("#bundleheight").text();
                let bundleheight = btl;
                let piec = (bundleheight1 / ChipThickness) * qty;
                $("#piecescal").text("Pieces : " + piec.toFixed(2));
                let KGs = ((widthSel * 0.0254) * (LengthSel * 0.0254) * (bundleheight / 1000)) * qty;
                let amt = KGs;
                let amt1 = amt.toFixed(2);
                $("#Volume").text("Volume : " + amt1);
                $("#volumecal").text(amt1);

                let Weight = ((widthSel * 0.0254) * (LengthSel * 0.0254) * (ChipThickness / 1000) * Density) * qty;
                $("#Weightid").text(Weight);
                //--------------------------------------EDIT CALC------------------------------------------------------//
                $("#pieces").text(piec.toFixed(2));
                //--------------------------------------EDIT CALC------------------------------------------------------//
            }
        }

        //----------------------------------------------------------------------------------------------------------------------------------//
        $scope.CalculatePiecevolumes = function (qty, subjectSel, LengthSel, widthSel, Density, thicknessSel, ChipThickness, CustomLengthId, CustomWidthId, IsLatexsheetid, IsPufsheetid) {
            //var subjectSel = $("#subject").find("option:selected").text();
            //var qty = qty;
            //var LengthSel = $("#LengthSel").find("option:selected").text();
            //var widthSel = $("#widthSel").find("option:selected").text();
            //var Density = $("#Density").find("option:selected").text();
            //var thicknessSel = $("#thicknessSel").find("option:selected").text();
            //var ChipThickness = $("#IsFoamid").val();
            //var CustomLengthId = $("#CustomLengthId").val();
            //var CustomWidthId = $("#CustomWidthId").val();
            //var IsLatexsheetid = $("#IsLatexsheetid").val();
            //var IsPufsheetid = $("#IsPufsheetid").val();
            var subjectSel = subjectSel;
            var qty = qty;
            var LengthSel = LengthSel;
            var widthSel = widthSel;
            var Density = Density;
            var thicknessSel = thicknessSel;
            var ChipThickness = ChipThickness;
            var CustomLengthId = CustomLengthId;
            var CustomWidthId = CustomWidthId;
            var IsLatexsheetid = IsLatexsheetid;
            var IsPufsheetid = IsPufsheetid;
            //---------------------------------------------------ITEM BASED BUNDLE CALCULATION----------------------------------------------------//
            if (subjectSel == "CHIP FOAM SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, widthSel, ChipThickness);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, CustomWidthId, ChipThickness);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, CustomWidthId, ChipThickness);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, ChipThickness);
                }
            }
            else if (subjectSel == "PUF CUSHIONS") {
                if (LengthSel != "Select" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, IsLatexsheetid);
                }
            }
            else if (subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF CUSHIONS" || subjectSel == "MF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, widthSel, IsLatexsheetid);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, CustomWidthId, IsLatexsheetid);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, CustomWidthId, IsLatexsheetid);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, IsLatexsheetid);
                }
            }
            else if (subjectSel == "PUF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, widthSel, IsPufsheetid);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, CustomWidthId, IsPufsheetid);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, CustomWidthId, IsPufsheetid);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, IsPufsheetid);
                }
            }
            // else if (subjectSel == "MF ROLLS" || subjectSel == "PUF ROLLS") {
            // $scope.GetBundleCalculatepieces(subjectSel, 0, widthSel, thicknessSel);
            //}
            else {
                $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, thicknessSel);
            }
            var pieces = $("#pieces").text();
            var bundleheightKg = $("#bundleheight").text();

            //---------------------------------------------------ITEM BASED BUNDLE CALCULATION----------------------------------------------------//
            if (LengthSel == "Custom Length" || widthSel == "Custom Width") {
                localStorage['STANDARD_ORDER'] = "";
                localStorage['STANDARD_ORDER'] = "NS";
            }
            else {
                localStorage['STANDARD_ORDER'] = "";
                localStorage['STANDARD_ORDER'] = "SO";
            }

            var density_puf = Density;
            Density = Density.substring(1, 3);
            //---------------------------------------------------ITEM BASED QTY*PIECES CALCULATION----------------------------------------------------//
            //if ($("#hdnprimary").text() == "BUNDLE") {
            //    $scope.BundleCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
            //}
            //else if ($("#hdnprimary").text() == "KG") {
            //    $scope.KGCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);

            //}
            //else if ($("#hdnprimary").text() == "BLOCKS") {
            //    $scope.BlocksCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);

            //}

            if (subjectSel == "AYUSH CUSHIONS" || subjectSel == "PUF DUSTERS") {
                $scope.BundleCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
                //$scope.AyushCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
            }
            else if (subjectSel == "PUF CUSHIONS TOUCH" || subjectSel == "PUF SHEETS TOUCH") {
                $scope.Densitydata = "";
                var post = $http({
                    method: "POST",

                    url: "/api/Orders/GetPufDensity" + "?Item=" + density_puf,
                    dataType: 'json',

                    headers: { "Content-Type": "application/json" }
                });
                post.success(function (response, status) {
                    $scope.Densitydata = response;
                    $scope.BundleCalc(pieces, thicknessSel, widthSel, LengthSel, qty, $scope.Densitydata[0].density);
                });
            }

            else if (subjectSel == "PUF CUSHIONS") {
                $scope.PufcushionmCalc(pieces, IsLatexsheetid, widthSel, LengthSel, qty, Density);
                //$scope.PufcushionmCalc(pieces, IsLatexsheetid, widthSel, LengthSel, qty, Density);
            }
            else if (subjectSel == "BLOCKS") {
                $scope.BlocksCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
            }

            else if (subjectSel == "CHIP FOAM SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, ChipThickness, widthSel, CustomLengthId, qty, Density);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.BundleCalc(pieces, ChipThickness, CustomWidthId, LengthSel, qty, Density);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.BundleCalc(pieces, ChipThickness, CustomWidthId, CustomLengthId, qty, Density);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, ChipThickness, widthSel, LengthSel, qty, Density);
                }
            }
            else if (subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF CUSHIONS" || subjectSel == "MF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, widthSel, CustomLengthId, qty, Density);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, CustomWidthId, LengthSel, qty, Density);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, CustomWidthId, CustomLengthId, qty, Density);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, widthSel, LengthSel, qty, Density);
                }
            }
            else if (subjectSel == "PUF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsPufsheetid, widthSel, CustomLengthId, qty, Density);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.BundleCalc(pieces, IsPufsheetid, CustomWidthId, LengthSel, qty, Density);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.BundleCalc(pieces, IsPufsheetid, CustomWidthId, CustomLengthId, qty, Density);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsPufsheetid, widthSel, LengthSel, qty, Density);
                }
            }
            else if (subjectSel == "MF ROLLS" || subjectSel == "PUF ROLLS") {
                $scope.KGCalc(pieces, thicknessSel, widthSel, bundleheightKg, qty, Density);
            }
            //---------------------------------------------------ITEM BASED QTY*PIECES CALCULATION----------------------------------------------------//
        }

        $scope.CalculatePiecevolume = function (qty) {
            var subjectSel = $("#subject").find("option:selected").text();
            var qty = qty;
            var LengthSel = $("#LengthSel").find("option:selected").text();
            var widthSel = $("#widthSel").find("option:selected").text();
            var Density = $("#Density").find("option:selected").text();
            var thicknessSel = $("#thicknessSel").find("option:selected").text();
            var ChipThickness = $("#IsFoamid").val();
            var CustomLengthId = $("#CustomLengthId").val();
            var CustomWidthId = $("#CustomWidthId").val();
            var IsLatexsheetid = $("#IsLatexsheetid").val();
            var IsPufsheetid = $("#IsPufsheetid").val();

            //---------------------------------------------------ITEM BASED BUNDLE CALCULATION----------------------------------------------------//
            if (subjectSel == "CHIP FOAM SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, widthSel, ChipThickness);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, CustomWidthId, ChipThickness);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, CustomWidthId, ChipThickness);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, ChipThickness);
                }
            }
            else if (subjectSel == "PUF CUSHIONS") {
                if (LengthSel != "Select" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, IsLatexsheetid);
                }
            }
            else if (subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF CUSHIONS" || subjectSel == "MF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, widthSel, IsLatexsheetid);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, CustomWidthId, IsLatexsheetid);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, CustomWidthId, IsLatexsheetid);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, IsLatexsheetid);
                }
            }
            else if (subjectSel == "PUF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, widthSel, IsPufsheetid);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, CustomWidthId, IsPufsheetid);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, CustomWidthId, IsPufsheetid);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, IsPufsheetid);
                }
            }
            // else if (subjectSel == "MF ROLLS" || subjectSel == "PUF ROLLS") {
            // $scope.GetBundleCalculatepieces(subjectSel, 0, widthSel, thicknessSel);
            //}
            else {
                $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, thicknessSel);
            }
            var pieces = $("#pieces").text();
            var bundleheightKg = $("#bundleheight").text();

            //---------------------------------------------------ITEM BASED BUNDLE CALCULATION----------------------------------------------------//
            if (LengthSel == "Custom Length" || widthSel == "Custom Width") {
                localStorage['STANDARD_ORDER'] = "";
                localStorage['STANDARD_ORDER'] = "NS";
            }
            else {
                localStorage['STANDARD_ORDER'] = "";
                localStorage['STANDARD_ORDER'] = "SO";
            }

            var density_puf = Density;
            Density = Density.substring(1, 3);
            //---------------------------------------------------ITEM BASED QTY*PIECES CALCULATION----------------------------------------------------//
            //if ($("#hdnprimary").text() == "BUNDLE") {
            //    $scope.BundleCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
            //}
            //else if ($("#hdnprimary").text() == "KG") {
            //    $scope.KGCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);

            //}
            //else if ($("#hdnprimary").text() == "BLOCKS") {
            //    $scope.BlocksCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);

            //}

            if (subjectSel == "AYUSH CUSHIONS" || subjectSel == "PUF DUSTERS") {
                $scope.BundleCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
                //$scope.AyushCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
            }
            else if (subjectSel == "PUF CUSHIONS TOUCH" || subjectSel == "PUF SHEETS TOUCH") {
                $scope.Densitydata = "";
                var post = $http({
                    method: "POST",

                    url: "/api/Orders/GetPufDensity" + "?Item=" + density_puf,
                    dataType: 'json',

                    headers: { "Content-Type": "application/json" }
                });
                post.success(function (response, status) {
                    $scope.Densitydata = response;
                    $scope.BundleCalc(pieces, thicknessSel, widthSel, LengthSel, qty, $scope.Densitydata[0].density);
                });
            }

            else if (subjectSel == "PUF CUSHIONS") {
                $scope.PufcushionmCalc(pieces, IsLatexsheetid, widthSel, LengthSel, qty, Density);
                //$scope.PufcushionmCalc(pieces, IsLatexsheetid, widthSel, LengthSel, qty, Density);
            }
            else if (subjectSel == "BLOCKS") {
                $scope.BlocksCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
            }

            else if (subjectSel == "CHIP FOAM SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, ChipThickness, widthSel, CustomLengthId, qty, Density);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.BundleCalc(pieces, ChipThickness, CustomWidthId, LengthSel, qty, Density);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.BundleCalc(pieces, ChipThickness, CustomWidthId, CustomLengthId, qty, Density);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, ChipThickness, widthSel, LengthSel, qty, Density);
                }
            }
            else if (subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF CUSHIONS" || subjectSel == "MF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, widthSel, CustomLengthId, qty, Density);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, CustomWidthId, LengthSel, qty, Density);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, CustomWidthId, CustomLengthId, qty, Density);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, widthSel, LengthSel, qty, Density);
                }
            }
            else if (subjectSel == "PUF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsPufsheetid, widthSel, CustomLengthId, qty, Density);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.BundleCalc(pieces, IsPufsheetid, CustomWidthId, LengthSel, qty, Density);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.BundleCalc(pieces, IsPufsheetid, CustomWidthId, CustomLengthId, qty, Density);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsPufsheetid, widthSel, LengthSel, qty, Density);
                }
            }
            else if (subjectSel == "MF ROLLS" || subjectSel == "PUF ROLLS") {
                $scope.KGCalc(pieces, thicknessSel, widthSel, bundleheightKg, qty, Density);
            }
            //---------------------------------------------------ITEM BASED QTY*PIECES CALCULATION----------------------------------------------------//
        }
        $scope.CalculatePiecevolume = function (qty) {
            var subjectSel = $("#subject").find("option:selected").text();
            var qty = qty;
            var LengthSel = $("#LengthSel").find("option:selected").text();
            var widthSel = $("#widthSel").find("option:selected").text();
            var Density = $("#Density").find("option:selected").text();
            var thicknessSel = $("#thicknessSel").find("option:selected").text();
            var ChipThickness = $("#IsFoamid").val();
            var CustomLengthId = $("#CustomLengthId").val();
            var CustomWidthId = $("#CustomWidthId").val();
            var IsLatexsheetid = $("#IsLatexsheetid").val();
            var IsPufsheetid = $("#IsPufsheetid").val();

            //---------------------------------------------------ITEM BASED BUNDLE CALCULATION----------------------------------------------------//
            if (subjectSel == "CHIP FOAM SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, widthSel, ChipThickness);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, CustomWidthId, ChipThickness);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, CustomWidthId, ChipThickness);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, ChipThickness);
                }
            }
            else if (subjectSel == "PUF CUSHIONS") {
                if (LengthSel != "Select" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, IsLatexsheetid);
                }
            }
            else if (subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF CUSHIONS" || subjectSel == "MF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, widthSel, IsLatexsheetid);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, CustomWidthId, IsLatexsheetid);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, CustomWidthId, IsLatexsheetid);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, IsLatexsheetid);
                }
            }
            else if (subjectSel == "PUF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, widthSel, IsPufsheetid);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, CustomWidthId, IsPufsheetid);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.GetBundleCalculatepieces(subjectSel, CustomLengthId, CustomWidthId, IsPufsheetid);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, IsPufsheetid);
                }
            }
            // else if (subjectSel == "MF ROLLS" || subjectSel == "PUF ROLLS") {
            // $scope.GetBundleCalculatepieces(subjectSel, 0, widthSel, thicknessSel);
            //}
            else {
                $scope.GetBundleCalculatepieces(subjectSel, LengthSel, widthSel, thicknessSel);
            }
            var pieces = $("#pieces").text();
            var bundleheightKg = $("#bundleheight").text();

            //---------------------------------------------------ITEM BASED BUNDLE CALCULATION----------------------------------------------------//
            if (LengthSel == "Custom Length" || widthSel == "Custom Width") {
                localStorage['STANDARD_ORDER'] = "";
                localStorage['STANDARD_ORDER'] = "NS";
            }
            else {
                localStorage['STANDARD_ORDER'] = "";
                localStorage['STANDARD_ORDER'] = "SO";
            }

            var density_puf = Density;
            Density = Density.substring(1, 3);
            //---------------------------------------------------ITEM BASED QTY*PIECES CALCULATION----------------------------------------------------//
            //if ($("#hdnprimary").text() == "BUNDLE") {
            //    $scope.BundleCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
            //}
            //else if ($("#hdnprimary").text() == "KG") {
            //    $scope.KGCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);

            //}
            //else if ($("#hdnprimary").text() == "BLOCKS") {
            //    $scope.BlocksCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);

            //}

            if (subjectSel == "AYUSH CUSHIONS" || subjectSel == "PUF DUSTERS") {
                $scope.BundleCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
                //$scope.AyushCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
            }
            else if (subjectSel == "PUF CUSHIONS TOUCH" || subjectSel == "PUF SHEETS TOUCH") {
                $scope.Densitydata = "";
                var post = $http({
                    method: "POST",

                    url: "/api/Orders/GetPufDensity" + "?Item=" + density_puf,
                    dataType: 'json',

                    headers: { "Content-Type": "application/json" }
                });
                post.success(function (response, status) {
                    $scope.Densitydata = response;
                    $scope.BundleCalc(pieces, thicknessSel, widthSel, LengthSel, qty, $scope.Densitydata[0].density);
                });
            }

            else if (subjectSel == "PUF CUSHIONS") {
                $scope.PufcushionmCalc(pieces, IsLatexsheetid, widthSel, LengthSel, qty, Density);
                //$scope.PufcushionmCalc(pieces, IsLatexsheetid, widthSel, LengthSel, qty, Density);
            }
            else if (subjectSel == "BLOCKS") {
                $scope.BlocksCalc(pieces, thicknessSel, widthSel, LengthSel, qty, Density);
            }

            else if (subjectSel == "CHIP FOAM SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, ChipThickness, widthSel, CustomLengthId, qty, Density);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.BundleCalc(pieces, ChipThickness, CustomWidthId, LengthSel, qty, Density);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.BundleCalc(pieces, ChipThickness, CustomWidthId, CustomLengthId, qty, Density);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, ChipThickness, widthSel, LengthSel, qty, Density);
                }
            }
            else if (subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF CUSHIONS" || subjectSel == "MF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, widthSel, CustomLengthId, qty, Density);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, CustomWidthId, LengthSel, qty, Density);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, CustomWidthId, CustomLengthId, qty, Density);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsLatexsheetid, widthSel, LengthSel, qty, Density);
                }
            }
            else if (subjectSel == "PUF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsPufsheetid, widthSel, CustomLengthId, qty, Density);
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    $scope.BundleCalc(pieces, IsPufsheetid, CustomWidthId, LengthSel, qty, Density);
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    $scope.BundleCalc(pieces, IsPufsheetid, CustomWidthId, CustomLengthId, qty, Density);
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    $scope.BundleCalc(pieces, IsPufsheetid, widthSel, LengthSel, qty, Density);
                }
            }
            else if (subjectSel == "MF ROLLS" || subjectSel == "PUF ROLLS") {
                $scope.KGCalc(pieces, thicknessSel, widthSel, bundleheightKg, qty, Density);
            }
            //---------------------------------------------------ITEM BASED QTY*PIECES CALCULATION----------------------------------------------------//
        }
        $("#CalcualtePieces").bind("keyup keydown", function () {
            var subjectSel = $("#subject").find("option:selected").text();
            var qty = $("#CalcualtePieces").val();
            var LengthSel = $("#LengthSel").find("option:selected").text();
            var widthSel = $("#widthSel").find("option:selected").text();
            var Density = $("#Density").find("option:selected").text();
            var thicknessSel = $("#thicknessSel").find("option:selected").text();
            var ChipThickness = $("#IsFoamid").val();
            var CustomLengthId = $("#CustomLengthId").val();
            var CustomWidthId = $("#CustomWidthId").val();
            var IsLatexsheetid = $("#IsLatexsheetid").val();
            var IsPufsheetid = $("#IsPufsheetid").val();
            if (parseInt(qty) > 0) {
                $("#btnOrderSave").prop('disabled', false);
                $scope.CalculatePiecevolume(parseInt(qty));
                //$scope.CalculatePiecevolume(parseInt(qty), subjectSel, LengthSel, widthSel, Density, thicknessSel, ChipThickness, CustomLengthId, CustomWidthId, IsLatexsheetid, IsPufsheetid);
            }
            else {
                $('#btnOrderSave').prop('disabled', true);
            }
        });
        $(".totalqty").bind("change keyup keydown", function () {
            $scope.CalculatePiecevolume($("#totalqty").val());
        });
        //--------------------------------------------//
        $("#btnOrderSave").bind("click", function () {
            var qty = $("#CalcualtePieces").val();
            if (parseInt(qty) > 0) {
                $scope.AddCart_SaveUpdate("Save", localStorage['DealerCode'], $("#HdnAddEditOrderHistory").val());
            }
            else {
                jAlert('Negative Value Not Allowed', 'Order', function (r) { document.getElementById("CalcualtePieces").focus(); });
            }
        });

        $('#Itemstbl').on("change keyup keydown", 'input', function () {
            var row = $(this).closest('tr');
            var total = 0;
            var piecesval = $(this).closest("tr").find("td:eq(5)").text();
            var ItemName = $(this).closest("tr").find("td:eq(9)").text();
            var lmax = $(this).closest("tr").find("td:eq(10)").text();
            var wmax = $(this).closest("tr").find("td:eq(11)").text();
            var tmax = $(this).closest("tr").find("td:eq(12)").text();
            var density = $(this).closest("tr").find("td:eq(13)").text();

            //density = density.substring(1, 3);

            var grade = $(this).closest("tr").find("td:eq(14)").text();

            $('input', row).each(function () {
                var subjectSel = ItemName;
                var qty = $(this).val();
                var LengthSel = lmax;
                var widthSel = wmax;
                var Density = density;
                var thicknessSel = tmax;

                var ChipThickness = tmax;
                var CustomLengthId = lmax;
                var CustomWidthId = wmax;
                var IsLatexsheetid = tmax;
                var IsPufsheetid = tmax;

                $scope.CalculatePiecevolumes(parseInt(qty), subjectSel, LengthSel, widthSel, Density, thicknessSel, ChipThickness, CustomLengthId, CustomWidthId, IsLatexsheetid, IsPufsheetid);
                // $scope.EditQty_CalculatePiecevolume  (qty, subjectSel, LengthSel, widthSel, Density, thicknessSel)
                $('.TotalPieces', row).text($("#pieces").text());
                $('.TotalVolume', row).text($("#volumecal").text());
            });
        });

        //-----------------------------------------------ORDER CREATION -INSERT---------------------//
        $scope.AddCart_SaveUpdate = function (Flag, dcode, OrderID) {
            var subjectSel = $("#subject").find("option:selected").text();
            var topicSel = $("#topic").find("option:selected").text();
            var Density = $("#Density").find("option:selected").text();
            var val = $("#CalcualtePieces").val();
            var LengthSel = $("#LengthSel").find("option:selected").text();
            var widthSel = $("#widthSel").find("option:selected").text();
            var thicknessSel = $("#thicknessSel").find("option:selected").text();
            var Qty = $("#CalcualtePieces").val();
            var ldpe = $("input[name='ldpe']:checked").val();
            var piece = $("#pieces").text();
            var pieces = piece * val;
            var lblBundle = $("#lblBundle").text();
            var Volume = $("#volumecal").text();
            var Weight = $("#Weightid").text();
            var CustomLengthId = $("#CustomLengthId").val();
            var CustomWidthId = $("#CustomWidthId").val();
            var ChipThickness = $("#IsFoamid").val();
            var Delivery_Location = $("#hdnDelivery_Location").val();

            var IsLatexsheetid = $("#IsLatexsheetid").val();
            var IsPufsheetid = $("#IsPufsheetid").val();
            //-------------------------------------------------------------------------------------------------------------//
            //if (subjectSel == "CHIP FOAM SHEETS" || subjectSel == "LATEX LIKE FOAM SHEETS") {
            //    if (LengthSel == "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
            //        thicknessSel = ChipThickness;
            //        LengthSel = CustomLengthId;

            //    }
            //    if (widthSel == "Custom Width" && widthSel != "Select" && LengthSel != "Custom Length" && LengthSel != "Select") {
            //        thicknessSel = ChipThickness;
            //        widthSel = CustomWidthId;
            //    }
            //    if (LengthSel == "Custom Length" && LengthSel != "Select" && widthSel == "Custom Width" && widthSel != "Select") {
            //        LengthSel = CustomLengthId;
            //        thicknessSel = ChipThickness;
            //        widthSel = CustomWidthId;
            //    }
            //    if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
            //        thicknessSel = ChipThickness;

            //    }

            //}
            if (subjectSel == "CHIP FOAM SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    LengthSel = CustomLengthId;
                    thicknessSel = ChipThickness;
                    widthSel = widthSel;
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    LengthSel = LengthSel;
                    thicknessSel = ChipThickness;
                    widthSel = CustomWidthId;
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    LengthSel = CustomLengthId;
                    thicknessSel = ChipThickness;
                    widthSel = CustomWidthId;
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    LengthSel = LengthSel;
                    thicknessSel = ChipThickness;
                    widthSel = widthSel;
                }
            }
            else if (subjectSel == "PUF CUSHIONS") {
                if (LengthSel != "Select" && widthSel != "Select") {
                    LengthSel = LengthSel;
                    thicknessSel = IsLatexsheetid;
                    widthSel = widthSel;
                }
            }
            else if (subjectSel == "LATEX LIKE FOAM SHEETS" || subjectSel == "MF CUSHIONS" || subjectSel == "MF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    LengthSel = CustomLengthId;
                    thicknessSel = IsLatexsheetid;
                    widthSel = widthSel;
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    LengthSel = LengthSel;
                    thicknessSel = IsLatexsheetid;
                    widthSel = CustomWidthId;
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    LengthSel = CustomLengthId;
                    thicknessSel = IsLatexsheetid;
                    widthSel = CustomWidthId;
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    LengthSel = LengthSel;
                    thicknessSel = IsLatexsheetid;
                    widthSel = widthSel;
                }
            }
            else if (subjectSel == "PUF SHEETS") {
                if (LengthSel == "Custom Length" && widthSel != "Custom Width" && widthSel != "Select") {
                    LengthSel = CustomLengthId;
                    thicknessSel = IsPufsheetid;
                    widthSel = widthSel;
                }
                if (widthSel == "Custom Width" && LengthSel != "Custom Length" && LengthSel != "Select") {
                    LengthSel = LengthSel;
                    thicknessSel = IsPufsheetid;
                    widthSel = CustomWidthId;
                }
                if (LengthSel == "Custom Length" && widthSel == "Custom Width") {
                    LengthSel = CustomLengthId;
                    thicknessSel = IsPufsheetid;
                    widthSel = CustomWidthId;
                }
                if (LengthSel != "Custom Length" && LengthSel != "Select" && widthSel != "Custom Width" && widthSel != "Select") {
                    LengthSel = LengthSel;
                    thicknessSel = IsPufsheetid;
                    widthSel = widthSel;
                }
            }
            else if (subjectSel == "PUF ROLLS" || subjectSel == "MF ROLLS") {
                if (widthSel != "Custom Width" && widthSel != "Select" && thicknessSel != "Select") {
                    LengthSel = "0";
                    thicknessSel = thicknessSel;
                    widthSel = widthSel;
                }
            }

            else {
                LengthSel = LengthSel;
                thicknessSel = thicknessSel;
                widthSel = widthSel;
            }
            //-------------------------------------------------------------------------------------------------------------//

            if (Flag == "Save") {
                //var postdt = "?Order" + Orders;
                var postData = "?ItemName=" + subjectSel + "&Grade=" + topicSel + "&Density=" + Density + "&PrimaryUOM=" + lblBundle + "&Lmax=" + LengthSel
                    + "&Wmax=" + widthSel + "&Tmax=" + thicknessSel + "&QTY=" + Qty + "&Pieces=" + pieces + "&LDPE=" + ldpe + "&DealerCode=" + dcode
                    + "&Volume=" + Volume + "&Weight=" + Weight + "&STANDARD_ORDER=" + localStorage['STANDARD_ORDER']
                    + "&OrderPlacedby=" + localStorage['ProfileName'] + "&OrderID=" + OrderID + "&CreatedBy=" + $("#userid").text();
                //var postData = "?ItemName=" + subjectSel + "&Grade=" + topicSel + "&Density=" + Density
                //    + "&PrimaryUOM=" + lblBundle + "&Lmax=" + LengthSel
                //    + "&Wmax=" + widthSel + "&Tmax=" + thicknessSel + "&QTY=" + Qty + "&Pieces=" + pieces + "&LDPE=" + ldpe;
                // var objs = {
                //  ItemName: subjectSel, Grade: topicSel, Density: Density, Lmax: LengthSel, Wmax: widthSel, QTY: Qty, Pieces: pieces, LDPE: ldpe, DealerCode: dcode,
                // Volume: Volume, Weight: Weight, STANDARD_ORDER: localStorage['STANDARD_ORDER'], OrderPlacedby: localStorage['UserId']
                //};

                var post = $http({
                    method: "GET",
                    url: "/api/SalesOrder/OrderCreate" + postData,  //OrderCreate "@Url.Action(OrderCreate, SalesOrder, new { area = '' })",//"/api/SalesOrder/OrderCreate",
                    dataType: 'json',

                    headers: { "Content-Type": "application/json" }
                });
                post.success(function (response, status) {
                    if (response.data != "") {
                        // alert("Data Save Successfully");
                        $scope.GetItems(OrderID);
                        if (response != "") {
                            alert(response);
                        }
                        else {
                            // alert("Order Created Successfully");
                            jAlert('Order Created Successfully', 'Order', function (r) { document.getElementById("subject").focus(); });

                            // return false;
                        }
                    } else {
                        // alert("Some error");
                    }
                });
                post.error(function (response, status) {
                    //$window.alert(response.Message);
                });
            }
        }
        //--------------------------------------------------ITEM SAVING-----------------------------------------------//

        //-----------------------------------------------ORDER CREATION -INSERT---------------------//
        $scope.AddItem_SaveUpdate = function (Flag, DealerCode, Flag1, id, qty, pieces, volume) {
            var Comments = $("#CommentsId").val();
            var Cust_Ref = $("#Cus_refId").val();

            var CRDDate = $("#CRDDate").val();
            var PlantSel = $("#PlantSel").find("option:selected").text();
            var OrderId = localStorage["OrderHistoryId"];// $("#OrderIDForItemUpdate").val();
            var VehicleSel = $("#VehicleSel").find("option:selected").text();

            var Weight = $("#Weightid").text();
            //var Qty = $("#ttlqty").val();
            //var ldpe = $("input[name='ldpe']:checked").val();
            var piece = pieces;
            //var pieces = piece * Qty;
            //var lblBundle = $("#lblBundle").text();
            //var Volume = $("#volumecal").text();
            var Deli_Loc = $("#hdnDelivery_Location").val();

            if (Flag == "Update") {
                //var postdt = "?Order" + Orders;
                var postData = "?Cust_Ref=" + Cust_Ref + "&Comments=" + Comments + "&VehicleCode=" + VehicleSel + "&PlantCode=" + PlantSel + "&CRD_Date=" + CRDDate
                    + "&Wmax=" + id + "&Tmax=" + Flag1 + "&QTY=" + qty + "&Pieces=" + piece + "&LDPE=" + '' + "&DealerCode=" + DealerCode + "&OrderID=" + OrderId + "&Volume=" + volume + "&Weight=" + Weight + "&Delivery_Location=" + Deli_Loc;
                //var postData = "?ItemName=" + subjectSel + "&Grade=" + topicSel + "&Density=" + Density
                //    + "&PrimaryUOM=" + lblBundle + "&Lmax=" + LengthSel
                //    + "&Wmax=" + widthSel + "&Tmax=" + thicknessSel + "&QTY=" + Qty + "&Pieces=" + pieces + "&LDPE=" + ldpe;

                var post = $http({
                    method: "POST",
                    url: "/api/SalesOrder/OrderItemUpdate" + postData,
                    dataType: 'json',

                    headers: { "Content-Type": "application/json" }
                });
                post.success(function (response, status) {
                    $scope.GetItemsDetails();

                    if (response.data != "") {
                        // $scope.GetItems();
                        //alert("Data Save Successfully");
                    } else {
                        // alert("Some error");
                    }
                });
                post.error(function (response, status) {
                    //$window.alert(response.Message);
                });
            }
        }
        $scope.ConfirmItem_SaveUpdate = function (Flag, DealerCode, Flag1, id) {
            var Comments = $("#CommentsId").val();
            var Cust_Ref = $("#Cus_refId").val();

            var CRDDate = $("#CRDDate").val();
            var PlantSel = $("#PlantSel").find("option:selected").text();
            var OrderId = localStorage["OrderHistoryId"];// $("#OrderIDForItemUpdate").val();
            var VehicleSel = $("#VehicleSel").find("option:selected").text();
            var FTL_TRUCK;
            if ($('#FTL_chk').is(":checked")) {
                FTL_TRUCK = 1;
            }
            else {
                FTL_TRUCK = 0;
            }
            var Qty = $("#ttlqty").val();
            //var ldpe = $("input[name='ldpe']:checked").val();
            var piece = $("#ttlpieces").text();
            //var pieces = piece * Qty;
            //var lblBundle = $("#lblBundle").text();
            //var Volume = $("#volumecal").text();
            // var Deli_Loc = $("#hdnDelivery_Location").val();
            var Deli_Loc = $("#DeliveryLocId").text();
            var Weight = $("#Weightid").text();
            if (Flag == "Update") {
                //var postdt = "?Order" + Orders;
                var postData = "?Cust_Ref=" + Cust_Ref + "&Comments=" + Comments + "&VehicleCode=" + VehicleSel + "&PlantCode=" + PlantSel + "&CRD_Date=" + CRDDate
                    + "&Wmax=" + id + "&Tmax=" + Flag1 + "&QTY=" + Qty + "&Pieces=" + piece + "&LDPE=" + '' + "&DealerCode=" + DealerCode + "&OrderID=" + OrderId + "&Weight=" + Weight + "&FTL_TRUCK=" + FTL_TRUCK + "&Delivery_Location=" + Deli_Loc;
                //var postData = "?ItemName=" + subjectSel + "&Grade=" + topicSel + "&Density=" + Density
                //    + "&PrimaryUOM=" + lblBundle + "&Lmax=" + LengthSel
                //    + "&Wmax=" + widthSel + "&Tmax=" + thicknessSel + "&QTY=" + Qty + "&Pieces=" + pieces + "&LDPE=" + ldpe;

                var post = $http({
                    method: "POST",
                    url: "/api/SalesOrder/OrderItemUpdate" + postData,
                    dataType: 'json',

                    headers: { "Content-Type": "application/json" }
                });
                post.success(function (response, status) {
                    if (response.data != "") {
                        // $scope.GetItems();
                        //alert("Data Save Successfully");
                        var url = $("#RedirectTo").val();
                        location.href = url;
                    } else {
                        // alert("Some error");
                    }
                });
                post.error(function (response, status) {
                    //$window.alert(response.Message);
                });
            }
        }
        //--------------------------------------------------LOAD ORDER ITEMS--------------------------------------//
        $scope.GetItems = function (orderid) {
            $scope.ItemDetails = "";

            orderid = localStorage["AddItems_OrderHistory"];

            var customer = '{OrderID: "' + $scope.Prefix + '" }';
            var post = $http({
                method: "POST",
                url: "/api/Orders/GetItems" + "?DealerCode=" + localStorage['DealerCode'] + "&ProfileName=" + localStorage['ProfileNameItem'] + "&OrderId=" + orderid,
                dataType: 'json',
                data: customer,
                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.ItemDetails = response;

                if ($scope.ItemDetails.length > 0) {
                    $("#tblBykeLists td").parent().remove();
                    for (var i = 0; i < $scope.ItemDetails.length; i++) {
                        var item = "<i class='mdi mdi-delete text-danger pull-right' ng - click='removeItem($index)' role = 'button' tabindex = '0' ></i > ";
                        var itemname = "<tr style='border:0'><td style='border:0'> <p class='ng-binding'><span style='color: grey;margin: 0px'>Item : </span> " + $scope.ItemDetails[i].itemName + "</p> &nbsp;&nbsp;" + item + "</td></tr>";
                        var material = "<tr style='border:0'><td style='border:0'> <p class='ng-binding'><span style='color: grey; margin: 0px'>Material ID : </span> " + $scope.ItemDetails[i].materialID + "</p></td></tr>";
                        var lwt = "<tr style='border:0'><td style='border:0'><p class='ng-binding'><span ng-if='item.leng' class='ng - binding ng - scope''>L-" + $scope.ItemDetails[i].lmax + "</span> <span ng-if='item.width' class='ng-binding ng-scope'>W-" + $scope.ItemDetails[i].wmax + "</span><span ng-if='item.thickness' class='ng-binding ng-scope'> T-" + $scope.ItemDetails[i].tmax + "</span>&nbsp;&nbsp;&nbsp; <span style='color: grey; margin: 0px'>Qty</span> - " + $scope.ItemDetails[i].qty + "&nbsp;&nbsp;&nbsp; <span style = 'color: grey; margin: 0px'>LDPE</span> - " + $scope.ItemDetails[i].ldpe + "</p></td></tr>";
                        var pieces = "<tr style='border:0'><td style='border:0'> <p class='ng-binding'><span style='color: grey; margin: 0px' class='ng - binding'>Pieces</span> - " + $scope.ItemDetails[i].pieces + " &nbsp;&nbsp;<span style='color: grey; margin: 0px'>UOM</span> - " + $scope.ItemDetails[i].primaryUOM + "</p></td></tr>";
                        var volume = "<tr style='border:0'><td style='border:0'> <p class='ng-binding'><span style ='color: grey;margin: 0px'>Volume</span> - " + $scope.ItemDetails[i].volume + "</p><hr></td></tr>";
                        $("#tblBykeLists").append(itemname + material + lwt + pieces + volume);
                        //$("#tblBykeListsv").append(itemname + material + lwt + pieces + volume);

                        //----------------------//
                        localStorage.setItem("Orderid", $scope.ItemDetails[i].orderID);
                        localStorage.setItem("OrderHistoryId", $scope.ItemDetails[i].orderID);

                        $('#btnPreview').show();
                    }

                    // $scope.GetRepeatOrder();
                }
                else {
                    $('#btnPreview').hide();
                }
                $scope.IsVisible = true;
            });
            // post.error(function (response, status) {
            //  //$window.alert(response.Message);
            // });
        }
        $scope.GetRepeatOrder = function () {
            $scope.OrderDetails1 = "";
            var customer = '{OrderID: "' + $scope.Prefix + '" }';
            var post = $http({
                method: "POST",
                url: "/api/Orders/GetOrders" + "?DealerCode=" + localStorage['DealerCode'] + "&SearchName=" + localStorage['ProfileNameRepeatorder'],
                dataType: 'json',
                data: customer,
                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.OrderDetails1 = response;
                var gfd = "";
                if ($scope.OrderDetails1.length > 0) {
                    for (var i = 0; i < $scope.OrderDetails1.length; i++) {
                        gfd = "<tr class='ng - scope' ng-repeat='emps in OrderDetails1'><td class= 'ng-binding' >" + $scope.OrderDetails1[i].orderID + "</td > <td class='ng-binding'>" + $scope.OrderDetails1[i].orderDate
                            + "</td> <td class='ng-binding'> <a style='text-decoration: none' data-href='re' id='Orderitemgg'  class='ng-binding OrderId' tabindex='0'>Repeat Order</a></td></tr >"
                        $("#tblBykeListsv").append(gfd);
                    }
                }
            });
        }

        $scope.GetOrdersId = function () {
            var customer = '{OrderID: "' + $scope.Prefix + '" }';
            var OrderIDForItem = localStorage["OrderHistoryId"];// $("#OrderIDForItemUpdate").val();
            //var id = GetParameterValues('id');

            //if (id != "" || id !=null) {
            //OrderIDForItem = id;
            //}
            var post = $http({
                method: "POST",
                url: "/api/Orders/GetOrdersId" + "?DealerCode=" + localStorage['DealerCode'] + "&OrderId=" + OrderIDForItem,
                dataType: 'json',
                data: customer,
                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.GetOrdersId = response;
                if ($scope.GetOrdersId.length > 0) {
                    for (var i = 0; i < $scope.GetOrdersId.length; i++) {
                        $("#Cus_refId").val($scope.GetOrdersId[i].cust_Ref);
                        $("#CommentsId").val($scope.GetOrdersId[i].cust_Comments);

                        var format3 = moment($scope.GetOrdersId[i].crD_Date).format('DD/MM/YYYY');

                        // $("#CRDDate").val(format3.replace("01/01/1900", ""));
                        $("#CRDDate").val(format3);

                        //$("#hdnstatus").val($scope.GetOrdersId[i].status);  && localStorage["ProfileName"] != "Admin"

                        $("#addNewItemBtn").hide();
                        $("#ItemUpdateSave").hide();
                        $("#ItemUpdateConfirm").hide();

                        if ($scope.GetOrdersId[i].status == "Draft") {
                            $("#ItemUpdateSave").show();
                            $("#ItemUpdateConfirm").show();

                            $("#addNewItemBtn").show();
                        }
                        else if ($scope.GetOrdersId[i].status == "Confirmed" && (localStorage["ProfileName"] == "Admin" || localStorage["ProfileName"] == "FactoryAdmin")) {
                            $("#ItemUpdateSave").show();
                            $("#ItemUpdateConfirm").show();

                            $("#addNewItemBtn").show();
                        }
                    }
                }
            });
            post.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        $scope.GetOrdersIdhistory = function () {
            var customer = '{OrderID: "' + $scope.Prefix + '" }';
            var OrderIDForItem = localStorage["OrderHistoryId"];// $("#OrderIDForItemUpdate").val();
            //var id = GetParameterValues('id');

            //if (id != "" || id !=null) {
            //OrderIDForItem = id;
            //}
            var post = $http({
                method: "POST",
                url: "/api/Orders/GetOrdersId" + "?DealerCode=" + localStorage['DealerCode'] + "&OrderId=" + localStorage['OrderHistoryId'],
                dataType: 'json',
                data: customer,
                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.GetOrdersId = response;
                if ($scope.GetOrdersId.length > 0) {
                    for (var i = 0; i < $scope.GetOrdersId.length; i++) {
                        $("#Cus_refId").val($scope.GetOrdersId[i].cust_Ref);
                        $("#CommentsId").val($scope.GetOrdersId[i].cust_Comments);

                        var format3 = moment($scope.GetOrdersId[i].crD_Date).format('DD/MM/YYYY');

                        $("#CRDDate").val(format3);

                        $("#addNewItemBtn").hide();
                        $("#ItemUpdateSave").hide();
                        $("#ItemUpdateConfirm").hide();

                        if ($scope.GetOrdersId[i].status == "Draft") {
                            $("#ItemUpdateSave").show();
                            $("#ItemUpdateConfirm").show();

                            $("#addNewItemBtn").show();
                        }
                        else if ($scope.GetOrdersId[i].status == "Confirmed" && (localStorage["ProfileName"] == "Admin" || localStorage["ProfileName"] == "FactoryAdmin")) {
                            $("#ItemUpdateSave").show();
                            $("#ItemUpdateConfirm").show();

                            $("#addNewItemBtn").show();
                        }
                    }
                }
            });
            post.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }

        $scope.Validate_ChangeAddress = function () {
            var DeLi_Loc = $("#DeliveryLocId").text();
            var AddCnt = localStorage["AddressCount"];
            if (AddCnt > 1 && DeLi_Loc == "") {
                jConfirm('Do you want to change the shipping address?', 'Order', function (r) {
                    var i = r + 'ok'; if (i == 'trueok') {
                        $('#Changeaddress_id').click();

                        return true;
                    }
                    else {
                    }
                }); return false;
            }
        }
        $scope.GetItems_OrderHistoryDetails = function () {
            $scope.ItemDetails = "";
            var TQtysum = 0;
            var TPiecessum = 0;
            var TVolumesum = 0;
            var customer = '{OrderID: "' + $scope.Prefix + '" }';
            var post = $http({
                method: "POST",
                url: "/api/Orders/GetOrderHistory_Items" + "?OrderId=" + localStorage["OrderHistoryId"] + "&ProfileName=" + localStorage['ProfileNameItem'],
                dataType: 'json',
                data: customer,
                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.ItemDetails = response;
                var TQtysum = 0;
                var TPiecessum = 0;
                if ($scope.ItemDetails.length > 0) {
                    for (var i = 0; i < $scope.ItemDetails.length; i++) {
                        //----------------------//
                        $("#DealerCodeForItemUpdate").val("IN " + $scope.ItemDetails[i].dealerCode);
                        $("#OrderIDForItemUpdate").val($scope.ItemDetails[i].orderID);
                        $("#hdnordstatus").val($scope.ItemDetails[i].status);

                        //--------------Admin Edit Button Show/Hide-----------------------------//
                        $scope.ItemDetails[i].flag = localStorage['ProfileName'];
                        //--------------Admin Edit Button Show/Hide-----------------------------//

                        $("#ordid").text($scope.ItemDetails[i].orderID);
                        $("#orddate").text($scope.ItemDetails[i].orderDate);
                        $("#ordplacedby").text($scope.ItemDetails[i].orderPlacedBy);
                        $("#ordsalesperson").text($scope.ItemDetails[i].salesPerson);
                        // $("#ordplant").text($scope.ItemDetails[i].plantCode);

                        TQtysum += parseFloat(NanValue($scope.ItemDetails[i].qty));
                        $('#TQtysum').text(TQtysum);

                        TPiecessum += parseFloat(NanValue($scope.ItemDetails[i].pieces));
                        $('#TPiecesum').text(TPiecessum);

                        TVolumesum += parseFloat(NanValue($scope.ItemDetails[i].volume));
                        $('#TVolumesum').text(TVolumesum.toFixed(2));

                        $scope.ConfirmEditBy_Role();

                        localStorage["OrderHistoryId"] = "";
                        localStorage["DealerCode"] = "";
                        localStorage["OrderHistoryId"] = $("#OrderIDForItemUpdate").val();

                        localStorage["DealerCode"] = $scope.ItemDetails[0].dealerCode;

                        $scope.GetAllCustomers();
                        // $scope.AdminProfileEnable();
                        $scope.GetOrdersIdhistory();

                        if ($scope.ItemDetails[i].ftL_TRUCK == "True") {
                            $("#FTL_chk").prop('checked', true);
                        }
                        else {
                            $("#FTL_chk").prop('checked', false);
                        }
                    }

                    $scope.LoadVehicle($("#OrderIDForItemUpdate").val());
                }
                else {
                    $('#btnPreview').hide();
                }
                $scope.IsVisible = true;
                $scope.GetOrdersId();
                //$scope.LoadVehicleDetails();
                if ($scope.ItemDetails[0].status == "Confirmed") {
                    $("#ItemUpdateConfirm").hide();
                }
                else {
                    $("#ItemUpdateConfirm").show();
                }
                // $('#VehicleSel').get(0).remove();
                // $scope.LoadVehicle(localStorage["OrderHistoryId"]);
                // document.getElementById("VehicleSel").options[0].remove();
                // document.getElementById("VehicleSel").insertBefore(new Option('', ''), document.getElementById("VehicleSel").firstChild);
                // alert(localStorage["AddressCount"]);
            });
            // post.error(function (response, status) {
            //  //$window.alert(response.Message);
            // });
        }
        $scope.GetItemsDetails = function () {
            var orderid = localStorage["AddItems_OrderHistory"];

            $scope.ItemDetails = "";
            var TQtysum = 0;
            var TPiecessum = 0;
            var TVolumesum = 0;
            var customer = '{OrderID: "' + $scope.Prefix + '" }';
            var post = $http({
                method: "POST",
                url: "/api/Orders/GetItems" + "?DealerCode=" + localStorage["DealerCode"] + "&ProfileName=" + localStorage['ProfileNameItem'] + "&OrderId=" + orderid,
                dataType: 'json',
                data: customer,
                headers: { "Content-Type": "application/json" }
            });
            post.success(function (response, status) {
                $scope.ItemDetails = response;
                var TQtysum = 0;
                var TPiecessum = 0;
                if ($scope.ItemDetails.length > 0) {
                    for (var i = 0; i < $scope.ItemDetails.length; i++) {
                        //----------------------//
                        $("#DealerCodeForItemUpdate").val("IN " + $scope.ItemDetails[i].dealerCode);
                        $("#OrderIDForItemUpdate").val($scope.ItemDetails[i].orderID);
                        $("#hdnordstatus").val($scope.ItemDetails[i].status);

                        //--------------Admin Edit Button Show/Hide-----------------------------//
                        $scope.ItemDetails[i].flag = localStorage['ProfileName'];
                        //--------------Admin Edit Button Show/Hide-----------------------------//

                        $("#ordid").text($scope.ItemDetails[i].orderID);
                        localStorage["OrderHistoryId"] = "";
                        localStorage["OrderHistoryId"] = $scope.ItemDetails[i].orderID;

                        $("#orddate").text($scope.ItemDetails[i].orderDate);
                        $("#ordplacedby").text($scope.ItemDetails[i].orderPlacedBy);
                        $("#ordsalesperson").text($scope.ItemDetails[i].salesPerson);
                        // $("#ordplant").text($scope.ItemDetails[i].plantCode);

                        TQtysum += parseFloat(NanValue($scope.ItemDetails[i].qty));
                        $('#TQtysum').text(TQtysum);

                        TPiecessum += parseFloat(NanValue($scope.ItemDetails[i].pieces));
                        $('#TPiecesum').text(TPiecessum);

                        TVolumesum += parseFloat(NanValue($scope.ItemDetails[i].volume));
                        $('#TVolumesum').text(TVolumesum.toFixed(2));
                        $scope.ConfirmEditBy_Role();
                        //---------------------------//
                        //if ($scope.ItemDetails[i].vehiclE_CODE !== 0 || $scope.ItemDetails[i].vehiclE_CODE !== '' || $scope.ItemDetails[i].vehiclE_CODE !== null) {
                        //    if ($scope.ItemDetails[i].vehiclE_CODE.length > 0) {
                        //    $("#VehicleSel").find("option[text=" + $scope.ItemDetails[i].vehiclE_CODE + "]").attr("selected", true);
                        //}
                        //}

                        //$scope.AdminProfileEnable();
                    }
                    localStorage["OrderHistoryId"] = "";
                    localStorage["OrderHistoryId"] = $("#OrderIDForItemUpdate").val();
                    $scope.LoadVehicle(localStorage["OrderHistoryId"]);
                }
                else {
                    $('#btnPreview').hide();
                }
                $scope.IsVisible = true;
                $scope.GetOrdersId();
                //$scope.LoadVehicleDetails();
            });
            // post.error(function (response, status) {
            //  //$window.alert(response.Message);
            // });
            // $scope.LoadVehicle($("#ordid").text());
            //document.getElementById("VehicleSel").options[0].remove();
        }

        //---------------------------------------------LOAD VEHICLE DETAILS----------------------//

        //------------------------------------------------LOAD PLANT-------------------------------//
        //$scope.GetPlant = function () {
        //--------------------------------------------//
        $("#btnOrderSaves").bind("click", function () {
            // var AddEditOrderHistory = $scope.GetParameterValues('orderid');
            alert($("#HdnAddEditOrderHistory").val());
            $scope.AddCart_SaveUpdate("Save", localStorage['DealerCode'], $("#HdnAddEditOrderHistory").val());
        });

        // $("#ItemUpdateSave").bind("click", function () {
        // $("#msgsave").dialog();

        function validate_Orders() {
            var CRDDate;
            CRDDate = document.getElementById("CRDDate").value;

            if ($("#VehicleSel").find("option:selected").text() == "Select Vehicle Code") {
                jAlert('Select vehicle code', 'Order', function (r) { document.getElementById("VehicleSel").focus(); });

                return false;
            }
            if (CRDDate.length <= 0) {
                jAlert('CRDDate cannot be blank', 'Order', function (r) { document.getElementById("CRDDate").focus(); });

                return false;
            }
            // $("#Itemstbl").closest("tr").find(".editable");
            var ttlvolume = $("#TVolumesum").text();

            var vehicode = $("#VehicleSel").find("option:selected").text();

            var inside_split = vehicode.substring(vehicode.indexOf("(") + 1, vehicode.indexOf(")"));
            //inside_split = inside_split.replace('CBM', '');
            var split_Text = inside_split.split("-");
            var CBML = split_Text[0].replace('CBM', '');
            var CBMH = split_Text[1].replace('CBM', '');
            CBML = CBML.trim();
            CBMH = CBMH.trim();

            var Lvalue = parseFloat(CBML);
            var Hvalue = parseFloat(CBMH);
            var TVol = parseFloat(ttlvolume);

            if ($('#FTL_chk').is(":checked") && (localStorage['ProfileName'] == "Admin" || localStorage['ProfileName'] == "FactoryAdmin")) {
            }
            else {
                if (vehicode != "Select Vehicle Code") {
                    if (TVol < Lvalue) {
                        jAlert('Not yet Full Truck Load!', 'Order', function (r) { document.getElementById("VehicleSel").focus(); });

                        return false;
                    }

                    if (TVol > Hvalue) {
                        jAlert('More than Full Truck Load!', 'Order', function (r) { document.getElementById("VehicleSel").focus(); });

                        return false;
                    }
                }
            }
        }

        $("#ItemUpdateSave").click(function (event) {
            if (validate_Orders() != false) {
                jConfirm('Do You Want To Save?', 'Order', function (r) {
                    var i = r + 'ok'; if (i == 'trueok') {
                        $scope.ConfirmItem_SaveUpdate("Update", localStorage['DealerCode'], 'ItemSave', '');
                    }
                    else {
                    }
                }); return false;
            }
        });

        $("#ItemUpdateConfirm").click(function (event) {
            if ($scope.Validate_ChangeAddress() != false) {
                if (validate_Orders() != false) {
                    jConfirm('Are You Sure Want To Confirm?', 'Order', function (r) {
                        var i = r + 'ok'; if (i == 'trueok') {
                            $scope.ConfirmItem_SaveUpdate("Update", localStorage['DealerCode'], 'ItemConfirm', '');
                        }
                        else {
                        }
                    }); return false;
                }
            }
        });

        //  });
        $("#addNewItemBtn").bind("click", function () {
            var orderid = $("#ordid").text();
            var url = $("#RedirectToNewOrder").val();
            location.href = url + "?orderid=" + orderid;
            localStorage["AdditemId"] = orderid;
            //alert(localStorage["AdditemId"]);
        });

        //-----------------------------LOAD PLANT---------------------------------//
        $scope.LoadPlant = function () {
            orderid = localStorage["OrderHistoryId"];
            var Grade = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/GetPlantDetails' + "?orderid=" + orderid,  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            Grade.success(function (response, status) {
                $scope.LoadPlant = response;
                //empty Chapters- and Topics- dropdowns
                PlantSel.length = 1;
                //display correct values
                //$('#topic').prop('selectedIndex', 0);
                for (var i = 0; i < $scope.LoadPlant.length; i++) {
                    PlantSel.options[PlantSel.options.length] = new Option($scope.LoadPlant[i].plant);
                }
                //DensitySel.remove(0);
                $('#PlantSel').prop('selectedIndex', 1);
                $scope.IsVisible = true;
            });
            Grade.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //-----------------------------LOAD VEHICLE CODE---------------------------------//
        $scope.LoadVehicle = function (orderid) {
            var Grade = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/LoadVehicleDetails' + "?DealerCode=" + localStorage['DealerCode'] + "&orderid=" + orderid,  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });

            Grade.success(function (response, status) {
                $scope.LoadVehicle = response;
                //empty Chapters- and Topics- dropdowns
                VehicleSel.length = 1;
                //display correct values
                //$('#topic').prop('selectedIndex', 0);
                var theElement = $('#VehicleSel');
                theElement.children("option").remove();
                for (var i = 0; i < $scope.LoadVehicle.length; i++) {
                    //VehicleSel.options[VehicleSel.options.length] = new Option($scope.LoadVehicle[i].vehicleCode + ' - ' + $scope.LoadVehicle[i].vehicleType);
                    //var value = $scope.LoadVehicle[i].vehicleCode + ' - ' + $scope.LoadVehicle[i].vehicleType;
                    VehicleSel.options[VehicleSel.options.length] = new Option($scope.LoadVehicle[i].vehiTypedesc);
                }
                //DensitySel.remove(0);
                // $('#VehicleSel').prop('selectedIndex', 2);

                $scope.IsVisible = true;
                // $("#VehicleSel").change(function (evt) { //listen to changes of selection
                if (!theElement.data("selected")) { //check if flag is not set
                    theElement.children("option")[0].remove(); //remove 1st child
                    theElement.data("selected", true); //set flag, so it doesn't continue removing items for every change
                }
                //});
                //  $('#VehicleSel option').eq(0).prop('selected', true);
                //$('#VehicleSel option')[0].selected = true;
                //$('#VehicleSel').prop('selectedIndex', 0);
            });
            Grade.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }
        //}
        //---------------------------------CHANGE PLANT BY ADMIN/FACTORYADMIN------------------------//

        $scope.ChangePlant = function () {
            var Plant = $("#PlantSel").find("option:selected").text();
            var Grade = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/ChangePlantByAdmin' + "?DealerCode=" + localStorage['DealerCode'] + "&PlantCode=" + Plant,  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            Grade.success(function (response, status) {
                if (response.data != "") {
                    alert("Data Save Successfully");
                } else {
                    alert("Some error");
                }
            });
            Grade.error(function (response, status) {
                //$window.alert(response.Message);
            });
        }

        $scope.RemoveItem = function (id) {
            //if (validate_Orders() != false) {
            jConfirm('Are You Sure Want To Delete?', 'Order', function (r) {
                var i = r + 'ok'; if (i == 'trueok') {
                    var Grade = $http(
                        {
                            method: 'POST',
                            url: '/api/Orders/RemoveOrderItems' + "?DealerCode=" + localStorage['DealerCode'] + "&ItemID=" + id,  /*You URL to post*/
                            dataType: 'json',
                            headers: {
                                "Content-Type": "application/json"
                            },
                        });
                    Grade.success(function (response, status) {
                        if (response.data != "") {
                            //alert("Data Save Successfully");
                            $scope.GetItemsDetails();
                            $(this).remove();
                        } else {
                            // alert("Some error");
                        }
                    });
                    Grade.error(function (response, status) {
                        //$window.alert(response.Message);
                    });
                }
                else {
                }
            }); return false;
            // }
        }

        $scope.UpdateItem = function (id, qty, pieces, volume) {
            $scope.AddItem_SaveUpdate("Update", localStorage['DealerCode'], 'Itemupdate', id, qty, pieces, volume);
            //  $scope.GetItemsDetails();
        }
        var NanValue = function (entry) {
            if (entry == "NaN" || entry == "" || entry == "null" || entry == null) {
                return 0.00;
            } else {
                return entry;
            }
        }
        var Homeurl = function () {
            var url = $("#RedirectTo").val();
            location.href = url;
        }

        $(document).on("click", ".edit", function (e) {
            var row_index = $(this).closest("tr").index();

            var row = $(this).closest('tr');
            // $('#Itemstbl tbody').find("tr").each(function (index, tds) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var btn = $(this);
            var td = btn.closest("tr").find(".editable");
            currentValue = td.text();

            if (btn.text() === "Edit") {
                td.html("<input  class='identifier' type='number'   style='width:45px' min='1'  value=" + currentValue + " />");
                btn.html("Save");
                // $('.cancel', row).show();
            }

            else {
                var qty = td.find("input").val();
                btn.html("Edit");

                //var d = $(this).closest('tr').find(".editable").attr('qtyid');
                var td = $(this).closest("tr").find(".editable");
                //alert(d);
                if (currentValue) {
                    td.html(currentValue);

                    $(this).parent().find(".edit").html("Edit");
                    //currentValue = null;
                }
                //alert(df);
                //alert($(this).closest("tr").find("td:eq(7)").text());
                var itemid = $(this).closest("tr").find("td:eq(8)").text();
                //var qty = $(this).closest("tr").find("td:eq(3)").text();
                $scope.UpdateItem(itemid, qty, $(this).closest("tr").find("td:eq(5)").text(), $(this).closest("tr").find("td:eq(6)").text());
            }
            // });
        });

        $(document).on("click", ".cancel", function (e) {
            var row_index = $(this).closest("tr").index();

            // $('#Itemstbl tbody').find("tr").each(function (index, tds) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var d = $(this).closest('tr').find(".editable").attr('qtyid');
            var td = $(this).closest("tr").find(".editable");
            //alert(d);
            if (currentValue) {
                td.html(currentValue);

                $(this).parent().find(".edit").html("Edit");
                currentValue = null;
                // $('.cancel', row).hide();
            }
        });

        $scope.LoadOrder_History = function (id) {
            $("#hdnordid").val(id);
            localStorage["OrderHistoryId"] = "";
            localStorage["OrderHistoryId"] = id;
            var url = $("#RedirectToOrderDetails").val();
            location.href = url + "?id=" + id;
            // $scope.GetOrderHistoryId(id);
        }

        $scope.selectAddress = function (index, Address, DeliveryLoc) {
            //for (let i = 0; i < $scope.shipping_addresses.length; i++)

            var ordid = localStorage["OrderHistoryId"];// $("#OrderIDForItemUpdate").val();
            // if (i != index) {
            //$scope.shipping_addresses[i].selected = false;

            var posttt = "?Item1=" + ordid + "&Item=" + Address.replace("#", "***") + "&DealerCode=" + localStorage['DealerCode'];
            var ordid = localStorage["OrderHistoryId"];// $("#OrderIDForItemUpdate").val();
            var items = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/ChangeShippingAddress' + posttt,  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            items.success(function (response, status) {
                $scope.shipping_addresses = response;
                $("#ShippingAdd").text(Address);
                $("#hdnDelivery_Location").val(DeliveryLoc);
                $("#DeliveryLocId").text(DeliveryLoc);

                // alert("Shipping Address has been Changed");
                //for (let i = 0; i < $scope.shipping_addresses.length; i++)
                //    if (i != index) $scope.shipping_addresses[i].selected = false;
                //    else {
                //        $scope.shipping_addresses[i].selected = true;
                //        $scope.config.shipping_address = $scope.shipping_addresses[i].address;
                //        alert("Shipping Address has been Changed");
                //        //$scope.config.ship_to_code = $scope.shipping_addresses[i].ShipToCode;
                //       // $scope.config.delivery_location = $scope.shipping_addresses[i].DeliveryLocation || '';
                //    }
                $scope.Loadshipping_addresses();
            });
            items.error(function (response, status) {
                // //$window.alert(response.Message);
            });
            //}
        }
        $scope.Loadshipping_addresses = function (item) {
            var items = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/LoadShippingAddress' + "?DealerCode=" + localStorage['DealerCode'],  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            items.success(function (response, status) {
                $scope.shipping_addresses = response;
                localStorage["AddressCount"] = $scope.shipping_addresses.length;

                $("#shipping_address .close").click()
                //$('#shipping_address').modal('toggle');
            });
            items.error(function (response, status) {
                // //$window.alert(response.Message);
            });
        }
        $scope.Orderstatus = function (item) {
            $("#lotstatusid").hide();
            var items = $http(
                {
                    method: 'POST',
                    url: '/api/Orders/Orderstatus' + "?Orderid=" + localStorage["OrderHistoryId"],  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            items.success(function (response, status) {
                $scope.orderDetailsstatus = response;

                $("#lotstatusid").show();
                $("#lotstatus").text($scope.orderDetailsstatus[0].loT_Status);
                $("#Releasestatus").text($scope.orderDetailsstatus[0].status);
                $("#Shipstatus").text($scope.orderDetailsstatus[0].ship_Status + " " + $scope.orderDetailsstatus[0].ship_Details);
            });
            items.error(function (response, status) {
                // //$window.alert(response.Message);
            });
        }
        $("#modeladdress").bind("click", function () {
            //  $('#shipping_address').modal('show');
        });

        $("#FoamOrder_Menuid").bind("click", function () {
            $scope.Foamorderclick();
        });
        $("#Invoice_Menuid").bind("click", function () {
            $scope.Invoiceorderclick();
        });
        $scope.Invoiceorderclick = function () {
            var a = "hi";
            var b = "hi1";
            var c = localStorage['ProfileName'];
            // if (localStorage['ProfileName'] == "Admin" || localStorage['ProfileName'] == "FactoryAdmin" || localStorage['ProfileName'] == "SalesPerson") {
            var url = $("#RedirectToInvoicelist").val();
            location.href = url;
            // $scope.GetAllCustomers();
            // }
            // else {
            // var url = $("#RedirectToOrderCreation").val();
            // location.href = url;

            // }
        }
        $scope.Foamorderclick = function () {
            var a = "hi";
            var b = "hi1";
            var c = localStorage['ProfileName'];
            if (localStorage['ProfileName'] == "Admin" || localStorage['ProfileName'] == "FactoryAdmin" || localStorage['ProfileName'] == "SalesPerson") {
                var url = $("#RedirectToCustomelist").val();
                location.href = url;
                $scope.GetAllCustomers();
            }
            else {
                var url = $("#RedirectToOrderCreation").val();
                location.href = url;
            }
        }

        $scope.LoadingMenu = function () {
            if (localStorage['ProfileName'] == "Admin") {
            }
            else {
            }
        }

        $("#btnlogin").bind("click", function () {
            var url = $("#RedirectToOrderDetails").val();

            localStorage.clear();

            var UserName = localStorage['UserId'] = $("#UserId").val();
            var Role = $("#ProfileName").find("option:selected").text();
            var roleid_ = "";

            if (Role == "Admin")
                roleid_ = "1";
            if (Role == "Customer")
                roleid_ = "2";
            if (Role == "SalesPerson")
                roleid_ = "3";
            if (Role == "FactoryAdmin")
                roleid_ = "4";

            localStorage["ProfileName"] = Role;
            //localStorage['ProfileName'] = Role;
            //---------------------------------------------------------------------------//

            var result = "";
            $scope.LoginCheck = "";
            var items = $http(
                {
                    method: 'POST',
                    url: '/api/Login/LoginCheck' + "?UserName=" + UserName + "&Role=" + roleid_ + "&BusinessValue=''",  /*You URL to post*/
                    dataType: 'json',
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            items.success(function (response, status) {
                $scope.LoginCheck = response;
                if ($scope.LoginCheck[0].resultErrorMsg == "1") {
                    if (roleid_ == "3" || roleid_ == "4") {
                        localStorage['UserId'] = $scope.LoginCheck[0].mUserName;
                        UserName = $scope.LoginCheck[0].mUserName;
                        location.href = url + "?UserName=" + UserName + "&Role=" + roleid_ + "&BusinessValue=''";
                    }
                    else
                        location.href = url + "?UserName=" + UserName + "&Role=" + roleid_ + "&BusinessValue=''";
                }
                else {
                    alert($scope.LoginCheck[0].resultErrorMsg);
                }
            });
            items.error(function (response, status) {
                // //$window.alert(response.Message);
            });
            //---------------------------------------------------------------------------//
        });

        $scope.GetParameterValues = function (param) {
            var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for (var i = 0; i < url.length; i++) {
                var urlparam = url[i].split('=');
                if (urlparam[0] == param) {
                    return urlparam[1];
                }
            }
        }

        $scope.parseJwt = function (token) {
            try {
                var base64Url = token.split('.')[1];
                var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                return JSON.parse(jsonPayload);
            }
            catch (e) {
                location.href = Duroconnecturl;
                //$('#error').val('Error Name: ' + e.name + ' Error Message: ' + e.message);
            }
        }

        $scope.Check_UserLogin = function () {
            debugger;
            alert("Check_UserLogin");
            var Token = $scope.GetParameterValues('Tokenid');

            var result = "";
            $scope.LoginCheck = "";
            var auth = btoa('username:password');
            $scope.GetTokenvalue = $scope.parseJwt(Token);
            var UserName_id = $scope.GetTokenvalue.UserName;
            var Role_id = $scope.GetTokenvalue.RoleId;

            if (UserName_id == null || UserName_id == "") {
                // location.href = Duroconnecturl;
                location.href = Duroconnecturl + "?Messge=" + "UserName Is Empty";
            }

            else if (Role_id == null || Role_id == "") {
                //location.href = Duroconnecturl;
                location.href = Duroconnecturl + "?Messge=" + "Role Is Empty";
            }
            else {
                debugger;
                var items = $http(
                    {
                        method: 'POST',
                        url: '/api/Login/LoginCheck' + "?UserName=" + UserName_id + "&Role=" + Role_id + "&BusinessValue=''",  /*You URL to post*/
                        dataType: 'json',
                        headers: {
                            "Authorization": "Basic " + auth
                        },
                    });
                alert(items);
                items.success(function (response, status) {
                    alert(response);
                    $scope.LoginCheck = response;
                    var Messge = $scope.LoginCheck[0].resultErrorMsg;
                    if ($scope.LoginCheck[0].resultErrorMsg == "1") {
                        localStorage['DealerCode'] = "";
                        localStorage['ProfileName'] = "";
                        localStorage['DealerCode'] = UserName_id;
                        localStorage['UserId'] = UserName_id;

                        var Role = Role_id;

                        if (Role == "1")
                            roleid_ = "Admin";
                        if (Role == "2")
                            roleid_ = "Customer";
                        if (Role == "3")
                            roleid_ = "SalesPerson";
                        if (Role == "4") {
                            roleid_ = "FactoryAdmin";
                        }
                        localStorage['ProfileName'] = roleid_;

                        $("#userid").text(localStorage['DealerCode']);

                        $("#profileid").text(localStorage['ProfileName']);
                        $("#usersignoutid").text(localStorage['ProfileName']);

                        if (Role == "3" || Role == "4") {
                            localStorage['UserId'] = $scope.LoginCheck[0].mUserName;
                            var UserName = $scope.LoginCheck[0].mUserName;
                            $("#userid").text(UserName);
                            localStorage['DealerCode'] = UserName;
                        }
                    }
                    else {
                        location.href = Duroconnecturl + "?Messge=" + Messge;
                    }
                });
                items.error(function (response, status) {
                    location.href = Duroconnecturl;
                });
            }
        }

        // $scope.GetCustomersDetails = function () {
        var customer = '{OrderID: "' + $scope.Prefix + '" }';
        var DealerCode = "";
        var Name = "";
        if ($("#AddEditOrderHistory").text() == "" || $("#AddEditOrderHistory").text() == null) {
            DealerCode = localStorage['OrderHistoryId'];
            Name = "Dealer";
        }
        else {
            DealerCode = localStorage['DealerCode'];
            Name = "DisplayCustomer";
        }
        var post = $http({
            method: "POST",
            url: "/api/Orders/GetDealersDetails" + "?DealerCode=" + DealerCode + "&Name=" + Name,
            dataType: 'json',

            headers: { "Content-Type": "application/json" }
        });
        post.success(function (response, status) {
            $scope.CustomerDetails = response;
            $("#CustomeraName").text($scope.CustomerDetails[0].dealerName);
            $("#BillingAdd").text($scope.CustomerDetails[0].billingAddress);

            $("#CustomerCode").text($scope.CustomerDetails[0].dealercode);
            $("#ShippingAdd").text($scope.CustomerDetails[0].shippingAddress);

            $("#DeliveryLocId").text($scope.CustomerDetails[0].delivery_Location);

            if ($scope.CustomerDetails[0].shippingAddress == null || $scope.CustomerDetails[0].shippingAddress == "") {
                $("#ShippingAdd").text($scope.CustomerDetails[0].billingAddress);
            }
            $scope.IsVisible = true;
        });
        //};
    });

$(document).ready(function () {
    $('#OrdrHistoryTbfl').delegate('td', 'click', function () {
        var url = $("#RedirectToOrderDetails").val();
        location.href = url;
    });
});
//-------------------------------------------JQUERY FUNCTIONS---------------------------------------------------//
$(document).ready(function () {
    function Tblearch_Input(input) {
        // Search Text
        var search = input;

        // Hide all table tbody rows
        $('table tbody tr').hide();

        // Count total search result
        var len = $('table tbody tr:not(.notfound) td:contains("' + search + '")').length;

        if (len > 0) {
            // Searching text in columns and show match row
            $('table tbody tr:not(.notfound) td:contains("' + search + '")').each(function () {
                $(this).closest('tr').show();
            });
        } else {
            $('.notfound').show();
        }
    }
    // Search all columns
    $('#myInput').keyup(function () {
        Tblearch_Input($(this).val());
    });
    $('#OrderHistory_Search').keyup(function () {
        Tblearch_Input($(this).val());
    });
    $('#btnOrderHistory_Search').click(function () {
        //Tblearch_Input($('#OrderHistory_Search').val());
        // Search Text
        var search = $('#OrderHistory_Search').val();

        // Hide all table tbody rows
        $('table tbody tr').hide();

        // Count total search result
        var len = $('table tbody tr:not(.notfound) td:contains("' + search + '")').length;

        if (len > 0) {
            // Searching text in columns and show match row
            $('table tbody tr:not(.notfound) td:contains("' + search + '")').each(function () {
                $(this).closest('tr').show();
            });
        } else {
            $('.notfound').show();
        }
    });

    //--------------------------------------------TABLE SEARCH-----------------------------------//

    //jQuery('#library tr').click(function (e) {
    //    e.stopPropagation();
    //    var $this = jQuery(this);
    //    var trid = $this.closest('tr').attr('id');
    //});

    //$(document).ready(function () {
    //});
    //$("#FoamOrder_Menuid").click(function () {
    //    alert("The paragraph was clicked.");
    //});
    //$(".MenuFoamId a").live('click', function (e) {
    //    if (DealerCode_Id != null && ProfileName_Id == "Customer") {
    //        var url = $("#RedirectToOrderCreation").val();
    //        location.href = url;
    //    }
    //    else if (DealerCode_Id != null && ProfileName_Id == "Customer") {
    //        $scope.GetAllCustomers();
    //    }
    //});
});

// Case-insensitive searching (Note - remove the below script for Case sensitive search )
$.expr[":"].contains = $.expr.createPseudo(function (arg) {
    return function (elem) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});