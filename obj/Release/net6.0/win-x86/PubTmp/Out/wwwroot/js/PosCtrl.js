/**
 * Created by Akash on 11/03/20.
 */
angular.module('ebs.controller')
    .controller("PosCtrl",function ($scope, $filter, $http, $uibModal,$routeParams,Settings, $window, toastr, $interval,$sce,$mdDialog,$location) {
        console.log("Hello From OrdersDetailsCtrl order .... !!!!");
        var localViewBy = $scope.newViewBy;
        var initialViewBy = 60;
        var initialUserViewBy = 60;
        var viewBy = {};
        viewBy.items = 12;
        var itemSearchBy = ['itemCode', 'Product', 'Manufacturer', 'subCategory','subSubCategory'];
        var itemSearchObj = {};
        $scope.itemSearch= {};
        //$scope.nav = Settings.getNav();
        $scope.orders = [];
        $scope.newOrderItemList = []
        $scope.filter = {};
        $scope.CTOCT = 1;
        //Cart to catalogue
        $scope.CTTOC = 2;
        $scope.data = {};
        $scope.taxSetups = {};
        $scope.taxSetups.otherSetup = '';
        $scope.newOrderItem =  {}
        $scope.stepQuantity = 1;
        $scope.settings = {};
        var instanceDetails =  Settings.getInstance();
        $scope.settings.invoice = instanceDetails.invoice;
        $scope.dealerClasses = instanceDetails.dealerClass || [] ;
        $scope.country = {};
        $scope.default_CountryCode = '+91';
        // $scope.default_CountryCode = instanceDetails.countryCode;
        $scope.country.name = instanceDetails.country || 'India';
        $scope.currency = instanceDetails.currency || "₹";
        $scope.taxExclusive = instanceDetails.taxExclusive;
        $scope.posPaymentModel = {};
        $scope.posPaymentModel.Flag = false;
        $scope.tempCountryName = $scope.country.name.toLowerCase();
        $scope.houselocation = {};
        $scope.houselocation.loc = '';
        $scope.priceListView = {};
        $scope.itemSelectAll = {};
        $scope.userRole = $scope.nav[4].roles;
        $scope.posPaymentObj = {};
        $scope.posPaymentObj.mode = 'Cash';
        $scope.posPaymentObj.posOutstandingAmt = 0
        $scope.posPaymentObj.totalPaid = 0;
        $scope.checkout = {};
        $scope.checkout.flag  = false;
        $scope.item= {};
        $scope.item.category_selected = '';
        $scope.item.subCategory_selected = '';
        $scope.item.subSubCategory_selected = '';
        $scope.tempHouseLoc = {};
        $scope.tempHouseLoc.loc = '';
        $scope.countryCode = [];
        $scope.PosDealer = {};
        $scope.showCustomersDropdown = false;
        $scope.dealerAsUserFlag = "";
        $scope.posPaymentMode = [{'id':'Cash','path':'../../assets/images/orders/Cash.svg'},
            {'id':'Paytm','path':'../../assets/images/orders/Paytm.svg'},
            {'id':'PhonePe','path':'../../assets/images/orders/PhonePe.svg'},
            {'id':'Card','path':'../../assets/images/orders/Cards.svg'},
            {'id':'Net Bank', 'path':'../../assets/images/orders/Net Bank.svg'},
            {'id':'Others', 'path':''},
        ]
        // $scope.posPaymentMode = ['Cash','Paytm','Card','Online','Others'];
        var dealerSearchBy = ['Dealercode', 'DealerName', 'City', 'seller','SellerName', 'StockistName', 'Area', 'Phone', 'email'];
        $scope.filteredDealer = false;
        $scope.posSearch = {};
        $scope.posDiscount = {};
        $scope.posDiscount.value = '';
        var dealerSearchObj= {};
        $scope.orderTotalAmount = 0;
        $scope.dealer = {};
        var masterItems = [];
        var masterInventory = [];
        $scope.freight = {};
        $scope.filteredDealer = false;
        $scope.enforceInventoryOrder = Settings.getInventoryOrderConfig();
        $scope.tax = []; //Holds array of tax objects
        $scope.tax = instanceDetails.tax ? instanceDetails.tax : [];
        //Ghana tax
        $scope.ghanaTax = {
            NHIL:2.5,
            GETL:2.5,
            VAT:15.9,
            VAT_VAL: 15,
            COVID : 1
        };
        $scope.inventoryLocationFlag = false ;
        var user_details  = Settings.getUserInfo();
        console.log(user_details)
        var defaultTax ='';
        if($scope.tax.length){
            for(var i=0;i<$scope.tax.length;i++){
                if($scope.tax[i].default){
                    defaultTax = $scope.tax[i];
                }
            }
        }
        const startLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "inline");
        };
        const stopLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "none");
        }
        //Function which is used to initialize new order, on clicking add order or even
        //to clear order click
        //... Dynamic programming to get Role Name from Nav...
        $scope.countryCodeGet = function () {
            console.log('get country codes');
            $http.get("/country/countryCode").success(function (res) {
                if(res){
                    $scope.countryCode = res;
                }
            })
            $http.get("/dash/instanceDetails").success(function (res){
                $scope.dealerAsUserFlag  = res.dealerAsUserFlag;
            })
        };
        $scope.countryCodeGet();
        $scope.filterInventoryByLocation = function(){
            $scope.inventoryLocationUnique = [];
            $http.get('dash/inventory/location/filter').success(function(res){
                if(res.length){
                    $scope.inventoryLocationUnique = res;
                    $scope.inventoryLocationUnique = $scope.inventoryLocationUnique.filter(Boolean) ;
                    $scope.inventoryLocationUnique = $scope.inventoryLocationUnique.map(function(x){return (x + "").toUpperCase()}) ;
                }
                for(var i=0; i< $scope.warehouseLocation.length; i++){
                    $scope.inventoryLocationUnique.push($scope.warehouseLocation[i].name);
                }
                $scope.inventoryLocationUnique = Array.from(new Set($scope.inventoryLocationUnique));
                for(var i=0;i< $scope.inventoryLocationUnique.length; i++){
                    if($scope.inventoryLocationUnique[i] == ''){
                        $scope.inventoryLocationUnique.splice(i, 1);
                    }
                }
            }).catch(function(err){
                console.log(err)
            })
        };
        $scope.getWarehouseLocation = function(){
            $http.get("/dash/settings/inventory/locations").success(function(res){
                if(res.length){
                    $scope.warehouseLocation = res[0].location;
                    $scope.filterInventoryByLocation();
                }
            }).catch(function(err){
                console.log(err);
            })
        };
        $scope.getWarehouseLocation();
        //Function which is used to initialize new order, on clicking add order or even
        //to clear order click
        $scope.selectDealerpos = function (dealer) {
            $scope.PosDealer = dealer;
            $scope.data.newOrderStore = dealer;
            $scope.filteredDealer = true;
            $scope.showPosFilter = false;
            if($scope.data.newOrderStore.class && $scope.dealerClasses){
                for(var i=0;i<$scope.dealerClasses.length;i++){
                    if($scope.dealerClasses[i].name == $scope.data.newOrderStore.class){
                        $scope.orderPriceList = $scope.dealerClasses[i].priceList;
                    }
                }
            }
            if($scope.orderPriceList){
                $scope.clearFilter(2);
            }
        }
        $scope.posDealers = [];
        $scope.posPhoneFilter = function(){
            $scope.showCustomersDropdown = false;
            if($scope.PosDealer.Phone){
                var phone = $scope.PosDealer.Phone.toString();
                if(phone.length > 5){
                    dealerSearchObj.viewLength = 0;
                    dealerSearchObj.viewBy = initialViewBy;
                    if($scope.PosDealer.Phone){
                        var phone = $scope.PosDealer.Phone.toString();
                        dealerSearchObj.searchFor = phone;
                        dealerSearchObj.searchBy = dealerSearchBy;
                    }
                    $http.post('/dash/stores', dealerSearchObj)
                        .success(function(res){
                            if(res.length > 0){
                                $scope.filteredDealer = true;
                                $scope.showCustomersDropdown = true;
                                $scope.posDealers = res;
                            }else{
                                $scope.orderPriceList = '';
                                $scope.PosDealer.DealerName = '';
                                $scope.PosDealer.email = '';
                                $scope.PosDealer.Address = '';
                                $scope.PosDealer.Phone = parseInt($scope.PosDealer.Phone);
                                $scope.data.newOrderStore = '';
                                $scope.filteredDealer = false;
                            }
                        });
                }
            }else if($scope.PosDealer.Phone === undefined && $scope.PosDealer.Phone !== null){
                $scope.PosDealer.DealerName = '';
                $scope.PosDealer.email = '';
                $scope.PosDealer.Address = '';
            }else{
                $scope.orderPriceList = '';
                $scope.clearFilter(2);
                $scope.PosDealer = {};
                $scope.filteredDealer = false;
            }
        }
        $scope.selectPosDealer = function (dealer) {
            $scope.showCustomersDropdown = false;
            $scope.PosDealer.DealerName = dealer.DealerName;
            $scope.PosDealer.email = dealer.email;
            $scope.PosDealer.Address = dealer.Address;
            $scope.PosDealer.Phone = dealer.Phone;
            $scope.PosDealer.customerVariant = dealer.customerVariant?dealer.customerVariant:"regular"
            $scope.data.newOrderStore = $scope.PosDealer;
            $scope.filteredDealer = true;
            if($scope.data.newOrderStore.class && $scope.dealerClasses){
                for(var i=0;i<$scope.dealerClasses.length;i++){
                    if($scope.dealerClasses[i].name == $scope.data.newOrderStore.class){
                        $scope.orderPriceList = $scope.dealerClasses[i].priceList;
                    }
                }
            }
            if($scope.orderPriceList){
                $scope.clearFilter(2);
            }
        }
        $scope.selectCountryCodeInDropdown = function (countryCode) {
            if(countryCode){
                $scope.PosDealer = {};
                $scope.posDealers = [];
                $scope.PosDealer.countryCode = countryCode;
            }
        }
        $scope.discountCalculate = function(arg){
            $scope.discountMrp =  Number($scope.newOrderMRPTotalAmount) - (Number($scope.newOrderMRPTotalAmount) * Number(arg) / 100);
        }
        $scope.posGetDealer = [];
        $scope.posDealerSearchFilter = function(data) {
            jQuery.noConflict();
            $('.refresh').css("display", "inline");
            $scope.posGetDealer = [];
            if(data){
                $http.get("/dash/stores/search/"+data)
                    .success(function(res){
                        $scope.posGetDealer = res;
                        jQuery.noConflict();
                        $(".dealerDropdown").css('display', 'block');
                    })
                $scope.showPosFilter = true;
                if($scope.PosDealer.DealerName == ''){
                    $scope.PosDealer = $scope.dealer;
                    $scope.showPosFilter = false;
                }
                jQuery.noConflict();
                $(".refresh").css('display', 'none');
            }else{
                jQuery.noConflict();
                $(".refresh").css('display', 'none');
            }
        };
        $scope.posAddDealer = function(){
            $scope.dealer.DealerName = $scope.orderDetails[0].dealername;
            $scope.dealer.Phone = $scope.orderDetails[0].dealerphone;
            $scope.dealer.Address = $scope.orderDetails[0].Address;
            $scope.dealer.email = $scope.orderDetails[0].email;
            if($scope.orderDetails[0].dealercode){
                $scope.dealer.Dealercode = $scope.orderDetails[0].dealercode;
            }
            $scope.addDealer();
            $scope.addAsDealer = false;
        }
        $scope.addDealer = function (flag) {
            $scope.disableFlag = true;
            $scope.dealer.Phone = Number($scope.dealer.Phone);
            if($scope.dealer.DealerName && $scope.dealer.Phone){
                    if(!$scope.validateDealerphone){
                        $http.get("/dash/get/recentID/"+$scope.dealer.Dealercode).success(function(result){
                            if(result !=""){
                                console.log("not unique");
                                $scope.dealercodeUnique = "";
                            } else {
                                console.log("--------unique dealercode-------2");
                                $scope.dealercodeUnique = "unique";
                            }
                            if($scope.dealercodeUnique == "unique"){
                                $scope.dealer.Dealercode = $scope.dealer.Dealercode != '' ? $scope.dealer.Dealercode : '';
                                var dealercodes = $scope.dealer.Dealercode;
                                if (isNaN(dealercodes)) {
                                    console.log(dealercodes);
                                } else {
                                    $scope.dealer.Dealercode = parseInt($scope.dealer.Dealercode);
                                    console.log($scope.dealer.Dealercode);
                                }
                                $scope.dealer.DealerName = $scope.dealer.DealerName.substr(0,1).toUpperCase() + $scope.dealer.DealerName.substr(1);
                                // $scope.dealer.Seller = $scope.dealer.Seller ? Number($scope.dealer.Seller) : '';
                                if($scope.dealer.salesPerson){
                                    $scope.dealer.Seller = $scope.dealer.salesPerson.sellerphone ? Number($scope.dealer.salesPerson.sellerphone) : '' ;
                                    $scope.dealer.SellerName =  $scope.dealer.salesPerson.sellername ? $scope.dealer.salesPerson.sellername : '' ;
                                }
                                else{
                                    $scope.dealer.Seller = $scope.user.sellerphone ? Number($scope.user.sellerphone) : '' ;
                                    $scope.dealer.SellerName =  $scope.user.username ? $scope.user.username : '' ;
                                }
                                $scope.dealer.addedBy = $scope.user.sellerphone ? Number($scope.user.sellerphone) : '' ;
                                $scope.dealer.class = $scope.dealer.class ? $scope.dealer.class : '';
                                $scope.dealer.Stockist = $scope.dealer.Stockist ? Number($scope.dealer.Stockist) : null;
                                if($scope.newStoreImageArray){
                                    $scope.dealer.cloudinaryURL = ($scope.newStoreImageArray.customerImage.length > 0) ? $scope.newStoreImageArray.customerImage : [];
                                    $scope.dealer.doccloudinaryURL = ($scope.newStoreImageArray.customerDoc.length > 0) ? $scope.newStoreImageArray.customerDoc : [];
                                }
                            $scope.dealer.customerType = "customer";
                            if(flag){
                                $scope.postNewDealer('pos');
                                }else{
                                    $scope.postNewDealer();
                                }
                            }
                            else if(result[0]!= undefined){
                                if($scope.Dealercodetemp==undefined){
                                    $scope.Dealercodetemp = 1001;
                                }
                                $scope.disableFlag = false;
                                Settings.failurePopup('Error',"This Customer code already exists. Please use Customer code :"+$scope.Dealercodetemp);
                            }
                        }).error(function(error, status){
                            console.log(error, status);
                            if(status >= 400 && status < 404)
                                $window.location.href = '/404';
                            else if(status >= 500)
                                $window.location.href = '/500';
                            else
                                $window.location.href = '/404';
                        });
                    }else{
                        $scope.disableFlag = false;
                        Settings.failurePopup('Error','This Phone number already exists.');
                    }
            }
            else if ($scope.dealer.Phone == undefined) {
                $scope.disableFlag = false;
                Settings.failurePopup('Error','Please enter a valid phone number');
            } else{
                $scope.disableFlag = false;
                Settings.failurePopup('Error','Please enter all mandatory details');
            }
        };
        $scope.postNewDealer = function(flag){
            if(flag){
                $scope.dealer.cloudinaryURL = [];
                $scope.dealer.doccloudinaryURL = [];
            }
            $http.post("/dash/stores/add/new", $scope.dealer)
                .success(function (res) {
                    //console.log(res);
                    if (!res.imageStatus) {
                        Settings.failurePopup('Error','Your image data could not be uploaded');
                    }
                    if(!flag){
                        Settings.successPopup('Success',$scope.dealer.DealerName+' successfully added.')
                    }
                    $scope.dealerAddPage = false;
                    $scope.dealer = {};
                    $scope.dealer.email = '';
                    $scope.showStockist = false;
                    $scope.showSalesperson = false;
                    $scope.newStoreImageArray = {};
                    $scope.newStoreImageArray.customerImage = [];
                    $scope.newStoreImageArray.customerDoc = [];
                })
        };
        $scope.posPayment = function(res){
            startLoader()
            var date = new Date();
            var dateform = [date.getFullYear(), (date.getMonth() + 1) < 10 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1), date.getDate() < 10 ? '0' + date.getDate() : date.getDate()].join('-') + ' '
                + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
            if ($scope.newOrderItemList.length) {
                $scope.renderItemsMrp();
            }
            if(!$scope.PosDealer.Phone){
                $scope.PosDealer.Phone = 9999999999;
            }else{
                if(!$scope.PosDealer.countryCode || $scope.PosDealer.countryCode == '+91'){
                    if($scope.PosDealer.Phone.toString().length > 5 && !$scope.filteredDealer){
                        var body = {
                            phone: $scope.PosDealer.Phone
                        };
                        $http.post("/dash/enquiry/validate/phone", body).success(function (res) {
                            if(!res.length){
                                $scope.dealer.DealerName = $scope.PosDealer.DealerName;
                                $scope.dealer.Phone = $scope.PosDealer.Phone;
                                $scope.dealer.Address = $scope.PosDealer.Address
                                $scope.dealer.City = $scope.PosDealer.City;
                                $scope.dealer.Area = $scope.PosDealer.Area;
                                $scope.dealer.Pincode = $scope.PosDealer.Pincode;
                                $scope.dealer.email = $scope.PosDealer.email;
                                $scope.dealer.countryCode = $scope.PosDealer.countryCode;
                                $scope.dealer.cloudinaryURL = [];
                                $scope.dealer.doccloudinaryURL = [];
                                if($scope.data.salesPerson)
                                    $scope.dealer.salesPerson = $scope.data.salesPerson ;
                                $scope.addDealer('pos');
                            }
                        });
                    }
                }
                // else if($scope.PosDealer.countryCode && $scope.PosDealer.countryCode != '+91'){
                //     if($scope.PosDealer.Phone.toString().length >= 5 && $scope.PosDealer.Phone.toString().length <= 15 && !$scope.filteredDealer){
                //         var body = {
                //             phone: $scope.PosDealer.Phone
                //         };
                //         $http.post("/dash/enquiry/validate/phone", body).success(function (res) {
                //             if(!res.length){
                //                 $scope.dealer.DealerName = $scope.PosDealer.DealerName;
                //                 $scope.dealer.Phone = $scope.PosDealer.Phone;
                //                 $scope.dealer.Address = $scope.PosDealer.Address
                //                 $scope.dealer.City = $scope.PosDealer.City;
                //                 $scope.dealer.Area = $scope.PosDealer.Area;
                //                 $scope.dealer.Pincode = $scope.PosDealer.Pincode;
                //                 $scope.dealer.email = $scope.PosDealer.email;
                //                 $scope.dealer.countryCode = $scope.PosDealer.countryCode;
                //                 $scope.dealer.cloudinaryURL = [];
                //                 $scope.dealer.doccloudinaryURL = [];
                //                 if($scope.data.salesPerson)
                //                     $scope.dealer.salesPerson = $scope.data.salesPerson ;
                //                 $scope.addDealer('pos');
                //             }
                //         });
                //     }
                // }
            }
            if(!$scope.PosDealer.DealerName){
                $scope.PosDealer.DealerName = 'Default Customer'
            }
            if(!$scope.PosDealer.Address){
                $scope.PosDealer.Address = 'Bengaluru, Karnataka, India'
            }
            if(!$scope.PosDealer.Dealercode){
                $scope.data.newOrderStore = $scope.PosDealer;
                $scope.data.newOrderShipping_address = $scope.PosDealer.Address;
                $scope.data.newOrderStore.Address = $scope.PosDealer.Address;
                $scope.data.newOrderBilling_address = $scope.PosDealer.Address;
                console.log('$scope.dealer',$scope.dealer)
                if($scope.dealer.Dealercode){
                    $scope.data.newOrderStore.Dealercode = $scope.dealer.Dealercode;
                }else{
                    $scope.data.newOrderStore.Dealercode = 0000;
                }
            }else{
                $scope.data.newOrderStore = $scope.PosDealer;
            }
            if($scope.PosDealer.email){
                $scope.data.newOrderStore.email = $scope.PosDealer.email;
            }else{
                $scope.data.newOrderStore.email = '';
            }
            // for(var i = 0; i < items.length; i++){
            //     (function(i){
            //
            //         countlyDb.collection(member.api_key + "_sellers").update({"ASP_ID" : items[i].ASP_ID},
            //             {"$set" : {"sellername" : items[i].ASP_Name,"sellerphone":items[i].Phone_Numbers,
            //                 "email":items[i].Flex_Care_Email_ID,"storesASP":true,"sellerid":items[i].Phone_Numbers,
            //                 "role":'Stores - ASP'}},
            //             {"upsert" : true},
            //             function (err, update) {
            //                 if(err) throw err;
            //                 //console.log("");
            //             })
            //     })(i);
            // }
            var invPayment = [];
            for(var i=0;i<$scope.posPaymentMode.length;i++){
                if($scope.posPaymentMode[i].amt){
                    var temp = {};
                    temp.orderId =  $scope.generateOrderId();
                    temp.orderId += i ;
                    var res = $scope.data.newOrderStore;
                    temp.dealercode = res.Dealercode;
                    temp.dealername = res.DealerName;
                    temp.dealerphone = res.Phone;
                    if($scope.data.salesPerson){
                        temp.seller =  $scope.data.salesPerson.sellerid ;
                        temp.sellername =  $scope.data.salesPerson.sellername ;
                    }
                    else{
                        temp.seller =  $scope.user.seller ? $scope.user.seller : 'PORTAL';
                        temp.sellername =  $scope.user.username ? $scope.user.username : 'PORTAL';
                    }
                    temp.type = 'Payment';
                    temp.date_added = dateform;
                    temp.paymentStatus = 'paid';
                    if($scope.nav[1].paymentstatus)
                        temp.paymentStatus = $scope.nav[1].paymentstatus.length ? $scope.nav[1].paymentstatus[$scope.nav[1].paymentstatus.length-1] : 'paid';
                    if($scope.posPaymentMode[i].id == 'Cash'){
                        temp.medicine = $scope.posPaymentMode[i].id;
                        temp.itemcode = 'XXX';
                    } else{
                        temp.medicine = $scope.posPaymentMode[i].id;
                        temp.itemcode = 'OTS';
                    }
                    temp.quantity = $scope.posPaymentMode[i].amt;
                    temp.paid_amount = $scope.posPaymentMode[i].amt;
                    if($scope.posPaymentObj.amount > $scope.posPaymentObj.orderTotal){
                        temp.return_change =Number($scope.posPaymentObj.amount) - Number($scope.posPaymentObj.orderTotal) ;
                    }else{
                        temp.return_change = 0;
                    }
                    temp.source = "Pos"
                    temp.order_Id = $scope.data.newOrderId;
                    invPayment.push(temp);
                }
            }
            $http.post("/dash/orders/" + temp.orderId, invPayment)
                .success(function (response) {
                    $scope.submitOrder('pos');
                    $scope.posPaymentObj = {};
                    $scope.posPaymentObj.mode = 'Cash';
                })
        }
        $scope.posItemFilter = function(){
            if(!$scope.posSearch.itemCode){
                Settings.alertPopup('Warning', "Please type text in search box")
            }
            else{
                itemSearchObj.viewLength = 0;
                itemSearchObj.viewBy = initialViewBy;
                $scope.viewLength = 0;
                $scope.newViewBy = viewBy.items;
                // $scope.items = [];
                itemSearchObj.searchFor = $scope.posSearch.itemCode;
                itemSearchObj.searchBy = itemSearchBy;
                $http.post('/dash/items', itemSearchObj)
                    .success(function(res){
                        if(res.length == 1){
                            var items=res;
                            var itemInventoryList = items[0].inventory;
                            var inventoryQty = 0;
                            console.log('itemInventoryList',itemInventoryList)
                            for(var j=0;j<itemInventoryList.length;j++){
                                if($scope.houselocation.loc){
                                    if($scope.houselocation.loc == itemInventoryList[j].location){
                                        inventoryQty +=itemInventoryList[j].Qty;
                                    }
                                }else{
                                    if(!itemInventoryList[j].location){
                                        inventoryQty +=itemInventoryList[j].Qty;
                                    }
                                }
                            }
                            if($scope.enforceInventoryOrder){
                                if(inventoryQty>0){
                                    for (var i = 0; i < items.length; i++) {
                                        if(items[i].Specials){
                                            items[i].orderMRP = Number(items[i].MRP) - (Number(items[i].MRP) * Number(items[i].Specials) / 100);
                                        }else{
                                            items[i].orderMRP = Number(items[i].MRP);
                                        }
                                        var neworderList = $scope.newOrderItemList;
                                        items[i].added = $scope.doesItemExistsInCart(neworderList, "itemCode", items[i]);
                                        if( $scope.newOrderItemList.length){
                                            for(var j = 0; j < $scope.newOrderItemList.length; j++){
                                                $scope.newOrderItemList[i].itemDetails.MRP = parseFloat($scope.newOrderItemList[i].itemDetails.MRP);
                                                $scope.newOrderItemList[i].itemDetails.orderMRP = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                                                if(items[i]._id == $scope.newOrderItemList[j].itemDetails._id){
                                                    items[i].itemQuantity = $scope.newOrderItemList[j].quantity;
                                                }
                                            }
                                        }
                                        if(items[i].added < 0){
                                            var item = items[0];
                                            $scope.addItemToOrder(item, item.itemQuantity, item.lineComment,inventoryQty);
                                            Settings.success_toast(items[i].Product+"  Added to cart" );
                                        }else{
                                            $scope.increaseItemCount(items[i]);
                                        }
                                        $scope.posSearch.itemCode = '';
                                        document.getElementById("posItemCode").focus();
                                    }
                                }else{
                                    Settings.alertPopup( "Alert", "Quantity is lesser than inventory quantity");
                                    $scope.posSearch.itemCode = '';
                                    document.getElementById("posItemCode").focus();
                                }
                            }else{
                                for (var i = 0; i < items.length; i++) {
                                    if(items[i].Specials){
                                        items[i].orderMRP = Number(items[i].MRP) - (Number(items[i].MRP) * Number(items[i].Specials) / 100);
                                    }else{
                                        items[i].orderMRP = Number(items[i].MRP);
                                    }
                                    var neworderList = $scope.newOrderItemList;
                                    items[i].added = $scope.doesItemExistsInCart(neworderList, "itemCode", items[i]);
                                    if( $scope.newOrderItemList.length){
                                        for(var j = 0; j < $scope.newOrderItemList.length; j++){
                                            $scope.newOrderItemList[i].itemDetails.MRP = parseFloat($scope.newOrderItemList[i].itemDetails.MRP);
                                            $scope.newOrderItemList[i].itemDetails.orderMRP = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                                            if(items[i]._id == $scope.newOrderItemList[j].itemDetails._id){
                                                items[i].itemQuantity = $scope.newOrderItemList[j].quantity;
                                            }
                                        }
                                    }
                                    if(items[i].added < 0){
                                        var item = items[0];
                                        $scope.addItemToOrder(item, item.itemQuantity, item.lineComment,inventoryQty);
                                        Settings.success_toast("SUCCESS",items[i].Product+"  Added to cart" );
                                    }else{
                                        $scope.increaseItemCount(items[i]);
                                    }
                                    $scope.posSearch.itemCode = '';
                                    document.getElementById("posItemCode").focus();
                                }
                            }
                            $scope.renderItemsMrp();
                            $scope.posSearch.itemCode = '';
                        }else{
                            Settings.fail_toast('Warning',"Failed to add item to cart")
                            $scope.posSearch.itemCode = '';
                            document.getElementById("posItemCode").focus();
                            // bootbox.alert({
                            //     title: 'Warning',
                            //     message : "Failed to add item to cart",
                            //     onEscape: function() {
                            //         // you can do anything here you want when the user dismisses dialog
                            //         $scope.posSearch.itemCode = '';
                            //         document.getElementById("posItemCode").focus();
                            //     }
                            // })
                        }
                    });
            }
        }
        $scope.deleteItemFromOrder = function(item, index){
            Settings.confirmPopup('warning',"Are you sure you want to delete the item from cart?", function(result) {
                console.log(result);
                if (result) {
                    $scope.$apply(function(){
                        var indexInCatalogue = $scope.doesItemExistsInArray($scope.items, "itemCode", item.itemDetails);
                        if(indexInCatalogue >=0){
                            $scope.itemsInModal[indexInCatalogue].added        = -1;
                            $scope.itemsInModal[indexInCatalogue].itemQuantity = '';
                        }
                        //remove items from the order
                        $scope.newOrderItemList.splice(index, 1);
                    })
                    if($scope.newOrderItemList.length == 0){
                        jQuery.noConflict();
                        $("#itemsInCart").modal('hide');
                    }
                    var temp = 0;
                    $scope.orderTotalPrice = $scope.dealerOrderTotalPrice;
                    for(var i=0; i<$scope.newOrderItemList.length; i++) {
                        temp = $scope.newOrderItemList[i].quantity * $scope.newOrderItemList[i].MRP;
                        $scope.orderTotalPrice = $scope.orderTotalPrice + temp;
                    }
                }
            })
        };
        $scope.getRoleName = function(role){
            // console.log(role)
            var temp = '';
            if(role){
                if($scope.userRole){
                    for (var i=0 ; i<$scope.userRole.length ; i++){
                        if($scope.userRole[i].role.toUpperCase() == role.toUpperCase()){
                            temp =$scope.userRole[i].name ;
                            break;
                        }
                    }
                }
            }
            return temp ;
        };
        $scope.posfetchlocation = function(){
            var body = {'seller':$scope.user.seller};
            $http.post('/dash/fetch/pos/location',body).success(function(res){
                if (res) {
                    if(res[0])
                        $scope.houselocation.loc = res[0].location;
                }
            })
        }
        //.... Get Seller Details....
        $scope.getSellDetails = function(){
            jQuery.noConflict();
            if($scope.dealerAsUserFlag){
                var seller = {};
                seller.sellername = $scope.PosDealer.DealerName;
                seller.countryCode = " ";//$scope.dealer.countryCode;
                seller.sellerphone = Number($scope.PosDealer.Phone);
                seller.sellerid = Number($scope.PosDealer.Phone);
                seller.role = 'Dealer';
                seller.email = $scope.PosDealer.email;
                seller.userStatus = 'Active';
                seller.portal = true;
                seller.salesrep = false;
                seller.admin = false;
                seller.stockist = false;
                seller.fulfiller = false;
                seller.manager = false;
                seller.dealer = true;
                seller.leave = [];
                seller.userType = '';
                seller.emailOtp = false;
                seller.emailOrder = false;
                seller.managerid = null;
                $http.get("/dash/getsellerDetails/" + seller.sellerphone)
                    .success(function (response) {
                        $scope.sellers1 = response;
                        // $scope.sellers1 = response;
                        if (!response) {
                            seller.sellerid = seller.sellerphone;
                            seller.dealerNotificationFlag = $scope.dealerNotificationFlag;
                            seller.newDealerToUserDetails = 'true';
                            // $http.post("/dash/sellers", seller)
                            //     .success(function (response) {
                            //     })
                            //     .error(function(error, status){
                            //     });
                        }
                    })
            };
        }
        //Function to see if order already exists in the list.
        $scope.doesItemExistsInCart = function (objectList, key, object) {
            for (var i = 0; i < objectList.length; i++) {
                if (objectList[i].itemDetails[key] === object[key]) {
                    return i;
                }
            }
            return -1;
        }//End of function doesItemExistsInCart
        //Function to see if order already exists in the list.
        $scope.doesItemExistsInArray = function (objectList, key, object) {
            for (var i = 0; i < objectList.length; i++) {
                if (objectList[i][key] === object[key]) {
                    return i;
                }
            }
            return -1;
        }//End of function doesItemExistsInArray
        $scope.navPage = function(tab, direction) {
            switch (tab) {
                //Items Navigation
                case 2:
                    var viewLength = $scope.viewLength;
                    var viewBy = $scope.newViewBy;
                    if (direction) {
                        //console.log("NEXT");
                        if (viewLength + viewBy >= $scope.items.length) {
                            if (viewLength + viewBy < $scope.items_count) {
                                $scope.displayloader = true
                                viewLength += viewBy;
                                //console.log("Fetch more")
                                itemSearchObj.viewLength = viewLength;
                                itemSearchObj.viewBy = initialViewBy;
                                itemSearchObj.searchFor = $scope.itemSearch.filter;
                                itemSearchObj.searchBy = itemSearchBy;
                                jQuery.noConflict();
                                $('.refresh').css("display", "inline");
                                $http.post("/dash/items", itemSearchObj)
                                    .success(function (response) {
                                        $scope.renderItems(response, 'Manufacturer');
                                        if (viewLength + viewBy > $scope.items_count) {
                                            a = viewLength + viewBy - $scope.items_count;
                                            viewBy -= a;
                                            $scope.newViewBy = viewBy;
                                        }
                                        $scope.viewLength = viewLength;
                                        $scope.displayloader = false;
                                    })
                                    .error(function(error, status){
                                        console.log(error, status);
                                        if(status >= 400 && status < 404)
                                            $window.location.href = '/404';
                                        else if(status >= 500)
                                            $window.location.href = '/500';
                                        else
                                            $window.location.href = '/404';
                                    });
                                jQuery.noConflict();
                                $('.refresh').css("display", "none");
                            }
                            else {
                                //console.log("Out of data")
                                if (viewLength + viewBy > $scope.items_count) {
                                    a = viewLength + viewBy - $scope.items_count;
                                    viewBy -= a;
                                    $scope.newViewBy = viewBy;
                                }
                            }
                        }
                        else {
                            //console.log("Minus viewby")
                            viewLength += viewBy;
                            if (viewLength + viewBy > $scope.items_count) {
                                a = viewLength + viewBy - $scope.items_count;
                                viewBy -= a;
                            }
                            $scope.newViewBy = viewBy;
                            $scope.viewLength = viewLength;
                        }
                    }
                    else {
                        //console.log("BACK");
                        if (viewLength < viewBy) {
                            //console.log("NO DATA")
                        }
                        else {
                            if (viewLength + viewBy >= $scope.items_count) {
                                viewBy += a;
                                a = 0;
                            }
                            viewLength -= viewBy;
                            $scope.viewLength = viewLength;
                            $scope.newViewBy = viewBy;
                        }
                    }
                    break;
                //Dealer tab navigation
                case 4:
                    var viewLength = $scope.viewLength;
                    var viewBy = $scope.newViewBy;
                    if (direction) {
                        //console.log("NEXT");
                        if (viewLength + viewBy >= $scope.serviceClients.length) {
                            if (viewLength + viewBy < $scope.dealer_count) {
                                viewLength += viewBy;
                                //console.log("Fetch more")
                                dealerSearchObj.viewLength = viewLength;
                                dealerSearchObj.viewBy = initialViewBy;
                                dealerSearchObj.searchFor = $scope.dealerSearch.filter;
                                if ($scope.filter.branch != 'All') {
                                    dealerSearchObj.stockist = $scope.filter.branch;
                                }
                                else {
                                    dealerSearchObj.stockist = '';
                                }
                                if ($scope.filter.class != 'All') {
                                    dealerSearchObj.class = $scope.filter.class;
                                }
                                else {
                                    dealerSearchObj.class = '';
                                }
                                if ($scope.filter.sales && $scope.filter.sales != 'All' ) {
                                    dealerSearchObj.seller = $scope.filter.sales.seller;
                                }
                                else {
                                    dealerSearchObj.seller = '';
                                }
                                dealerSearchObj.searchBy = dealerSearchBy;
                                $http.post("/dash/stores", dealerSearchObj)
                                    .success(function (response) {
                                        // console.log(response);
                                        $scope.multipleUsers(response);
                                        if (viewLength + viewBy > $scope.dealer_count) {
                                            a = viewLength + viewBy - $scope.dealer_count;
                                            viewBy -= a;
                                            $scope.newViewBy = viewBy;
                                        }
                                        $scope.viewLength = viewLength;
                                    })
                            }
                            else {
                                //console.log("Out of data")
                                if (viewLength + viewBy > $scope.dealer_count) {
                                    a = viewLength + viewBy - $scope.dealer_count;
                                    viewBy -= a;
                                    $scope.newViewBy = viewBy;
                                }
                            }
                        }
                        else {
                            //console.log("Minus viewby")
                            viewLength += viewBy;
                            if (viewLength + viewBy > $scope.dealer_count) {
                                a = viewLength + viewBy - $scope.dealer_count;
                                viewBy -= a;
                            }
                            $scope.newViewBy = viewBy;
                            $scope.viewLength = viewLength;
                        }
                    }
                    else {
                        //console.log("BACK");
                        if (viewLength < viewBy) {
                            //console.log("NO DATA")
                        }
                        else {
                            if (viewLength + viewBy >= $scope.dealer_count) {
                                viewBy += a;
                                a = 0;
                            }
                            viewLength -= viewBy;
                            $scope.viewLength = viewLength;
                            $scope.newViewBy = viewBy;
                        }
                    }
                    break;
            }
        }
        $scope.checkTypeString = function(arg){
            if(typeof arg == 'string'){
                return true;
            }else{
                return false;
            }
        }
        //Akash: Adding MRP and added attributes in array
        $scope.renderItemsMrp  = function(){
            var priceList = $scope.orderPriceList;
            console.log('priceList',priceList);
            $scope.PosDealer.countryCode = $scope.default_CountryCode;
            if(priceList && priceList!='master'){
                for (var i = 0; i < $scope.itemsInModal.length; i++) {
                    if($scope.itemsInModal[i][priceList] && typeof $scope.itemsInModal[i][priceList] != 'string' && typeof $scope.itemsInModal[i][priceList] != 'undefined' && typeof $scope.itemsInModal[i][priceList] !== 'object'){
                        $scope.itemsInModal[i].MRP = Number($scope.itemsInModal[i][priceList]);
                        if($scope.itemsInModal[i].Specials  ){
                            $scope.itemsInModal[i].orderMRP = Number($scope.itemsInModal[i][priceList]) - (Number($scope.itemsInModal[i][priceList]) * Number($scope.itemsInModal[i].Specials) / 100);
                        }else{
                            $scope.itemsInModal[i].orderMRP = Number($scope.itemsInModal[i][priceList]);
                        }
                    }else{
                        $scope.itemsInModal[i].MRP = Number($scope.itemsInModal[i][priceList]);
                        $scope.itemsInModal[i].orderMRP = '';
                    }
                    var neworderList = $scope.newOrderItemList;
                    $scope.itemsInModal[i].added = $scope.doesItemExistsInCart(neworderList, "itemCode", $scope.itemsInModal[i]);
                    if($scope.itemsInModal[i].added >= 0 && $scope.newOrderItemList.length){
                        for(var j = 0; j < $scope.newOrderItemList.length; j++){
                            if($scope.itemsInModal[i]._id == $scope.newOrderItemList[j].itemDetails._id){
                                $scope.itemsInModal[i].itemQuantity = $scope.newOrderItemList[j].quantity;
                            }
                        }
                    }
                    if( !$scope.itemsInModal[i].trackInventory && $scope.itemsInModal[i].trackInventory != false){
                        $scope.itemsInModal[i].trackInventory = true;
                    }else{
                        $scope.itemsInModal[i].trackInventory = $scope.itemsInModal[i].trackInventory;
                    }
                }
            }else{
                for (var i = 0; i < $scope.itemsInModal.length; i++) {
                    if($scope.itemsInModal[i].Specials){
                        $scope.itemsInModal[i].orderMRP = Number($scope.itemsInModal[i].MRP) - (Number($scope.itemsInModal[i].MRP) * Number($scope.itemsInModal[i].Specials) / 100);
                    }else{
                        $scope.itemsInModal[i].orderMRP = Number($scope.itemsInModal[i].MRP);
                    }
                    var neworderList = $scope.newOrderItemList;
                    $scope.itemsInModal[i].added = $scope.doesItemExistsInCart(neworderList, "itemCode", $scope.itemsInModal[i]);
                    if($scope.itemsInModal[i].added >= 0 && $scope.newOrderItemList.length){
                        for(var j = 0; j < $scope.newOrderItemList.length; j++){
                            if($scope.itemsInModal[i]._id == $scope.newOrderItemList[j].itemDetails._id){
                                $scope.itemsInModal[i].itemQuantity = $scope.newOrderItemList[j].quantity;
                            }
                        }
                    }
                    if( !$scope.itemsInModal[i].trackInventory && $scope.itemsInModal[i].trackInventory != false){
                        $scope.itemsInModal[i].trackInventory = true;
                    }else{
                        $scope.itemsInModal[i].trackInventory = $scope.itemsInModal[i].trackInventory;
                    }
                }
            }
        }
        $scope.handleChangeInCategory = function( category,  changedKey){
            $scope.categorySearch = "";
            // console.log("handleChangeInCategory "+type)
            if( changedKey == 'All' ){
                if($scope.categorySelected['All'])
                    $scope.categorySearch = "Searching in all Categories";
                else
                    $scope.categorySearch = "Category Selected for search NONE";
            }
            if( changedKey == 'All' ){
                for(var i=0; i< $scope.itemCategories.length; i++ )
                    $scope.categorySelected[$scope.itemCategories[i][category]] = $scope.categorySelected['All'];
            }else{
                $scope.categorySelected['All'] = true;
                $scope.categorySearch = "Searching in categories ( "
                for(key in $scope.categorySelected) {
                    $scope.categorySelected['All'] = $scope.categorySelected['All'] && $scope.categorySelected[key];
                    if( $scope.categorySelected[key] && key != "All") $scope.categorySearch += " " + key+",";
                }
                $scope.categorySearch += " ) ";
                if($scope.categorySelected['All'] )
                    $scope.categorySearch = "Searching in all Categories";
            }
            $scope.searchMessage = $scope.categorySearch + " " + $scope.KeyWordSearch;
            $scope.updateFilterTags( category, $scope.itemCategories, changedKey,
                $scope.categorySelected[changedKey] );
        };
        $scope.transactionCount = function(response, tab) {
            switch (tab) {
                //Items Total Count
                case 2:
                    //console.log(response);
                    if(response){
                        if(response > viewBy.items){
                            $scope.items_count = response;
                            $scope.viewLength = 0;
                            $scope.newViewBy = viewBy.items;
                        }
                        else if(response <= viewBy.items){
                            $scope.items_count = response;
                            $scope.newViewBy = response;
                        }
                        else{
                            $scope.items = [];
                            $scope.newViewBy = 1;
                            $scope.items_count = 0;
                            $scope.viewLength = -1;
                        }
                    }
                    else{
                        $scope.items = [];
                        $scope.newViewBy = 1;
                        $scope.items_count = 0;
                        $scope.viewLength = -1;
                    }
                    break;
                //Dealer total count
                case 4:
                    if(response){
                        if(response > viewBy.dealer){
                            $scope.dealer_count = response;
                            $scope.viewLength = 0;
                            $scope.newViewBy = viewBy.dealer;
                        }
                        else if(response <= viewBy.dealer){
                            $scope.dealer_count = response;
                            $scope.newViewBy = response;
                        }
                        else{
                            $scope.serviceClients = [];
                            $scope.newViewBy = 1;
                            $scope.dealer_count = 0;
                            $scope.viewLength = -1;
                        }
                    }
                    else{
                        $scope.serviceClients = [];
                        $scope.newViewBy = 1;
                        $scope.dealer_count = 0;
                        $scope.viewLength = -1;
                    }
                    break;
            }
        }
        $scope.DateTimeFormat = function (date_added, when) {
            if (date_added) {
                //This is to format the date in dd-mm-yy hh:mm:ss format, also padding 0's if values are <10 using above function
                var date = new Date(date_added);
                if (when == 'start') date.setHours(0, 0, 0, 0);
                else if (when == 'end') date.setHours(23, 59, 59, 999);
                var dformat = [date.getFullYear(), (date.getMonth() + 1).padLeft(), date.getDate().padLeft()].join('-') + ' '
                    + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join(':');
                return (dformat);
            }
            else
                return 0;
        };
        $scope.clearFilterButton = function (search,tab) {
            if (search === '') {
                switch (tab) {
                    case 2 :
                        itemSearchObj.viewLength = 0;
                        itemSearchObj.viewBy = initialViewBy;
                        itemSearchObj.searchFor = '';
                        itemSearchObj.searchBy = [];
                        $scope.viewLength = 0;
                        $scope.newViewBy = viewBy.items;
                        $scope.itemSearch.filter = '';
                        $scope.itemSearch.priceList = '';
                        $scope.items = [];
                        $http.post('/dash/items', itemSearchObj)
                            .success($scope.renderItems);
                        $http.post('/dash/item/count', itemSearchObj)
                            .success(function (response) {
                                $scope.transactionCount(response, 2)
                            });
                        $scope.showItemFilter = false;
                        // $scope.getAllCategories(true, 'category');
                        // $scope.getAllSubCategories(true, 'subCategory');
                        break;
                    case 3:
                        dealerSearchObj.viewLength = 0;
                        dealerSearchObj.viewBy = initialViewBy;
                        dealerSearchObj.searchFor = '';
                        dealerSearchObj.seller = '';
                        dealerSearchObj.stockist = '';
                        dealerSearchObj.searchBy = [];
                        $scope.viewLength = 0;
                        $scope.newViewBy = viewBy.dealer;
                        $scope.dealerSearch.filter = '';
                        $scope.serviceClients = [];
                        $http.post("/dash/stores", dealerSearchObj)
                            .success(function(res){
                                $scope.multipleUsers(res);
                            })
                        $http.post("/dash/stores/count", dealerSearchObj)
                            .success(function(res){
                                $scope.transactionCount(res,4);
                            })
                        $scope.showStoreFilter = false;
                        $scope.getAllStoreCities(true,'city');
                        $scope.getAllStoreAreas(true,'area');
                        break;
                }
            }
        }
        $scope.renderItems = function (items_list,type) {
            var obj = [];
            if($scope.itemSelectAll.category)
                $scope.itemSelectAll.category = true;
            else
                $scope.itemSelectAll.category = false;
            if($scope.itemSelectAll.category)
                $scope.itemSelectAll.subCategory = true;
            else
                $scope.itemSelectAll.subCategory = false;
            if($scope.itemSelectAll.category && $scope.itemSelectAll.subCategory)
                $scope.itemSelectAll.subSubCategory = true;
            else
                $scope.itemSelectAll.subSubCategory = false;
            if($scope.user.role == 'Dealer'){
                $http.get("/dash/store/details/"+$scope.user.sellerphone)
                    .success(function(dealer){
                        $http.get('dash/customprice/'+dealer[0].Dealercode)
                            .success(function(pricelist){
                                console.log("Custom prices : "+pricelist.length)
                                $scope.items_count = pricelist.length;
                                dealerItemsCount = pricelist.length;
                                if(pricelist.length < $scope.newViewBy){
                                    $scope.newViewBy = pricelist.length;
                                    dealerNewViewBy = pricelist.length;
                                }
                                $scope.customPrices = pricelist;
                                if(pricelist.length > 0){
                                    console.log("Populating Custom price list")
                                    for(var i=0; i< pricelist.length; i++){
                                        $scope.items.push(pricelist[i])
                                    }
                                    $scope.itemsInModal=$scope.items;
                                    $scope.renderItemsMrp();
                                }
                                else{
                                    console.log("Showing all items")
                                    for(var i=0; i< items_list.length; i++){
                                        items_list[i].inventory.forEach( function(item) {
                                            items_list[i].totalInventory += item.Qty;
                                        });
                                        $scope.items.push(items_list[i])
                                    }
                                    $scope.itemsInModal=$scope.items;
                                    $scope.renderItemsMrp();
                                }
                            })
                    });
            }
            else{
                for(var i=0; i< items_list.length; i++){
                    items_list[i].customPricelist = [];
                    items_list[i].totalInventory = 0;
                    items_list[i].inventory.forEach( function(item) {
                        items_list[i].totalInventory += item.Qty;
                    });
                    if($scope.priceListName){
                        for(var k = 0;k < $scope.priceListName.length;k++ ){
                            if($scope.priceListName[k] != 'master'){
                                if ( typeof items_list[i][$scope.priceListName[k]] !== 'undefined' &&  items_list[i][$scope.priceListName[k]] != null) {
                                    if( typeof items_list[i][$scope.priceListName[k]] == "string"){
                                        items_list[i].customPricelist.push({
                                            itemCode:items_list[i].itemCode,
                                            name:$scope.priceListName[k],
                                            price: null ,
                                            status: false
                                        })
                                    }
                                    else{
                                        items_list[i].customPricelist.push({
                                            itemCode:items_list[i].itemCode,
                                            name:$scope.priceListName[k],
                                            price: items_list[i][$scope.priceListName[k]],
                                            status: true
                                        })
                                    }
                                }
                                else{
                                    items_list[i].customPricelist.push({
                                        itemCode:items_list[i].itemCode,
                                        name:$scope.priceListName[k],
                                        price: null ,
                                        status: false
                                    })
                                }
                            }
                        }
                    }
                    $scope.items.push(items_list[i])
                    if(items_list[i].subCategory){
                        obj.push(items_list[i]);
                    }
                }
                $scope.itemsInModal=$scope.items;
                $scope.renderItemsMrp();
            }
            if(type=='Manufacturer'){
                $scope.itemSubCategories = [];
                $scope.itemSubCategories = obj.unique('subCategory');
                // console.log($scope.itemSubCategories)
                $scope.itemSubCategories.map(function (item) {
                    // console.log( item.subCategory)
                    if($scope.itemSelectAll.category){
                        item.selected_subCategory = true;
                    }else{
                        item.selected_subCategory = true;
                    }
                    return item;
                })
            }
            if(type=='subCategory'){
                $scope.itemSubSubCategories = [];
                $scope.itemSubSubCategories = obj.unique('subSubCategory');
                if($scope.itemSubSubCategories && $scope.itemSubSubCategories.length){
                    for(var i=0; i< $scope.itemSubSubCategories.length ; i++){
                        if((!$scope.itemSubSubCategories[i].subSubCategory) || $scope.itemSubSubCategories[i].subSubCategory == ''){
                            $scope.itemSubSubCategories.splice(i, 1);
                        }
                    }
                }
                $scope.itemSubSubCategories.map(function (item) {
                    // console.log( item.subSubCategory)
                    if($scope.itemSelectAll.subCategory){
                        item.selected_subSubCategory = true;
                    }else{
                        item.selected_subSubCategory = true;
                    }
                    return item;
                })
            }
            // $scope.itemSelectAll.subCategory = true;
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
        $scope.getImageUrl = function(obj){
            if(obj){
                if(obj.cloudinaryURL){
                    if(angular.isObject(obj.cloudinaryURL) && obj.cloudinaryURL.length > 0){
                        return obj.cloudinaryURL[0].image;
                    }
                    else if(angular.isObject(obj.cloudinaryURL) && obj.cloudinaryURL.length == 0){
                        return '../appimages/image_not_available.jpg';
                    }
                    else if(obj.cloudinaryURL!="[object Object]"){
                        return obj.cloudinaryURL;
                    }else return '../appimages/image_not_available.jpg';
                }
                else{
                    return '../appimages/image_not_available.jpg';
                }
            }
        }
        //Function which is used to Search or filter Items
        $scope.itemFilterBy = function(type){
            if(type == 'category'){
                $scope.categoryFilterFlag = true ;
                $scope.subCategoryFilterFlag = false ;
                $scope.subSubCategoryFilterFlag = false ;
            }
            else if(type == 'subCat'){
                $scope.categoryFilterFlag = false ;
                $scope.subCategoryFilterFlag = true ;
                $scope.subSubCategoryFilterFlag = false ;
            }
            else if(type == 'subSubCat'){
                $scope.categoryFilterFlag = false ;
                $scope.subCategoryFilterFlag = false ;
                $scope.subSubCategoryFilterFlag = true ;
            }
            else {
                $scope.filterItemsByCriteria('clear',1);
                $scope.categoryFilterFlag = false ;
                $scope.subCategoryFilterFlag = false ;
                $scope.subSubCategoryFilterFlag = false ;
            }
        }
        $scope.filterItemsByCriteria = function(type, all ,filter){
            //Parameter 'all' is used when user clicks SELECT ALL
            $scope.items = [];
            if (type == 'category') {
                $scope.itemFilterCategories.map(function (item) {
                    if(item.category_selected && filter){
                        item.category_selected = filter;
                    } else {
                        item.category_selected = null;
                    }
                    return item;
                })
                $scope.itemFilterSubCategories = [];
                $scope.itemFilterSubSubCategories = [];
                $http.post("/dash/items/filter/" + 'subCategory', itemSearchObj)
                    .success(function (subCategory) {
                        console.log(subCategory)
                        if(subCategory.length){
                            // subCategory = subCategory.filter(function( obj ) {
                            //     return obj._id !== 'DEFAULT';
                            // });
                            console.log(subCategory)
                            $scope.itemFilterSubCategories = subCategory;
                        }
                    })
                $scope.subCategoryFilterFlag = true ;
                var newArray = [];
                itemSearchObj.searchCategory = [];
                if(filter){
                    itemSearchObj.searchCategory.push(filter);
                }
                if(itemSearchObj.searchCategory && itemSearchObj.searchCategory.length){
                    for (var i = 0; i < itemSearchObj.searchCategory.length; i++) {
                        //... Push all other cities...
                        if (filter == itemSearchObj.searchCategory[i]) {
                            newArray.push(itemSearchObj.searchCategory[i]);
                        }
                    }
                    //... Replace the array..
                    itemSearchObj.searchCategory = newArray;
                    itemSearchObj.searchBySubCategory = [];
                    itemSearchObj.searchBySubSubCategory = [];
                }else if(!$scope.itemFilterCategories.length){
                    $scope.itemFilterSubCategories = [];
                }
                $http.post("/dash/items", itemSearchObj)
                    .success(function (response) {
                        $scope.renderItems(response, 'Manufacturer');
                        $http.post("/dash/item/count", itemSearchObj)
                            .success(function (res) {
                                $scope.transactionCount(res, 2);
                            });
                    });
            } else if(type == 'subCategory'){
                $scope.itemFilterSubCategories.map(function (item) {
                    if(item.subCategory_selected){
                        item.subCategory_selected = filter;
                    } else {
                        item.subCategory_selected = null;
                    }
                })
                $scope.itemFilterSubSubCategories = [];
                $http.post("/dash/items/filter/" + 'subSubCategory', itemSearchObj)
                    .success(function (subSubCategory) {
                        if(subSubCategory.length){
                            $scope.itemFilterSubSubCategories = [];
                            for(var i=0; i< subSubCategory.length ; i++){
                                if(subSubCategory[i]._id){
                                    $scope.itemFilterSubSubCategories.push(subSubCategory[i]);
                                }
                            }
                        }
                    })
                $scope.subSubCategoryFilterFlag = true ;
                if(filter){
                    var newArray = [];
                    if(filter)
                        newArray.push(filter);
                    itemSearchObj.searchBySubCategory = [];
                    itemSearchObj.searchBySubCategory = newArray; //... Replace the array..
                    itemSearchObj.searchBySubSubCategory = [];
                    if (itemSearchObj.searchBySubCategory.length) {
                        $http.post("/dash/items", itemSearchObj)
                            .success(function (response) {
                                $scope.renderItems(response, 'subCategory');
                                $http.post("/dash/item/count", itemSearchObj)
                                    .success(function (res) {
                                        $scope.transactionCount(res, 2);
                                    });
                            });
                    }
                }
            } else if(type == 'subSubCategory'){
                $scope.itemFilterSubSubCategories.map(function (item) {
                    if(item.subSubCategory_selected || item.subSubCategory_selected == ''){
                        item.subSubCategory_selected = filter;
                    } else {
                        item.subSubCategory_selected = null;
                    }
                })
                if(filter){
                    var newArray = [];
                    if(filter)
                        newArray.push(filter);
                    itemSearchObj.searchBySubSubCategory = newArray; //... Replace the array..
                    if (itemSearchObj.searchBySubSubCategory.length) {
                        $http.post("/dash/items", itemSearchObj)
                            .success(function (response) {
                                $scope.renderItems(response, 'subSubCategory');
                                $http.post("/dash/item/count", itemSearchObj)
                                    .success(function (res) {
                                        $scope.transactionCount(res, 2);
                                    });
                            });
                    }
                }
            }else if(type == 'clear'){
                $scope.item.category_selected = '';
                $scope.item.subCategory_selected = '';
                $scope.item.subSubCategory_selected = '';
                if(all){
                    // itemSearchObj = {};
                    $scope.getAllCategories(false,'category');
                    $scope.getAllSubCategories(false,'subCategory');
                    $scope.getAllSubSubCategories(false,'subSubCategory');
                    itemSearchObj.searchCategory = [];
                    itemSearchObj.searchSubCategory = [];
                    itemSearchObj.searchSubSubCategory = [];
                    itemSearchObj.searchByCategory = [];
                    itemSearchObj.searchBySubCategory = [];
                    itemSearchObj.searchBySubSubCategory = [];
                    $http.post("/dash/items", itemSearchObj)
                        .success(function (response) {
                            $scope.renderItems(response, 'Manufacturer');
                            $http.post("/dash/item/count", itemSearchObj)
                                .success(function (res) {
                                    $scope.transactionCount(res, 2);
                                });
                        });
                }
            } else {
                $scope.itemFilterCategories = [];
                $scope.itemFilterSubCategories = [];
                $scope.itemFilterSubSubCategories = [];
            }
        }
        $scope.addCategoryTempFunc = function(newItem,category,type) {
            if(category != '' && category != undefined && category != null){
                var temp = [];
                var uniquieCategory =  $scope.itemCategories.unique('_id');
                for (var i = 0; i < uniquieCategory.length ;i++){
                    temp.push(uniquieCategory[i]._id)
                }
                if(temp.indexOf(category) == -1){
                    $scope.itemCategories.push(newItem);
                    $scope.newItem.Manufacturer = category;
                    $scope.editedItem.Manufacturer = category;
                    $scope.newItem.subCategory = 'DEFAULT' ;
                    $scope.editedItem.subCategory = 'DEFAULT';
                    temp.push(category)
                    $scope.fetchOnlySubCatDropDown(newItem,'edit');
                    $scope.filterBasedOnCategory(category,'edit')
                    if(type == 'item'){
                        console.log('item')
                        $('#newCategory').modal('hide');
                        // $(function () {
                        //     $('#newCategory').modal('toggle');
                        //     $('#newCategory').on('hidden.bs.modal', function (e) {
                        //         $(this).find("input").val('').end()
                        //     })
                        // });
                    }else if(type == 'inventory'){
                        console.log(type)
                        jQuery.noConflict();
                        $(function () {
                            $('#inventoryNewCategory').modal('toggle');
                            $('#inventoryNewCategory').on('hidden.bs.modal', function (e) {
                                $(this).find("input").val('').end()
                            })
                        });
                    }
                }
                else {
                    Settings.failurePopup("Error",'Category already exist');
                    // bootbox.alert({
                    //     size : 'small',
                    //     title : 'ERROR',
                    //     message : "Category already exist",
                    //     className : "text-center"
                    // });
                }
            }
            else{
                Settings.failurePopup("Error",'Enter a Category');
                // bootbox.alert({
                //     size : 'small',
                //     title : 'ERROR',
                //     message : "Enter a Category ",
                //     className : "text-center"
                // });
            }
        };
        $scope.addSubCategoryTempFunc = function(newItem,subCategory,type) {
            if(subCategory != '' && subCategory != undefined && subCategory != null) {
                if($scope.newItem.Manufacturer != 'DEFAULT' && $scope.editedItem.Manufacturer != 'DEFAULT'){
                    var temp = [];
                    for (var i = 0; i < $scope.addItemSubCategory.length ;i++){
                        temp.push($scope.addItemSubCategory[i].subCategory)
                    }
                    if(temp.indexOf(subCategory) == -1){
                        $scope.newItem.subCategory = subCategory;
                        $scope.subCategoriesDropDown.push(newItem);
                        $scope.newItem.subSubCategory = 'DEFAULT' ;
                        $scope.editedItem.subSubCategory = 'DEFAULT';
                        $scope.editedItem.subCategory = subCategory ;
                        // if($scope.itemsDisp){
                        //     $scope.subCategoriesDropDown.push(newItem);
                        // }
                        if(type == 'item'){
                            $('#newSubCategory').modal('hide');
                            // jQuery.noConflict();
                            // $(function () {
                            //     $('#newSubCategory').modal('toggle');
                            //     $('#newSubCategory').on('hidden.bs.modal', function (e) {
                            //         $(this).find("input").val('').end()
                            //     })
                            // });
                        }else if(type == 'inventory'){
                            jQuery.noConflict();
                            $(function () {
                                $('#inventoyNewSubCategory').modal('toggle');
                                $('#inventoyNewSubCategory').on('hidden.bs.modal', function (e) {
                                    $(this).find("input").val('').end()
                                })
                            });
                        }
                    }
                    else{
                        Settings.failurePopup("Error",'SubCategory already exist');
                        // bootbox.alert({
                        //     size : 'small',
                        //     title : 'ERROR',
                        //     message : "SubCategory already exist ",
                        //     className : "text-center"
                        // });
                    }
                }
                else{
                    Settings.failurePopup("Error",'Please Add or Select a Category First');
                    // bootbox.alert({
                    //     size : 'small',
                    //     title : 'ERROR',
                    //     message : "Please Add or Select a Category First",
                    //     className : "text-center"
                    // });
                }
            }
            else{
                Settings.failurePopup("Error",'Enter a SubCategory');
                // bootbox.alert({
                //     size : 'small',
                //     title : 'ERROR',
                //     message : "Enter a SubCategory ",
                //     className : "text-center"
                // });
            }
        };
        $scope.addSubSubCategoryTempFunc = function(newItem,subSubCategory,type) {
            if(subSubCategory != '' && subSubCategory != undefined && subSubCategory != null) {
                if(($scope.newItem.Manufacturer != 'DEFAULT' && $scope.newItem.subCategory != 'DEFAULT') || ($scope.editedItem.Manufacturer != 'DEFAULT' && $scope.editedItem.subCategory != 'DEFAULT')){
                    var temp = [];
                    for (var i = 0; i < $scope.addItemSubSubCategory.length ;i++){
                        temp.push($scope.addItemSubSubCategory[i].subSubCategory)
                    }
                    if(temp.indexOf(subSubCategory) == -1){
                        $scope.newItem.subSubCategory = subSubCategory;
                        $scope.subSubCategoriesDropDown.push(newItem);
                        $scope.editedItem.subSubCategory = subSubCategory ;
                        // if($scope.itemsDisp){
                        //     $scope.subSubCategoriesDropDown.push(newItem);
                        // }
                        if(type == 'item'){
                            // jQuery.noConflict();
                            $('#newSubSubCategory').modal('hide');
                            // $(function () {
                            //     $('#newSubSubCategory').modal('toggle');
                            //     $('#newSubSubCategory').on('hidden.bs.modal', function (e) {
                            //         $(this).find("input").val('').end()
                            //     })
                            // });
                        }else if(type == 'inventory'){
                            jQuery.noConflict();
                            $(function () {
                                $('#inventoyNewSubSubCategory').modal('toggle');
                                $('#inventoyNewSubSubCategory').on('hidden.bs.modal', function (e) {
                                    $(this).find("input").val('').end()
                                })
                            });
                        }
                    }
                    else{
                        Settings.failurePopup("Error",'Sub-Sub-Category already exist');
                        // bootbox.alert({
                        //     size : 'small',
                        //     title : 'ERROR',
                        //     message : "Sub-Sub-Category already exist ",
                        //     className : "text-center"
                        // });
                    }
                }
                else{
                    Settings.failurePopup("Error",'Please Add or Select a subCategory First');
                    // bootbox.alert({
                    //     size : 'small',
                    //     title : 'ERROR',
                    //     message : "Please Add or Select a subCategory First",
                    //     className : "text-center"
                    // });
                }
            }
            else{
                Settings.failurePopup("Error",'Enter a Sub-Sub-Category');
                // bootbox.alert({
                //     size : 'small',
                //     title : 'ERROR',
                //     message : "Enter a Sub-Sub-Category ",
                //     className : "text-center"
                // });
            }
        }
        $scope.getAllCategories = function(param,type){
            $http.post("/dash/items/filter/"+type, {viewBy : 0})
                .success(function(category){
                    $scope.itemFilterCategories = category ;
                    $scope.itemCategories = category;
                    $scope.itemCategories = $scope.itemCategories.filter(function( obj ) {
                        return obj._id !== 'DEFAULT';
                    });
                    // $scope.itemCategories.map(function (item) {
                    //
                    //     if($scope.itemSelectAll.category){
                    //         item.selected_category = param;
                    //     }else{
                    //         item.itemCategories = true;
                    // }
                    //     return item;
                    // })
                })
        };
        $scope.getAllSubCategories = function(param,type){
            $http.post("/dash/items/filter/"+type, {viewBy : 0})
                .success(function(subCategory){
                    $scope.itemSubCategories = subCategory;
                    $scope.itemFilterSubCategories = subCategory;
                    $scope.itemSubCategories = $scope.itemSubCategories.filter(function( obj ) {
                        return obj._id !== 'DEFAULT';
                    });
                    // $scope.itemSubCategories.map(function (item) {
                    //
                    //     if($scope.itemSelectAll.category){
                    //         item.selected_subCategory = false;
                    //
                    //     }else{
                    //         item.itemSubCategories = false;
                    //         $scope.itemSubCategories = [];
                    //     }
                    //     return item;
                    // })
                })
        };
        $scope.getAllSubSubCategories = function(param,type){
            $http.post("/dash/items/filter/"+type, {viewBy : 0})
                .success(function(subSubCategory){
                    $scope.itemSubSubCategories = subSubCategory;
                    $scope.itemFilterSubSubCategories = subSubCategory;
                    $scope.itemSubSubCategories = $scope.itemSubSubCategories.filter(function( obj ) {
                        return obj._id !== 'DEFAULT';
                    });
                    if($scope.itemSubSubCategories.length ==1){
                        if($scope.itemSubSubCategories[0]._id == null){
                            $scope.itemSubSubCategories = [];
                        }
                    }
                    // $scope.itemSubSubCategories.map(function (item) {
                    //
                    //     if($scope.itemSelectAll.category && $scope.itemSelectAll.subCategory){
                    //         item.selected_subSubCategory = false;
                    //
                    //     }else{
                    //         item.itemSubSubCategories = true
                    //         $scope.itemSubSubCategories = [];
                    //     }
                    //     return item;
                    // })
                })
        };
        $scope.filterBasedOnCategory=function(category,type){
            var tempCategory = [];
            for(var i=0;i< masterItems.length;i++){
                if(masterItems[i].Manufacturer == category){
                    tempCategory.push(masterItems[i]);
                }
            }
            if(type == 'add'){
                $scope.addItemSubCategory = tempCategory.unique('subCategory');
                $scope.newItem.subCategory = 'DEFAULT' ;
                if($scope.itemsDisp){
                    $scope.itemsDisp.itemSubCategories = tempCategory.unique('subCategory') ;
                }
            }
            else if (type == 'edit'){
                $scope.editedItem.subCategory = 'DEFAULT' ;
                if($scope.itemsDisp){
                    $scope.itemsDisp.itemSubCategories = tempCategory.unique('subCategory') ;
                }
            }
            setTimeout(function(){
                $scope.$digest();
            }, 1000);
        };
        $scope.fetchOnlySubCatDropDown = function(data,type, subtype){
            // console.log(data)
            // console.log(type)
            var tempObj = {};
            tempObj = data;
            $http.post("/dash/items/category/sub", tempObj).success(function(res) {
                // console.log("res of subcat======",res);
                // $scope.subCategoriesDropDown = [];
                if(type == 'add'){
                    $scope.subCategoriesDropDown =  res;
                    $scope.subCategoriesDropDown = $scope.subCategoriesDropDown.filter(function( obj ) {
                        return obj._id !== 'DEFAULT';
                    });
                    $scope.newItem.subCategory = "DEFAULT" ;
                    $scope.newItem.subSubCategory = "DEFAULT";
                    $scope.subSubCategoriesDropDown = [];
                }
                else if (type == 'edit'){
                    $scope.subCategoriesDropDown =  res;
                    $scope.subCategoriesDropDown = $scope.subCategoriesDropDown.filter(function( obj ) {
                        return obj._id !== 'DEFAULT';
                    });
                    $scope.subSubCategoriesDropDown = [];
                    if(subtype == 'editView'){
                        $scope.editedItem.subCategory = tempObj.subCategory || 'DEFAULT';
                    }else{
                        $scope.editedItem.subCategory = "DEFAULT" ;
                    }
                    // $scope.editedItem.subSubCategory = "" ;
                }
                // console.log($scope.editedItem.subCategory)
            })
        };
        $scope.fetchOnlySubSubCatDropDown = function(data,type, subType){
            var tempObj = {};
            tempObj = data;
            $http.post("/dash/items/category/sub/sub", tempObj).success(function(res) {
                // $scope.subCategoriesDropDown = [];
                if(type == 'add'){
                    $scope.subSubCategoriesDropDown =  res;
                    $scope.subSubCategoriesDropDown = $scope.subSubCategoriesDropDown.filter(function( obj ) {
                        return obj._id !== 'DEFAULT';
                    });
                    $scope.newItem.subSubCategory = "DEFAULT" ;
                }
                else if (type == 'edit'){
                    $scope.subSubCategoriesDropDown = res;
                    $scope.subSubCategoriesDropDown = $scope.subSubCategoriesDropDown.filter(function( obj ) {
                        return obj._id !== 'DEFAULT';
                    });
                    if(subType == 'editView'){
                        $scope.editedItem.subSubCategory = tempObj.subSubCategory || 'DEFAULT';
                    }else{
                        $scope.editedItem.subSubCategory = 'DEFAULT';
                    }
                }
            })
        };
        $scope.clearFilter = function(tab) {
            switch (tab) {
                //Clear Items
                case 2:
                    itemSearchObj.viewLength = 0;
                    itemSearchObj.viewBy = initialViewBy;
                    itemSearchObj.searchFor = '';
                    itemSearchObj.searchBy = [];
                    itemSearchObj.searchBySubCategory = [];
                    itemSearchObj.searchBySubSubCategory = [];
                    itemSearchObj.searchCategory = [];
                    $scope.viewLength = 0;
                    $scope.newViewBy = viewBy.items;
                    $scope.itemSearch.filter = '';
                    $scope.itemSearch.priceList = '';
                    $scope.priceListView.filter='master' ;
                    $scope.priceListfilter = false ;
                    $scope.items = [];
                    $scope.showItemFilter = false;
                    $scope.itemSelectAll.category = true;
                    $http.post("/dash/items",itemSearchObj)
                        .success(function(response) {
                            $scope.renderItems(response);
                        });
                    $http.post('/dash/item/count', itemSearchObj)
                        .success(function(response){
                            $scope.transactionCount(response,2)
                        });
                    $scope.getAllCategories(true,'category');
                    $scope.getAllSubCategories(true,'subCategory');
                    $scope.getAllSubSubCategories(true,'subSubCategory');
                    $scope.categoryFilterFlag = false ;
                    $scope.subCategoryFilterFlag = false ;
                    $scope.subSubCategoryFilterFlag = false ;
                    break;
            }
        }
        //Apply item search Filter
        $scope.itemSearchFilter = function(){
            if($scope.itemSearch.filter == ''){
                Settings.alertPopup('Warning',"Please type text in search box")
            }
            else{
                itemSearchObj.viewLength = 0;
                itemSearchObj.viewBy = initialViewBy;
                $scope.viewLength = 0;
                $scope.newViewBy = viewBy.items;
                $scope.items = [];
                if($scope.itemSearch.filter){
                    itemSearchObj.searchFor = $scope.itemSearch.filter;
                    itemSearchObj.searchBy = itemSearchBy;
                }
                $http.post('/dash/items', itemSearchObj)
                    .success($scope.renderItems);
                $http.post('/dash/item/count', itemSearchObj)
                    .success(function(response){
                        $scope.transactionCount(response,2)
                    });
                $scope.showItemFilter = true;
            }
        }
        // Decrease item quantity
        $scope.decreaseItemCount = function(item , flag , index) {
            if(!flag){
                if (item.itemQuantity > 1) {
                    item.itemQuantity--;
                    for(var i=0;i<$scope.newOrderItemList.length;i++){
                        if(item._id == $scope.newOrderItemList[i].itemDetails._id){
                            $scope.newOrderItemList[i].itemQuantity= item.itemQuantity;
                            $scope.changeInQuantity($scope.CTTOC, $scope.newOrderItemList[i], $scope.newOrderItemList[i].itemQuantity, 0);
                        }
                    }
                }else{
                    for(var i=0;i<$scope.newOrderItemList.length;i++){
                        if(item._id == $scope.newOrderItemList[i].itemDetails._id){
                            $scope.deleteItemFromOrder($scope.newOrderItemList[i], i)
                        }
                    }
                }
            }else{
                if (item.quantity > 1) {
                    item.quantity--;
                    $scope.changeInQuantity($scope.CTTOC, item, item.quantity, 0);
                }else{
                    $scope.deleteItemFromOrder(item, index)
                }
            }
        };
        // Increase item quantity
        $scope.addItemQuantity = function(item,itemQuantity,comment) {
            var itemQty = itemQuantity || 0;
            for(var i=0;i<$scope.newOrderItemList.length;i++){
                if(item._id == $scope.newOrderItemList[i].itemDetails._id){
                    $scope.newOrderItemList[i].itemQuantity= Number(itemQty.toFixed(3));
                    $scope.changeInQuantity($scope.CTTOC, $scope.newOrderItemList[i], $scope.newOrderItemList[i].itemQuantity, 0);
                }
            }
        };
        // Increase item quantity
        $scope.increaseItemCount = function(item,flag) {
            if(!flag){
                item.itemQuantity++;
                for(var i=0;i<$scope.newOrderItemList.length;i++){
                    if(item._id == $scope.newOrderItemList[i].itemDetails._id){
                        $scope.newOrderItemList[i].itemQuantity= item.itemQuantity;
                        $scope.changeInQuantity($scope.CTTOC, $scope.newOrderItemList[i], $scope.newOrderItemList[i].itemQuantity, 0);
                    }
                }
            }else{
                item.quantity++;
                $scope.changeInQuantity($scope.CTTOC, item, item.quantity, 0);
            }
        };
        $scope.changeInQuantity = function(direction, item, itemQuantity,flag,neworderflag){
            console.log('changeInQuantity',itemQuantity,direction);
            if(itemQuantity)
                itemQuantity = Number(itemQuantity.toFixed(3));
            switch(direction){
                case $scope.CTOCT :
                    //Check if the item is already in the order
                    var itemIndex = $scope.doesItemExistsInCart($scope.newOrderItemList, "itemCode", item);
                    if( $scope.newOrderItemList.length != 0 && itemIndex >= 0 && ( itemQuantity <= 0  ) )
                        Settings.alertPopup('Warning',"ZERO quantity not accepted. Press delete icon to delete item")
                    // Settings.alertPopup( "danger", "", "ZERO quantity not accepted. Press delete icon to delete item");
                    if( itemIndex >= 0 ){
                        if( itemQuantity > 0 )
                            $scope.newOrderItemList[itemIndex].quantity = Math.round(itemQuantity);
                        else
                            item.itemQuantity = Math.round($scope.newOrderItemList[itemIndex].quantity);
                    }
                    break;
                case $scope.CTTOC :
                    if(!neworderflag){
                        //Check if the item is already in the order
                        var itemIndex = $scope.doesItemExistsInArray($scope.itemsInModal, "itemCode", item.itemDetails);
                    }else {
                        //Check if the item is already in the order
                        var itemIndex = $scope.doesItemExistsInCart($scope.newOrderItemList, "itemCode", item.itemDetails);
                    }
                    if(itemQuantity > item.totalInventory && item.itemDetails.trackInventory){
                        Settings.alertPopup( "Alert", "Quantity should be lesser than inventory quantity");
                        item.quantity='';
                        item.itemQuantity = '';
                        $scope.renderItemsMrp();
                        break;
                    }
                    if( $scope.newOrderItemList.length != 0 && (!itemQuantity && itemQuantity < 0 ) ){
                        Settings.alertPopup( "Alert", "ZERO quantity not accepted. Press delete icon to delete item");
                    }
                    console.log("itemIndex",itemIndex)
                    if( itemIndex >= 0 ){
                        // if( itemQuantity <=1000 ){
                            // $scope.itemsInModal[itemIndex].itemQuantity = Math.round(itemQuantity);
                            // item.itemQuantity = Math.round($scope.itemsInModal[itemIndex].itemQuantity)
                            // item.quantity = Math.round($scope.itemsInModal[itemIndex].itemQuantity)* $scope.stepQuantity ;
                            $scope.itemsInModal[itemIndex].itemQuantity = itemQuantity;
                            item.itemQuantity = $scope.itemsInModal[itemIndex].itemQuantity;
                            item.quantity = $scope.itemsInModal[itemIndex].itemQuantity* $scope.stepQuantity ;
                        // }
                        // else{
                        //     Settings.alertPopup( "Alert", "", "ZERO quantity not accepted. Press delete icon to delete item");
                        //     if(flag){
                        //         item.quantity='';
                        //         item.itemQuantity = '';
                        //     }else{
                        //         item.quantity = Math.round($scope.itemsInModal[itemIndex].itemQuantity)* $scope.stepQuantity ;
                        //         item.itemQuantity = Math.round($scope.itemsInModal[itemIndex].itemQuantity);
                        //     }
                        // }
                        if($scope.taxExclusive){
                            for(var i=0; i< $scope.newOrderItemList.length; i++){
                                if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice){
                                    $scope.newOrderItemList[i].taxableValue =  $scope.newOrderItemList[i].itemDetails.BulkPrice * $scope.newOrderItemList[i].quantity;
                                    if($scope.taxSetups.otherSetup != 'other'){
                                        $scope.newOrderItemList[i].BulkPrice =
                                            ( $scope.newOrderItemList[i].itemDetails.BulkPrice) +
                                            (( $scope.newOrderItemList[i].CGST * $scope.newOrderItemList[i].itemDetails.BulkPrice)/100 + ($scope.newOrderItemList[i].SGST* $scope.newOrderItemList[i].itemDetails.BulkPrice)/100 + ($scope.newOrderItemList[i].IGST* $scope.newOrderItemList[i].itemDetails.BulkPrice)/100);
                                    }else if($scope.taxSetups.otherSetup == 'other' && $scope.newOrderItemList[i].otherTaxes){
                                        var otherTaxesValue = 0;
                                        for(var j=0; i< $scope.newOrderItemList[i].otherTaxes.length; j++){
                                            if(itemIndex == j){
                                                otherTaxesValue += (($scope.newOrderItemList[i].otherTaxes[j].value * $scope.newOrderItemList[i].itemDetails.BulkPrice)/100)
                                            }
                                        }
                                        $scope.newOrderItemList[i].BulkPrice = $scope.newOrderItemList[i].itemDetails.BulkPrice + otherTaxesValue;
                                    }
                                }else{
                                    if($scope.taxSetups.otherSetup != 'other') {
                                        $scope.newOrderItemList[i].taxableValue =  $scope.newOrderItemList[i].itemDetails.orderMRP * $scope.newOrderItemList[i].quantity;
                                        $scope.newOrderItemList[i].orderMRP =
                                            ( $scope.newOrderItemList[i].itemDetails.orderMRP) +
                                            (( $scope.newOrderItemList[i].CGST * $scope.newOrderItemList[i].itemDetails.orderMRP)/100 + ($scope.newOrderItemList[i].SGST* $scope.newOrderItemList[i].itemDetails.orderMRP)/100 + ($scope.newOrderItemList[i].IGST* $scope.newOrderItemList[i].itemDetails.orderMRP)/100);
                                    }else if($scope.taxSetups.otherSetup == 'other' && $scope.newOrderItemList[i].otherTaxes){
                                        var otherTaxesValue = 0;
                                        $scope.newOrderItemList[i].taxableValue = $scope.newOrderItemList[i].itemDetails.orderMRP * $scope.newOrderItemList[i].quantity;
                                        for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                                            otherTaxesValue += (($scope.newOrderItemList[i].otherTaxes[j].value * $scope.newOrderItemList[i].itemDetails.orderMRP)/100)
                                        }
                                        $scope.newOrderItemList[i].orderMRP = $scope.newOrderItemList[i].itemDetails.orderMRP + otherTaxesValue;
                                    }
                                }
                            }
                        }else{
                            for(var i=0; i< $scope.newOrderItemList.length; i++){
                                if($scope.data.newOrderStore.customerVariant == 'bulk' &&  $scope.newOrderItemList[i].itemDetails.BulkPrice){
                                    $scope.newOrderItemList[i].taxableValue =
                                        (($scope.newOrderItemList[i].quantity  *
                                            ($scope.newOrderItemList[i].itemDetails.BulkPrice -
                                                ($scope.newOrderItemList[i].itemDetails.BulkPrice * ($scope.getItemsDiscount($scope.newOrderItemList[i].itemDetails.itemCode) / 100)))) /
                                            (100 + $scope.newOrderItemList[i].CGST + $scope.newOrderItemList[i].SGST + $scope.newOrderItemList[i].IGST)) * 100;
                                }else{
                                    if($scope.taxSetups.otherSetup != 'other') {
                                        $scope.newOrderItemList[i].taxableValue =
                                            (($scope.newOrderItemList[i].quantity * $scope.newOrderItemList[i].itemDetails.orderMRP) /
                                                (100 + $scope.newOrderItemList[i].CGST + $scope.newOrderItemList[i].SGST + $scope.newOrderItemList[i].IGST)) * 100;
                                    }else if($scope.taxSetups.otherSetup == 'other'){
                                        var otherTaxesValue = 0;
                                        for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                                            otherTaxesValue += $scope.newOrderItemList[i].otherTaxes[j].value;
                                        }
                                        $scope.newOrderItemList[i].taxableValue =
                                            (($scope.newOrderItemList[i].quantity  * ($scope.newOrderItemList[i].itemDetails.orderMRP - ($scope.newOrderItemList[i].itemDetails.orderMRP * ($scope.getItemsDiscount($scope.newOrderItemList[i].itemDetails.itemCode) / 100)))) /
                                                (100 + otherTaxesValue)) * 100;
                                    }
                                }
                            }
                        }
                    }
                    break;
            }     //End of switch
        }//End of function changeInQuantity
        //Adding item to the order
        $scope.addItemToOrder = function( item, itemQuantity, lineComment,invtQty){
            $scope.getSellDetails();
            console.log('$scope.tempCountryName',$scope.tempCountryName)
            switch($scope.tempCountryName){
                case 'india': {
                    $scope.addItemToOrderIndia(item, itemQuantity, lineComment,invtQty);
                    break;
                }
                case 'ghana': {
                    $scope.addItemToOrderGhana(item, itemQuantity, lineComment,invtQty);
                    break;
                }
                default:
                    $scope.addItemToOrderIndia(item, itemQuantity, lineComment,invtQty);
                    console.log("Changed default *******" );
                    break;
            }
        }//End of addItemToOrder
        $scope.CheckGstByState = function (orderItem,item ) {
            var type = 'gst_total_inter';
            // if(!$scope.data.newOrderStore.State || !$scope.data.tempState){
            //     type = 'gst_total_intra';
            // }else{
            //     if($scope.data.newOrderStore.State ==  $scope.data.tempState){
            //         type = 'gst_total_inter';
            //     }else{
            //         type = 'gst_total_intra';
            //     }
            // }
            switch (type) {
                case 'gst_total_inter' : {
                    console.log('gst_total_inter')
                    if(item.gst){
                        if(!item.gst.cgst && !item.gst.sgst && !item.gst.igst){
                            if(defaultTax){
                                orderItem.CGST = defaultTax.cgst ? defaultTax.cgst  : 0;
                                orderItem.SGST = defaultTax.sgst ? defaultTax.sgst : 0;
                                orderItem.IGST =  0;
                            }else {
                                orderItem.CGST =  0;
                                orderItem.SGST =  0;
                                orderItem.IGST = 0;
                            }
                        }else{
                            orderItem.CGST = item.gst.cgst ? item.gst.cgst  : 0;
                            orderItem.SGST = item.gst.sgst ? item.gst.sgst  : 0;
                            orderItem.IGST = 0;
                            if(item.gst.qbId){
                                orderItem.qbId = item.gst.qbId;
                            }
                        }
                    }else{
                        if(item.CGST || item.SGST){
                            orderItem.CGST = item.CGST ? item.CGST  : 0;
                            orderItem.SGST = item.SGST ? item.SGST  : 0;
                            orderItem.IGST = 0;
                        }else if(defaultTax){
                            orderItem.CGST = defaultTax.cgst ? defaultTax.cgst  : 0;
                            orderItem.SGST = defaultTax.sgst ? defaultTax.sgst : 0;
                            orderItem.IGST =  0;
                        }else {
                            orderItem.CGST =  0;
                            orderItem.SGST =  0;
                            orderItem.IGST = 0;
                        }
                    }
                    break;
                }
                case 'gst_total_intra' : {
                    $scope.calculateIGST = true;
                    if(item.gst){
                        if(!item.gst.cgst && !item.gst.sgst && !item.gst.igst){
                            if(defaultTax){
                                orderItem.CGST =  0;
                                orderItem.SGST =  0;
                                orderItem.IGST =  defaultTax.igst ? defaultTax.igst : 0;
                            }else {
                                orderItem.CGST =  0;
                                orderItem.SGST =  0;
                                orderItem.IGST = 0;
                            }
                        }else{
                            orderItem.IGST = item.gst.igst ? item.gst.igst : 0;
                            orderItem.CGST = 0;
                            orderItem.SGST = 0;
                            if(item.gst.qbId){
                                orderItem.qbId = item.gst.qbId;
                            }
                        }
                    }else{
                        if(item.IGST){
                            orderItem.IGST = item.IGST ? item.IGST : 0;
                            orderItem.CGST = 0;
                            orderItem.SGST = 0;
                        }else if(defaultTax){
                            orderItem.CGST =  0;
                            orderItem.SGST =  0;
                            orderItem.IGST =  defaultTax.igst ? defaultTax.igst : 0;;
                        }else {
                            orderItem.CGST =  0;
                            orderItem.SGST =  0;
                            orderItem.IGST = 0;
                        }
                    }
                    console.log('gst_total_intra')
                    break;
                }
            }
        }
        //Adding item based on india country
        $scope.addItemToOrderIndia = function( item, itemQuantity, lineComment,invtQty){
            console.log('invtQty',invtQty)
            itemQuantity = 1;
            item.itemQuantity = 1;
            $scope.newOrderItem.itemDetails = angular.copy(item);
            $scope.CheckGstByState($scope.newOrderItem,item);
            if($scope.taxSetups.otherSetup != 'other'){
                // if(item.gst){
                //     if($scope.calculateIGST){
                //         $scope.newOrderItem.IGST = item.gst.igst ? item.gst.igst : 0;
                //         $scope.newOrderItem.CGST = 0;
                //         $scope.newOrderItem.SGST = 0;
                //         if(item.gst.qbId){
                //             $scope.newOrderItem.qbId = item.gst.qbId;
                //         }
                //
                //     }
                //     else{
                //         $scope.newOrderItem.CGST = item.gst.cgst ? item.gst.cgst  : 0;
                //         $scope.newOrderItem.SGST = item.gst.sgst ? item.gst.sgst  : 0;
                //         $scope.newOrderItem.IGST = 0;
                //         if(item.gst.qbId){
                //             $scope.newOrderItem.qbId = item.gst.qbId;
                //         }
                //     }
                // }else{
                //     if($scope.calculateIGST){
                //         $scope.newOrderItem.IGST = item.IGST ? item.IGST : 0;
                //         $scope.newOrderItem.CGST = 0;
                //         $scope.newOrderItem.SGST = 0;
                //     }
                //     else{
                //         if(defaultTax){
                //             $scope.newOrderItem.CGST = defaultTax.cgst ? defaultTax.cgst  : 0;
                //             $scope.newOrderItem.SGST = defaultTax.sgst ? defaultTax.sgst : 0;
                //             $scope.newOrderItem.IGST = defaultTax.igst ? defaultTax.igst : 0;
                //
                //         }else {
                //             $scope.newOrderItem.CGST = item.CGST ? item.CGST  : 0;
                //             $scope.newOrderItem.SGST = item.SGST ? item.SGST : 0;
                //             $scope.newOrderItem.IGST = 0;
                //         }
                //
                //     }
                //
                // }
            }else if($scope.taxSetups.otherSetup == 'other'){
                if(!item.otherTaxes || (item.otherTaxes && !item.otherTaxes.length) ){
                    $scope.newOrderItem.otherTaxes = [];
                    if($scope.otherTaxDefault && $scope.otherTaxDefault.taxs && $scope.otherTaxDefault.taxs.length){
                        for(var i = 0; i< $scope.otherTaxDefault.taxs.length; i++){
                            $scope.newOrderItem.otherTaxes.push($scope.otherTaxDefault.taxs[i]);
                        }
                        item.otherTaxes = $scope.newOrderItem.otherTaxes;
                    }
                }else if(item.otherTaxes){
                    $scope.newOrderItem.otherTaxes = [];
                    if(item.otherTaxes && item.otherTaxes.length){
                        for(var i = 0; i< item.otherTaxes.length; i++){
                            $scope.newOrderItem.otherTaxes.push(item.otherTaxes[i]);
                        }
                    }
                }
            }
            if($scope.newOrderItem.itemDetails.looseQty){
                if($scope.newOrderItem.itemDetails.trackInventory){
                    if(invtQty >= 0 && invtQty <= 1){
                        $scope.newOrderItem.quantity = (invtQty)*$scope.stepQuantity;
                    }else{
                        $scope.newOrderItem.quantity = itemQuantity*$scope.stepQuantity;
                    }
                }else{
                    $scope.newOrderItem.quantity = itemQuantity*$scope.stepQuantity;
                }
            }else{
                $scope.newOrderItem.quantity = Math.round(itemQuantity)*$scope.stepQuantity;
            }
            if($scope.newOrderItem.quantity > invtQty && $scope.enforceInventoryOrder && $scope.newOrderItem.itemDetails.trackInventory){
                Settings.alertPopup("Alert", "Quantity should be lesser than inventory quantity for "+$scope.newOrderItem.itemDetails.Product);
                return;
            }
            console.log('$scope.newOrderItem.quantity',$scope.newOrderItem.quantity)
            item.itemQuantity =  $scope.newOrderItem.quantity;
            // if(invtQty >= 0 && invtQty <= 1){
            //         $scope.newOrderItem.quantity = Math.round(invtQty)*$scope.stepQuantity;
            // }else{
            //     console.log("else")
            // $scope.newOrderItem.quantity = Math.round(itemQuantity)*$scope.stepQuantity;
            // }
            if(!item.itemQuantity){
                Settings.alertPopup("Alert",  "Please Enter a Valid Quantity");
                return;
            }
            // if(!item.orderMRP){
            //     Settings.alertPopup("danger", "In New Order Addition", "Please Enter a Valid Order MRP");
            //     return;
            // }
            //Validate Fields of an item
            if(	   $scope.newOrderItem.itemDetails.Product == ""
                || typeof $scope.newOrderItem.itemDetails.Product == "undefined")
            {
                //throw up modal for reConfirmation of  submission of order
                Settings.alertPopup( "Alert", "Item Not Selected");
                return;
            }
            // if($scope.newOrderItem.quantity < MIN_ORDER || $scope.newOrderItem.quantity == null)
            // {
            //     Settings.alertPopup("danger", "In New Order Addition", MIN_ORDER + " is minimum number of items that must be ordered" );
            //     return;
            // }
            //Check if the item is already in the order
            if($scope.doesItemExistsInCart($scope.newOrderItemList, "itemCode", $scope.newOrderItem.itemDetails) >= 0){
                Settings.alertPopup("info",  "Item already exists in the order, please check");
                return;
            }
            //Price of Order
            $scope.newOrderItem.total = $scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.MRP;
            $scope.newOrderItem.orderTotal = $scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.orderMRP;
            $scope.newOrderItem.MRP = $scope.newOrderItem.itemDetails.MRP;
            $scope.newOrderItem.orderMRP = $scope.newOrderItem.itemDetails.orderMRP;
            if(invtQty){
                $scope.newOrderItem.totalInventory = invtQty;
            }
            if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItem.itemDetails.BulkPrice){
                //Calculate discount
                // var discount = (($scope.newOrderItem.MRP - $scope.newOrderItem.itemDetails.BulkPrice)/$scope.newOrderItem.MRP) * 100;
                // if(discount > 0){
                //     $scope.newOrderItem.Specials = discount.toFixed(2);
                // }else{
                $scope.newOrderItem.Specials = 0;
                // }
                if(item.gst){
                    if(!$scope.taxExclusive){
                        $scope.newOrderItem.taxableValue =
                            (($scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.BulkPrice) /
                                (100 + $scope.newOrderItem.CGST + $scope.newOrderItem.SGST + $scope.newOrderItem.IGST)) * 100;
                        $scope.newOrderItem.BulkPrice = $scope.newOrderItem.itemDetails.BulkPrice;
                    }else{
                        $scope.newOrderItem.taxableValue = $scope.newOrderItem.itemDetails.BulkPrice *$scope.newOrderItem.quantity  ;
                        $scope.newOrderItem.BulkPrice =
                            ( $scope.newOrderItem.itemDetails.BulkPrice) +
                            (( $scope.newOrderItem.CGST * $scope.newOrderItem.itemDetails.BulkPrice)/100 + ($scope.newOrderItem.SGST* $scope.newOrderItem.itemDetails.BulkPrice)/100 + ($scope.newOrderItem.IGST* $scope.newOrderItem.itemDetails.BulkPrice)/100);
                    }
                }else{
                    if($scope.taxSetups.otherSetup != 'other'){
                        $scope.newOrderItem.taxableValue =
                            (($scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.BulkPrice) /
                                (100 + $scope.newOrderItem.CGST + $scope.newOrderItem.SGST + $scope.newOrderItem.IGST)) * 100;
                    }else if($scope.taxSetups.otherSetup == 'other' && item.otherTaxes && item.otherTaxes.length){
                        var otherTaxes = 0;
                        for(var j=0; j< item.otherTaxes.length; j++){
                            otherTaxes += item.otherTaxes[j].value;
                        }
                        $scope.newOrderItem.taxableValue = (($scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.BulkPrice) / (100 + otherTaxes)) * 100;
                    }
                }
            }else{
                //Calculate discount
                var discount = (($scope.newOrderItem.MRP - $scope.newOrderItem.orderMRP)/$scope.newOrderItem.MRP) * 100;
                if(discount > 0){
                    $scope.newOrderItem.Specials = discount.toFixed(2);
                }else{
                    $scope.newOrderItem.Specials = 0;
                }
                if(item.gst && $scope.taxSetups.otherSetup != 'other'){
                    if(!$scope.taxExclusive){
                        $scope.newOrderItem.taxableValue =
                            (($scope.newOrderItem.quantity  * $scope.newOrderItem.orderMRP) /
                                (100 + $scope.newOrderItem.CGST + $scope.newOrderItem.SGST + $scope.newOrderItem.IGST)) * 100;
                        $scope.newOrderItem.orderMRP = $scope.newOrderItem.itemDetails.orderMRP;
                    }else{
                        $scope.newOrderItem.taxableValue = $scope.newOrderItem.itemDetails.orderMRP *$scope.newOrderItem.quantity  ;
                        $scope.newOrderItem.orderMRP =
                            ( $scope.newOrderItem.itemDetails.orderMRP) +
                            (( $scope.newOrderItem.CGST * $scope.newOrderItem.itemDetails.orderMRP)/100 + ($scope.newOrderItem.SGST* $scope.newOrderItem.itemDetails.orderMRP)/100 + ($scope.newOrderItem.IGST* $scope.newOrderItem.itemDetails.orderMRP)/100);
                    }
                }else if(item.otherTaxes && item.otherTaxes.length && $scope.taxSetups.otherSetup == 'other'){
                    if(!$scope.taxExclusive){
                        var otherTaxes = 0;
                        for(var i=0;i< item.otherTaxes.length; i++){
                            otherTaxes += item.otherTaxes[i].value;
                        }
                        $scope.newOrderItem.taxableValue =
                            (($scope.newOrderItem.quantity  * $scope.newOrderItem.orderMRP) /
                                (100 + otherTaxes)) * 100;
                        $scope.newOrderItem.orderMRP = $scope.newOrderItem.itemDetails.orderMRP;
                    }else{
                        var otherTaxes = 0;
                        $scope.newOrderItem.taxableValue = $scope.newOrderItem.itemDetails.orderMRP *$scope.newOrderItem.quantity;
                        if(item.otherTaxes && item.otherTaxes.length){
                            for(var i=0;i< item.otherTaxes.length; i++){
                                otherTaxes += ( item.otherTaxes[i].value * $scope.newOrderItem.itemDetails.orderMRP)/100;
                            }
                        }
                        $scope.newOrderItem.orderMRP = $scope.newOrderItem.itemDetails.orderMRP + otherTaxes;
                    }
                }else {
                    $scope.newOrderItem.taxableValue =
                        (($scope.newOrderItem.quantity  * $scope.newOrderItem.orderMRP) /
                            (100 + $scope.newOrderItem.CGST + $scope.newOrderItem.SGST + $scope.newOrderItem.IGST)) * 100;
                }
            }
            var date = new Date;
            $scope.newOrderItem.lineComment = {};
            $scope.newOrderItem.lineComment.date_added = [date.getFullYear(),(date.getMonth()+1).padLeft(), date.getDate().padLeft() ].join('-') + ' '
                + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join (':');
            $scope.newOrderItem.lineComment.username = $scope.user.role ? $scope.user.username : 'PORTAL ADMIN';
            $scope.newOrderItem.lineComment.userphone = $scope.user.sellerphone ? $scope.user.sellerphone : '';
            $scope.newOrderItem.lineComment.comment = lineComment ? lineComment : '';
            //Push items to the order items list
            $scope.newOrderItemList.unshift($scope.newOrderItem);
            var indexInCatalogue = $scope.doesItemExistsInArray($scope.items, "itemCode", $scope.newOrderItem.itemDetails);
            $scope.itemsInModal[indexInCatalogue].added        = $scope.newOrderItemList.length - 1 ;
            //Initialize
            $scope.newOrderItem = {
                itemDetails:{},
                quantity: 1,
                total: 0,
                MRP:0,
                orderMRP:0,
                CGST:0,
                SGST:0,
                IGST : 0,
                otherTaxes: []
            };
            $scope.data.category = "";
            //To display option to add item need to be displayed
            $scope.displayAddItemOption = false;
            return $scope.newOrderItemList.length;
        }//End of addItemToOrder
        //Adding item based on Ghana country
        $scope.addItemToOrderGhana = function ( item, itemQuantity, lineComment,invtQty){
            itemQuantity = 1;
            item.itemQuantity = 1;
            var defaultTax ='';
            if($scope.tax.length){
                for(var i=0;i<$scope.tax.length;i++){
                    if($scope.tax[i].default){
                        defaultTax = $scope.tax[i];
                    }
                }
            }
            item.MRP = parseFloat(item.MRP);
            item.orderMRP = parseFloat(item.orderMRP);
            $scope.newOrderItem.itemDetails = angular.copy(item);
            if($scope.taxSetups.otherSetup != 'other'){
                if(item.gst){
                    $scope.newOrderItem.CGST = item.gst.cgst ? item.gst.cgst  : (defaultTax.cgst ? defaultTax.cgst  : 0);
                    $scope.newOrderItem.SGST = item.gst.sgst ? item.gst.sgst  : (defaultTax.sgst ? defaultTax.sgst : 0);
                    $scope.newOrderItem.IGST = item.gst.igst ? item.gst.igst : (defaultTax.igst ? defaultTax.igst : 0);
                }else{
                    if(defaultTax){
                        $scope.newOrderItem.CGST = defaultTax.cgst ? defaultTax.cgst  : 0;
                        $scope.newOrderItem.SGST = defaultTax.sgst ? defaultTax.sgst : 0;
                        $scope.newOrderItem.IGST = defaultTax.igst ? defaultTax.igst : 0;
                    }else {
                        $scope.newOrderItem.CGST = item.gst ? (item.gst.cgst ? item.gst.cgst  : 0) : 0;
                        $scope.newOrderItem.SGST = item.gst ? (item.gst.sgst ? item.gst.sgst  : 0) : 0;
                        $scope.newOrderItem.IGST = item.gst ? (item.gst.igst ? item.gst.igst  : 0) : 0;
                    }
                }
            }else if($scope.taxSetups.otherSetup == 'other'){
                if(!item.otherTaxes || (item.otherTaxes && !item.otherTaxes.length) ){
                    $scope.newOrderItem.otherTaxes = [];
                    if($scope.otherTaxDefault && $scope.otherTaxDefault.taxs && $scope.otherTaxDefault.taxs.length){
                        for(var i = 0; i< $scope.otherTaxDefault.taxs.length; i++){
                            $scope.newOrderItem.otherTaxes.push($scope.otherTaxDefault.taxs[i]);
                        }
                        item.otherTaxes = $scope.newOrderItem.otherTaxes;
                    }
                }else if(item.otherTaxes){
                    $scope.newOrderItem.otherTaxes = [];
                    if(item.otherTaxes && item.otherTaxes.length){
                        for(var i = 0; i< item.otherTaxes.length; i++){
                            $scope.newOrderItem.otherTaxes.push(item.otherTaxes[i]);
                        }
                    }
                }
            }
            if($scope.newOrderItem.itemDetails.looseQty){
                if($scope.newOrderItem.itemDetails.trackInventory){
                    if(invtQty >= 0 && invtQty <= 1){
                        $scope.newOrderItem.quantity = (invtQty)*$scope.stepQuantity;
                    }else{
                        $scope.newOrderItem.quantity = itemQuantity*$scope.stepQuantity;
                    }
                }else{
                    $scope.newOrderItem.quantity = itemQuantity*$scope.stepQuantity;
                }
            }else{
                $scope.newOrderItem.quantity = Math.round(itemQuantity)*$scope.stepQuantity;
            }
            if($scope.newOrderItem.quantity > invtQty && $scope.newOrderItem.itemDetails.trackInventory){
                Settings.alertPopup("Alert","Quantity should be lesser than inventory quantity for "+$scope.newOrderItem.itemDetails.Product);
                return;
            }
            item.itemQuantity =  $scope.newOrderItem.quantity;
            // if(invtQty >= 0 && invtQty <= 1){
            //         $scope.newOrderItem.quantity = Math.round(invtQty)*$scope.stepQuantity;
            // }else{
            //     console.log("else")
            // $scope.newOrderItem.quantity = Math.round(itemQuantity)*$scope.stepQuantity;
            // }
            if(!item.itemQuantity){
                Settings.alertPopup("Alert", "Please Enter a Valid Quantity");
                return;
            }
            // if(!item.orderMRP){
            //     Settings.alertPopup("danger", "In New Order Addition", "Please Enter a Valid Order MRP");
            //     return;
            // }
            //Validate Fields of an item
            if(	   $scope.newOrderItem.itemDetails.Product == ""
                || typeof $scope.newOrderItem.itemDetails.Product == "undefined")
            {
                //throw up modal for reConfirmation of  submission of order
                Settings.alertPopup( "Alert", "Item Not Selected");
                return;
            }
            // if($scope.newOrderItem.quantity < MIN_ORDER || $scope.newOrderItem.quantity == null)
            // {
            //     Settings.alertPopup("danger", "In New Order Addition", MIN_ORDER + " is minimum number of items that must be ordered" );
            //     return;
            // }
            //Check if the item is already in the order
            if($scope.doesItemExistsInCart($scope.newOrderItemList, "itemCode", $scope.newOrderItem.itemDetails) >= 0){
                Settings.alertPopup("info",  "Item already exists in the order, please check");
                return;
            }
            //Price of Order
                $scope.newOrderItem.total = $scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.MRP;
                $scope.newOrderItem.orderTotal = $scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.orderMRP;
                $scope.newOrderItem.MRP = $scope.newOrderItem.itemDetails.MRP;
                $scope.newOrderItem.orderMRP = $scope.newOrderItem.itemDetails.orderMRP;
                if(invtQty){
                    $scope.newOrderItem.totalInventory = invtQty;
                }
            if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItem.itemDetails.BulkPrice){
                //Calculate discount
                // var discount = (($scope.newOrderItem.MRP - $scope.newOrderItem.itemDetails.BulkPrice)/$scope.newOrderItem.MRP) * 100;
                // if(discount > 0){
                //     $scope.newOrderItem.Specials = discount.toFixed(2);
                // }else{
                $scope.newOrderItem.Specials = 0;
                // }
                if(item.gst || defaultTax){
                    if(!$scope.taxExclusive){
                        $scope.newOrderItem.taxableValue =
                            (($scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.BulkPrice) /
                                (100 + $scope.newOrderItem.CGST + $scope.newOrderItem.SGST + $scope.newOrderItem.IGST)) * 100;
                        $scope.newOrderItem.BulkPrice = $scope.newOrderItem.itemDetails.BulkPrice;
                    }else{
                        $scope.newOrderItem.taxableValue = $scope.newOrderItem.itemDetails.BulkPrice *$scope.newOrderItem.quantity  ;
                        $scope.newOrderItem.BulkPrice =
                            ( $scope.newOrderItem.itemDetails.BulkPrice) +
                            (( $scope.newOrderItem.CGST * $scope.newOrderItem.itemDetails.BulkPrice)/100 + ($scope.newOrderItem.SGST* $scope.newOrderItem.itemDetails.BulkPrice)/100 + ($scope.newOrderItem.IGST* $scope.newOrderItem.itemDetails.BulkPrice)/100);
                    }
                }else{
                    if($scope.taxSetups.otherSetup != 'other'){
                        $scope.newOrderItem.taxableValue =
                            (($scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.BulkPrice) /
                                (100 + $scope.newOrderItem.CGST + $scope.newOrderItem.SGST + $scope.newOrderItem.IGST)) * 100;
                    }else if($scope.taxSetups.otherSetup == 'other' && item.otherTaxes && item.otherTaxes.length){
                        var otherTaxes = 0;
                        for(var j=0; j< item.otherTaxes.length; j++){
                            otherTaxes += item.otherTaxes[j].value;
                        }
                        $scope.newOrderItem.taxableValue = (($scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.BulkPrice) / (100 + otherTaxes)) * 100;
                    }
                }
            }else{
                if(item.Specials){
                    //Calculate discount
                    var discount = Number(item.Specials);
                    if(discount > 0){
                        $scope.newOrderItem.Specials = discount.toFixed(2);
                    }else{
                        $scope.newOrderItem.Specials = 0;
                    }
                }else{
                    //Calculate discount
                    $scope.newOrderItem.Specials = 0;
                }
                if((item.gst || defaultTax) && $scope.taxSetups.otherSetup != 'other'){
                    if(!$scope.taxExclusive){
                        $scope.newOrderItem.taxableValue =
                            (($scope.newOrderItem.quantity  * $scope.newOrderItem.orderMRP) /
                                (100 + $scope.newOrderItem.CGST + $scope.newOrderItem.SGST + $scope.newOrderItem.IGST)) * 100;
                        $scope.newOrderItem.orderMRP = $scope.newOrderItem.itemDetails.orderMRP;
                    }else{
                        $scope.newOrderItem.taxableValue = $scope.newOrderItem.itemDetails.orderMRP *$scope.newOrderItem.quantity ;
                        $scope.newOrderItem.orderMRP =
                            ( $scope.newOrderItem.itemDetails.orderMRP) +
                            (( $scope.newOrderItem.CGST * $scope.newOrderItem.itemDetails.orderMRP)/100 + ($scope.newOrderItem.SGST* $scope.newOrderItem.itemDetails.orderMRP)/100 + ($scope.newOrderItem.IGST* $scope.newOrderItem.itemDetails.orderMRP)/100);
                    }
                }else if(item.otherTaxes && item.otherTaxes.length && $scope.taxSetups.otherSetup == 'other'){
                    if(!$scope.taxExclusive){
                        var otherTaxes = 0;
                        for(var i=0;i< item.otherTaxes.length; i++){
                            otherTaxes += item.otherTaxes[i].value;
                        }
                        $scope.newOrderItem.taxableValue =
                            (($scope.newOrderItem.quantity  * $scope.newOrderItem.orderMRP) /
                                (100 + otherTaxes)) * 100;
                        $scope.newOrderItem.orderMRP = $scope.newOrderItem.itemDetails.orderMRP;
                    }else{
                        var otherTaxes = 0;
                        $scope.newOrderItem.taxableValue = $scope.newOrderItem.itemDetails.orderMRP *$scope.newOrderItem.quantity;
                        if(item.otherTaxes && item.otherTaxes.length){
                            for(var i=0;i< item.otherTaxes.length; i++){
                                otherTaxes += ( item.otherTaxes[i].value * $scope.newOrderItem.itemDetails.orderMRP)/100;
                            }
                        }
                        $scope.newOrderItem.orderMRP = $scope.newOrderItem.itemDetails.orderMRP + otherTaxes;
                    }
                }else {
                    $scope.newOrderItem.taxableValue =
                        (($scope.newOrderItem.quantity  * $scope.newOrderItem.orderMRP) /
                            (100 + $scope.newOrderItem.CGST + $scope.newOrderItem.SGST + $scope.newOrderItem.IGST)) * 100;
                }
            }
            var date = new Date;
            $scope.newOrderItem.lineComment = {};
            $scope.newOrderItem.lineComment.date_added = [date.getFullYear(),(date.getMonth()+1).padLeft(), date.getDate().padLeft() ].join('-') + ' '
                + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join (':');
            $scope.newOrderItem.lineComment.username = $scope.user.role ? $scope.user.username : 'PORTAL ADMIN';
            $scope.newOrderItem.lineComment.userphone = $scope.user.sellerphone ? $scope.user.sellerphone : '';
            $scope.newOrderItem.lineComment.comment = lineComment ? lineComment : '';
            //Push items to the order items list
            $scope.newOrderItemList.unshift($scope.newOrderItem);
            var indexInCatalogue = $scope.doesItemExistsInArray($scope.items, "itemCode", $scope.newOrderItem.itemDetails);
            $scope.itemsInModal[indexInCatalogue].added        = $scope.newOrderItemList.length - 1 ;
            //Initialize
            $scope.newOrderItem = {
                itemDetails:{},
                quantity: 1,
                total: 0,
                MRP:0,
                orderMRP:0,
                CGST:0,
                SGST:0,
                IGST : 0,
                otherTaxes: []
            };
            $scope.data.category = "";
            //To display option to add item need to be displayed
            $scope.displayAddItemOption = false;
            return $scope.newOrderItemList.length;
        }
        //Order Id generator
        //Its picked up from the app code as thats what is been used by the apps to generate
        //order id. Its as is
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
        $scope.Taxtotal = function(){
            $scope.GST = {};
            $scope.otherTaxCal = {};
            $scope.otherTaxCal.otherTax = [];
            $scope.GST.CSGSTTotal = 0;
            $scope.GST.SGSTTotal = 0;
            $scope.GST.IGSTTotal = 0;
            $scope.newOrderExcTaxNHIL = 0;
            $scope.newOrderExcTaxGETL = 0;
            $scope.newOrderExcTaxVAT = 0;
            var ghanaOrderTotal = 0;
            $scope.GST.listTotal = [];
            $scope.GST.orderTotal = [];
            $scope.GST.Quantity = 0;
            $scope.GST.taxableValue = [];
            $scope.otherTaxCal.listTotal = [];
            $scope.otherTaxCal.Quantity = 0;
            $scope.otherTaxCal.orderTotal = [];
            $scope.otherTaxCal.taxableValue = [];
            $scope.otherTaxCal.otherTaxesTotal = [];
            $scope.otherTaxCal.taxSetup = $scope.taxSetups.otherSetup;
            //console.log($scope.newOrderItemList)
            for(var i=0;i<$scope.newOrderItemList.length;i++){
                if($scope.tempCountryName != 'ghana') {
                    var taxableValue = 0;
                    if ($scope.taxExclusive) {
                        if ($scope.taxSetups.otherSetup == 'other') {
                            if ($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice) {
                                taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice)
                                $scope.GST.orderTotal[i] = ( parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice)) +
                                    (( $scope.newOrderItemList[i].CGST * $scope.newOrderItemList[i].itemDetails.BulkPrice) / 100 + ($scope.newOrderItemList[i].SGST * $scope.newOrderItemList[i].itemDetails.BulkPrice) / 100 + ($scope.newOrderItemList[i].IGST * $scope.newOrderItemList[i].itemDetails.BulkPrice) / 100);
                                $scope.GST.orderTotal[i] = $scope.GST.orderTotal[i] * Number($scope.newOrderItemList[i].quantity);
                                $scope.GST.taxableValue[i] = Number($scope.newOrderItemList[i].itemDetails.BulkPrice) * Number($scope.newOrderItemList[i].quantity)
                            } else {
                                if ($scope.newOrderItemList[i].itemDetails.otherTaxes && $scope.newOrderItemList[i].itemDetails.otherTaxes.length) {
                                    taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP)
                                    // taxableValue = taxableValue * Number($scope.newOrderItemList[i].quantity);
                                    var otherTaxesCal = 0;
                                    for (var j = 0; j < $scope.newOrderItemList[i].itemDetails.otherTaxes.length; j++) {
                                        if (!$scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name])
                                            $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = 0;
                                        otherTaxesCal += (taxableValue * $scope.newOrderItemList[i].otherTaxes[j].value) / 100;
                                        $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] += ((taxableValue * $scope.newOrderItemList[i].itemDetails.otherTaxes[j].value) / 100) * Number($scope.newOrderItemList[i].quantity);
                                    }
                                } else {
                                    taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP)
                                    //taxableValue = taxableValue * Number($scope.newOrderItemList[i].quantity);
                                    var otherTaxesCal = 0;
                                    for (var j = 0; j < $scope.newOrderItemList[i].otherTaxes.length; j++) {
                                        if (!$scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name])
                                            $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name] = 0;
                                        otherTaxesCal += (taxableValue * $scope.newOrderItemList[i].otherTaxes[j].value) / 100;
                                        $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name] += ((taxableValue * $scope.newOrderItemList[i].otherTaxes[j].value) / 100) * Number($scope.newOrderItemList[i].quantity);
                                    }
                                }
                                $scope.otherTaxCal.orderTotal[i] = (parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP) + otherTaxesCal);
                                // $scope.GST.orderTotal[i] = ( parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP)) +
                                //     (( $scope.newOrderItemList[i].CGST * $scope.newOrderItemList[i].itemDetails.orderMRP)/100 + ($scope.newOrderItemList[i].SGST* $scope.newOrderItemList[i].itemDetails.orderMRP)/100 + ($scope.newOrderItemList[i].IGST* $scope.newOrderItemList[i].itemDetails.orderMRP)/100);
                                $scope.otherTaxCal.orderTotal[i] = $scope.otherTaxCal.orderTotal[i] * Number($scope.newOrderItemList[i].quantity);
                                $scope.otherTaxCal.taxableValue[i] = Number($scope.newOrderItemList[i].itemDetails.orderMRP) * Number($scope.newOrderItemList[i].quantity)
                            }
                        } else {
                            if ($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice) {
                                taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice)
                                $scope.GST.orderTotal[i] = ( parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice)) +
                                    (( $scope.newOrderItemList[i].CGST * $scope.newOrderItemList[i].itemDetails.BulkPrice) / 100 + ($scope.newOrderItemList[i].SGST * $scope.newOrderItemList[i].itemDetails.BulkPrice) / 100 + ($scope.newOrderItemList[i].IGST * $scope.newOrderItemList[i].itemDetails.BulkPrice) / 100);
                                $scope.GST.orderTotal[i] = $scope.GST.orderTotal[i] * Number($scope.newOrderItemList[i].quantity);
                                $scope.GST.taxableValue[i] = Number($scope.newOrderItemList[i].itemDetails.BulkPrice) * Number($scope.newOrderItemList[i].quantity)
                            } else {
                                taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP)
                                $scope.GST.orderTotal[i] = ( parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP)) +
                                    (( $scope.newOrderItemList[i].CGST * $scope.newOrderItemList[i].itemDetails.orderMRP) / 100 + ($scope.newOrderItemList[i].SGST * $scope.newOrderItemList[i].itemDetails.orderMRP) / 100 + ($scope.newOrderItemList[i].IGST * $scope.newOrderItemList[i].itemDetails.orderMRP) / 100);
                                $scope.GST.orderTotal[i] = $scope.GST.orderTotal[i] * Number($scope.newOrderItemList[i].quantity);
                                $scope.GST.taxableValue[i] = Number($scope.newOrderItemList[i].itemDetails.orderMRP) * Number($scope.newOrderItemList[i].quantity)
                            }
                        }
                    } else {
                        if ($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice) {
                            taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice) / (100 + $scope.newOrderItemList[i].CGST + $scope.newOrderItemList[i].SGST + $scope.newOrderItemList[i].IGST) * 100;
                            $scope.GST.taxableValue[i] = Number(taxableValue) * Number($scope.newOrderItemList[i].quantity)
                            $scope.GST.orderTotal[i] = Number($scope.newOrderItemList[i].quantity) * parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice);
                        } else {
                            if ($scope.taxSetups.otherSetup != 'other') {
                                taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP) / (100 + $scope.newOrderItemList[i].CGST + $scope.newOrderItemList[i].SGST + $scope.newOrderItemList[i].IGST) * 100;
                                $scope.GST.taxableValue[i] = Number(taxableValue) * Number($scope.newOrderItemList[i].quantity)
                                $scope.GST.orderTotal[i] = Number($scope.newOrderItemList[i].quantity) * parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                            } else if ($scope.taxSetups.otherSetup == 'other') {
                                var otherTaxesValue = 0;
                                for (var j = 0; j < $scope.newOrderItemList[i].otherTaxes.length; j++) {
                                    otherTaxesValue += $scope.newOrderItemList[i].otherTaxes[j].value;
                                }
                                taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP) / (100 + otherTaxesValue) * 100;
                                $scope.otherTaxCal.taxableValue[i] = Number(taxableValue) * Number($scope.newOrderItemList[i].quantity)
                                $scope.otherTaxCal.orderTotal[i] = Number($scope.newOrderItemList[i].quantity) * parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                                var otherTaxesCal = 0;
                                taxableValue = taxableValue * Number($scope.newOrderItemList[i].quantity);
                                if ($scope.newOrderItemList[i].itemDetails.otherTaxes && $scope.newOrderItemList[i].itemDetails.otherTaxes.length) {
                                    for (var j = 0; j < $scope.newOrderItemList[i].itemDetails.otherTaxes.length; j++) {
                                        if (!$scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name])
                                            $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = 0;
                                        $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] += (taxableValue * $scope.newOrderItemList[i].itemDetails.otherTaxes[j].value) / 100;
                                    }
                                } else if ($scope.newOrderItemList[i].otherTaxes && $scope.newOrderItemList[i].otherTaxes.length) {
                                    for (var j = 0; j < $scope.newOrderItemList[i].otherTaxes.length; j++) {
                                        if (!$scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name])
                                            $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name] = 0;
                                        $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name] += (taxableValue * $scope.newOrderItemList[i].otherTaxes[j].value) / 100;
                                    }
                                }
                            }
                        }
                    }
                    $scope.GST.CSGSTTotal += (parseFloat($scope.newOrderItemList[i].CGST / 100) * taxableValue) * Number($scope.newOrderItemList[i].quantity);
                    $scope.GST.SGSTTotal += (parseFloat($scope.newOrderItemList[i].SGST / 100) * taxableValue) * Number($scope.newOrderItemList[i].quantity);
                    $scope.GST.IGSTTotal += (parseFloat($scope.newOrderItemList[i].IGST / 100) * taxableValue) * Number($scope.newOrderItemList[i].quantity);
                    $scope.GST.listTotal[i] = Number($scope.newOrderItemList[i].quantity) * (parseFloat($scope.newOrderItemList[i].itemDetails.MRP));
                    $scope.GST.Quantity += Number($scope.newOrderItemList[i].quantity);
                    $scope.otherTaxCal.listTotal[i] = Number($scope.newOrderItemList[i].quantity) * (parseFloat($scope.newOrderItemList[i].itemDetails.MRP));
                    $scope.otherTaxCal.Quantity += Number($scope.newOrderItemList[i].quantity);
                }
                if($scope.tempCountryName == 'ghana'){
                    var taxableValue = 0;
                    if($scope.taxExclusive){
                        if($scope.taxSetups.otherSetup == 'other'){
                            if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice){
                                // taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice)
                                taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice * $scope.newOrderItemList[i].quantity);
                                $scope.newOrderExcTaxNHIL = (taxableValue *$scope.ghanaTax.NHIL)/100;
                                $scope.newOrderExcTaxGETL = (taxableValue * $scope.ghanaTax.GETL)/100;
                                $scope.newOrderExcTaxVAT = (taxableValue * $scope.ghanaTax.VAT)/100;
                                $scope.newOrderExcTaxCOVID = (taxableValue * $scope.ghanaTax.COVID)/100;
                                var grandTotalTax = parseFloat($scope.newOrderExcTaxNHIL  +  $scope.newOrderExcTaxGETL  +  $scope.newOrderExcTaxVAT + $scope.newOrderExcTaxCOVID);
                                $scope.GST.orderTotal[i] = ( parseFloat(taxableValue)) + grandTotalTax;
                                // $scope.GST.orderTotal[i] = $scope.GST.orderTotal[i] * Number($scope.newOrderItemList[i].quantity);
                                $scope.GST.taxableValue[i] = Number($scope.newOrderItemList[i].itemDetails.BulkPrice) * Number($scope.newOrderItemList[i].quantity)
                            }else{
                                if($scope.newOrderItemList[i].itemDetails.otherTaxes && $scope.newOrderItemList[i].itemDetails.otherTaxes.length){
                                    taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP)
                                    // taxableValue = taxableValue * Number($scope.newOrderItemList[i].quantity);
                                    var otherTaxesCal = 0;
                                    for(var j=0; j< $scope.newOrderItemList[i].itemDetails.otherTaxes.length; j++){
                                        if(!$scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name])
                                            $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = 0;
                                        otherTaxesCal += (taxableValue * $scope.newOrderItemList[i].otherTaxes[j].value) / 100;
                                        $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] += ((taxableValue * $scope.newOrderItemList[i].itemDetails.otherTaxes[j].value) / 100) * Number($scope.newOrderItemList[i].quantity);
                                    }
                                }else{
                                    taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP)
                                    //taxableValue = taxableValue * Number($scope.newOrderItemList[i].quantity);
                                    var otherTaxesCal = 0;
                                    for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                                        if(!$scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name])
                                            $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name] = 0;
                                        otherTaxesCal += (taxableValue * $scope.newOrderItemList[i].otherTaxes[j].value) / 100;
                                        $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name] += ((taxableValue * $scope.newOrderItemList[i].otherTaxes[j].value) / 100) * Number($scope.newOrderItemList[i].quantity);
                                    }
                                }
                                $scope.otherTaxCal.orderTotal[i] = (parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP) + otherTaxesCal);
                                // $scope.GST.orderTotal[i] = ( parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP)) +
                                //     (( $scope.newOrderItemList[i].CGST * $scope.newOrderItemList[i].itemDetails.orderMRP)/100 + ($scope.newOrderItemList[i].SGST* $scope.newOrderItemList[i].itemDetails.orderMRP)/100 + ($scope.newOrderItemList[i].IGST* $scope.newOrderItemList[i].itemDetails.orderMRP)/100);
                                $scope.otherTaxCal.orderTotal[i] = $scope.otherTaxCal.orderTotal[i] * Number($scope.newOrderItemList[i].quantity);
                                $scope.otherTaxCal.taxableValue[i] = Number($scope.newOrderItemList[i].itemDetails.orderMRP) * Number($scope.newOrderItemList[i].quantity)
                            }
                        }else{
                            if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice){
                                // taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice);
                                taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice * $scope.newOrderItemList[i].quantity);
                                $scope.newOrderExcTaxNHIL = (taxableValue *$scope.ghanaTax.NHIL)/100;
                                $scope.newOrderExcTaxGETL = (taxableValue * $scope.ghanaTax.GETL)/100;
                                $scope.newOrderExcTaxVAT = (taxableValue * $scope.ghanaTax.VAT)/100;
                                $scope.newOrderExcTaxCOVID = (taxableValue * $scope.ghanaTax.COVID)/100;
                                var grandTotalTax = parseFloat($scope.newOrderExcTaxNHIL  +  $scope.newOrderExcTaxGETL  +  $scope.newOrderExcTaxVAT + $scope.newOrderExcTaxCOVID);
                                $scope.newOrderExcTaxNHIL = parseFloat($scope.newOrderExcTaxNHIL.toFixed(2));
                                $scope.newOrderExcTaxGETL = parseFloat($scope.newOrderExcTaxGETL.toFixed(2));
                                $scope.newOrderExcTaxVAT = parseFloat($scope.newOrderExcTaxVAT.toFixed(2));
                                $scope.newOrderExcTaxCOVID = parseFloat($scope.newOrderExcTaxCOVID.toFixed(2));
                                $scope.GST.orderTotal[i] = ( parseFloat(taxableValue)) + grandTotalTax;
                                // $scope.GST.orderTotal[i] = $scope.GST.orderTotal[i] * Number($scope.newOrderItemList[i].quantity);
                                $scope.GST.taxableValue[i] = Number($scope.newOrderItemList[i].itemDetails.BulkPrice) * Number($scope.newOrderItemList[i].quantity)
                            }else{
                                // taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                                taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP * $scope.newOrderItemList[i].quantity);
                                $scope.newOrderExcTaxNHIL = (taxableValue *$scope.ghanaTax.NHIL)/100;
                                $scope.newOrderExcTaxGETL = (taxableValue * $scope.ghanaTax.GETL)/100;
                                $scope.newOrderExcTaxVAT = (taxableValue * $scope.ghanaTax.VAT)/100;
                                $scope.newOrderExcTaxCOVID = (taxableValue * $scope.ghanaTax.COVID)/100;
                                var grandTotalTax = parseFloat($scope.newOrderExcTaxNHIL  +  $scope.newOrderExcTaxGETL  +  $scope.newOrderExcTaxVAT + $scope.newOrderExcTaxCOVID);
                                $scope.newOrderExcTaxNHIL = parseFloat($scope.newOrderExcTaxNHIL.toFixed(2));
                                $scope.newOrderExcTaxGETL = parseFloat($scope.newOrderExcTaxGETL.toFixed(2));
                                $scope.newOrderExcTaxVAT = parseFloat($scope.newOrderExcTaxVAT.toFixed(2));
                                $scope.newOrderExcTaxCOVID = parseFloat($scope.newOrderExcTaxCOVID.toFixed(2));
                                $scope.GST.orderTotal[i] = ( parseFloat(taxableValue)) + grandTotalTax;
                                // $scope.GST.orderTotal[i] = parseFloat($scope.GST.orderTotal[i] * Number($scope.newOrderItemList[i].quantity).toFixed(2));
                                $scope.GST.taxableValue[i] = Number($scope.newOrderItemList[i].itemDetails.orderMRP) * Number($scope.newOrderItemList[i].quantity)
                            }
                        }
                    }else{
                        if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice) {
                            taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice) / (100 + $scope.newOrderItemList[i].CGST + $scope.newOrderItemList[i].SGST + $scope.newOrderItemList[i].IGST) * 100;
                            $scope.GST.taxableValue[i] = Number(taxableValue) * Number($scope.newOrderItemList[i].quantity)
                            $scope.GST.orderTotal[i] = Number($scope.newOrderItemList[i].quantity) * parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice);
                        }else{
                            if($scope.taxSetups.otherSetup != 'other'){
                                taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP) / (100 + $scope.newOrderItemList[i].CGST + $scope.newOrderItemList[i].SGST + $scope.newOrderItemList[i].IGST) * 100;
                                $scope.GST.taxableValue[i] = Number(taxableValue) * Number($scope.newOrderItemList[i].quantity)
                                $scope.GST.orderTotal[i] = Number($scope.newOrderItemList[i].quantity) * parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                            }else if($scope.taxSetups.otherSetup == 'other'){
                                var otherTaxesValue = 0;
                                for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                                    otherTaxesValue += $scope.newOrderItemList[i].otherTaxes[j].value;
                                }
                                taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP) / (100 + otherTaxesValue) * 100;
                                $scope.otherTaxCal.taxableValue[i] = Number(taxableValue) * Number($scope.newOrderItemList[i].quantity)
                                $scope.otherTaxCal.orderTotal[i] = Number($scope.newOrderItemList[i].quantity) * parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                                var otherTaxesCal = 0;
                                taxableValue = taxableValue * Number($scope.newOrderItemList[i].quantity);
                                if($scope.newOrderItemList[i].itemDetails.otherTaxes && $scope.newOrderItemList[i].itemDetails.otherTaxes.length){
                                    for(var j=0; j< $scope.newOrderItemList[i].itemDetails.otherTaxes.length; j++){
                                        if(!$scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name])
                                            $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = 0;
                                        $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] += (taxableValue * $scope.newOrderItemList[i].itemDetails.otherTaxes[j].value) / 100;
                                    }
                                }else if($scope.newOrderItemList[i].otherTaxes && $scope.newOrderItemList[i].otherTaxes.length){
                                    for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                                        if(!$scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name])
                                            $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name] = 0;
                                        $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name] += (taxableValue * $scope.newOrderItemList[i].otherTaxes[j].value) / 100;
                                    }
                                }
                            }
                        }
                    }
                    ghanaOrderTotal += taxableValue;
                    $scope.newOrderExcTaxNHIL = (ghanaOrderTotal * $scope.ghanaTax.NHIL)/100;
                    $scope.newOrderExcTaxGETL = (ghanaOrderTotal * $scope.ghanaTax.GETL)/100;
                    $scope.newOrderExcTaxVAT = (ghanaOrderTotal * $scope.ghanaTax.VAT)/100;
                    $scope.newOrderExcTaxCOVID = (ghanaOrderTotal * $scope.ghanaTax.COVID)/100;
                    $scope.GST.CSGSTTotal = $scope.newOrderExcTaxNHIL ;
                    $scope.GST.SGSTTotal =  $scope.newOrderExcTaxGETL ;
                    $scope.GST.IGSTTotal = $scope.newOrderExcTaxVAT;
                    $scope.GST.COVID = $scope.newOrderExcTaxCOVID;
                    $scope.newOrderExcTaxNHIL = parseFloat($scope.newOrderExcTaxNHIL.toFixed(2));
                    $scope.newOrderExcTaxGETL = parseFloat($scope.newOrderExcTaxGETL.toFixed(2));
                    $scope.newOrderExcTaxVAT = parseFloat($scope.newOrderExcTaxVAT.toFixed(2));
                    $scope.newOrderExcTaxCOVID = parseFloat($scope.newOrderExcTaxCOVID.toFixed(2));
                    $scope.GST.listTotal[i] = Number($scope.newOrderItemList[i].quantity) * (parseFloat($scope.newOrderItemList[i].itemDetails.MRP));
                    $scope.GST.Quantity += Number($scope.newOrderItemList[i].quantity);
                    $scope.otherTaxCal.listTotal[i] = Number($scope.newOrderItemList[i].quantity) * (parseFloat($scope.newOrderItemList[i].itemDetails.MRP));
                    $scope.otherTaxCal.Quantity += Number($scope.newOrderItemList[i].quantity);
                }
            }
        }
        //order
        $scope.handleCancelNewOrder = function(){
            $scope.addOrderButton =	!$scope.addOrderButton;
            $scope.addPosButton = false;
            $scope.displayAddItemOption=false;
            $scope.data.newOrderStore = {};
            $scope.orderViewTab.tab = 0;
            $scope.data.newOrderSalesPerson = {};
            $scope.a.selectedSalesPerson = "";
            $scope.disableSalesPersonSelection = true;
            $scope.a.selectedStores = {};
            $scope.data.tempCity = "";
            $scope.data.tempState = "";
            $scope.showDealerDetails = false;
            $window.scrollTo(0, 0);
            $scope.viewLength = 0;
            $scope.newViewBy = localViewBy;
            if($scope.user.role != 'Dealer' && $scope.order_count < localViewBy){
                $scope.newViewBy = $scope.order_count;
            }
            if($scope.user.role == 'Dealer' && $scope.order_count < localViewBy){
                $scope.newViewBy = $scope.order_count;
            }
            $scope.displayBGWhite = true;
            $scope.$apply();
        }
        $scope.intitializeNewOrder = function(){
            //Some HTML Models to be reset
            $scope.data = 	{
                "newOrderSalesPerson": {},
                "newOrderStore": {},
                "newOrderBilling_address": "",
                "newOrderShipping_address": "",
                "newOrderFulfiller": "",
                "newOrderStatus": "New",
                "newOrderDateTime" : "",
                "newOrderDate": "",
                "newOrderId"   : "",
                "newOrderComment":"",
                "category" 	: "",
                "newOrderfreight": 0,
                "chequenum": "",
                "bankname": ""
            }
            //old order frieght need to stored , in case frieght charge changes
            //we need it to recalculate the value of total amount
            $scope.data.oldOrderfreight = $scope.data.newOrderfreight;
            //Need for editing the items entered
            $scope.newOrderItemEditing = [];
            $scope.newOrder = [];
            //For typeahead for store and sales person
            $scope.display = {};
            $scope.disableSalesPersonSelection = true;
            //With primitive type selectedStores, scope assignments in controllers
            // are not reflected on html, so make it into an object, now changes are reflected
            $scope.a = {};
            $scope.a.selectedStores = "";
            $scope.a.selectedSalesPerson = "";
            $scope.displayAddItemOption = false;  //to display item options to add item to order
            $scope.editShippingAddress = {};
            $scope.editShippingAddress.flag = false;
            $scope.tempnewOrderShipping_address = "";
            $scope.editpurchaseShippingAddress = false;
            $scope.tempnewpurchaseOrderShipping_address = "";
            $scope.newOrderItemList 		= [];
            $scope.newOrderItem 			= {
                itemDetails:{},
                quantity: 1,
                total: 0,
                MRP: 0,
                orderMRP:0,
                CGST:0,
                SGST:0,
                IGST: 0
            };
            $scope.newOrderTotalAmount = 0;
            // $scope.newOrderMRPTotalAmount = 0;
            //Clear order should clear the catalogue displayed selections
            if($scope.itemsInModal)
                for(var i=0; i < $scope.itemsInModal.length; i++ )
                {
                    $scope.itemsInModal[i].added = -1;
                    $scope.itemsInModal[i].itemQuantity = '';
                }
            if($scope.user.role == 'Dealer'){
                console.log("Store assigned to Dealer user")
                $scope.a.selectedStores = newOrderSelectedStore;
                $scope.data.newOrderStore = newOrderSelectedStore;
                $scope.StoreSelectedFromTypeahead(newOrderSelectedStore);
                $scope.changeOrderView(1)
            }
        }
        //Data preparations that are needed before we take a new order
        $scope.addPosInitialize = function(flag){
            $scope.edit =false;
            if(!flag){
                $scope.displayBGWhite = true;
                $scope.addPosButton = true;
                $scope.addOrderButton = false;
            }
            $scope.intitializeNewOrder();		//Reset the new order page
            $scope.PosDealer = {};
            $scope.orderPriceList = '';
            $scope.categorySearch = "Searching in all Categories";
            $scope.KeyWordSearch = "";
            $scope.searchMessage = $scope.categorySearch + " " + $scope.KeyWordSearch;
            $scope.categorySelected = {	'All': true	};
            $scope.viewLength = 0;
            $scope.newViewBy = viewBy.dealer;
            $scope.filterTagsArray = [
                { strictWhenEmpty:  true, type: filterTagTypes.select, 		'Manufacturer'  : []},
                { strictWhenEmpty: false, type:	filterTagTypes.valueString, 'Product': []}
            ];
            var sellerSearchObj = {};
            sellerSearchObj.viewLength = 0;
            sellerSearchObj.viewBy = initialUserViewBy;
            sellerSearchObj.searchFor = '';
            sellerSearchObj.statusFilter = 'allUsers';
            sellerSearchObj.searchBy = [];
            sellerSearchObj.userLoginDetails = $scope.user ;
            $scope.showDealerDetails = true;
            $http.post("/dash/users/list", sellerSearchObj)
                .success(function (res) {
                    $scope.sellers = res;
                    //$scope.data.newOrderStore.Seller - contains seller mobile number in number format
                    if($scope.user.role != ''){
                        for(var i = 0; i < $scope.sellers.length ; i++){
                            if( $scope.sellers[i].sellerphone == $scope.user.seller)
                            {
                                $scope.data.newOrderSalesPerson = $scope.sellers[i];
                                $scope.a.selectedSalesPerson = $scope.data.newOrderSalesPerson.sellername;
                                break;
                            }
                        }
                    }
                    else if($scope.data.newOrderStore.Seller == "" || typeof $scope.data.newOrderStore.Seller == "undefined")
                        $scope.disableSalesPersonSelection = false;
                    else{
                        for(var i = 0; i < $scope.sellers.length ; i++)
                            if( $scope.sellers[i].sellerphone == $scope.data.newOrderStore.Seller)
                            {
                                $scope.data.newOrderSalesPerson = $scope.sellers[i];
                                $scope.a.selectedSalesPerson = $scope.data.newOrderSalesPerson.sellername;
                                break;
                            }
                    }
                });
            // $scope.handleChangeInCategory('Manufacturer', 'All')
            //         $scope.clearFilter(2);
            $scope.clearFilter(2);
            $scope.data.newOrderId = $scope.generateOrderId();
            jQuery.noConflict();
            $('#newOrderDealerSearchBox').val(null);
        }//End of addOrderInitialize
        $scope.addPosInitialize();
        var temp;
        $scope.posPaymentType = function (amt,type) {
            console.log('amt',amt)
            if(amt >= 0){
                $scope.posPaymentObj.totalPaid = 0;
                $scope.posPaymentObj.posOutstandingAmt =  parseFloat($scope.posPaymentObj.amount.toFixed(2));
                for(var i=0;i<$scope.posPaymentMode.length; i++){
                    if($scope.posPaymentMode[i].id == type){
                        $scope.posPaymentMode[i].amt = amt;
                    }
                    if($scope.posPaymentMode[i].amt){
                        $scope.posPaymentObj.posOutstandingAmt -=$scope.posPaymentMode[i].amt;
                        $scope.posPaymentObj.totalPaid += $scope.posPaymentMode[i].amt;
                    }
                }
            }
        }
        // paymentsType(type){
        //     if (type.amount >= 0){
        //         this.outstandingAmount = this.cartTotal.totalAmount;
        //         this.paymode = [];
        //         let temp_amt = 0;
        //         temp_amt = type.value;
        //         this.content.resize();
        //         for(let i=0;i<this.paymentDetails.length;i++){
        //             if(this.paymentDetails[i].amount){
        //                 this.outstandingAmount -= this.paymentDetails[i].amount;
        //                 this.outstandingAmount = Number(this.outstandingAmount.toFixed(2))
        //                 this.paymode.push(this.paymentDetails[i]);
        //             }
        //         }
        //     }
        //
        // }
        $scope.posConfirm = function() {
            $scope.posPaymentModel.Flag = false;
            var temp = 0;
            $scope.orderTotalPrice = $scope.dealerOrderTotalPrice;
            for (var i = 0; i < $scope.newOrderItemList.length; i++) {
                temp = $scope.newOrderItemList[i].quantity * $scope.newOrderItemList[i].total;
                $scope.orderTotalPrice = $scope.orderTotalPrice + temp;
                if($scope.newOrderItemList[i].itemDetails.looseQty){
                    if($scope.newOrderItemList[i].quantity <= 0 || !$scope.newOrderItemList[i].quantity){
                        Settings.alertPopup("Alert", "Please Enter a Valid  Quantity for "+$scope.newOrderItemList[i].itemDetails.Product);
                        return;
                    }
                }else{
                    if($scope.newOrderItemList[i].quantity <= 0 || !$scope.newOrderItemList[i].quantity || ((typeof $scope.newOrderItemList[i].quantity === 'number') && ($scope.newOrderItemList[i].quantity % 1 != 0))){
                        Settings.alertPopup("Alert", "Please Enter a Valid  Quantity for "+$scope.newOrderItemList[i].itemDetails.Product);
                        return;
                    }
                }
            }
            if($scope.posDiscount.value){
                $scope.posPaymentObj.orderTotal = $scope.discountMrp;
                if($scope.tempCountryName == 'ghana'){
                    $scope.posPaymentObj.amount =  $scope.discountMrp;
                }else{
                    $scope.posPaymentObj.amount =  Math.round($scope.discountMrp);
                }
            }else{
                $scope.posPaymentObj.orderTotal= $scope.newOrderMRPTotalAmount;
                if($scope.tempCountryName == 'ghana'){
                    $scope.posPaymentObj.amount = $scope.newOrderMRPTotalAmount;
                }else{
                    $scope.posPaymentObj.amount =  Math.round($scope.newOrderMRPTotalAmount);
                }
            }
            $scope.posPaymentObj.posOutstandingAmt = $scope.posPaymentObj.orderTotal;
            // $('#posOrderPayment').modal('show');
            if($scope.PosDealer.Phone && !$scope.filteredDealer){
                dealerSearchObj.viewLength = 0;
                dealerSearchObj.viewBy = initialViewBy;
                var dealerPhone = 0;
                if($scope.PosDealer.countryCode && $scope.PosDealer.countryCode != '+91'){
                    dealerPhone = Number($scope.PosDealer.countryCode + $scope.PosDealer.Phone)
                }else{
                    dealerPhone = $scope.PosDealer.Phone
                }
                dealerSearchObj.searchFor = dealerPhone.toString();
                dealerSearchObj.searchBy = dealerSearchBy;
                $http.post('/dash/stores', dealerSearchObj)
                    .success(function(res){
                        if(res.length == 1){
                            $scope.PosDealer = res[0];
                            $scope.filteredDealer = true;
                        }
                    });
            }
            if($scope.PosDealer.Phone){
                if( $scope.PosDealer.Phone.toString().length == 10 && !$scope.filteredDealer){
                    $http.get("/dash/get/recentID/dealer")
                        .success(function(res){
                            if(res.Dealercode){
                                $scope.Dealercodetemp = 1001;
                                $scope.Dealercodetemp = res.Dealercode + 1;
                                $scope.dealer.Dealercode = res.Dealercode + 1;
                            }else{
                                $scope.dealer.Dealercode = 1001;
                            }
                        })
                }else{
                    $http.get("/dash/get/recentID/dealer")
                        .success(function(res){
                            if(res.Dealercode){
                                $scope.Dealercodetemp = 1001;
                                $scope.Dealercodetemp = res.Dealercode + 1;
                                $scope.dealer.Dealercode = res.Dealercode + 1;
                            }else{
                                $scope.dealer.Dealercode = 1001;
                            }
                        })
                }
            };
            if(!$scope.data.newOrderStore){
                $scope.data.newOrderStore = $scope.PosDealer;
            }
            $scope.newposOrder = [];
            $scope.Taxtotal();
            for(var i=0; i < $scope.newOrderItemList.length; i++) {
                if($scope.newOrderItemList[i].itemDetails.BulkPrice){
                    var bulkprice = $scope.newOrderItemList[i].itemDetails.BulkPrice;
                }
                itemAsStoredInMongo = {
                    "date_added": $scope.data.newOrderDateTime,
                    "date": (new Date()) + "",
                    "orderId": $scope.data.newOrderId,
                    "paymentMode": $scope.data.newOrderStore.paymentMode || '',
                    "dealercode": $scope.data.newOrderStore.Dealercode,
                    "dealername": $scope.data.newOrderStore.DealerName,
                    "dealerphone": $scope.data.newOrderStore.Phone,
                    "shipping_address": $scope.data.newOrderShipping_address,
                    "Address": $scope.data.newOrderStore.Address,
                    "itemcode": $scope.newOrderItemList[i].itemDetails.itemCode,
                    "email": $scope.data.newOrderStore.email,
                    "item": "",
                    "quantity": $scope.newOrderItemList[i].quantity,
                    "seller": ($scope.user.seller) ? $scope.user.seller : ($scope.data.newOrderSalesPerson.sellerphone) ? $scope.data.newOrderSalesPerson.sellerphone.toString() : '',
                    "MRP": $scope.newOrderItemList[i].MRP,
                    "GST": {
                        'cgst': $scope.newOrderItemList[i].CGST,
                        'sgst': $scope.newOrderItemList[i].SGST,
                        'igst': $scope.newOrderItemList[i].IGST,
                        'qbId': $scope.newOrderItemList[i].qbId || 24,
                    },
                    "orderMRP": $scope.newOrderItemList[i].itemDetails.orderMRP,
                    "mrpDiscount" : $scope.posDiscount.value,
                    "class": $scope.data.newOrderStore.class || '',
                    "BulkPrice": bulkprice,
                    "Special": Number($scope.newOrderItemList[i].Specials),
                    "sellername": $scope.user.username || $scope.data.newOrderSalesPerson.sellername || 'PORTAL',
                    "stockist": ($scope.data.newOrderStore.Stockist) ? $scope.data.newOrderStore.Stockist : "",
                    "stockistname": $scope.data.newOrderStore.StockistName,
                    "billing_address": $scope.data.newOrderBilling_address,
                    "stockistarea": $scope.data.newOrderStore.Area,
                    "fulfiller": $scope.data.newOrderFulfiller.sellerphone,
                    "status": status,
                    "chequenum": $scope.data.chequenum,
                    "bankname": $scope.data.bankname,
                    "total": Number(($scope.newOrderTotalAmount).toFixed(2)),
                    "orderTotal": Number(($scope.newOrderMRPTotalAmount).toFixed(2)),
                    // "GST_Total": {
                    //     'cgst': Number(($scope.GST.CSGSTTotal).toFixed(2)),
                    //     'sgst': Number(($scope.GST.SGSTTotal).toFixed(2)),
                    //     'igst': Number(($scope.GST.IGSTTotal).toFixed(2))
                    // },
                    "comment": [],
                    "type": "Order",
                    "latitude": 0,
                    "longitude": 0,
                    "api_key": "",
                    "medicine": $scope.newOrderItemList[i].itemDetails.Product,
                    // "freight": $scope.data.newOrderfreight,
                    // "freightChargeType": $scope.data.freightCharge,
                    "lineComment": [$scope.newOrderItemList[i].lineComment],
                    "lineStatus": $scope.nav[1].status[0],
                    //  "source": source
                }
                if($scope.tempCountryName == 'ghana'){
                    itemAsStoredInMongo.country = $scope.tempCountryName;
                    itemAsStoredInMongo.ghana_Tax = $scope.ghanaTax;
                }
                if($scope.posDiscount.value){
                    itemAsStoredInMongo.orderTotal = $scope.discountMrp;
                }
                if($scope.newOrderItemList[i].otherTaxes){
                    itemAsStoredInMongo.otherTaxes_Total = [];
                    itemAsStoredInMongo.otherTaxes = $scope.newOrderItemList[i].otherTaxes;
                    var otherTotalTaxess = {};
                    for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                        otherTotalTaxess = {
                            'name':$scope.newOrderItemList[i].otherTaxes[j].name,
                            'value':$scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name]
                        }
                        itemAsStoredInMongo.otherTaxes_Total.push(otherTotalTaxess);
                        //itemAsStoredInMongo.otherTaxes_Total[$scope.newOrderItemList[i].otherTaxes[j].name] = $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name];
                    }
                }
                    itemAsStoredInMongo.unit = $scope.newOrderItemList[i].itemDetails.unit ? $scope.newOrderItemList[i].itemDetails.unit:null;
                //Each Item is segregated into one element of newOrder Array
                //Thats how orders are stored in mongo
                $scope.newposOrder.push(itemAsStoredInMongo);
            }
            if($scope.currency){
                $scope.newposOrder.currency = $scope.currency;
            }
            console.log('PosDealer',$scope.PosDealer)
            tempPosDealer = {};
            tempPosDealer = $scope.PosDealer;
            tempPosDealer.newOrderId = $scope.data.newOrderId;
            var tempDiscountMrp = 0;
            if($scope.PosDealer.paymentMode){
                $scope.PosDealer.paymentMode = 'Cash';
            }
            if($scope.posDiscount.value){
                $scope.orderTotalAmount = $scope.discountMrp;
            }else{
                $scope.orderTotalAmount  = $scope.newOrderMRPTotalAmount;
            }
        }
        $scope.filterInventoryByLocation = function(){
            $scope.inventoryLocationUnique = [];
            $http.get('dash/inventory/location/filter').success(function(res){
                if(res.length){
                    $scope.inventoryLocationUnique = res;
                    $scope.inventoryLocationUnique = $scope.inventoryLocationUnique.filter(Boolean) ;
                    $scope.inventoryLocationUnique = $scope.inventoryLocationUnique.map(function(x){return (x + "").toUpperCase()}) ;
                }
                for(var i=0; i< $scope.warehouseLocation.length; i++){
                    $scope.inventoryLocationUnique.push($scope.warehouseLocation[i].name);
                }
                $scope.inventoryLocationUnique = Array.from(new Set($scope.inventoryLocationUnique));
                for(var i=0;i< $scope.inventoryLocationUnique.length; i++){
                    if($scope.inventoryLocationUnique[i] == ''){
                        $scope.inventoryLocationUnique.splice(i, 1);
                    }
                }
            }).catch(function(err){
                console.log(err)
            })
        };
        $scope.getWarehouseLocation = function(){
            $http.get("/dash/settings/inventory/locations").success(function(res){
                if(res.length){
                    $scope.warehouseLocation = res[0].location;
                    $scope.filterInventoryByLocation();
                }
            }).catch(function(err){
                console.log(err);
            })
        };
        $scope.getOrderDetailsForInvoice = function(order,flag){
            $scope.orderInvoiceDetails = {};
            $scope.orderInvoiceDetails.taxableAmount = 0;
            $scope.orderInvoiceDetails.cgst = order[0].GST_Total ? order[0].GST_Total.cgst : 0;
            $scope.orderInvoiceDetails.sgst = order[0].GST_Total ? order[0].GST_Total.sgst : 0;
            $scope.orderInvoiceDetails.igst = order[0].GST_Total ? order[0].GST_Total.igst : 0;
            $scope.orderInvoiceDetails.orderTotal = order[0].orderTotal;
            $scope.orderInvoiceDetails.mrpDiscount = order[0].mrpDiscount;
            $scope.orderInvoiceDetails.quantity = 0;
            if(order){
                //console.log(order);
                for(var i=0; i< order.length; i++){
                    $scope.orderInvoiceDetails.quantity += Number(order[i].quantity);
                    if(!order[i].taxExclusive){
                        if(order[i].BulkPrice){
                            var taxableAmount = (order[i].BulkPrice /
                                ((order[i].GST ? order[i].GST.cgst : 0) + (order[i].GST ? order[i].GST.sgst : 0) + (order[i].GST ? order[i].GST.igst : 0) + 100) * 100) * order[i].quantity;
                            order[i].taxableValue = taxableAmount;
                            $scope.orderInvoiceDetails.taxableAmount += taxableAmount;
                        }else{
                            var taxableAmount = (order[i].orderMRP /
                                ((order[i].GST ? order[i].GST.cgst : 0) + (order[i].GST ? order[i].GST.sgst : 0) + (order[i].GST ? order[i].GST.igst : 0) + 100) * 100) * order[i].quantity;
                            order[i].taxableValue = taxableAmount;
                            $scope.orderInvoiceDetails.taxableAmount += taxableAmount;
                        }
                    }else{
                        if(order[i].BulkPrice){
                            order[i].taxableValue = order[i].BulkPrice * order[i].quantity;
                            var taxableAmount =   ( order[i].BulkPrice) +
                                (((order[i].GST ? order[i].GST.cgst : 0)* order[i].BulkPrice)/100 + ((order[i].GST ? order[i].GST.sgst : 0)* order[i].BulkPrice)/100 + ((order[i].GST ? order[i].GST.igst : 0)* order[i].BulkPrice)/100);
                            $scope.orderInvoiceDetails.taxableAmount += order[i].taxableValue;
                            order[i].totalAmount = taxableAmount * order[i].quantity;
                        }else{
                            order[i].taxableValue = order[i].orderMRP * order[i].quantity;
                            var taxableAmount =   ( order[i].orderMRP) +
                                (((order[i].GST ? order[i].GST.cgst : 0)* order[i].orderMRP)/100 + ((order[i].GST ? order[i].GST.sgst : 0)* order[i].orderMRP)/100 + ((order[i].GST ? order[i].GST.igst : 0)* order[i].orderMRP)/100);
                            $scope.orderInvoiceDetails.taxableAmount += order[i].taxableValue;
                            order[i].totalAmount =taxableAmount * order[i].quantity;
                        }
                    }
                }
            }
            jQuery.noConflict();
            // if(flag){
            //
            //     $('#posTaxInvoiceModal').modal('show');
            //
            // }else{
            //
            //     $('#taxInvoiceModal').modal('show');
            //
            // }
            //console.log($scope.orderInvoiceDetails);
        }
        $scope.renderInventory = function (response){
            console.log('Inventory Refresh',response)
            $scope.inventory = [];
            $scope.assets = [];
            $scope.inventorySearch = {};
            $scope.inventorySearch.filter = '';
            $scope.filter = {};
            console.log("GET : Inventory --> ");
            $scope.filter.branchCode = '';
            $scope.filter.typeSelected = '';
            if(response.length < 10)
                $scope.totalInventoryDisplayed = response.length;
            if($scope.settings.invoice){
                var temp = [];
                for(var i=0; i< response.length; i++){
                    if(response[i].locationType == 'customer')
                        temp.push(response[i]);
                }
                $scope.inventory = temp;
                masterInventory = temp;
                $scope.inventory_rentalCount = temp.length;
            }else{
                $scope.inventory = response;
                $scope.items15 = $scope.inventory;
                $scope.viewby = 10;
                $scope.totalItems = $scope.inventory.length;
                $scope.currentPage = 1;
                $scope.itemsPerPage = $scope.viewby;
                $scope.maxSize = 5;
                $scope.case15Length = $scope.inventory.length;
                $scope.getWarehouseLocation();
            }
            masterInventory = response;
            //$scope.loaded(13);
            if(response.length == 0){
                $scope.uploadFiles.inventory=true;
            }
        };
        function fetchOrderDetails (order,flag){
            $http.get("/dash/orders/" + order.orderId)
                .success(function (response) {
                    $scope.orderDetails = [];
                    $scope.objAddr = false;
                    $scope.GhanataxableAmount = 0;
                    for (var i = 0; i < response.length; i++) {
                        if(response[i].deliveryDate){
                            // response[i].delivery = new Date(response[i].deliveryDate[0]);
                            response[i].delivery = moment(response[i].deliveryDate).format("DD-MMM-YYYY");
                            response[i].deliveryDate = moment(response[i].deliveryDate).format("DD-MMM-YYYY");
                        }
                        if($scope.tempCountryName == 'ghana'){
                            var TemptaxableAmount = (response[i].orderMRP * response[i].quantity);
                            $scope.GhanataxableAmount += TemptaxableAmount;
                        }
                        try {
                            response[i].objAddress = JSON.parse(response[i].Address)
                            $scope.objAddr = true;
                        }catch(err){
                            console.log('err');
                        };
                        try {
                            response[i].objShipAddress = JSON.parse(response[i].shipping_address)
                            $scope.objAddr = true;
                        }catch(err){
                            console.log('err');
                        };
                        (function (i) {
                            if (response[i].itemcode != "GEN") {
                                if (masterItems.length > 0) {
                                    for (var j = 0; j < masterItems.length; j++) {
                                        if (response[i].itemcode == masterItems[j].itemCode) {
                                            response[i].category = masterItems[j].Manufacturer;
                                            $scope.orderDetails.push(response[i])
                                        }
                                    }
                                }
                                else {
                                    $scope.orderDetails.push(response[i])
                                }
                            } else {
                                $scope.orderDetails.push(response[i]);
                            }
                        }(i))
                    }
                    var transactionDetails = {};
                    transactionDetails = $scope.translated_transactions;
                    if(response.length) {
                        var itemCodes = [];
                        var totalQty = [];
                        var balanceQty = [];
                        for (var i = 0; i < response.length; i++) {
                            itemCodes[response[i].itemcode] = response[i].itemcode;
                            if (!totalQty[response[i].itemcode]) totalQty[response[i].itemcode] = 0;
                            totalQty[response[i].itemcode] += response[i].quantity || 0;
                            var totalQty1 = 0;
                        }
                        if (transactionDetails) {
                            for (var j = 0; j < transactionDetails.length; j++) {
                                if(transactionDetails[j].transaction){
                                    for (var k = 0; k < transactionDetails[j].transaction.length; k++) {
                                        totalQty[transactionDetails[j].transaction[k].itemCode] -= transactionDetails[j].transaction[k].quantity;
                                    }
                                }
                            }
                        }
                        for (var i = 0; i < response.length; i++) {
                            response[i].balanceQty = Number((totalQty[response[i].itemcode]).toFixed(3));
                            response[i].checkQty = totalQty[response[i].itemcode]
                        }
                        if(order.location == 'Not Available'){
                            order.location = '';
                        }
                        for (var i = 0; i < response.length; i++) {
                            response[i].invLocQty = 0;
                            if(masterInventory.length){
                                for(var j=0; j< masterInventory.length; j++){
                                    if(response[i].itemcode == masterInventory[j].itemCode && order.location == masterInventory[j].location){
                                        response[i].invLocQty = masterInventory[j].Qty;
                                    }else if(response[i].itemcode == masterInventory[j].itemCode && masterInventory[j].location == '' && !order.location){
                                        response[i].invLocQty = masterInventory[j].Qty;
                                    }
                                }
                            }
                        }
                    }
                    $scope.orderDetails = response;
                    $scope.orderDetails.location = order.location;
                    $scope.freight.edit = $scope.orderDetails[0].freight;
                    $scope.mapTransaction = response[0];
                    var stockQty = {};
                    $scope.orderDetails.qty = 0;
                    var temp = 0
                    for (var i = 0; i < response.length; i++) {
                        if (response[i].itemcode != 'VVV' && response[i].itemcode != 'WWW' && response[i].itemcode != 'XXX' && response[i].itemcode != 'YYY' && response[i].itemcode != 'ZZZ')
                            temp += Number(response[i].quantity)
                    }
                    $scope.orderDetails.qty = temp;
                    $scope.mapShow = true;
                    $scope.orderLoader = false;
                    if(flag){
                        $scope.getOrderDetailsForInvoice($scope.orderDetails,'pos');
                    }
                    if($scope.orderDetails[0].dealerphone){
                        var body = {
                            phone: $scope.orderDetails[0].dealerphone
                        };
                        $http.post("/dash/enquiry/validate/phone", body).success(function (res) {
                            if (!res.length) {
                                $scope.addAsDealer = true;
                                if(flag){
                                    if($scope.PosDealer.DealerName && $scope.PosDealer.Phone && !$scope.filteredDealer){
                                        $http.get("/dash/get/recentID/dealer")
                                            .success(function(res){
                                                if(res.Dealercode){
                                                    $scope.Dealercodetemp = 1001;
                                                    $scope.Dealercodetemp = res.Dealercode + 1;
                                                    $scope.dealer.Dealercode = res.Dealercode + 1;
                                                }else{
                                                    $scope.dealer.Dealercode = 1001;
                                                }
                                            })
                                    }
                                }else{
                                    $http.get("/dash/get/recentID/dealer")
                                        .success(function(res){
                                            if(res.Dealercode){
                                                $scope.Dealercodetemp = 1001;
                                                $scope.Dealercodetemp = res.Dealercode + 1;
                                                $scope.dealer.Dealercode = res.Dealercode + 1;
                                            }else{
                                                $scope.dealer.Dealercode = 1001;
                                            }
                                        })
                                }
                            } else {
                                $scope.addAsDealer = false;
                            }
                        });
                    }
                });
            jQuery.noConflict();
            $("#order_fulfiller").val(null);
            $("#order_deliverDate").val(null);
            $("#orderLine_fulfiller").val(null);
            // $("#orderLine_deliveryDate").val(null);
        }
        $scope.generateTransactionNumber = function(callback){
            var date = new Date();
            var components = [
                date.getFullYear().toString().substr(-2),
                (date.getMonth() < 10)? '0' + date.getMonth() : date.getMonth(),
                (date.getDate() < 10)? '0' + date.getDate() : date.getDate(),
                (date.getHours() < 10)? '0' + date.getHours() : date.getHours(),
                (date.getMinutes() < 10)? '0' + date.getMinutes() : date.getMinutes(),
                (date.getSeconds() < 10)? '0' + date.getSeconds() : date.getSeconds(),
                (date.getMilliseconds() < 10)? '00' + date.getMilliseconds() : (date.getMilliseconds() < 100)? '0' + date.getMilliseconds() : date.getMilliseconds()
            ];
            var date_ = components.join("");
            callback(date_);
        }
        //Weekly Dashboard data
        var renderWeeklyDashboard = function(){
            var todayDate = new Date();
            var week_firstDay = (new Date()).setDate((new Date()).getDate() -7);
            var present_firstDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
            var lastDay = todayDate;
            var last_firstDay = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
            var last_lastDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), 0);
            var last_orders =0;
            var last_ordersAmount =0;
            var week_totalAmount =0;
            var week_numberOfOrders =0;
            var present_totalAmountMonth =0;
            var present_numberOfOrdersMonth =0;
            var numberOfOrdersMonth = 0;
            var totalAmountMonth = 0;
            var monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            if(todayDate.getMonth() == 0){
                $scope.last_monthName = monthNames[11];
                $scope.last_yearName = todayDate.getFullYear() - 1;
            }
            else{
                $scope.last_monthName = monthNames[todayDate.getMonth() - 1];
                $scope.last_yearName = todayDate.getFullYear();
            }
            $scope.monthName = monthNames[todayDate.getMonth()];
            $scope.yearName = todayDate.getFullYear();
            //Previous month
            $http.get("/dash/reports/orders/"+$scope.DateTimeFormat(last_firstDay, 'start')+"/"+$scope.DateTimeFormat(last_lastDay, 'end'))
                .success(function(response){
                    $scope.lastWeeklyDashboard = response;
                    for( var i=0; i< response.length; i++){
                        last_orders += $scope.lastWeeklyDashboard[i].orders;
                        last_ordersAmount += $scope.lastWeeklyDashboard[i].orderTotal;
                    }
                    $scope.lastWeeklyDashboardOrders = last_orders;
                    $scope.lastWeeklyDashboardOrderAmount = last_ordersAmount;
                    $scope.lastWeeklyDashboardOrdersPercent = (numberOfOrdersMonth/last_orders) * 100;
                    $scope.lastWeeklyDashboardOrderAmountPercent = (totalAmountMonth/last_ordersAmount) * 100;
                });
            //Present month
            $http.get("/dash/reports/orders/"+$scope.DateTimeFormat(present_firstDay, 'start')+"/"+$scope.DateTimeFormat(lastDay, 'end'))
                .success(function(response){
                    $scope.weeklyDashboard = response;
                    for(var i=0; i<response.length; i++){
                        present_totalAmountMonth += response[i].orderTotal;
                        present_numberOfOrdersMonth += response[i].orders;
                    }
                    $scope.weeklyDashboardOrderAmountMonth = present_totalAmountMonth;
                    $scope.weeklyDashboardOrdersMonth = present_numberOfOrdersMonth;
                });
            //Present week
            $http.get("/dash/reports/orders/"+$scope.DateTimeFormat(week_firstDay, 'start')+"/"+$scope.DateTimeFormat(lastDay, 'end'))
                .success(function(response){
                    $scope.weeklyDashboard = response;
                    for(var i=0; i<response.length; i++){
                        week_totalAmount += response[i].orderTotal;
                        week_numberOfOrders += response[i].orders;
                    }
                    $scope.weeklyDashboardOrderAmount = week_totalAmount;
                    $scope.weeklyDashboardOrders = week_numberOfOrders;
                });
        };
        //renderWeeklyDashboard();
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
                        tempObj.transaction.push(res[j]);
                        if (res[j].itemcode == 'OTS' || res[j].itemcode == 'XXX' || res[j].type == 'Payment') { //Caluclate total payment received for a day
                            tempObj.value += Number(res[j].quantity[0]);
                        }
                        if (res[j].type == 'Order') { //Calculate Order value for a day
                            tempObj.value += Number(res[j].orderTotal_amount[0]);
                        }
                    }
                }
                $scope.allRecent.push(tempObj);
            }
        }
        $scope.fetchRecentTranasctions = function () {
            //console.log('Fetch recent transactions for the last 7 days')
            recentTransactionFromServer = {};
            masterRecentTransactions = {};
            $http.get('/dash/orders/recent/transactions')
                .success(function (res) {
                    recentTransactionFromServer = res; //Holds response from server for further use
                    masterRecentTransactions = res; //Holds response for filtration
                    recentorder=res;
                    $scope.recentTransactionType = 'all';
                    renderRecentTransactions(res);
                })
        }
        $scope.renderDashboardOrdersReport = function(){
            $http.get("/dash/reports/orders")
                .success(function(response) {
                    console.log("GetAll Dashboard Order Summary reports-->");
                    $scope.dashboardorderreport = response;
                    // ordersSummaryChart($scope, response);
                })
        };
        //Function to handle on submission of order
        $scope.submitOrder = function(flag){
            //Validate that item list is not empty
            if($scope.newOrderItemList.length == 0){
                Settings.alertPopup("Alert", "Item list is empty for order");
                return;
            }
            for(var i=0;i<$scope.newOrderItemList.length;i++){
                if($scope.newOrderItemList[i].itemDetails.looseQty){
                    if($scope.newOrderItemList[i].quantity <= 0 || !$scope.newOrderItemList[i].quantity){
                        Settings.alertPopup("Alert", "Please Enter a Valid  Quantity for "+$scope.newOrderItemList[i].itemDetails.Product);
                        return;
                    }
                }else{
                    if($scope.newOrderItemList[i].quantity <= 0 || !$scope.newOrderItemList[i].quantity || ((typeof $scope.newOrderItemList[i].quantity === 'number') && ($scope.newOrderItemList[i].quantity % 1 != 0))){
                        Settings.alertPopup("Alert",  "Please Enter a Valid  Quantity for "+$scope.newOrderItemList[i].itemDetails.Product);
                        return;
                    }
                }
            }
            //Validate that sales person and store are not empty
            /*if(typeof $scope.data.newOrderSalesPerson.sellername === "undefined" ||
             $scope.data.newOrderSalesPerson.sellername === "")
             {
             Settings.alertPopup("Alert", "In New Order Addition", "Sales person is not choosen for new Order");
             return;
             }*/
            if(typeof $scope.data.newOrderStore.DealerName === "undefined" ||
                $scope.data.newOrderStore.DealerName === "")
            {
                Settings.alertPopup("Alert", "Store is not choosen for new order");
                return;
            }
            //DATE AND TIMESTAMP
            $scope.data.newOrderDate = new Date();
            $scope.Taxtotal();
            var date = 	$scope.data.newOrderDate;
            $scope.data.newOrderDateTime = [date.getFullYear(),(date.getMonth()+1).padLeft(), date.getDate().padLeft() ].join('-') + ' '
                + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join (':');
            if(!flag){
                //Lets generate order id
                $scope.data.newOrderId = $scope.generateOrderId();
            }
            //Comment to say order is added from the portal
            var portalComment = {
                "comment" : "-------- Order Added from portal ",
                "date" : $scope.data.newOrderDateTime,
                "userphone" : "",
                "username" : ($scope.user.role)? $scope.user.username : "Portal Admin or Portal Access"
            };
            //There could be changes in sales person and store during the process of ordering
            //Reassign value of sales person and store in item list
            var itemAsStoredInMongo;
            var status = '';
            var source = '';
            var fulfillmentStatus = 'fulfilled';
            var paymentStatus = 'paid';
            var cloudinary = [];
            if(flag){
                status = $scope.nav[1].status[$scope.nav[1].status.length-1];
                source = 'Pos';
                if($scope.nav[1].fulfillmentstatus)
                    fulfillmentStatus = $scope.nav[1].fulfillmentstatus.length ? $scope.nav[1].fulfillmentstatus[$scope.nav[1].fulfillmentstatus.length-1] : 'fulfilled';
                if($scope.nav[1].paymentstatus)
                    paymentStatus = $scope.nav[1].paymentstatus.length ? $scope.nav[1].paymentstatus[$scope.nav[1].paymentstatus.length-1] : 'paid';
            }else{
                status = $scope.nav[1].status[0];
                source = 'Order';
            }
            if($scope.delivery_date_Enable && !flag){
                var deliveryDate = new Date();
                deliveryDate.setDate(deliveryDate.getDate() + Number($scope.deliveryOrderDate));
                deliveryDate = $scope.DateTimeFormat(deliveryDate, 'start');
            }
            for(var i=0; i < $scope.newOrderItemList.length; i++) {
                console.log("$scope.newOrderItemList[i].Specials",$scope.newOrderItemList[i].Specials);
                var bulkprice = '';
                if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice){
                    var bulkprice = $scope.newOrderItemList[i].itemDetails.BulkPrice;
                }
                if(typeof $scope.newOrderItemList[i].itemDetails.cloudinaryURL == 'string'){
                    cloudinary[i] = $scope.newOrderItemList[i].itemDetails.cloudinaryURL;
                }else if(typeof $scope.newOrderItemList[i].itemDetails.cloudinaryURL == 'object'){
                    if($scope.newOrderItemList[i].itemDetails.cloudinaryURL.length)
                        cloudinary[i] = $scope.newOrderItemList[i].itemDetails.cloudinaryURL[0].image;
                }
                var dealerPhone = $scope.data.newOrderStore.Phone;
                if($scope.data.newOrderStore.countryCode != '+91')
                    dealerPhone = Number($scope.data.newOrderStore.countryCode)+''+ $scope.data.newOrderStore.Phone;
                itemAsStoredInMongo = {
                    "date_added": $scope.data.newOrderDateTime,
                    "date": (new Date()) + "",
                    "orderId": $scope.data.newOrderId,
                    "dealercode": $scope.data.newOrderStore.Dealercode,
                    "dealername": $scope.data.newOrderStore.DealerName,
                    "dealerphone": dealerPhone,
                    "shipping_address": $scope.data.newOrderShipping_address,
                    "Address": $scope.data.newOrderStore.Address,
                    "itemcode": $scope.newOrderItemList[i].itemDetails.itemCode,
                    "email": $scope.data.newOrderStore.email,
                    "paymentMode": $scope.data.newOrderStore.paymentMode || '',
                    "class": $scope.data.newOrderStore.class || '',
                    "item": "",
                    "quantity": $scope.newOrderItemList[i].quantity,
                    "seller": ($scope.user.seller) ? $scope.user.seller : ($scope.data.newOrderSalesPerson.sellerphone) ? $scope.data.newOrderSalesPerson.sellerphone.toString() : '',
                    "MRP": $scope.newOrderItemList[i].MRP,
                    "GST": {
                        'cgst': $scope.newOrderItemList[i].CGST,
                        'sgst': $scope.newOrderItemList[i].SGST,
                        'igst': $scope.newOrderItemList[i].IGST,
                        'qbId': $scope.newOrderItemList[i].qbId || 24,
                    },
                    "orderMRP": $scope.newOrderItemList[i].itemDetails.orderMRP,
                    "BulkPrice": bulkprice,
                    "Special": Number($scope.newOrderItemList[i].Specials),
                    "sellername": $scope.user.username || $scope.data.newOrderSalesPerson.sellername || 'PORTAL',
                    "stockist": ($scope.data.newOrderStore.Stockist) ? $scope.data.newOrderStore.Stockist : "",
                    "stockistname": $scope.data.newOrderStore.StockistName,
                    "billing_address": $scope.data.newOrderBilling_address,
                    "stockistarea": $scope.data.newOrderStore.Area,
                    "fulfiller": $scope.data.newOrderFulfiller.sellerphone,
                    "status": status,
                    "chequenum": $scope.data.chequenum,
                    "bankname": $scope.data.bankname,
                    "total": Number(($scope.newOrderTotalAmount).toFixed(2)),
                    "orderTotal": Number(($scope.newOrderMRPTotalAmount).toFixed(2)),
                    "GST_Total": {
                        'cgst': Number(($scope.GST.CSGSTTotal).toFixed(2)),
                        'sgst': Number(($scope.GST.SGSTTotal).toFixed(2)),
                        'igst': Number(($scope.GST.IGSTTotal).toFixed(2))
                    },
                    "comment": [],
                    "type": "Order",
                    "latitude": 0,
                    "longitude": 0,
                    "api_key": "",
                    "medicine": $scope.newOrderItemList[i].itemDetails.Product,
                    "cloudinaryURL": cloudinary[i],
                    "freight": $scope.data.newOrderfreight,
                    "freightChargeType": $scope.data.freightCharge,
                    "lineComment": [$scope.newOrderItemList[i].lineComment],
                    "lineStatus": $scope.nav[1].status[0],
                    "fulfillmentStatus": fulfillmentStatus,
                    "paymentStatus": paymentStatus,
                    "source": source,
                    "taxExclusive":$scope.taxExclusive,
                    "line_id":i+1
                }
                if( !$scope.newOrderItemList[i].itemDetails.trackInventory && $scope.newOrderItemList[i].itemDetails.trackInventory != false){
                    itemAsStoredInMongo.trackInventory = true;
                }else{
                    itemAsStoredInMongo.trackInventory = $scope.newOrderItemList[i].itemDetails.trackInventory;
                }
                if($scope.posDiscount.value){
                    itemAsStoredInMongo.mrpDiscount = $scope.posDiscount.value;
                    itemAsStoredInMongo.total = $scope.discountMrp;
                    itemAsStoredInMongo.orderTotal = $scope.discountMrp;
                }
                if($scope.tempCountryName == 'ghana'){
                    itemAsStoredInMongo.country = $scope.tempCountryName;
                    itemAsStoredInMongo.ghana_Tax = $scope.ghanaTax
                }
                if($scope.newOrderItemList[i].otherTaxes){
                    itemAsStoredInMongo.otherTaxes_Total = [];
                    itemAsStoredInMongo.otherTaxes = $scope.newOrderItemList[i].otherTaxes;
                    var otherTotalTaxess = {};
                    for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                        otherTotalTaxess = {
                            'name':$scope.newOrderItemList[i].otherTaxes[j].name,
                            'value':$scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name]
                        }
                        itemAsStoredInMongo.otherTaxes_Total.push(otherTotalTaxess);
                        //itemAsStoredInMongo.otherTaxes_Total[$scope.newOrderItemList[i].otherTaxes[j].name] = $scope.otherTaxCal.otherTaxesTotal[$scope.newOrderItemList[i].otherTaxes[j].name];
                    }
                }
                    itemAsStoredInMongo.unit = $scope.newOrderItemList[i].itemDetails.unit ? $scope.newOrderItemList[i].itemDetails.unit:null;
                if($scope.data.salesPerson){
                    itemAsStoredInMongo.sellername = $scope.data.salesPerson.sellername;
                    itemAsStoredInMongo.seller = $scope.data.salesPerson.sellerid;
                }
                if($scope.delivery_date_Enable && !flag){
                    itemAsStoredInMongo.deliveryDate = deliveryDate;
                }else if(flag){
                    itemAsStoredInMongo.deliveryDate = $scope.DateTimeFormat($scope.data.newOrderDateTime, 'start');
                }
                if($scope.settings.invoice){
                    if(!$scope.data.newOrderStore.type || $scope.data.newOrderStore.type == 'Lead'){
                        var temp = {};
                        temp.dealercode = $scope.data.newOrderStore.Dealercode;
                        temp.type = "Customer";
                    }
                }
                if ($scope.data.newOrderComment != "") {
                    itemAsStoredInMongo.comment.unshift(
                        {
                            "comment" 	:	$scope.data.newOrderComment,
                            "date"    	:	$scope.data.newOrderDateTime,
                            "username"	:	"Portal",
                            "userphone"	:	""
                        });
                }
                //Each Item is segregated into one element of newOrder Array
                //Thats how orders are stored in mongo
                $scope.newOrder.push(itemAsStoredInMongo);
            }
            if(flag){
                $scope.generateTransactionNumber(function(num) {
                    var date = new Date();
                    var shipDate = [date.getFullYear(), (date.getMonth() + 1).padLeft(), date.getDate().padLeft()].join('-') + ' '
                        + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join(':');
                    var obj = {};
                    obj.transaction = [];
                    if($scope.houselocation.loc){
                        obj.shippedLoc = $scope.houselocation.loc;
                    }else{
                        obj.shippedLoc = '';
                    }
                    if($scope.newOrder){
                        for(var i=0;i< $scope.newOrder.length;i++) {
                            var trackInventory = true;
                            if( !$scope.newOrder[i].trackInventory && $scope.newOrder[i].trackInventory != false){
                                trackInventory = true;
                            }else{
                                trackInventory = $scope.newOrder[i].trackInventory;
                            }
                            obj.transaction.push({
                                'itemCode': $scope.newOrder[i].itemcode,
                                'quantity': Number($scope.newOrder[i].quantity.toFixed(3)),
                                'Product': $scope.newOrder[i].medicine,
                                'date': shipDate,
                                'trackInventory':trackInventory
                            })
                        }
                    }
                    if($scope.newOrder){
                        if($scope.newOrder.paymentMode){
                            $scope.newOrder.paymentMode = 'Cash';
                        }
                    }
                    obj.transaction_id = num;
                    obj.orderId = $scope.newOrder[0].orderId;
                    obj.date_added = shipDate;
                    obj.type = 'inventory_shipment';
                    if ($scope.user.role) {
                        obj.shippedByPhoneNo = $scope.user.seller;
                        obj.shippedByName = $scope.user.username;
                    } else {
                        obj.shippedByName = 'Admin'
                    }
                    $http.put("/dash/inventory/shipment/transactions", obj)
                        .success(function(res){
                            if(res){
                                $http.get("/dash/inventory")
                                    .success($scope.renderInventory);
                            }
                        })
                })
                //HTTP Header is not being set here, Session id is being set in
                //request in cookies.
                //HTTP post to post order to the server
                $http.post("/dash/orders/" + $scope.data.newOrderId, $scope.newOrder)
                    .success(function (response) {
                        var order = $scope.newOrder;
                        var tempOrderId = angular.copy($scope.data.newOrderId);
                        // toastr.success("Paid Successfully")
                        if(flag){
                            $scope.posDiscount.value = '';
                            $scope.discountMrp = 0;
                            fetchOrderDetails(itemAsStoredInMongo,'pos');
                        }
                        //Show up the add order button again
                        $scope.addOrderButton = true;
                        $scope.data.newOrderStore = {};
                        $scope.data.newOrderSalesPerson = {};
                        $scope.a.selectedSalesPerson = "";
                        $scope.disableSalesPersonSelection = true;
                        $scope.a.selectedStores = {};
                        $scope.data.tempCity = "";
                        $scope.data.tempState = "";
                        $scope.showDealerDetails = false;
                        //to bring the latest addition to the top
                        $scope.sortOrder = false;
                        $scope.clearFilter(1);
                        $scope.clearFilter(2);
                        $scope.orderPriceList = '';
                        renderWeeklyDashboard();
                        $scope.fetchRecentTranasctions();
                        $scope.renderDashboardOrdersReport();
                        if($scope.posTabFlag){
                            $scope.addPosInitialize('pos');
                        }else{
                            $scope.addPosInitialize();
                        }
                        $scope.orderDetails = [];
                        Settings.buttonConfigPopup("SUCCESS"," Sale completed successfully ","Sale details","Next sale", function (res) {
                            if(res == 'id'){
                                console.log('ressss inside',res,tempOrderId );
                                $scope.$apply(function() {
                                    $location.path('/order-details/' + tempOrderId);
                                });
                            }
                        });
                    });
                // Settings.alertPopup("green", "", "New Order Successfully Submitted");
                if ($scope.settings.invoice) {
                    $http.put("/dash/enquiry/type/update", temp)
                        .success(function (response) {
                            console.log(response)
                        })
                }
            }
        }//End of submitOrder
        $scope.locUpdate = function(arg){
            if($scope.newOrderItemList.length){
                Settings.confirmPopup('','Location change will remove the items added to the cart',function (res) {
                    if(res){
                        $scope.houselocation.loc = arg;
                        $scope.newOrderItemList = [];
                        $scope.clearFilter(2)
                    }else{
                        $scope.tempHouseLoc.loc  = $scope.houselocation.loc;
                    }
                    $scope.$apply();
                })
            }else{
                $scope.clearFilter(2)
                $scope.houselocation.loc = arg;
                // $scope.$apply();
            }
        }
        $scope.$watch('calculateIGST', function () {
            // console.log('IGST : ' + $scope.calculateIGST);
            // console.log($scope.newOrderItemList);
            if ($scope.calculateIGST) {
                for (var i = 0; i < $scope.newOrderItemList.length; i++) {
                    $scope.newOrderItemList[i].IGST = $scope.newOrderItemList[i].itemDetails.IGST;
                    $scope.newOrderItemList[i].CGST = 0;
                    $scope.newOrderItemList[i].SGST = 0;
                }
            } else {
                for (var i = 0; i < $scope.newOrderItemList.length; i++) {
                    $scope.newOrderItemList[i].IGST = 0;
                    $scope.newOrderItemList[i].CGST = $scope.newOrderItemList[i].itemDetails.CGST;
                    $scope.newOrderItemList[i].SGST = $scope.newOrderItemList[i].itemDetails.SGST;
                }
            }
        });
        // $scope.taxCalc = function(value)
        // {
        //     var with2Decimals = value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
        //     return Number(with2Decimals);
        // }
        //Change in any of the items calls for change in total amount of order
        $scope.$watch('newOrderItemList', function(){
            // $scope.newOrderTaxAmount = {};
            // $scope.newOrderTaxAmount.totalTax = 0;
            // $scope.newOrderTaxAmount.totalCGST = 0;
            // $scope.newOrderTaxAmount.totalSGST = 0;
            // $scope.newOrderTaxAmount.totalIGST = 0;
            // $scope.newOrderExcTaxAmount = 0;
            // $scope.newOrderTotalAmount = 0;
            // $scope.newOrderMRPTotalAmount = 0;
            // var grandTotalTax = 0;
            //
            // $scope.newOrderTaxAmount.totalOtherTaxes = [];
            // $scope.newOrderOtherTaxesNames = [];
            // var totalOtherTaxes = [];
            if($scope.tempCountryName == 'ghana'){
                $scope.getCalulatedTax($scope.newOrderItemList ,1,$scope.data.newOrderStore,$scope.calculateIGST);
                // for(var i=0; i<$scope.newOrderItemList.length; i++){
                //
                //     if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice){
                //
                //         var mrp = $scope.taxCalc(parseFloat($scope.newOrderItemList[i].itemDetails.MRP));
                //         var BulkPrice = $scope.taxCalc(parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice));
                //         var taxableMrp = $scope.taxCalc(parseFloat(BulkPrice / (100 + cgst + sgst + igst) * 100));
                //         var listTexableMrp = parseFloat(mrp);
                //
                //         if($scope.taxExclusive){
                //             var taxableMrp = parseFloat(BulkPrice);
                //
                //         }else{
                //             var taxableMrp = parseFloat(BulkPrice / (100 + $scope.ghanaTax.NHIL + $scope.ghanaTax.GETL + $scope.ghanaTax.VAT) * 100);
                //         }
                //
                //         $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                //         $scope.newOrderExcTaxAmount += $scope.orderTotal;
                //         $scope.newOrderExcTaxAmount1 = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.NHIL)/100;
                //         $scope.newOrderExcTaxAmount1 = $scope.taxCalc( $scope.newOrderExcTaxAmount1);
                //         $scope.newOrderExcTaxAmount2 = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.GETL)/100;
                //         $scope.newOrderExcTaxAmount2 = $scope.taxCalc( $scope.newOrderExcTaxAmount2);
                //         $scope.newOrderExcTaxAmount3 = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.VAT)/100;
                //         $scope.newOrderExcTaxAmount3 = $scope.taxCalc( $scope.newOrderExcTaxAmount3);
                //         grandTotalTax = $scope.newOrderExcTaxAmount1 + $scope.newOrderExcTaxAmount2 + $scope.newOrderExcTaxAmount3;
                //         grandTotalTax = parseFloat(grandTotalTax.toFixed(2));
                //
                //         if($scope.calculateIGST){
                //             $scope.newOrderMRPTotalAmount = ($scope.newOrderExcTaxAmount + grandTotalTax);
                //             $scope.newOrderMRPTotalAmount = $scope.newOrderMRPTotalAmount;
                //             $scope.newOrderTotalAmount += ((listTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                //         }
                //         else{
                //             $scope.newOrderMRPTotalAmount = ($scope.newOrderExcTaxAmount + grandTotalTax);
                //             $scope.newOrderTotalAmount += ((listTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                //         }
                //
                //         $scope.newOrderTaxAmount.totalTax +=  (parseFloat($scope.ghanaTax.NHIL/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat($scope.ghanaTax.GETL/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat($scope.ghanaTax.VAT/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //         $scope.newOrderTaxAmount.totalCGST += (parseFloat($scope.ghanaTax.NHIL/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //         $scope.newOrderTaxAmount.totalSGST += (parseFloat($scope.ghanaTax.GETL/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //         $scope.newOrderTaxAmount.totalIGST += (parseFloat($scope.ghanaTax.VAT/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //         // $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                //         // $scope.newOrderExcTaxAmount += $scope.orderTotal;
                //
                //     }else{
                //         if(!$scope.taxSetups.otherSetup){
                //             // var cgst = 0;
                //             // var sgst = 0;
                //             // var igst = 0;
                //             //
                //             // cgst = $scope.newOrderItemList[i].CGST;
                //             // sgst = $scope.newOrderItemList[i].SGST;
                //             // igst = $scope.newOrderItemList[i].IGST;
                //
                //             var mrp = $scope.taxCalc(parseFloat($scope.newOrderItemList[i].itemDetails.MRP));
                //             var orderMrp = $scope.taxCalc(parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP));
                //             var taxableMrp = $scope.taxCalc(parseFloat(orderMrp / (100 + $scope.ghanaTax.NHIL + $scope.ghanaTax.GETL + $scope.ghanaTax.VAT) * 100));
                //             var listTexableMrp = parseFloat(mrp);
                //
                //             if($scope.taxExclusive){
                //                 var taxableMrp = parseFloat(orderMrp);
                //
                //             }else{
                //                 var taxableMrp = parseFloat(orderMrp / (100 + $scope.ghanaTax.NHIL + $scope.ghanaTax.GETL + $scope.ghanaTax.VAT) * 100);
                //             }
                //
                //             $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                //             $scope.newOrderExcTaxAmount += $scope.orderTotal;
                //             $scope.newOrderExcTaxAmount1 = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.NHIL)/100;
                //             $scope.newOrderExcTaxAmount1 = $scope.taxCalc( $scope.newOrderExcTaxAmount1);
                //             $scope.newOrderExcTaxAmount2 = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.GETL)/100;
                //             $scope.newOrderExcTaxAmount2 = $scope.taxCalc( $scope.newOrderExcTaxAmount2);
                //             $scope.newOrderExcTaxAmount3 = ($scope.newOrderExcTaxAmount * $scope.ghanaTax.VAT)/100;
                //             $scope.newOrderExcTaxAmount3 = $scope.taxCalc( $scope.newOrderExcTaxAmount3);
                //             grandTotalTax = $scope.newOrderExcTaxAmount1 + $scope.newOrderExcTaxAmount2 + $scope.newOrderExcTaxAmount3;
                //             grandTotalTax = parseFloat(grandTotalTax.toFixed(2));
                //
                //             if($scope.calculateIGST){
                //                 $scope.newOrderMRPTotalAmount = ($scope.newOrderExcTaxAmount + grandTotalTax);
                //                 $scope.newOrderMRPTotalAmount = $scope.taxCalc($scope.newOrderMRPTotalAmount);
                //                 $scope.newOrderTotalAmount += ((listTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                //             }
                //             else{
                //                 $scope.newOrderMRPTotalAmount = parseFloat(($scope.newOrderExcTaxAmount + grandTotalTax).toFixed(2));
                //                 $scope.newOrderTotalAmount += ((listTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                //             }
                //             // $scope.newOrderTaxAmount.totalTax +=  (parseFloat(cgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat(sgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat(igst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //             $scope.newOrderTaxAmount.totalTax =  $scope.newOrderExcTaxAmount1 +  $scope.newOrderExcTaxAmount2 +  $scope.newOrderExcTaxAmount3 ;
                //             $scope.newOrderTaxAmount.totalCGST += (parseFloat($scope.ghanaTax.NHIL/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //             $scope.newOrderTaxAmount.totalSGST += (parseFloat($scope.ghanaTax.GETL/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //             $scope.newOrderTaxAmount.totalIGST += (parseFloat($scope.ghanaTax.VAT/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //             // $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                //             // $scope.newOrderExcTaxAmount += $scope.orderTotal;
                //         }else if($scope.newOrderItemList[i].otherTaxes && $scope.newOrderItemList[i].otherTaxes.length){
                //
                //             var sumOfTax = 0;
                //
                //             if(!$scope.newOrderOtherTaxesNames.length && $scope.newOrderItemList[i].otherTaxes){
                //                 $scope.newOrderOtherTaxesNames = $scope.newOrderItemList[i].otherTaxes;
                //             }
                //
                //             for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                //                 sumOfTax += $scope.newOrderItemList[i].otherTaxes[j].value;
                //             }
                //
                //             // cgst = $scope.newOrderItemList[i].CGST;
                //             // sgst = $scope.newOrderItemList[i].SGST;
                //             // igst = $scope.newOrderItemList[i].IGST;
                //
                //             var mrp =  $scope.taxCalc(parseFloat($scope.newOrderItemList[i].itemDetails.MRP));
                //             var orderMrp =  $scope.taxCalc(parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP));
                //
                //
                //             var taxableMrp =  $scope.taxCalc(parseFloat(orderMrp / (100 + sumOfTax) * 100));
                //             var listTexableMrp = parseFloat(mrp / (100 + sumOfTax)* 100);
                //
                //
                //             if($scope.taxExclusive){
                //                 var taxableMrp = $scope.taxCalc(parseFloat(orderMrp));
                //             }else{
                //                 var taxableMrp = $scope.taxCalc(parseFloat(orderMrp / (100 + sumOfTax) * 100));
                //             }
                //
                //             if($scope.calculateIGST){
                //                 $scope.newOrderMRPTotalAmount = $scope.taxCalc((taxableMrp +(taxableMrp * ($scope.ghanaTax.NHIL/100)) + (taxableMrp * ($scope.ghanaTax.GETL/100)) +(taxableMrp * ($scope.ghanaTax.VAT/100))) * ($scope.newOrderItemList[i].quantity));
                //                 $scope.newOrderTotalAmount += ((listTexableMrp +(mrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                //             }
                //             else{
                //                 var sumOftaxableMrp = 0;
                //                 var sumOflistTexableMrp = 0;
                //                 var totalTax = 0;
                //
                //                 if($scope.newOrderItemList[i].itemDetails.otherTaxes){
                //                     for(var j=0; j< $scope.newOrderItemList[i].itemDetails.otherTaxes.length; j++){
                //                         sumOftaxableMrp += (taxableMrp * ($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100));
                //                         sumOflistTexableMrp += (listTexableMrp * ($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100))
                //                         $scope.newOrderTaxAmount.totalTax += (parseFloat($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //
                //                         if(!totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name])
                //                             totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = 0;
                //                         totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name]+= (parseFloat($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //                         $scope.newOrderTaxAmount.totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name];
                //
                //                     }
                //                 }else{
                //                     for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                //                         sumOftaxableMrp += (taxableMrp * ($scope.newOrderItemList[i].otherTaxes[j].value/100));
                //                         sumOflistTexableMrp += (listTexableMrp * ($scope.newOrderItemList[i].otherTaxes[j].value/100))
                //                         $scope.newOrderTaxAmount.totalTax += (parseFloat($scope.newOrderItemList[i].otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //
                //                         if(!totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name])
                //                             totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name] = 0;
                //                         totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name]+= (parseFloat($scope.newOrderItemList[i].otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //                         $scope.newOrderTaxAmount.totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name] = totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name];
                //
                //                     }
                //                 }
                //
                //                 $scope.newOrderMRPTotalAmount += ((taxableMrp + sumOftaxableMrp  ) * ($scope.newOrderItemList[i].quantity));
                //                 $scope.newOrderMRPTotalAmount = Math.trunc($scope.newOrderMRPTotalAmount * 100)/100;
                //                 $scope.newOrderTotalAmount += ((listTexableMrp + sumOflistTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                //
                //             }
                //
                //             $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                //             $scope.newOrderExcTaxAmount += $scope.orderTotal;
                //         }
                //     }
                //
                //
                //
                // }
            }else{
                $scope.getCalulatedTax($scope.newOrderItemList ,2,$scope.data.newOrderStore,$scope.calculateIGST);
                // for(var i=0; i<$scope.newOrderItemList.length; i++){
                //
                //     if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice){
                //         var cgst = 0;
                //         var sgst = 0;
                //         var igst = 0;
                //
                //         cgst = $scope.newOrderItemList[i].CGST;
                //         sgst = $scope.newOrderItemList[i].SGST;
                //         igst = $scope.newOrderItemList[i].IGST;
                //
                //         var mrp = parseFloat($scope.newOrderItemList[i].itemDetails.MRP);
                //         var BulkPrice = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice);
                //         var taxableMrp = parseFloat(BulkPrice / (100 + cgst + sgst + igst) * 100);
                //         var listTexableMrp = parseFloat(mrp / (100 + cgst + sgst + igst)* 100);
                //
                //
                //         if($scope.taxExclusive){
                //             var taxableMrp = parseFloat(BulkPrice);
                //
                //         }else{
                //             var taxableMrp = parseFloat(BulkPrice / (100 + cgst + sgst + igst) * 100);
                //         }
                //         if($scope.calculateIGST){
                //             $scope.newOrderMRPTotalAmount += ((taxableMrp +(taxableMrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                //             $scope.newOrderTotalAmount += ((listTexableMrp +(mrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                //         }
                //         else{
                //             $scope.newOrderMRPTotalAmount += ((taxableMrp +( (taxableMrp * (cgst/100)) + (taxableMrp *(sgst/100)))) * ($scope.newOrderItemList[i].quantity));
                //             $scope.newOrderTotalAmount += ((listTexableMrp +( (listTexableMrp * (cgst/100)) + (listTexableMrp *(sgst/100)))) * ($scope.newOrderItemList[i].quantity));
                //         }
                //
                //         $scope.newOrderTaxAmount.totalTax +=  (parseFloat(cgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat(sgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat(igst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //         $scope.newOrderTaxAmount.totalCGST += (parseFloat(cgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //         $scope.newOrderTaxAmount.totalSGST += (parseFloat(sgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //         $scope.newOrderTaxAmount.totalIGST += (parseFloat(igst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //         $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                //         $scope.newOrderExcTaxAmount += $scope.orderTotal;
                //
                //     }else{
                //         if(!$scope.taxSetups.otherSetup){
                //             var cgst = 0;
                //             var sgst = 0;
                //             var igst = 0;
                //
                //             cgst = $scope.newOrderItemList[i].CGST;
                //             sgst = $scope.newOrderItemList[i].SGST;
                //             igst = $scope.newOrderItemList[i].IGST;
                //
                //             var mrp = parseFloat($scope.newOrderItemList[i].itemDetails.MRP);
                //             var orderMrp = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                //             var taxableMrp = parseFloat(orderMrp / (100 + cgst + sgst + igst) * 100);
                //             var listTexableMrp = parseFloat(mrp / (100 + cgst + sgst + igst)* 100);
                //
                //
                //             if($scope.taxExclusive){
                //                 var taxableMrp = parseFloat(orderMrp);
                //
                //             }else{
                //                 var taxableMrp = parseFloat(orderMrp / (100 + cgst + sgst + igst) * 100);
                //             }
                //             if($scope.calculateIGST){
                //                 $scope.newOrderMRPTotalAmount += ((taxableMrp +(taxableMrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                //                 $scope.newOrderTotalAmount += ((listTexableMrp +(mrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                //             }
                //             else{
                //                 $scope.newOrderMRPTotalAmount += ((taxableMrp +( (taxableMrp * (cgst/100)) + (taxableMrp *(sgst/100)))) * ($scope.newOrderItemList[i].quantity));
                //                 $scope.newOrderTotalAmount += ((listTexableMrp +( (listTexableMrp * (cgst/100)) + (listTexableMrp *(sgst/100)))) * ($scope.newOrderItemList[i].quantity));
                //             }
                //
                //             $scope.newOrderTaxAmount.totalTax +=  (parseFloat(cgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat(sgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat(igst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //             $scope.newOrderTaxAmount.totalCGST += (parseFloat(cgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //             $scope.newOrderTaxAmount.totalSGST += (parseFloat(sgst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //             $scope.newOrderTaxAmount.totalIGST += (parseFloat(igst/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //             $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                //             $scope.newOrderExcTaxAmount += $scope.orderTotal;
                //         }else if($scope.newOrderItemList[i].otherTaxes && $scope.newOrderItemList[i].otherTaxes.length){
                //
                //             var sumOfTax = 0;
                //
                //             if(!$scope.newOrderOtherTaxesNames.length && $scope.newOrderItemList[i].otherTaxes){
                //                 $scope.newOrderOtherTaxesNames = $scope.newOrderItemList[i].otherTaxes;
                //             }
                //
                //             for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                //                 sumOfTax += $scope.newOrderItemList[i].otherTaxes[j].value;
                //             }
                //
                //
                //             var mrp = parseFloat($scope.newOrderItemList[i].itemDetails.MRP);
                //             var orderMrp = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP);
                //
                //
                //             var taxableMrp = parseFloat(orderMrp / (100 + sumOfTax) * 100);
                //             var listTexableMrp = parseFloat(mrp / (100 + sumOfTax)* 100);
                //
                //
                //             if($scope.taxExclusive){
                //                 var taxableMrp = parseFloat(orderMrp);
                //             }else{
                //                 var taxableMrp = parseFloat(orderMrp / (100 + sumOfTax) * 100);
                //             }
                //
                //             if($scope.calculateIGST){
                //                 $scope.newOrderMRPTotalAmount += ((taxableMrp +(taxableMrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                //                 $scope.newOrderTotalAmount += ((listTexableMrp +(mrp * (igst/100))) * ($scope.newOrderItemList[i].quantity));
                //             }
                //             else{
                //                 var sumOftaxableMrp = 0;
                //                 var sumOflistTexableMrp = 0;
                //                 var totalTax = 0;
                //
                //                 if($scope.newOrderItemList[i].itemDetails.otherTaxes){
                //                     for(var j=0; j< $scope.newOrderItemList[i].itemDetails.otherTaxes.length; j++){
                //                         sumOftaxableMrp += (taxableMrp * ($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100));
                //                         sumOflistTexableMrp += (listTexableMrp * ($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100))
                //                         $scope.newOrderTaxAmount.totalTax += (parseFloat($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //
                //                         if(!totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name])
                //                             totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = 0;
                //                         totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name]+= (parseFloat($scope.newOrderItemList[i].itemDetails.otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //                         $scope.newOrderTaxAmount.totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name] = totalOtherTaxes[$scope.newOrderItemList[i].itemDetails.otherTaxes[j].name];
                //
                //                     }
                //                 }else{
                //                     for(var j=0; j< $scope.newOrderItemList[i].otherTaxes.length; j++){
                //                         sumOftaxableMrp += (taxableMrp * ($scope.newOrderItemList[i].otherTaxes[j].value/100));
                //                         sumOflistTexableMrp += (listTexableMrp * ($scope.newOrderItemList[i].otherTaxes[j].value/100))
                //                         $scope.newOrderTaxAmount.totalTax += (parseFloat($scope.newOrderItemList[i].otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //
                //                         if(!totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name])
                //                             totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name] = 0;
                //                         totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name]+= (parseFloat($scope.newOrderItemList[i].otherTaxes[j].value/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //                         $scope.newOrderTaxAmount.totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name] = totalOtherTaxes[$scope.newOrderItemList[i].otherTaxes[j].name];
                //
                //                     }
                //                 }
                //
                //                 $scope.newOrderMRPTotalAmount += ((taxableMrp + sumOftaxableMrp  ) * ($scope.newOrderItemList[i].quantity));
                //                 $scope.newOrderTotalAmount += ((listTexableMrp + sumOflistTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                //
                //             }
                //
                //             $scope.orderTotal = Number($scope.newOrderItemList[i].quantity) * taxableMrp;
                //             $scope.newOrderExcTaxAmount += $scope.orderTotal;
                //         }
                //     }
                //
                //
                //
                // }
            }
            var tempflag = false;
            for(var i=0; i<$scope.newOrderItemList.length; i++){
                if($scope.newOrderItemList[i].itemDetails.looseQty){
                    if($scope.newOrderItemList[i].quantity <= 0 || !$scope.newOrderItemList[i].quantity){
                        tempflag = true;
                    }
                }else{
                    if($scope.newOrderItemList[i].quantity <= 0 || !$scope.newOrderItemList[i].quantity|| ((typeof $scope.newOrderItemList[i].quantity === 'number') && ($scope.newOrderItemList[i].quantity % 1 != 0))){
                        tempflag = true;
                    }
                }
            }
            $scope.checkout.flag = tempflag;
            // $scope.$apply();
            // $scope.discountCalculate($scope.posDiscount.value);
            // if($scope.data.newOrderfreight ){
            // $scope.newOrderMRPTotalAmount += $scope.data.newOrderfreight;
            // }
        }, true);
        if(user_details){
            if(user_details.sellerObject){
                if(user_details.sellerObject.inventoryLocation){
                    $scope.tempHouseLoc.loc = user_details.sellerObject.inventoryLocation ;
                    $scope.locUpdate(user_details.sellerObject.inventoryLocation);
                    $scope.inventoryLocationFlag = true ;
                }
            }
        };
    })
