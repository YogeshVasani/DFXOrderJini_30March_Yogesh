/**
 * Created by shreyasgombi on 03/04/20.
 */
angular.module('ebs.controller')
    .controller("SideMenuCtrl",function ($scope, Settings, $http, $location, toastr, $window) {
    console.log("Hello From Side Menu Controller .... !!!!");
    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    };
    $scope.stateComparator = function (user, viewValue) {
        return viewValue === secretEmptyKey || (''+user).toLowerCase().indexOf((''+viewValue).toLowerCase()) > -1;
    };
    $scope.onFocus = function (e) {
        console.log('onFocus');
        $timeout(function () {
            $(e.target).trigger('input');
            $(e.target).trigger('change'); // for IE
        });
    };
    $scope.nav = [];
    $scope.sellers = [];
    $scope.reportTab = [];
    $scope.enabledReports = [];
    $scope.user = {};
    $scope.instance_details = {};
    $scope.currency = '₹';
    $scope.notifications = [];
    $scope.orderStatus = [];
    $scope.unread_notification_count = 0;
    $scope.memberdetails = {};
    $scope.countryCode = [];
    $scope.recentTransactionType = 'all';
    $scope.disableAddSellers = false;
    $scope.disableAddItems = false;
    $scope.disableAddDealers = false;
    $scope.shopify = {};
    var recentTransactionFromServer = {};
    var masterRecentTransactions = {};
    var instance_details = {};
    var email = {};
    var defaultTaxObj = {};
    //........... Get Shopify Creds ...........
    $http.get("/dash/shopify/creds/fetch")
        .success(function (response) {
            console.log("Shopify credentials Fetched");
            if(response.length){
                $scope.shopify.api_key = response[0].shopify_api_key;
                $scope.shopify.password = response[0].shopify_password;
                $scope.shopify.host = response[0].shopify_host;
                $scope.shopify.store_name = response[0].shopify_store_name;
            }
        })
        .error(function (error){
            console.log(error)
        })
    $http.get("/dash/instanceDetails")
        .success(function(response){
            console.log("Instance details ---> ", response);
            if(response.api_key){
                //.... All important portal / instance details to be cached....
                //... These details will be then used accross controllers...
                instance_details.coID = $scope.instance_details.coID = response.coID || '';
                instance_details.api_key = $scope.instance_details.api_key = response.api_key || '';
                instance_details.currency = $scope.instance_details.currency = $scope.currency = response.currency || "₹";
                instance_details.country = $scope.instance_details.country = response.country || 'India';
                instance_details.companyEmail = $scope.instance_details.companyEmail =  response.companyEmail;
                instance_details.fullName = $scope.instance_details.fullName = response.full_name;
                instance_details.logo_url = $scope.memberdetails.logo_url = response.logo_url;
                instance_details.invoice = response.invoice;
                instance_details.tax = response.tax ? response.tax : [];
                instance_details.taxExclusive = response.tax? (response.taxExclusive ? response.taxExclusive : false) : false;
                instance_details.dealerClass = response.dealerClass ? response.dealerClass : [];
                instance_details.inventoryLocation = response.inventoryLocation? response.inventoryLocation : [];
                instance_details.lineStatusChange = response.lineStatusChange ? response.lineStatusChange : '';
                instance_details.statusChange = response.statusChange ? response.statusChange : '';
                instance_details.taxSetup = response.taxSetup? !!response.taxSetup.activate : true;
                instance_details.enforceInventoryOrder = response.enforceInventoryOrder || '';
                instance_details.orderEditForStatus = response.orderEditForStatus || {};
                instance_details.dealerClasses = response.dealerClasses || [];
                instance_details.lockOrderInventory = response.orderInvlock || '';
                instance_details.masterPriceList = response.masterPriceList || [];
                instance_details.invoice = response.invoice || '';
                instance_details.stepQuantity = response.stepQuantity || 1;
                instance_details.UOM = response.UOM || '';
                instance_details.shipmentEnable = response.orderShipment;
                instance_details.inventoryType = response.inventoryType ? response.inventoryType : '';
                instance_details.applicationType = response.applicationType ? response.applicationType : 'B2BOMS';
                instance_details.paytm = response.paytm ;
                instance_details.freight = response.freight ? response.freight :[] ;
                instance_details.freightChargeType = response.freightChargeType ? response.freightChargeType :[];
                instance_details.mopMargin = response.mopMargin ? response.mopMargin : 0 ;
                instance_details.deliveryDate = response.deliveryDate || {};
                instance_details.token = response.token? response.token : false;
                instance_details.addItems = response.addItems? response.addItems : false;
                instance_details.attendance = response.attendance? response.attendance : false;
                instance_details.enableStocks = response.enableStocks? response.enableStocks : false;
                instance_details.enableFulfiller = response.enableFulfiller? response.enableFulfiller : false;
                instance_details.enableQuotations = response.enableQuotations? response.enableQuotations : false;
                instance_details.enableOrdersEmail = response.enableOrdersEmail? response.enableOrdersEmail : false;
                instance_details.editByRoles = response.dealerEdit ? response.dealerEdit : {};
                instance_details.invoiceID = response.invoiceID || 'INV';
                instance_details.paymentModes = response.paymentMode;
                instance_details.dealerEdit = response.dealerEdit || [];
                instance_details.countryCode = response.countryCode || '+91';
                instance_details.leadStatus = response.leadStatus || [];
                instance_details.leadSource = response.leadSource || [];
                instance_details.companyLatitude = response.companyLatitude || '';
                instance_details.companyLongitude = response.companyLongitude || '';
                instance_details.gMapAPI = response.gMapAPI || 'AIzaSyAPs4yVp42Ko_GzD7jUX6mBxFIQT-Ryguo';
                instance_details.companyAddress = response.companyAddress || '';
                instance_details.companyCity = response.companyCity || '';
                instance_details.companyState = response.companyState || '';
                instance_details.customNames = response.customNames || '';
                instance_details.dealerNotificationFlag = response.dealerNotificationFlag || '';
                instance_details.dealerAsUserFlag = response.dealerAsUserFlag || false;
                instance_details.recordPaymentFlag = response.recordPayment || false;
                instance_details.editItemPrice = response.editItemPrice || false;
                instance_details.percentageDiscount=response.percentageDiscount || false;
                instance_details.csv_upload_date = response.csv_upload_date
                $scope.taxExclusive = instance_details.taxExclusive;
                // $scope.leadstatus=response.leadStatus || [];
                // if($scope.leadStatus.length){
                //     $scope.RenderLeadData();
                //
                // }
                //.... Set the Instance's Wizard...
                $scope.instance_details.setupCheck = response.setupCheck;
                if(!$scope.instance_details.companyEmail){
                    $scope.instance_details.companyEmail = 'support@B2BOMS.com';
                }
                if(!response.setupCheck || response.setupCheck < 4)
                    $scope.getAccountDataCount();
                Settings.setInstance(instance_details);
                //.... All the email configuration is set here....!!!
                email.company_name = response.company_name;
                email.from = response.from;
                email.cc = response.cc;
                email.contact_number = response.support_contact_number;
                email.support_email = response.support_email;
                email.company_logo_url = response.company_logo_url;
                email.company_description = response.company_description;
                email.company_website_url = response.company_website_url;
                if(response.tax && response.tax.length){
                    for(var i = 0; i < response.tax.length; i++){
                        if(response.tax[i].default){
                            defaultTaxObj = response.tax[i];
                            break;
                        }
                    }
                }
                Settings.setEmailConfig(instance_details);
            }else
                $window.location.href = '/404';
        })
        .error(function(error, status){
            console.log(error, status);
            if(status >= 400 && status < 500)
                $window.location.href = '/404';
            else if(status >= 500)
                $window.location.href = '/500';
        });
    $http.get("/country/countryCode").
        then(function (res) {
            if(res.data){
                $scope.countryCode = res.data;
            }
        }, function(error, status){
            console.log(error, status);
            if(status >= 400 && status < 500)
                $window.location.href = '/404';
            else if(status >= 500)
                $window.location.href = '/500';
        });
    $http.get('/dash/enforce/orderInventory/fetch').then(function (response){
            if(response.data.length){
                $scope.enforceInventoryOrder = response.data[0].enforceInventoryOrder || false;
                Settings.setInventoryOrderConfig($scope.enforceInventoryOrder);
            }
        }, function(error, status){
            console.log(error, status);
            if(status >= 400 && status < 500)
                $window.location.href = '/404';
            else if(status >= 500)
                $window.location.href = '/500';
        });
    $http.get('/dash/settings/standard/fulfilment').then(function (response){
        if(response.data.length){
            $scope.standardOrderFulfilFlag = response.data[0].standardOrderFulfilFlag || false;
            Settings.setStandredOrderFulfilmentConfig($scope.standardOrderFulfilFlag);
        }
    }, function(error, status){
        console.log(error, status);
        if(status >= 400 && status < 500)
            $window.location.href = '/404';
        else if(status >= 500)
            $window.location.href = '/500';
    });
    Settings.getUserInfo(function(user_details){
        $scope.user = user_details;
    });
    $scope.getRole = function(role){
        let temp = role;
        if(role){
            if($scope.nav[4] && $scope.nav[4].roles){
                for (let i = 0 ; i < $scope.nav[4].roles.length ; i++){
                    if($scope.nav[4].roles[i].role.toUpperCase() == role.toUpperCase()){
                        temp = $scope.nav[4].roles[i].name;
                        break;
                    }
                }
            }
        }else
            temp = "Portal Admin";
        return temp ;
    };
    const statusCountInit = () => {
        // $http.post('/dash/orders/status/count', searchObj)
        // .success(function (response) {
        //     $scope.OrderStausCount = {};
        //     $scope.OrderStausCount['total'] = 0;
        //     $scope.OrderStausCount['others'] = 0;
        //     if($scope.nav[1])
        //         $scope.OrderStausCount[$scope.nav[1].status[0]] = 0;
        //     else $scope.OrderStausCount['new'] = 0;
        //     if(response){
        //         $scope.OrderStausCount = response; // before all data we are fetching later here we are calculating now it is calculating in DB
        //         // if(response.length){
        //         //     $scope.OrderStausCount['total'] = response.length ;
        //         //     $scope.OrderStausCount['others'] = 0
        //         //     if($scope.nav[1].status.length){
        //         //         for(var i=0;i < $scope.nav[1].status.length;i++){
        //         //             $scope.OrderStausCount[($scope.nav[1].status[i].toLowerCase())] = 0
        //         //         }
        //         //     }
        //         //     for(var j= 0;j < response.length;j++){
        //         //         if(response[j].status[0] == null || response[j].status[0] == '' || !response[j].status[0] ){
        //         //             $scope.OrderStausCount[($scope.nav[1].status[0].toLowerCase())] = $scope.OrderStausCount[$scope.nav[1].status[0].toLowerCase()] +1 ;
        //         //         }
        //         //         else{
        //         //             if(typeof(response[j].status[0])!='number'){
        //         //                 $scope.OrderStausCount[(response[j].status[0].toLowerCase())] += 1 ;
        //         //                 if(!$scope.OrderStausCount[(response[j].status[0].toLowerCase())]){
        //         //                     $scope.OrderStausCount['others'] += 1 ;
        //         //                 }
        //         //             }
        //         //         }
        //         //
        //         //     }
        //         // }
        //     }
        // })
        // .error(function(error, status){
        //     console.log(error, status);
        //     if(status >= 400 && status < 404)
        //         $window.location.href = '/404';
        //     else if(status >= 500)
        //         $window.location.href = '/500';
        //     else
        //         $window.location.href = '/404';
        // })
    }
    Settings.getNav(false, function(nav_details){
        if(nav_details){
            $scope.nav = nav_details;
        }else{
            $scope.nav = [
                {
                    activated: true,
                    cols:["New Orders", "Catalogs","Distributors", "Employees", "Provisioned Devices"],
                    flag: true,
                    tab: "Overview",
                    taborder: 0
                },
                {
                    activated: true,
                    cols : ["Date", "Order ID","source","Seller Name","Dealer Name","Lines","Qty","Stockist","total","Action","Payment Status","Fulfillment Status"],
                    display: ["DATE", "ORDERID","TYPE","SALESPERSON","CUSTOMER","LINE","QUANTITY","STOCKIST","TOTAL","STATUS","PAYMENT STATUS","FULFILLMENT STATUS"],
                    flag: true,
                    fulfillmentstatus : ["unfulfilled", "partially fulfilled","fulfilled"],
                    paymentstatus : ["unpaid","partially paid","paid"],
                    status : ["new","open","closed"],
                    tab: "Orders",
                    taborder: 1,
                    "order_details" : ["Sl#", "Item Code", "Item Name", "Qty", "List Price", "Order Price", "Discount Applied(%)", "List Total", "Order Total", "Fulfiller", "Delivery Date", "Status"]
                },
                {
                    activated: true,
                    cols : ["Dealercode","DealerName","Phone","Address","City","Seller","SellerName"],
                    display : ["CUSTOMER CODE","CUSTOMER NAME","CUSTOMER PHONE","ADDRESS","CITY","SALESPERSON PHONE","SALESPERSON NAME"],
                    flag: true,
                    tab: "Customers",
                    taborder: 2
                },
                {
                    activated: true,
                    cols : ["itemCode", "Product", "Pack", "Manufacturer", "Qty", "MRP", "Specials"],
                    display : ["ITEMCODE", "ITEM", "DESCRIPTION", "CATEGORY", "MIN.QTY", "PRICE", "DISCOUNT"],
                    flag: true,
                    tab: "Catalog",
                    taborder: 3
                },
                {
                    activated: true,
                    cols :  ["userAccess", "sellerid", "sellername", "sellerphone", "email", "role", "manager", "Action"],
                    display : ["STATUS", "ID", "NAME", "PHONE NUMBER", "EMAIL", "ROLE", "MANAGED BY", "OPTIONS"],
                    roles :  [{
                        "name": "Admin",
                        "role": "Admin",
                        "status": true
                    }, {
                        "name": "Salesperson",
                        "role": "Salesperson",
                        "status": true
                    }, {
                        "name": "Stockist",
                        "role": "Stockist",
                        "status": true
                    }, {
                        "name": "Dealer",
                        "role": "Dealer",
                        "status": true
                    }, {
                        "name": "Portal Access",
                        "role": "Portal",
                        "status": true
                    }, {
                        "name": "Fulfiller",
                        "role": "Fulfiller",
                        "status": true
                    }, {
                        "name": "Manager",
                        "role": "Manager",
                        "status": true
                    }, {
                        "name": "Branch Role",
                        "role": "BranchManager",
                        "status": true
                    }],
                    flag: true,
                    tab: "Users",
                    taborder: 4
                },
                {
                    activated: true,
                    cols : ["Info", "Action"],
                    flag: true,
                    tab: "Settings",
                    taborder: 5
                },
                {
                    activated: false,
                    cols : ["User ID", "Platform", "Device", "Registration Date", "Last Access Date", "State"],
                    flag: true,
                    tab: "Devices",
                    taborder: 6,
                },
                {
                    activated: true,
                    cols : ["SALESPERSON PHONE", "DATE_TIME", "MESSAGE"],
                    flag: true,
                    tab: "SMS",
                    taborder: 7
                },
                {
                    activated: true,
                    cols : [{
                        "reportTab": 1,
                        "tabName": "Top Sold",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 2,
                        "tabName": "Top Customers",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 3,
                        "tabName": "Top Users",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 4,
                        "tabName": "Summary",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 5,
                        "tabName": "Payments",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 6,
                        "tabName": "Check Ins",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 7,
                        "tabName": "Expenses",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 8,
                        "tabName": "Meetings",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 9,
                        "tabName": "Items Not Billed",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 10,
                        "tabName": "Visits",
                        "enabled": false,
                        "flag" : true
                    }, {
                        "reportTab": 11,
                        "tabName": "Attendance",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 12,
                        "tabName": "Quotations",
                        "enabled": false,
                        "flag" : true
                    }, {
                        "reportTab": 13,
                        "tabName": "Employee Time",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 14,
                        "tabName": "Over All Reports",
                        "enabled": true,
                        "flag" : true
                    }, {
                        "reportTab": 15,
                        "tabName": "Top Enquired",
                        "enabled": false,
                        "flag" : true
                    }, {
                        "reportTab": 16,
                        "tabName": "Target v/s Achievement",
                        "enabled": false,
                        "flag" : true
                    }, {
                        "reportTab": 19,
                        "tabName": "Distribution Report",
                        "enabled": false,
                        "flag" : true
                    },{
                        "reportTab": 21,
                        "tabName": "Check Ins Distance Calculation",
                        "enabled": false,
                        "flag" : true
                    }],
                    flag: true,
                    tab: "Reports",
                    taborder: 8
                },
                {
                    activated: false,
                    cols :["Date", "Order ID", "Seller Name", "Dealer Name", "total"],
                    display : ["DATE", "QUOTATION ID", "SALESPERSON", "STORE", "QUANTITY", "TOTAL"],
                    flag: false,
                    tab: "Quotations",
                    taborder: 9
                },
                {
                    activated: true,
                    flag: true,
                    tab: "Stock In Channel",
                    taborder: 12
                },
                {
                    activated: true,
                    flag: true,
                    tab: "Inventory",
                    taborder: 13
                },
                {
                    activated: true,
                    flag: true,
                    tab: "Archive Orders",
                    taborder: 14
                },
                {
                    activated: true,
                    flag: true,
                    tab: "Maps",
                    taborder: 17
                },
                {
                    activated: true,
                    flag: true,
                    tab: "Walk-in Sale",
                    taborder: 22
                }
            ]
        }
        if($scope.nav[1]){
            if(!$scope.nav[1].paymentstatus){
                $scope.nav[1].paymentstatus = ["pending","approved","failed"];
            }
        }
        if(!$scope.nav[1].status){
            $scope.nav[1].status = ["new","open","closed"];
        }else{
            for(var i =0 ;i<$scope.nav[1].status.length;i++){
                $scope.orderStatus.push(($scope.nav[1].status[i].toLowerCase()))
            }
        }
        if($scope.nav[8]){
            $scope.reportTab = $scope.nav[8].cols;
            if($scope.nav[8].cols){
                for(var l = 0; l < $scope.nav[8].cols.length; l++) {
                    if($scope.nav[8].cols[l]){
                        if ($scope.nav[8].cols[l].enabled) {
                            $scope.enabledReports.push($scope.nav[8].cols[l]);
                        }
                    }
                }
            }
        }
        statusCountInit()
    });
    //Render Tenants
    $scope.renderSettings = function (response) {
        console.log("GetAll Settings -->" );
        //console.log(response);
        $scope.settings = response;
    };
    var sellerSearchObj = {};
    sellerSearchObj.viewLength = 0;
    sellerSearchObj.viewBy = 10;
    sellerSearchObj.searchFor = '';
    sellerSearchObj.searchBy = [];
    sellerSearchObj.userLoginDetails = $scope.user ;
    if($scope.applicationType == 'Atmosphere' && $scope.user.sellerObject) {
        sellerSearchObj.resort = $scope.user.sellerObject.Resort;
    }
    $scope.refreshNotification = function(){
        $http.get("/dash/notification/counts").then(function(response) {
            if (response.data) {
                $scope.unread_notification_count = response.data;
            }
        }, function(error, status){
            console.log(error, status);
            if(status >= 400 && status < 500)
                $window.location.href = '/404';
            else if(status >= 500)
                $window.location.href = '/500';
        });
        $http.get("/dash/notifications").then(function(response){
            if(response.data.length){
                $scope.notifications = response.data;
                var unread_notif = response.data;
                for(var i = 0; i < unread_notif.length; i ++){
                    for(j = 0; j < unread_notif[i].numbers.length; j++){
                        if(unread_notif[i].numbers[j].userphone === $scope.user.seller){
                            if(!unread_notif[i].numbers[j].read){
                                $scope.notifications[i].unread = true;
                            }
                        }
                    }
                }
            }
        }).catch(function(error, status){
            console.log(error, status);
            if(status >= 400 && status < 500)
                $window.location.href = '/404';
            else if(status >= 500)
                $window.location.href = '/500';
        });
    };
    $scope.formatDate = function(date){
        if(date==undefined || date == '')
            return ('');
        /* replace is used to ensure cross browser support*/
        var d = new Date(date.toString().replace("-","/").replace("-","/"));
        var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var dt = d.getDate();
        if(dt<10)
            dt = "0"+dt;
        var dateOut = dt+" - "+monthNames[d.getMonth()]+" - "+(d.getFullYear());
        return dateOut;
    }
    $scope.renderSellers = function (response) {
        // console.log(response)
        console.log("GetAll Users and Branches --> "+response.length);
        $scope.sellers = response;
        $scope.roleSalesrep = [];
        $scope.locSeller =[];
        $scope.roleAdmin = [];
        $scope.roleStockist = [];
        $scope.roleDealerPortalApp = [];
        $scope.roleManager = [];
        //create fulfillers list
        for(var i = 0; i < $scope.sellers.length; i++){
            if($scope.sellers[i].salesrep){
                $scope.roleSalesrep.push($scope.sellers[i]);
                if($scope.sellers[i].latitude)
                    $scope.locSeller.push($scope.sellers[i]);
            }
            //Admin list
            if($scope.sellers[i].admin){
                $scope.roleAdmin.push($scope.sellers[i]);
            }
            //Stockist list
            if($scope.sellers[i].stockist){
                $scope.roleStockist.push($scope.sellers[i]);
            }
            //Dealer list in sellers collection
            if($scope.sellers[i].dealer)
                $scope.roleDealerPortalApp.push($scope.sellers[i]);
        }
    };
    $http.post("/dash/users/list", sellerSearchObj)
        .success(function (res) {
            $scope.renderSellers(res);
            $scope.sellers = res;
        })
        .catch(function(error, status){
            console.log(error, status);
            if(status >= 400 && status < 500)
                $window.location.href = '/404';
            else if(status >= 500)
                $window.location.href = '/500';
        });
    $scope.markNotificationRead = function(notification_id){
        $http.put("/dash/read/notification", [notification_id]).then(function(response){
            if(response.data.status && response.data.status == "success"){
                $scope.refreshNotification();
            }
        }).catch(function(error, status){
            console.log(error, status);
            if(status >= 400 && status < 500)
                $window.location.href = '/404';
            else if(status >= 500)
                $window.location.href = '/500';
        });
    };
    //Order Id generator
    //Its picked up from the app code as thats what is been used by the apps to generate
    //order id. Its as is
    //... This function is generic and can be called from any controller....
    $scope.generateOrderId = function(){
        var date = new Date();
        var components = [
            date.getYear(),
            (date.getMonth() < 10)? '0' + date.getMonth() : date.getMonth(),
            (date.getDate() < 10)? '0' + date.getDate() : date.getDate(),
            (date.getHours() < 10)? '0' + date.getHours() : date.getHours(),
            (date.getMinutes() < 10)? '0' + date.getMinutes() : date.getMinutes(),
            (date.getSeconds() < 10)? '0' + date.getSeconds() : date.getSeconds(),
            (date.getMilliseconds() < 10)? '00' + date.getMilliseconds() : (date.getMilliseconds() < 100)? '0' + date.getMilliseconds() : date.getMilliseconds()
        ];
        var date_ = components.join("");
        //At app side, category is appended to the orderid
        // shreyas said , it was use case for patanjali and is not
        // needed for other company user. So sticking to date only as base
        // kind of order id is applied in portal
        // app  side category is - category[i].Category
        return date_;
    }//End of function to generate Order Id
    $scope.fetchRecentTranasctions = function () {
        //console.log('Fetch recent transactions for the last 7 days')
        recentTransactionFromServer = {};
        masterRecentTransactions = {};
        // console.log('sidemenu')
        $http.get('/dash/orders/recent/transactions').then(function (res) {
            recentTransactionFromServer = res.data; //Holds response from server for further use
            masterRecentTransactions = res.data; //Holds response for filtration
            recentorder = res.data;
            $(document).ready(function() {
                $('.recentTransaction').find('#overall-tab').trigger('click');
            });
            $scope.recentTransactionType = 'all';
            renderRecentTransactions(res.data);
        })
    }
    function renderRecentTransactions(res) {
        var dates = [];
        for (var i = 0; i < res.length; i++) {
            dates.push({'date': $scope.formatDate(res[i].date_added[0])})
        }
        var uniqueDates = dates.unique('date');
        $scope.allRecent = [];
        for (var i = 0; i < uniqueDates.length; i++) {
            var tempObj = {};
            tempObj.date = uniqueDates[i].date;
            tempObj.transaction = [];
            tempObj.value = 0;
            for (var j = 0; j < res.length; j++) {
                if (uniqueDates[i].date == $scope.formatDate(res[j].date_added[0])) {
                    if(res[j].type[0] == 'Order'){
                        if(res[j].source[0] == "Pos")
                            res[j].order_type = "Sale";
                        else
                            res[j].order_type = "Order";
                    }
                    tempObj.transaction.push(res[j]);
                    if (res[j].type == 'Payment') { //Caluclate total payment received for a day
                        tempObj.value += Number(res[j].quantity[0]);
                    }
                    if (res[j].type[0] == 'Order') { //Calculate Order value for a day
                        tempObj.value += Number(res[j].orderTotal_amount[0]);
                    }
                }
            }
            $scope.allRecent.push(tempObj);
        }
    }
    $scope.fetchRecentTranasctions();
    $scope.filterRecentTransaction = function (id) {
        switch (id) {
            case 0 :
                $scope.recentTransactionType = 'all';
                $scope.allRecent = [];
                console.log(masterRecentTransactions)
                renderRecentTransactions(masterRecentTransactions);
                break;
            case 1:
                $scope.recentTransactionType = 'order';
                $scope.allRecent = [];
                var temp = [];
                for (var i = 0; i < masterRecentTransactions.length; i++) {
                    if (masterRecentTransactions[i].type[0] == 'Order'){
                        if(masterRecentTransactions[i].source[0] != "Pos"){
                            masterRecentTransactions[i].order_type = "Order";
                            temp.push(masterRecentTransactions[i]);
                        }
                    }
                }
                renderRecentTransactions(temp);
                break;
            case 2:
                $scope.recentTransactionType = 'payment';
                $scope.allRecent = [];
                var temp = [];
                for (var i = 0; i < masterRecentTransactions.length; i++) {
                    if (masterRecentTransactions[i].type[0] == 'Payment')
                        temp.push(masterRecentTransactions[i]);
                }
                renderRecentTransactions(temp);
                break;
            case 3:
                $scope.recentTransactionType = 'checkIn';
                $scope.allRecent = [];
                var temp = [];
                for (var i = 0; i < masterRecentTransactions.length; i++) {
                    if (masterRecentTransactions[i].type[0] == 'Check_In')
                        temp.push(masterRecentTransactions[i]);
                }
                renderRecentTransactions(temp);
                break;
            case 4:
                $scope.recentTransactionType = 'attendance';
                $scope.allRecent = [];
                var temp = [];
                for (var i = 0; i < masterRecentTransactions.length; i++) {
                    if (masterRecentTransactions[i].type[0] == 'Attendance')
                        temp.push(masterRecentTransactions[i]);
                }
                renderRecentTransactions(temp);
                break;
            case 5:
                $scope.recentTransactionType = 'sale';
                $scope.allRecent = [];
                var temp = [];
                for (var i = 0; i < masterRecentTransactions.length; i++) {
                    if (masterRecentTransactions[i].type[0] == 'Order'){
                        if(masterRecentTransactions[i].source[0] == "Pos"){
                            masterRecentTransactions[i].order_type = "Sale";
                            temp.push(masterRecentTransactions[i]);
                        }
                    }
                }
                renderRecentTransactions(temp);
                break;
        }
    };
    $scope.filterTransactionBySeller = function (user) {
        console.log(user)
        if (user) {
            masterRecentTransactions = [];
            console.log(recentTransactionFromServer)
            for (var i = 0; i < recentTransactionFromServer.length; i++) {
                if (recentTransactionFromServer[i].seller == user.sellerphone + "" || recentTransactionFromServer[i].seller == Number(user.sellerphone))
                    masterRecentTransactions.push(recentTransactionFromServer[i]);
            }
            $scope.filterRecentTransaction(0);
        }
        else {
            masterRecentTransactions = recentTransactionFromServer;
            $scope.filterRecentTransaction(0);
        }
    }
    var searchObj = {};
    $scope.refreshNotification();
    /*....
     Jini Saas - Wizard Setup....
     ..*/
    // ................................ Jini - Saas functions ....................................
    //....... Jini Saas : get users, items and stores count.........
    $scope.getAccountDataCount = function() {
        $http.get("/dash/wizard/progress")
            .success(function (res) {
                console.log("Account Details -->>> ", res);
                $scope.account ={};
                $scope.account.setupCheck = 0;
                $scope.account.usersCount = res.users;
                $scope.account.itemsCount = res.items;
                $scope.account.storesCount = res.stores;
                if(res.userSkip){
                    $scope.account.userSkip = res.userSkip;
                }
                if(res.itemSkip){
                    $scope.account.itemSkip = res.itemSkip;
                }
                if(res.storeSkip){
                    $scope.account.storeSkip = res.storeSkip;
                }
                if(res.users || res.userSkip)
                    $scope.account.setupCheck += 1;
                if(res.items || res.itemSkip)
                    $scope.account.setupCheck += 1;
                if(res.stores || res.storeSkip)
                    $scope.account.setupCheck += 1;
                if(res.orders)
                    $scope.account.setupCheck += 1;
                $http.put("/dash/wizard/step/update", $scope.account)
                    .success(function (response) {
                        if(response.n){
                            $scope.instance_details.setupCheck = $scope.account.setupCheck;
                        }
                    });
            });
    };
    $scope.skip = function(data){
        $http.put("/dash/wizard/step/update", data)
            .success(function (response) {
                if(response.n){
                    $scope.getAccountDataCount()
                }
            });
    };
    $scope.getNumber = new Array(5);
    $scope.userAdded = [];
    $scope.itemAdded = [];
    $scope.storeAdded = [];
    $scope.newSellers = [];
    $scope.newItems = [];
    $scope.newStores = [];
    $scope.accountSettings = {};
    $scope.showSetup4 = false;
    $scope.tempSeller = {};
    $scope.tempItem = {};
    $scope.tempCust = {};
    $scope.sellerDataAdded = function(value,data,index){
        if(index == 0){
            if(value && data){
                if(value == 'email' && data){
                    $scope.tempSeller.email = data
                }
                if(value == 'role' && data){
                    $scope.tempSeller.role = data
                }
            }
            else{
                // console.log("no data");
                if(value == 'email'){
                    $scope.tempSeller.email = ''
                }
                if(value == 'role'){
                    $scope.tempSeller.role = ''
                }
            }
        }
    };
    $scope.addTeamMembers = function(allSellers) {
        //  console.log("Add team member")
        $scope.disableAddSellers = true;
        var tempSeller = [];
        var tempPhone = [];
        var seller = [];
        for(var i=0;i<allSellers.length;i++){
            if(allSellers[i]){
                if(allSellers[i].email == undefined && allSellers[i].role == undefined  && allSellers[i].sellerphone == undefined ){
                    allSellers.splice(i,1);
                }
            }
        }
        for(var i=0;i<allSellers.length;i++){
            if(allSellers[i]){
                if(allSellers[i].email && allSellers[i].role) {
                    seller.push(allSellers[i]);
                    if (i == allSellers.length - 1) {
                        // console.log(seller);
                        if (seller.length) {
                            for (var k = 0; k < seller.length; k++) {
                                if (seller[k]) {
                                    if (tempSeller.includes(seller[k].email)) {
                                        $scope.disableAddSellers = false;
                                        Settings.failurePopup("ERROR", "Email ID already exists");
                                            /*bootbox.alert({
                                            title: 'ERROR',
                                            message: seller[k].email + " Email ID already exists",
                                            className: 'text-center'
                                        });*/
                                        break;
                                    } else if (tempPhone.includes(seller[k].sellerphone)) {
                                        $scope.disableAddSellers = false;
                                        Settings.failurePopup("ERROR", seller[k].sellerphone + " Phone number already exists");
                                        /*bootbox.alert({
                                            title: 'ERROR',
                                            message: seller[k].sellerphone + " Phone number already exists",
                                            className: 'text-center'
                                        });*/
                                        break;
                                    } else {
                                        if (seller[k].sellerphone) {
                                            tempPhone.push(seller[k].sellerphone);
                                        }
                                        if (seller[k].email) {
                                            tempSeller.push(seller[k].email);
                                        }
                                        seller[k].userStatus = "Active";
                                        seller[k].showOperations = true;
                                        seller[k].portal = true;
                                        seller[k].sellerphone = parseFloat(seller[k].sellerphone) ? parseFloat(seller[k].sellerphone) : '';
                                        seller[k].sellerid = parseFloat(seller[k].sellerphone) ? parseFloat(seller[k].sellerphone) : '';
                                        // seller[k].email = seller.email;
                                        seller[k].setupEmail = true;
                                        seller[k].member = $scope.memberdetails.full_name;
                                        //seller[k].countryCode = "+91";
                                        var date1 = new Date();
                                        seller[k].date_added = [date1.getFullYear(), (date1.getMonth() + 1).padLeft(), date1.getDate().padLeft()].join('-') + ' '
                                            + [date1.getHours().padLeft(), date1.getMinutes().padLeft(), date1.getSeconds().padLeft()].join(':');
                                        if (seller[k].role == "Salesperson") {
                                            seller[k].salesrep = true;
                                            seller[k].role = "Salesperson"
                                        } else if (seller[k].role == "Admin") {
                                            seller[k].admin = true;
                                            seller[k].role = "Admin"
                                        }
                                        if (k == seller.length - 1) {
                                            $http.post("/dash/wizard/users", seller)
                                                .success(function (response) {
                                                    console.log("Create -->" + response);
                                                    $scope.disableAddSellers = false;
                                                    Settings.success_toast("SUCCESS", "User Added successfully");
                                                    document.getElementById("addUsers").style.display = "none";
                                                    //hide the modal
                                                    $('body').removeClass('modal-open');
                                                    //modal-open class is added on body so it has to be removed
                                                    $('.modal-backdrop').remove();
                                                    //toastr.success('User Added successfully')
                                                    /*jQuery.noConflict();
                                                    $('#addUsers').modal('hide');*/
                                                    $scope.getAccountDataCount();
                                                });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else{
                    console.log("data not available");
                    if(!allSellers[i].email){
                        $scope.disableAddSellers = false;
                        Settings.failurePopup("ERROR", "Please enter valid Email ID");
                        /*bootbox.alert({
                            title: 'ERROR',
                            message: "Please enter valid Email ID",
                            className: 'text-center'
                        });*/
                        break;
                    }
                    if(!allSellers[i].role){
                        $scope.disableAddSellers = false;
                        Settings.failurePopup("ERROR", "Please select role");
                        /*bootbox.alert({
                            title: 'ERROR',
                            message: "Please select role",
                            className: 'text-center'
                        });*/
                        break;
                    }
                }
            }
        }
    };
    $scope.itemDataAdded = function(value,data,index){
        if(index == 0){
            if(value && data){
                if(value == 'Product' && data){
                    $scope.tempItem.Product = data
                }
                if(value == 'MRP' && data){
                    $scope.tempItem.MRP = data
                }
            }
            else{
                if(value == 'Product'){
                    $scope.tempItem.Product = ''
                }
                if(value == 'MRP'){
                    $scope.tempItem.MRP = ''
                }
            }
        }
    };
    $scope.addCatalogData = function(data){
        /* console.log("addd item funt");
         console.log(data);*/
        $scope.disableAddItems=true;
        for(var j=0;j<data.length;j++) {
            if (data[j].Product == undefined && data[j].MRP == undefined) {
                data.splice(j, 1);
            }
        }
        if(data.length){
            for(var j=0;j<data.length;j++){
                if(data[j] && data[j].Product) {
                    (function (j) {
                        data[j].itemCode = 1001 + j;
                        data[j].Qty = 0;
                        data[j].Specials = 0;
                        data[j].gst = defaultTaxObj;
                        data[j].Manufacturer = 'DEFAULT';
                        data[j].subCategory = 'DEFAULT';
                        // data[j].Product = data[j].Product;
                        data[j].MRP = data[j].MRP? data[j].MRP :0;
                        data[j].cloudinaryURL = [];
                        data[j].looseQty = false;
                        if(j == data.length -1){
                            $http.post("/dash/wizard/items", data)
                                .success(function (res) {
                                    //console.log(res)
                                    if (res) {
                                        $scope.disableAddItems=false;
                                        Settings.success_toast("SUCCESS", "Successfully added..!");
                                        document.getElementById("addItems").style.display = "none";
                                        //hide the modal
                                        $('body').removeClass('modal-open');
                                        //modal-open class is added on body so it has to be removed
                                        $('.modal-backdrop').remove();
                                        //toastr.success("Successfully added..!");
                                        /*jQuery.noConflict();
                                        $('#addItems').modal('hide');*/
                                        $scope.getAccountDataCount()
                                    } else {
                                        $scope.disableAddItems=false;
                                        Settings.alertPopup("ERROR", "Failed to add. Please try again later");
                                        //bootbox.alert("Failed to add. Please try again later");
                                    }
                                })
                        }
                    })(j);
                }
                else{
                    $scope.disableAddItems=false;
                    Settings.failurePopup("ERROR", "Please enter Product Name");
                        /*bootbox.alert({
                        title: 'ERROR',
                        message: "Please enter Product Name",
                        className: 'text-center'
                    });*/
                }
            }
        }
        else{
            $scope.disableAddItems=false;
            console.log("no items added")
        }
    }
    $scope.customerDataAdded = function(value,data,index){
        if(index == 0){
            if(value && data){
                if(value == 'DealerName' && data){
                    $scope.tempCust.DealerName = data
                }
                if(value == 'Phone' && data){
                    $scope.tempCust.Phone = data
                }
            }
            else{
                if(value == 'DealerName'){
                    $scope.tempCust.DealerName = ''
                }
                if(value == 'Phone'){
                    $scope.tempCust.Phone = ''
                }
            }
        }
    }
    $scope.addCustomerData = function (dealer) {
        for(var m=0;m<dealer.length;m++) {
            if (dealer[m].DealerName == undefined && dealer[m].Phone == undefined) {
                dealer.splice(m, 1);
            }
        }
        if(dealer.length){
            $scope.disableAddDealers = true;
            for(var m=0;m<dealer.length;m++){
                if(dealer[m] && dealer[m].DealerName && dealer[m].Phone){
                    (function(m){
                        dealer[m].Dealercode = 1001 + m;
                        dealer[m].Phone = Number(dealer[m].Phone) ;
                        dealer[m].DealerName = dealer[m].DealerName.substr(0,1).toUpperCase() + dealer[m].DealerName.substr(1);
                        dealer[m].addedBy = $scope.memberdetails.email ;
                        dealer[m].cloudinaryURL = [];
                        dealer[m].doccloudinaryURL = [];
                        if(m == dealer.length -1){
                            $http.post("/dash/wizard/customers", dealer)
                                .success(function (res) {
                                    $scope.disableAddDealers = false;
                                    Settings.success_toast("SUCCESS", "Customers Successfully added..!");
                                    document.getElementById("addCustomers").style.display = "none";
                                    //hide the modal
                                    $('body').removeClass('modal-open');
                                    //modal-open class is added on body so it has to be removed
                                    $('.modal-backdrop').remove();
                                    //toastr.success("Customers Successfully added..!");
                                    /*jQuery.noConflict();
                                    $('#addCustomers').modal('hide');*/
                                    $scope.getAccountDataCount()
                                })
                        }
                    })(m);
                }
                else{
                    if(!dealer[m].Phone){
                        $scope.disableAddDealers = false;
                        Settings.failurePopup("ERROR", "Please enter valid Customer Phone number");
                        /*bootbox.alert({
                            title: 'ERROR',
                            message: "Please enter valid Customer Phone number",
                            className: 'text-center'
                        });*/
                        break;
                    }
                    if(!dealer[m].DealerName){
                        $scope.disableAddDealers = false;
                        Settings.failurePopup("ERROR", "Please enter Customer name");
                        /*bootbox.alert({
                            title: 'ERROR',
                            message: "Please enter Customer name",
                            className: 'text-center'
                        });*/
                        break;
                    }
                }
            }
        }
        else{
            $scope.disableAddDealers = false;
            console.log("no dealers")
        }
    };
    $scope.goToSettings = function (){
        $location.path('/settings')
    }
    const updateWizardSetup = () => {
        $scope.accountSettings.setupCheck = 4;
        $http.put("/dash/wizard/step/update", $scope.accountSettings)
            .success(function (response) {
                if (response.n) {
                    $scope.showSetup4 = false;
                    $scope.instance_details.setupCheck = $scope.accountSettings.setupCheck;
                    $(document).ready(function() {
                        $('#setupComplete').modal();
                    });
                }
            });
    }
    $scope.completeSetup = function(){
        var image = [];
        if(document.getElementById('company_logo')){
            image = document.getElementById('company_logo').files;
        }
        if(!$scope.accountSettings.currency)
            $scope.accountSettings.currency = '₹';
        else $scope.currency = $scope.accountSettings.currency;
        if($scope.accountSettings.currency && $scope.accountSettings.companyEmail && !$scope.accountSettings.logo_url && image[0]) {
            var reader = new FileReader();
                reader.onloadend = function () {
                    var tempObj = {};
                    tempObj.image = reader.result;
                    $http.post("/dash/upload/logo", tempObj)
                        .success(function (err, logo) {
                            //console.log(logo);
                            console.log("Logo Uploaded!! ---->>>>> ");
                        })
                }
                reader.readAsDataURL(image[0]);
                updateWizardSetup();
        } else{
            updateWizardSetup();
        }
    }
    $scope.loadDemo = () => {
        $http.get("/dash/wizard/load/demo")
            .then((res) => {
                if(res && res.data){
                    console.log(res.data);
                    Settings.success_toast("Success", "Sample Data Loaded");
                    $scope.updateWizardSetup();
                }
            })
    }
    $scope.showLastSetup = function(){
        $scope.accountSettings.currency = '₹';
        $scope.showSetup4 = true;
    }
    /*====== common function for tax =======*/
    $scope.data = {
        "newOrderStore" : {}
    };
    $scope.taxSetups = {};
    $scope.taxSetups.otherSetup = '';
    //Ghana tax
    $scope.ghanaTax = {
        NHIL:2.5,
        GETL:2.5,
        VAT:15.9,
        VAT_VAL: 15,
        COVID : 1
    }
    $scope.getCalulatedTax = function(res,tab ,store,calculateigst){
        $scope.calculateIGST = calculateigst ? calculateigst :false;
        $scope.newOrderItemList = res;
        $scope.data.newOrderStore = store;
        $scope.newOrderTaxAmount = {};
        $scope.newOrderTaxAmount.totalTax = 0;
        $scope.newOrderTaxAmount.totalCGST = 0;
        $scope.newOrderTaxAmount.totalSGST = 0;
        $scope.newOrderTaxAmount.totalIGST = 0;
        $scope.newOrderExcTaxAmount = 0;
        $scope.newOrderTotalAmount = 0;
        $scope.newOrderMRPTotalAmount = 0;
        var grandTotalTax = 0;
        $scope.newOrderTaxAmount.totalOtherTaxes = [];
        $scope.newOrderOtherTaxesNames = [];
        var totalOtherTaxes = [];
        switch (tab){
            case 1: {
                if ($scope.newOrderItemList && $scope.newOrderItemList.length) {
                    for (var i = 0; i < $scope.newOrderItemList.length; i++) {
                        if ($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice) {
                            $scope.newOrderExcTaxNHIL = 0;
                            $scope.newOrderExcTaxGETL = 0;
                            $scope.newOrderExcTaxVAT = 0;
                            $scope.newOrderExcTaxCOVID = 0;
                            var mrp = parseFloat($scope.newOrderItemList[i].itemDetails.MRP);
                            var BulkPrice = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice);
                            var taxableMrp = parseFloat(BulkPrice / (100 + $scope.ghanaTax.NHIL + $scope.ghanaTax.GETL + $scope.ghanaTax.VAT + $scope.ghanaTax.COVID) * 100);
                            var listTexableMrp = parseFloat(mrp);
                            if ($scope.taxExclusive) {
                                var taxableMrp = parseFloat(BulkPrice);
                            } else {
                                var taxableMrp = parseFloat(BulkPrice / (100 + $scope.ghanaTax.NHIL + $scope.ghanaTax.GETL + $scope.ghanaTax.VAT + $scope.ghanaTax.COVID) * 100);
                            }
                            $scope.orderTotal = (Number($scope.newOrderItemList[i].quantity) * taxableMrp);
                            $scope.newOrderExcTaxAmount += $scope.orderTotal;
                            $scope.newOrderExcTaxNHIL = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.NHIL) / 100;
                            $scope.newOrderExcTaxGETL = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.GETL) / 100;
                            $scope.newOrderExcTaxVAT = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.VAT) / 100;
                            $scope.newOrderExcTaxCOVID = ($scope.newOrderExcTaxAmount * $scope.newOrderExcTaxCOVID )/100;
                            grandTotalTax = parseFloat($scope.newOrderExcTaxNHIL + $scope.newOrderExcTaxGETL + $scope.newOrderExcTaxVAT + $scope.newOrderExcTaxCOVID);
                            $scope.newOrderExcTaxNHIL = parseFloat($scope.newOrderExcTaxNHIL.toFixed(2));
                            $scope.newOrderExcTaxGETL = parseFloat($scope.newOrderExcTaxGETL.toFixed(2));
                            $scope.newOrderExcTaxVAT = parseFloat($scope.newOrderExcTaxVAT.toFixed(2));
                            if ($scope.calculateIGST) {
                                $scope.newOrderMRPTotalAmount = ($scope.newOrderExcTaxAmount + grandTotalTax);
                                $scope.newOrderMRPTotalAmount = $scope.newOrderMRPTotalAmount;
                                $scope.newOrderTotalAmount += ((listTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                            }
                            else {
                                $scope.newOrderMRPTotalAmount = ($scope.newOrderExcTaxAmount + grandTotalTax);
                                $scope.newOrderTotalAmount += ((listTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                            }
                            $scope.newOrderTaxAmount.totalTax += (parseFloat($scope.ghanaTax.NHIL / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat($scope.ghanaTax.GETL / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat($scope.ghanaTax.VAT / 100) * taxableMrp) + (parseFloat($scope.ghanaTax.COVID / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                            $scope.newOrderTaxAmount.totalCGST += (parseFloat($scope.ghanaTax.NHIL / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                            $scope.newOrderTaxAmount.totalSGST += (parseFloat($scope.ghanaTax.GETL / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                            $scope.newOrderTaxAmount.totalIGST += (parseFloat($scope.ghanaTax.VAT / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                            $scope.newOrderTaxAmount.totalCOVID += (parseFloat($scope.ghanaTax.COVID / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                        } else {
                            if (!$scope.taxSetups.otherSetup) {
                                $scope.newOrderExcTaxNHIL = 0;
                                $scope.newOrderExcTaxGETL = 0;
                                $scope.newOrderExcTaxVAT = 0;
                                $scope.newOrderExcTaxCOVID = 0;
                                var mrp = parseFloat($scope.newOrderItemList[i].itemDetails.MRP);
                                var orderMrp = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                                var taxableMrp = parseFloat(orderMrp / (100 + $scope.ghanaTax.NHIL + $scope.ghanaTax.GETL + $scope.ghanaTax.VAT + $scope.ghanaTax.COVID) * 100);
                                var listTexableMrp = parseFloat(mrp);
                                if ($scope.taxExclusive) {
                                    var taxableMrp = parseFloat(orderMrp);
                                } else {
                                    var taxableMrp = parseFloat(orderMrp / (100 + $scope.ghanaTax.NHIL + $scope.ghanaTax.GETL + $scope.ghanaTax.VAT + $scope.ghanaTax.COVID) * 100);
                                }
                                $scope.orderTotal = ($scope.newOrderItemList[i].quantity) * orderMrp;
                                $scope.newOrderExcTaxAmount += $scope.orderTotal;
                                $scope.newOrderExcTaxNHIL = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.NHIL) / 100;
                                $scope.newOrderExcTaxGETL = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.GETL) / 100;
                                $scope.newOrderExcTaxVAT = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.VAT) / 100;
                                $scope.newOrderExcTaxCOVID = ($scope.newOrderExcTaxAmount *  $scope.ghanaTax.COVID )/100;
                                grandTotalTax = parseFloat($scope.newOrderExcTaxNHIL + $scope.newOrderExcTaxGETL + $scope.newOrderExcTaxVAT + $scope.newOrderExcTaxCOVID);
                                $scope.newOrderExcTaxNHIL = parseFloat($scope.newOrderExcTaxNHIL.toFixed(2));
                                $scope.newOrderExcTaxGETL = parseFloat($scope.newOrderExcTaxGETL.toFixed(2));
                                $scope.newOrderExcTaxVAT = parseFloat($scope.newOrderExcTaxVAT.toFixed(2));
                                $scope.newOrderExcTaxCOVID = parseFloat($scope.newOrderExcTaxCOVID.toFixed(2));
                                if ($scope.calculateIGST) {
                                    $scope.newOrderMRPTotalAmount = ($scope.newOrderExcTaxAmount + grandTotalTax);
                                    $scope.newOrderMRPTotalAmount = $scope.newOrderMRPTotalAmount;
                                    $scope.newOrderTotalAmount += ((listTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                                }
                                else {
                                    $scope.newOrderMRPTotalAmount = ($scope.newOrderExcTaxAmount + grandTotalTax);
                                    $scope.newOrderTotalAmount += ((listTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                                }
                                $scope.newOrderTaxAmount.totalTax = grandTotalTax;
                                $scope.newOrderTaxAmount.totalCGST += (parseFloat($scope.ghanaTax.NHIL / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                                $scope.newOrderTaxAmount.totalSGST += (parseFloat($scope.ghanaTax.GETL / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                                $scope.newOrderTaxAmount.totalIGST += (parseFloat($scope.ghanaTax.VAT / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                                $scope.newOrderTaxAmount.totalCOVID += (parseFloat($scope.ghanaTax.COVID / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                            } else if ($scope.newOrderItemList[i].otherTaxes && $scope.newOrderItemList[i].otherTaxes.length) {
                                var sumOfTax = 0;
                                if (!$scope.newOrderOtherTaxesNames.length && $scope.newOrderItemList[i].otherTaxes) {
                                    $scope.newOrderOtherTaxesNames = $scope.newOrderItemList[i].otherTaxes;
                                }
                                for (var j = 0; j < $scope.newOrderItemList[i].otherTaxes.length; j++) {
                                    sumOfTax += $scope.newOrderItemList[i].otherTaxes[j].value;
                                }
                                var mrp = parseFloat($scope.newOrderItemList[i].itemDetails.MRP);
                                var orderMrp = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                                var taxableMrp = parseFloat(orderMrp / (100 + sumOfTax) * 100);
                                var listTexableMrp = parseFloat(mrp / (100 + sumOfTax) * 100);
                                if ($scope.taxExclusive) {
                                    var taxableMrp = parseFloat(orderMrp);
                                } else {
                                    var taxableMrp = parseFloat(orderMrp / (100 + sumOfTax) * 100);
                                }
                                if ($scope.calculateIGST) {
                                    $scope.newOrderMRPTotalAmount =(taxableMrp + (taxableMrp * ($scope.ghanaTax.NHIL / 100)) + (taxableMrp * ($scope.ghanaTax.GETL / 100)) + (taxableMrp * ($scope.ghanaTax.VAT / 100)) + (taxableMrp * ($scope.ghanaTax.COVID / 100))) * ($scope.newOrderItemList[i].quantity);
                                    $scope.newOrderTotalAmount += ((listTexableMrp + (mrp * (igst / 100))) * ($scope.newOrderItemList[i].quantity));
                                }
                                else {
                                    var sumOftaxableMrp = 0;
                                    var sumOflistTexableMrp = 0;
                                    var totalTax = 0;
                                    if ($scope.newOrderItemList[i].itemDetails.otherTaxes) {
                                        for (var j = 0; j < $scope.newOrderItemList[i].itemDetails.otherTaxes.length; j++) {
                                            sumOftaxableMrp += (taxableMrp * ($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value / 100));
                                            sumOflistTexableMrp += (listTexableMrp * ($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value / 100))
                                            $scope.newOrderTaxAmount.totalTax += (parseFloat($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                                            if (!totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name])
                                                totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = 0;
                                            totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] += (parseFloat($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                                            $scope.newOrderTaxAmount.totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name];
                                        }
                                    } else {
                                        for (var j = 0; j < $scope.newOrderItemList[i].otherTaxes.length; j++) {
                                            sumOftaxableMrp += (taxableMrp * ($scope.newOrderItemList[i].otherTaxes[j].value / 100));
                                            sumOflistTexableMrp += (listTexableMrp * ($scope.newOrderItemList[i].otherTaxes[j].value / 100))
                                            $scope.newOrderTaxAmount.totalTax += (parseFloat($scope.newOrderItemList[i].otherTaxes[j].value / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                                            if (!totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name])
                                                totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name] = 0;
                                            totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name] += (parseFloat($scope.newOrderItemList[i].otherTaxes[j].value / 100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                                            $scope.newOrderTaxAmount.totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name] = totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name];
                                        }
                                    }
                                    $scope.newOrderMRPTotalAmount += ((taxableMrp + sumOftaxableMrp  ) * ($scope.newOrderItemList[i].quantity));
                                    $scope.newOrderTotalAmount += ((listTexableMrp + sumOflistTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                                    $scope.newOrderMRPTotalAmount = $scope.newOrderMRPTotalAmount;
                                }
                                $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                                $scope.newOrderExcTaxAmount += $scope.orderTotal;
                            }
                        }
                    }
                    break;
                }
            }
            case 2:{
                for(var i=0; i<$scope.newOrderItemList.length; i++){
                    if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice){
                        var cgst = 0;
                        var sgst = 0;
                        var igst = 0;
                        cgst = $scope.newOrderItemList[i].CGST;
                        sgst = $scope.newOrderItemList[i].SGST;
                        igst = $scope.newOrderItemList[i].IGST;
                        var mrp = parseFloat($scope.newOrderItemList[i].itemDetails.MRP);
                        var BulkPrice = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice);
                        var taxableMrp = parseFloat(BulkPrice / (100 + cgst + sgst + igst) * 100);
                        var listTexableMrp = parseFloat(mrp / (100 + cgst + sgst + igst)* 100);
                        if($scope.taxExclusive){
                            var taxableMrp = parseFloat(BulkPrice);
                        }else{
                            var taxableMrp = parseFloat(BulkPrice / (100 + cgst + sgst + igst) * 100);
                        }
                        if($scope.calculateIGST){
                            $scope.newOrderMRPTotalAmount += ((taxableMrp +(taxableMrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                            $scope.newOrderTotalAmount += ((listTexableMrp +(mrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                        }
                        else{
                            $scope.newOrderMRPTotalAmount += ((taxableMrp +( (taxableMrp * (cgst/100)) + (taxableMrp *(sgst/100)))) * ($scope.newOrderItemList[i].quantity));
                            $scope.newOrderTotalAmount += ((listTexableMrp +( (listTexableMrp * (cgst/100)) + (listTexableMrp *(sgst/100)))) * ($scope.newOrderItemList[i].quantity));
                        }
                        $scope.newOrderTaxAmount.totalTax +=  (parseFloat(cgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat(sgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat(igst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                        $scope.newOrderTaxAmount.totalCGST += (parseFloat(cgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                        $scope.newOrderTaxAmount.totalSGST += (parseFloat(sgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                        $scope.newOrderTaxAmount.totalIGST += (parseFloat(igst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                        $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                        $scope.newOrderExcTaxAmount += $scope.orderTotal;
                    }else{
                        if(!$scope.taxSetups.otherSetup){
                            var cgst = 0;
                            var sgst = 0;
                            var igst = 0;
                            cgst = $scope.newOrderItemList[i].CGST;
                            sgst = $scope.newOrderItemList[i].SGST;
                            igst = $scope.newOrderItemList[i].IGST;
                            var mrp = parseFloat($scope.newOrderItemList[i].itemDetails.MRP);
                            var orderMrp = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                            var taxableMrp = parseFloat(orderMrp / (100 + cgst + sgst + igst) * 100);
                            var listTexableMrp = parseFloat(mrp / (100 + cgst + sgst + igst)* 100);
                            if($scope.taxExclusive){
                                var taxableMrp = parseFloat(orderMrp);
                            }else{
                                var taxableMrp = parseFloat(orderMrp / (100 + cgst + sgst + igst) * 100);
                            }
                            if($scope.calculateIGST){
                                $scope.newOrderMRPTotalAmount += ((taxableMrp +(taxableMrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                                $scope.newOrderTotalAmount += ((listTexableMrp +(mrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                            }
                            else{
                                $scope.newOrderMRPTotalAmount += ((taxableMrp +( (taxableMrp * (cgst/100)) + (taxableMrp *(sgst/100)))) * ($scope.newOrderItemList[i].quantity));
                                $scope.newOrderTotalAmount += ((listTexableMrp +( (listTexableMrp * (cgst/100)) + (listTexableMrp *(sgst/100)))) * ($scope.newOrderItemList[i].quantity));
                            }
                            $scope.newOrderTaxAmount.totalTax +=  (parseFloat(cgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat(sgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat(igst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                            $scope.newOrderTaxAmount.totalCGST += (parseFloat(cgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                            $scope.newOrderTaxAmount.totalSGST += (parseFloat(sgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                            $scope.newOrderTaxAmount.totalIGST += (parseFloat(igst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                            $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                            $scope.newOrderExcTaxAmount += $scope.orderTotal;
                        }else if($scope.newOrderItemList[i].otherTaxes && $scope.newOrderItemList[i].otherTaxes.length){
                            var sumOfTax = 0;
                            if(!$scope.newOrderOtherTaxesNames.length && $scope.newOrderItemList[i].otherTaxes){
                                $scope.newOrderOtherTaxesNames = $scope.newOrderItemList[i].otherTaxes;
                            }
                            for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                                sumOfTax += $scope.newOrderItemList[i].otherTaxes[j].value;
                            }
                            var mrp = parseFloat($scope.newOrderItemList[i].itemDetails.MRP);
                            var orderMrp = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                            var taxableMrp = parseFloat(orderMrp / (100 + sumOfTax) * 100);
                            var listTexableMrp = parseFloat(mrp / (100 + sumOfTax)* 100);
                            if($scope.taxExclusive){
                                var taxableMrp = parseFloat(orderMrp);
                            }else{
                                var taxableMrp = parseFloat(orderMrp / (100 + sumOfTax) * 100);
                            }
                            if($scope.calculateIGST){
                                $scope.newOrderMRPTotalAmount += ((taxableMrp +(taxableMrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                                $scope.newOrderTotalAmount += ((listTexableMrp +(mrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                            }
                            else{
                                var sumOftaxableMrp = 0;
                                var sumOflistTexableMrp = 0;
                                var totalTax = 0;
                                if($scope.newOrderItemList[i].itemDetails.otherTaxes){
                                    for(var j=0; j< $scope.newOrderItemList[i].itemDetails.otherTaxes.length; j++){
                                        sumOftaxableMrp += (taxableMrp * ($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100));
                                        sumOflistTexableMrp += (listTexableMrp * ($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100))
                                        $scope.newOrderTaxAmount.totalTax += (parseFloat($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                                        if(!totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name])
                                            totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = 0;
                                        totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name]+= (parseFloat($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                                        $scope.newOrderTaxAmount.totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name];
                                    }
                                }else{
                                    for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                                        sumOftaxableMrp += (taxableMrp * ($scope.newOrderItemList[i].otherTaxes[j].value/100));
                                        sumOflistTexableMrp += (listTexableMrp * ($scope.newOrderItemList[i].otherTaxes[j].value/100))
                                        $scope.newOrderTaxAmount.totalTax += (parseFloat($scope.newOrderItemList[i].otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                                        if(!totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name])
                                            totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name] = 0;
                                        totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name]+= (parseFloat($scope.newOrderItemList[i].otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                                        $scope.newOrderTaxAmount.totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name] = totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name];
                                    }
                                }
                                $scope.newOrderMRPTotalAmount += ((taxableMrp + sumOftaxableMrp  ) * ($scope.newOrderItemList[i].quantity));
                                $scope.newOrderTotalAmount += ((listTexableMrp + sumOflistTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                            }
                            $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                            $scope.newOrderExcTaxAmount += $scope.orderTotal;
                        }
                    }
                }
                break;
            }
        }
    }
})