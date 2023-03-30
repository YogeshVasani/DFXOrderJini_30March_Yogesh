/**
 * Created by Akash on 10/03/20.
 */
angular.module('ebs.controller')
    .controller("RegalRexNewOrdersCtrl",function ($scope, $filter, $http, $modal,$routeParams, $window,Settings, toastr, $interval,$sce,$mdDialog,$location) {
        console.log("Hello From RegalRexNewOrdersCtrl new Orders Controller .... !!!!");
        $scope.displayEditloader = false;
        $scope.orderViewTab  = {};
        $scope.orderViewTab.tab = 0;
        var instanceDetails =  Settings.getInstance();
        var allStockist = [];
        console.log("$routeParams.id ",$routeParams.id )
        if($routeParams.id == '0'){
            $scope.OrderIdParam = 0;
        }else{
            $scope.orderViewTab.tab = 1;
            $scope.OrderIdParam = $routeParams.id;
            $scope.displayEditloader = true;
        }
        var searchObj = {};
        var initialViewBy = 60;
        $scope.newViewBy = 10;
        $scope.taxExclusive = instanceDetails.taxExclusive;
        //.... States....
        $scope.states = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'New Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Orissa', 'Punjab', 'Puducherry', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Tripura', 'Uttar Pradesh', 'West Bengal', 'Chhattisgarh', 'Uttarakhand', 'Jharkhand', 'Telangana'];
        $scope.dealerReportFilter = {};
        $scope.coID = instanceDetails.coID;
        $scope.editItemPrice = instanceDetails.editItemPrice;
        $scope.country = {};
        $scope.country.name = instanceDetails.country || 'India';
        $scope.currency = instanceDetails.currency || "₹";
        $scope.dealerClasses = instanceDetails.dealerClass || [] ;
        $scope.enforceInventoryOrder = Settings.getInventoryOrderConfig();
        $scope.houselocation = {};
        $scope.houselocation.loc = '';
        $scope.displayloader = false;
        $scope.tempHouseLoc = {};
        $scope.tempHouseLoc.loc = '';
        $scope.categoryFilterFlag = false ;
        $scope.subCategoryFilterFlag = false ;
        $scope.subSubCategoryFilterFlag = false;
        $scope.categoryFilter = false;
        $scope.subCategoryFilter = false;
        $scope.subSubCategoryFilter = false;
        let tempProductFilterArray = [];
        let filterArr = {};
        jQuery.noConflict();
        $('.refresh').css("display", "inline");
        $scope.tempCountryName = $scope.country.name.toLowerCase();
        var topCustomerSearchObj = {};
        var topDealerSearchBy = ['dealername','sellername'];
        var itemSearchBy = ['itemCode', 'Product', 'Manufacturer','Pack', 'subCategory','subSubCategory'];
        var dealerSearchBy = ['Dealercode', 'DealerName', 'City', 'seller','SellerName', 'StockistName', 'Area', 'Phone', 'email'];
        var dealerSearchObj = {};
        $scope.dealerSearch = {};
        $scope.dealerSearch.filter = '';
        $scope.serviceClients = $filter('orderBy')( $scope.serviceClients, 'DealerName');
        var recentorder = [];
        var viewBy = {};
        viewBy.items = 12;
        viewBy.dealer = 12;
        $scope.filter = {};
        $scope.dealerSelectAll = {};
        $scope.sellerNames = []; //stores seller name
        $scope.fulfillerNames = {};
        $scope.orders = [];
        $scope.newDealers = $scope.serviceClients;
        var localViewBy = $scope.newViewBy;
        var initialUserViewBy = 60;
        $scope.newOrderItemList = []
        $scope.itemSelectAll = {};
        var itemSearchObj = {};
        $scope.itemSearch= {};
        $scope.priceListView = {};
        $scope.cityText = {};
        $scope.data = {};
        $scope.taxSetups = {};
        $scope.taxSetups.otherSetup = '';
        $scope.newOrderItem =  {}
        $scope.stepQuantity = 1;
        $scope.settings = {};
        $scope.tax = []; //Holds array of tax objects
        $scope.tax = instanceDetails.tax ? instanceDetails.tax : [];
        Settings.getNav((nav) => {
            $scope.nav = nav;
        $scope.userRole = $scope.nav[4].roles ? $scope.nav[4].roles: [];
    });
        $scope.phone_number = {};
        $scope.phone_number.number = [];
        $scope.phone_numbers =[];
        $scope.dealerSelected = {};
        $scope.dealerSelected.flag = false;
        $scope.selectedOrder = false;
        $scope.item= {};
        $scope.item.category_selected = '';
        $scope.item.subCategory_selected = '';
        $scope.item.subSubCategory_selected = '';
        var user_details  = Settings.getUserInfo();
        // console.log(user_details)
        var newOrderSelectedStore = {};
        dealerSearchObj.viewLength = 0;
        dealerSearchObj.viewBy = initialViewBy;
        dealerSearchObj.searchFor = '';
        dealerSearchObj.seller = '';
        dealerSearchObj.stockist = '';
        dealerSearchObj.searchBy = [];
        dealerSearchObj.searchByArea = [];
        dealerSearchObj.searchRegion = [];
        $scope.enforceCredit = false;
        $scope.recharge = {
            amt : ''
        };
        $scope.orderConditions ={};
        const fetchOrderTermsAndCondition = () => {
            $http.get("/dash/settings/details/terms_conditions_order")
                .then(status => {
                console.log("status",status)
            if(status.data){
                $scope.orderConditions.terms_conditions_order = status.data.enabled;
                $scope.orderConditions.terms_conditions = status.data.terms_conditions;
            }else{
                $scope.terms_conditions_order = '';
            }
        })
        .catch((error, status) => {
                console.log(error, status);
            if(status){
                if(status >= 400 && status < 404)
                    $window.location.href = '/404';
                else if(status >= 500)
                    $window.location.href = '/500';
            }else if(error.status){
                if(error.status >= 400 && error.status < 404)
                    $window.location.href = '/404';
                else if(error.status >= 500)
                    $window.location.href = '/500';
            }
            else
                $window.location.href = '/404';
        });
        };
        fetchOrderTermsAndCondition();
        $http.get('/dash/enforce/credit/fetch')
            .success(function (response) {
                if (response.length) {
                    $scope.enforceCredit = response[0].enforceCredit;
                }
            })
        const getUniqueBy = (arr, prop) => {
            const set = new Set;
            return arr.filter(o => !set.has(o[prop]) && set.add(o[prop]));
        };
        $http.post("/dash/items/filterProduct/" + 'tags', itemSearchObj)
            .success(function (filterProduct) {
                $scope.itemFilterProducts = '';
                if(filterProduct.length){
                     console.log("filtersss",filterProduct)
                    $scope.itemFilterProducts = filterProduct;
                }
            })
        //Ghana tax
        $scope.ghanaTax = {
            NHIL:2.5,
            GETL:2.5,
            VAT:15.9,
            VAT_VAL: 15,
            COVID : 1
        }
        //Catalogue to cart
        $scope.CTOCT = 1;
        //Cart to catalogue
        $scope.CTTOC = 2;
        $scope.dealerfilterFlag = false ;
        // ************************Add dealer
        $scope.dealer = {};
        $scope.searchDealer = {};
        $scope.subscriptions = [];
        $scope.invalidSubscriptions = [];
        $scope.displayQuickBooksSync = false;
        // .......... Get Bulk Subscription for Tecknovate instance .........
        $http.get('/dash/enforce/credit/fetch')
            .success(function (response) {
                if (response.length) {
                    $scope.enforceCredit = response[0].enforceCredit;
                }
            })
        var defaultTax ='';
        if($scope.tax.length){
            for(var i=0;i<$scope.tax.length;i++){
                if($scope.tax[i].default){
                    defaultTax = $scope.tax[i];
                }
            }
        }
        $http.get("/dash/quickbooks/creds/fetch").then(function(creds) {
            if (creds) {
                if (creds.data) {
                    if (creds.data.quickbooks_token) {
                        $scope.displayQuickBooksSync = true;
                    }
                }
            }
        })
        if($scope.coID == 'GLGR'){
            $http.get("/dash/store/details/"+$scope.user.sellerphone)
                .success(function(response){
                    // console.log(response);
                    if(response.length){
                        if(response[0].class && $scope.dealerClasses.length){
                            for(var i=0;i<$scope.dealerClasses.length;i++){
                                if($scope.dealerClasses[i].name == response[0].class){
                                    $scope.orderPriceList = $scope.dealerClasses[i].priceList;
                                    // console.log($scope.orderPriceList);
                                    getSubscriptions();
                                }
                            }
                        }
                        else
                            getSubscriptions()
                    }
                    function getSubscriptions() {
                        $scope.newSubscriptionTotalAmount = 0;
                        $scope.tecknovateUser = $scope.user.seller || 'Portal Admin';
                        $http.get("/dash/susbscription/" + $scope.tecknovateUser)
                            .success(function (subs) {
                                for(var i=0; i<subs.length; i++){
                                    if(subs[i].items && subs[i].items[0].Validated){
                                        var temp_subs = {};
                                        temp_subs.phone_numbers =[];
                                        temp_subs.itemDetails = {};
                                        if(subs[i].items[0].Manufacturer == 'DATA')
                                            temp_subs.itemDetails.MRP = $scope.orderPriceList? subs[i].items[0][$scope.orderPriceList] : subs[i].items[0].MRP;
                                        else
                                            temp_subs.itemDetails.MRP = subs[i].items[0].MRP;
                                        temp_subs.itemDetails.Manufacturer = subs[i].items[0].Manufacturer;
                                        temp_subs.itemDetails.Product = subs[i].items[0].Product;
                                        temp_subs.itemDetails.Size = subs[i].items[0].Size;
                                        temp_subs.itemDetails.Validity = subs[i].items[0].Validity;
                                        temp_subs.itemDetails.itemCode = subs[i]._id;
                                        temp_subs.itemDetails.packageId = subs[i].items[0].packageId;
                                        temp_subs.quantity = subs[i].phone_number.length;
                                        temp_subs.itemDetails.itemQuantity = temp_subs.quantity;
                                        temp_subs.MRP = temp_subs.itemDetails.MRP;
                                        temp_subs.orderMRP = temp_subs.itemDetails.MRP;
                                        temp_subs.total = temp_subs.quantity  * temp_subs.itemDetails.MRP;
                                        temp_subs.orderTotal = temp_subs.total;
                                        for(var j=0; j<subs[i].phone_number.length; j++){
                                            (function(i, j){
                                                temp_subs.phone_numbers.push({'number' : subs[i].phone_number[j], 'transaction_id' : $scope.generateOrderId() + j});
                                            })(i, j);
                                        }
                                        $scope.newSubscriptionTotalAmount += temp_subs.orderTotal;
                                        $scope.subscriptions.push(temp_subs)
                                    }
                                    else{
                                        $scope.invalidSubscriptions.push(subs[i]);
                                    }
                                }
                            });
                    }
                })
        }
        //Function which is used to Search or filter dealers
        $http.get("/dash/role/sellers/Salesperson")
            .success(function (salesperson) {
                //console.log("Salesperson : ", salesperson);
                if(salesperson && salesperson.length){
                    $scope.roleSalesrep = [];
                    for(var i = 0; i < salesperson.length; i++){
                        $scope.roleSalesrep.push({sellername : salesperson[i].sellername, sellerphone : salesperson[i].sellerphone});
                    }
                }
            });
        $scope.checkTypeString = arg => typeof arg == 'string';
        ///..... Location update......
        $scope.locUpdate = function(arg){
            if($scope.newOrderItemList.length){
                Settings.confirmPopup('','Location change will remove the items added to the cart',function (res) {
                    if(res){
                        $scope.houselocation.loc = arg;
                        $scope.newOrderItemList = [];
                    }else{
                        $scope.tempHouseLoc.loc  = $scope.houselocation.loc;
                    }
                    $scope.$apply();
                })
            }else{
                $scope.houselocation.loc = arg;
                // $scope.$apply();
            }
        }
        $scope.dealerSelectionPage  = function () {
            if($scope.OrderIdParam){
                console.log("entered  308")
                $location.path('/ui-orders');
            }else{
                console.log("entered  312")
                if($scope.newOrderItemList.length > 0){
                    Settings.confirmPopup('','Customer change will remove all selected items from cart',function (res) {
                        if(res){
                            $scope.handleCancelNewOrder();
                        }
                    })
                }else{
                    $scope.handleCancelNewOrder();
                }
            }
        }
        $scope.dealerArray = [];
        //..... Dealer Search and Select a different dealer....
        $scope.DealerSearchFilter = function(data) {
            if($scope.newOrderItemList.length){
                Settings.confirmPopup('','Customer change will remove all selected items from cart',function (res) {
                    if (res) {
                        $scope.handleCancelNewOrder();
                        $scope.$apply();
                        jQuery.noConflict();
                        $('.refresh').css("display", "inline");
                        $scope.dealerArray =[];
                        if(data){
                            $http.get("/dash/stores/search/"+data)
                                .success(function(res){
                                    $scope.dealerArray = res;
                                    jQuery.noConflict();
                                    $(".dealerDropdown").css('display', 'block')
                                })
                            $scope.showSearchFilter = true;
                            if($scope.searchDealer.DealerName == ''){
                                $scope.searchDealer = dealer;
                                $scope.showSearchFilter = false;
                            }
                            setTimeout(function(){
                                $('.refresh').css("display", "none");
                            }, 2000);
                        }else{
                            $scope.refreshTransactions(34);
                        }
                    }
                })
            }else{
                jQuery.noConflict();
                $('.refresh').css("display", "inline");
                $scope.dealerArray =[];
                if(data){
                    $http.get("/dash/stores/search/"+data)
                        .success(function(res){
                            $scope.dealerArray = res;
                            jQuery.noConflict();
                            $(".dealerDropdown").css('display', 'block')
                        })
                    $scope.showSearchFilter = true;
                    if($scope.searchDealer.DealerName == ''){
                        $scope.searchDealer = dealer;
                        $scope.showSearchFilter = false;
                    }
                    setTimeout(function(){
                        $('.refresh').css("display", "none");
                    }, 2000);
                }else{
                    $scope.refreshTransactions(34);
                }
            }
        };
        //...... Change the dealer....
        $scope.ChangeDealer= function(){
            if($scope.newOrderItemList.length){
                Settings.confirmPopup('','Customer change will remove all selected items from cart',function (res) {
                    console.log('res',res)
                    if(res){
                        $scope.dealerSelected.flag = false;
                        $scope.handleCancelNewOrder();
                        $scope.$apply();
                    }
                })
            }else{
                $scope.dealerSelected.flag = false;
                $scope.handleCancelNewOrder();
                $scope.$apply();
            }
        }
        //.... Fetch categories from server...
        $scope.getAllCategories = function(param,type){
            console.log("cate",param,type)
            $http.post("/dash/items/filterRexItems/"+type, {viewBy : 0})
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
        //.... Fetch sub categories from server....
        $scope.getAllSubCategories = function(param,type){
            $http.post("/dash/items/filterRexItems/"+type, {viewBy : 0})
                .success(function(subCategory){
                    $scope.itemSubCategories = subCategory;
                    $scope.itemFilterSubCategories = subCategory;
                    $scope.itemSubCategories = $scope.itemSubCategories.filter(function( obj ) {
                        return obj._id !== 'DEFAULT';
                    });
                })
        };
        //...... Fetch sub sub categories from server...
        $scope.getAllSubSubCategories = function(param,type){
            $http.post("/dash/items/filterRexItems/"+type, {viewBy : 0})
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
                })
        };
        //..... Filter by Category....
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
        ///.... Filter by sub category...
        $scope.fetchOnlySubCatDropDown = function(data,type, subtype){
            var tempObj = {};
            tempObj = data;
            $http.post("/dash/items/category/sub", tempObj).success(function(res) {
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
                }
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
        //... Filter by Cities....
        $scope.fetchStoresByCities =function(dealerSearchObj){
            $http.post("/dash/stores", dealerSearchObj)
                .success(function (response) {
                    $scope.multipleUsers(response, 'City');
                    $http.post("/dash/stores/count", dealerSearchObj)
                        .success(function (res) {
                            $scope.transactionCount(res, 4);
                        });
                    $scope.getAllStoreAreas(false, 'area');
                });
        }
        //... Filter by Area....
        $scope.fetchStoresByArea =function(dealerSearchObj){
            $http.post("/dash/stores", dealerSearchObj)
                .success(function (response) {
                    $scope.multipleUsers(response, 'Area');
                    $http.post("/dash/stores/count", dealerSearchObj)
                        .success(function (res) {
                            $scope.transactionCount(res, 4);
                        });
                });
        }
        //....Store filter function
        $scope.storeSearchFilter = function(){
            $scope.showListDealerDetail = false;
            dealerSearchObj.viewLength = 0;
            dealerSearchObj.viewBy = initialViewBy;
            $scope.viewLength = 0;
            $scope.newViewBy = localViewBy;
            if($scope.dealerSearch.filter){
                dealerSearchObj.searchFor = $scope.dealerSearch.filter;
                dealerSearchObj.searchBy = dealerSearchBy;
            }
            dealerSearchObj.stockist = {};
            if($scope.filter.branch != 'All'){
                dealerSearchObj.stockist = $scope.filter.branch;
            }
            else {
                dealerSearchObj.stockist = '';
            }
            if($scope.filter.sales != 'All'){
                dealerSearchObj.seller = $scope.filter.sales;
            }
            else{
                dealerSearchObj.seller = '';
            }
            if($scope.filter.class != 'All'){
                dealerSearchObj.class = $scope.filter.class;
            }
            else{
                dealerSearchObj.class = '';
            }
            $scope.serviceClients = [];
            if($scope.dealerSelectAll.city){
                $http.post('/dash/stores', dealerSearchObj)
                    .success(function(res){
                        $scope.multipleUsers(res);
                        // $scope.renderStoreMap(res);
                    });
                $http.post("/dash/stores/count", dealerSearchObj)
                    .success(function(res){
                        $scope.transactionCount(res,4);
                    });
            }
            $scope.showStoreFilter = true;
            if($scope.dealerSearch.filter == '' && $scope.filter.branch == 'All' && $scope.filter.sales == 'All' && $scope.filter.class == 'All')
                $scope.showStoreFilter = false;
        };
        $scope.dealerFilterBy = function(){
            $scope.dealerfilterFlag = !$scope.dealerfilterFlag;
        };
        //.... Function to filter stores based on city and area .....
        $scope.filterDealerByCriteria = function (type, all, filter) {
            $scope.serviceClients = [];
            $scope.showListDealerDetail = false;
            let new_array = [];  //.. Temp array..
            const loadCustomers = (data, type) => {
                //..... Stores / Customers....
                $http.post("/dash/stores", data)
                    .success(function (response) {
                        $scope.multipleUsers(response, type);
                    });
                //..... Load the count ....
                $http.post("/dash/stores/count", data)
                    .success(function (res) {
                        $scope.transactionCount(res, 4);
                    });
            }
            //..... If filter by City ....
            if (type == 'city') {
                $scope.dealer.selected_area = null;
                dealerSearchObj.searchRegion = [];
                if (all) {
                    if (!$scope.dealerSelectAll.city) {
                        $scope.getAllStoreCities(false, 'city');
                        $scope.getAllStoreAreas(false, 'area');
                        $scope.viewLength = 0;
                        $scope.newViewBy = viewBy.dealer;
                        $scope.cityText.filter = '';
                        $scope.transactionCount(0, 4);
                    } else {
                        dealerSearchObj.searchRegion = [];
                        $scope.clearFilter(4);
                        $scope.getAllStoreCities(true, 'city');
                        $scope.getAllStoreAreas(true, 'area');
                        $scope.viewLength = 0;
                        $scope.newViewBy = viewBy.dealer;
                        loadCustomers(dealerSearchObj, 'City');
                    }
                } else {
                    //.... If city is all ....
                    if ($scope.dealerSelectAll.city) {
                        dealerSearchObj.dealerSelectAll = true;
                        if (dealerSearchObj.searchRegion.length) {
                            //... If City A needs to be removed...
                            if (filter.selected_city) {
                                for (let i = 0; i < dealerSearchObj.searchRegion.length; i++) {
                                    if (filter._id != dealerSearchObj.searchRegion[i]) {
                                        new_array.push(dealerSearchObj.searchRegion[i]);  //... Push all other cities...
                                    }
                                }
                                dealerSearchObj.searchRegion = new_array; //... Replace the array..
                                dealerSearchObj.searchByArea = [];
                                if (dealerSearchObj.searchRegion.length) {
                                    $scope.fetchStoresByCities(dealerSearchObj);
                                } else {
                                    $scope.fetchStoresByCities(dealerSearchObj);
                                }
                            } else {
                                for (let j = 0; j < dealerSearchObj.searchRegion.length; j++) {
                                    if (filter._id == dealerSearchObj.searchRegion[j]) {
                                        continue;
                                    } else {
                                        if (j == dealerSearchObj.searchRegion.length - 1) dealerSearchObj.searchRegion.push(filter._id);
                                    }
                                }
                                dealerSearchObj.searchByArea = [];
                                $scope.fetchStoresByCities(dealerSearchObj);
                            }
                        } else {
                            if (!filter.selected_city) {
                                $scope.serviceClients = [];
                                dealerSearchObj.searchRegion.push(filter._id);
                                $scope.fetchStoresByCities(dealerSearchObj);
                            } else {
                                if ($scope.dealer_city.length) {
                                    for (let i = 0; i < $scope.dealer_city.length; i++) {
                                        if ($scope.dealer_city[i]._id == filter.selected_city) {
                                            dealerSearchObj.searchRegion.push($scope.dealer_city[i]._id)
                                        }
                                    }
                                    $scope.showStoreFilter = true;
                                    $scope.fetchStoresByCities(dealerSearchObj);
                                }
                            }
                        }
                    } else {
                        dealerSearchObj.dealerSelectAll = false;
                        //.... If some city is already there...
                        if (dealerSearchObj.searchRegion.length) {
                            //... If City A needs to be removed...
                            if (!filter.selected_city) {
                                for (let i = 0; i < dealerSearchObj.searchRegion.length; i++) {
                                    //... Push all other cities...
                                    if (filter._id != dealerSearchObj.searchRegion[i]) {
                                        new_array.push(dealerSearchObj.searchRegion[i]);
                                    }
                                }
                                //... Replace the array..
                                dealerSearchObj.searchRegion = new_array;
                                dealerSearchObj.searchByArea = [];
                                if (dealerSearchObj.searchRegion.length) {
                                    loadCustomers(dealerSearchObj, 'City');
                                } else {
                                    $scope.dealer_area = [];
                                }
                            } else {
                                for (let j = 0; j < dealerSearchObj.searchRegion.length; j++) {
                                    if (filter._id == dealerSearchObj.searchRegion[j]) {
                                        continue;
                                    } else {
                                        if (j == dealerSearchObj.searchRegion.length - 1) dealerSearchObj.searchRegion.push(filter._id);
                                    }
                                }
                                dealerSearchObj.searchByArea = [];
                                loadCustomers(dealerSearchObj, 'City');
                            }
                        } else {
                            if (filter.selected_city) {
                                $scope.serviceClients = [];
                                dealerSearchObj.searchRegion.push(filter._id);
                                loadCustomers(dealerSearchObj, 'City');
                            } else {
                                if ($scope.dealer_city.length) {
                                    for (let i = 0; i < $scope.dealer_city.length; i++) {
                                        if ($scope.dealer_city[i]._id != filter._id) {
                                            dealerSearchObj.searchRegion.push($scope.dealer_city[i]._id)
                                        }
                                    }
                                    loadCustomers(dealerSearchObj, 'City');
                                }
                            }
                        }
                        $scope.viewLength = 0;
                        $scope.newViewBy = viewBy.dealer;
                    }
                }
            } else if(type =='area'){
                if ($scope.dealerSelectAll.city) {
                    if (dealerSearchObj.searchByArea.length) {
                        if (filter.selected_area) {
                            for (let i = 0; i < dealerSearchObj.searchByArea.length; i++) {
                                //... Push all other cities...
                                if (filter._id != dealerSearchObj.searchByArea[i]) {
                                    new_array.push(dealerSearchObj.searchByArea[i]);
                                }
                            }
                            //... Replace the array..
                            dealerSearchObj.searchByArea = new_array;
                            if (dealerSearchObj.searchByArea.length) {
                                $scope.fetchStoresByArea(dealerSearchObj);
                            } else {
                                $scope.fetchStoresByArea(dealerSearchObj);
                            }
                        } else {
                            for (let j = 0; j < dealerSearchObj.searchByArea.length; j++) {
                                if (filter._id == dealerSearchObj.searchByArea[j]) {
                                    continue;
                                } else {
                                    if (j == dealerSearchObj.searchByArea.length - 1) dealerSearchObj.searchByArea.push(filter._id);
                                }
                            }
                            $scope.fetchStoresByArea(dealerSearchObj);
                        }
                    } else {
                        if (!filter.selected_area) {
                            $scope.serviceClients = [];
                            dealerSearchObj.dealerSelectAll = true;
                            dealerSearchObj.searchByArea.push(filter._id);
                            $scope.fetchStoresByArea(dealerSearchObj);
                        } else {
                            if ($scope.dealer_area.length) {
                                for (let i = 0; i < $scope.dealer_area.length; i++) {
                                    if ($scope.dealer_area[i]._id == filter.selected_area) {
                                        dealerSearchObj.searchByArea.push($scope.dealer_area[i]._id)
                                    }
                                }
                                $scope.showStoreFilter = true;
                                $scope.fetchStoresByArea(dealerSearchObj);
                            }
                        }
                    }
                } else {
                    if (dealerSearchObj.searchByArea.length) {
                        if (!filter.selected_area) {
                            for (let i = 0; i < dealerSearchObj.searchByArea.length; i++) {
                                // console.log('i Loop')
                                if (filter.Area != dealerSearchObj.searchByArea[i]) {
                                    new_array.push(dealerSearchObj.searchByArea[i]);
                                }
                            }
                            dealerSearchObj.searchByArea = new_array; //... Replace the array..
                            if (dealerSearchObj.searchByArea.length) {
                                loadCustomers(dealerSearchObj, 'Area');
                            }
                        } else {
                            for (let j = 0; j < dealerSearchObj.searchByArea.length; j++) {
                                if (filter.Area == dealerSearchObj.searchByArea[j]) {
                                    continue;
                                } else {
                                    if (j == dealerSearchObj.searchByArea.length - 1) dealerSearchObj.searchByArea.push(filter.Area);
                                }
                            }
                            loadCustomers(dealerSearchObj, 'Area');
                        }
                    } else {
                        if (filter.selected_area) {
                            $scope.serviceClients = [];
                            dealerSearchObj.searchByArea.push(filter.selected_area);
                            loadCustomers(dealerSearchObj, 'Area');
                        } else {
                            if ($scope.dealer_area.length) {
                                for (var i = 0; i < $scope.dealer_area.length; i++) {
                                    if ($scope.dealer_area[i].Area != filter.Area) {
                                        dealerSearchObj.searchByArea.push($scope.dealer_area[i].Area)
                                    }
                                }
                                loadCustomers(dealerSearchObj, 'Area');
                            }
                        }
                    }
                }
            }
        };
        //End of Function which is used to Search or filter Items
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
        $scope.categoryArray = [];
        $scope.subCategoryArray = [];
        $scope.subSubCategoryArray = [];
        // $scope.categoryArray1 = [];
        $scope.clearFilterBy = function(){
            console.log("entered clearFilterBy")
            $scope.items = [];
            const loadItems = (data, type) => {
                console.log("data",data)
                $http.post("/dash/items", data)
                    .success(function (response) {
                        $scope.renderItems(response, type);
                        $http.post("/dash/item/count", data)
                            .success(function (res) {
                                $scope.transactionCount(res, 2);
                            });
                    });
            };
            $scope.catActive = '';
            $scope.subcatActive = '';
            $scope.subSubCatActive = '';
            $scope.categoryArray=[];
            $scope.subCategoryArray=[];
            $scope.subSubCategoryArray=[];
            $scope.productFilterArray=[];
            $scope.productFilterArray1=[];
            itemSearchObj.searchCategory = [];
            itemSearchObj.searchBySubCategory = [];
            itemSearchObj.searchBySubSubCategory = [];
            itemSearchObj.searchBy= []
            itemSearchObj.searchByFilterColumn = ""
            itemSearchObj.searchFor = ""
            itemSearchObj.searchbySelectedCheckbox = []
            itemSearchObj.viewBy = 60
            itemSearchObj.viewLength = 0
            $scope.itemSearch.filter = '';
            $scope.subCategoryArray = [];
            $scope.subSubCategoryArray = [];
             filterArr = {};
            $scope.FilterProductCategories = '';
            tempProductFilterArray = []
            $scope.getAllCategories(false,'category');
            $scope.getAllSubCategories(false,'subCategory');
            $scope.getAllSubSubCategories(false,'subSubCategory');
            loadItems(itemSearchObj, 'Manufacturer');
            $http.post("/dash/items/filterProduct/" + 'tags', itemSearchObj)
                .success(function (filterProduct) {
                    $scope.itemFilterProducts = '';
                    if(filterProduct.length){
                        console.log("filtersss",filterProduct)
                        $scope.itemFilterProducts = filterProduct;
                    }
                })
        }
        $scope.filterItemsByCriteria = function(type, all ,filter){
            //Parameter 'all' is used when user clicks SELECT ALL
            $scope.items = [];
            const loadItems = (data, type) => {
                console.log("data",data)
                $http.post("/dash/items", data)
                    .success(function (response) {
                        $scope.renderItems(response, type);
                        $http.post("/dash/item/count", data)
                            .success(function (res) {
                                $scope.transactionCount(res, 2);
                            });
                    });
            };
            if (type == 'category') {
                var newArray = [];
                $scope.categoryArray = [];
                itemSearchObj.searchCategory = [];
                itemSearchObj.searchBySubCategory = [];
                itemSearchObj.searchBySubSubCategory = [];
                itemSearchObj.searchbySelectedCheckbox = []
                $scope.subCategoryArray = [];
                $scope.subSubCategoryArray = [];
                filterArr = {};
                $scope.FilterProductCategories = '';
                tempProductFilterArray = []
                //
                // if(filter){
                //     itemSearchObj.searchCategory.push(filter);
                // }
                // if(arr.includes(id)){
                //     arr.splice(arr.indexOf(id), 1);
                //     return;
                // }
               if( $scope.categoryArray.includes(filter)){
                   console.log("duplicates");
                   $scope.categoryArray.splice( $scope.categoryArray.indexOf(filter), 1);
               }else{
                   $scope.categoryArray.push(filter);
               }
                console.log("filter",$scope.categoryArray);
                // $scope.itemFilterCategories.map(function (item) {
                //     if(item.category_selected && filter){
                //         item.category_selected = filter;
                //     } else {
                //         item.category_selected = null;
                //     }
                //     return item;
                // })
                $scope.itemFilterSubCategories = [];
                $scope.itemFilterSubSubCategories = [];
                itemSearchObj.searchByFilterColumn = [];
                itemSearchObj.searchbySelectedCheckbox = [];
                $scope.productFilterArray1=[];
                console.log("filter",$scope.categoryArray);
                itemSearchObj.searchCategory =  $scope.categoryArray;
                console.log("itemSearchObj",itemSearchObj);
                $http.post("/dash/items/filterRexItems/" + 'subCategory', itemSearchObj)
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
                $http.post("/dash/items/filterProduct/" + 'subCategory', itemSearchObj)
                    .success(function (filterProduct) {
                        $scope.itemFilterProducts = '';
                        if(filterProduct.length){
                            console.log("SubCatagory",filterProduct)
                            $scope.itemFilterProducts = filterProduct;
                            $scope.categoryFilter = true;
                        }
                    })
                $scope.subCategoryFilterFlag = true ;
                if(itemSearchObj.searchCategory && itemSearchObj.searchCategory.length){
                    for (var i = 0; i < itemSearchObj.searchCategory.length; i++) {
                        //... Push all other cities...
                        if (filter == itemSearchObj.searchCategory[i]) {
                            newArray.push(itemSearchObj.searchCategory[i]);
                        }
                    }
                    //... Replace the array..
                    itemSearchObj.searchCategory = $scope.categoryArray;
                    itemSearchObj.searchBySubCategory = [];
                    itemSearchObj.searchBySubSubCategory = [];
                    itemSearchObj.searchByFilterColumn = [];
                    itemSearchObj.searchbySelectedCheckbox = [];
                }else if(!$scope.itemFilterCategories.length){
                    $scope.itemFilterSubCategories = [];
                }
                loadItems(itemSearchObj, 'Manufacturer');
            }
            else if(type == 'subCategory'){
                itemSearchObj.searchBySubCategory = [];
                itemSearchObj.searchBySubSubCategory = [];
                itemSearchObj.searchByFilterColumn = [];
                itemSearchObj.searchbySelectedCheckbox = [];
                $scope.subSubCategoryArray =[];
                $scope.productFilterArray1=[];
                filterArr = {};
                $scope.FilterProductCategories = '';
                tempProductFilterArray = []
                if( $scope.subCategoryArray.includes(filter)){
                    console.log("duplicates subCategoryArray");
                    $scope.subCategoryArray.splice( $scope.subCategoryArray.indexOf(filter), 1);
                }else{
                    // $scope.subCategoryArray.push(filter);
                    $scope.subCategoryArray = [filter]
                }
                console.log("filter",$scope.subCategoryArray);
                // $scope.itemFilterSubCategories.map(function (item) {
                //     if(item.subCategory_selected){
                //         item.subCategory_selected = filter;
                //     } else {
                //         item.subCategory_selected = null;
                //     }
                // })
                $scope.itemFilterSubSubCategories = [];
                $http.post("/dash/items/filterRexItems/" + 'subSubCategory', itemSearchObj)
                    .success(function (subSubCategory) {
                console.log("entered into subcategory")
                        if(subSubCategory.length){
                            $scope.itemFilterSubSubCategories = [];
                            for(var i=0; i< subSubCategory.length ; i++){
                                if(subSubCategory[i]._id){
                                    $scope.itemFilterSubSubCategories.push(subSubCategory[i]);
                                }
                            }
                        }
                    })
                $http.post("/dash/items/filterProduct/" + 'subSubCategory', itemSearchObj)
                    .success(function (filterProduct) {
                        $scope.itemFilterProducts = '';
                        if(filterProduct.length){
                            console.log("subSubCategory",filterProduct)
                            $scope.itemFilterProducts = filterProduct;
                            $scope.subCategoryFilter = true;
                        }
                    })
                $scope.subSubCategoryFilterFlag = true ;
                itemSearchObj.searchByFilterColumn = [];
                itemSearchObj.searchbySelectedCheckbox = [];
                if(filter){
                    var newArray = [];
                    if(filter)
                        newArray.push(filter);
                    itemSearchObj.searchBySubCategory = [];
                    itemSearchObj.searchBySubCategory = newArray; //... Replace the array..
                    itemSearchObj.searchBySubSubCategory = [];
                    itemSearchObj.searchByFilterColumn = [];
                    itemSearchObj.searchbySelectedCheckbox = [];
                    // if (itemSearchObj.searchBySubCategory.length)
                        loadItems(itemSearchObj, 'subCategory');
                }
            }
            else if(type == 'subSubCategory'){
                filterArr = {};
                $scope.FilterProductCategories = '';
                tempProductFilterArray = []
                itemSearchObj.searchBySubSubCategory = [];
                if( $scope.subSubCategoryArray.includes(filter)){
                    console.log("duplicates subSubCategoryArray");
                    $scope.subSubCategoryArray.splice( $scope.subSubCategoryArray.indexOf(filter), 1);
                }else{
                    // $scope.subSubCategoryArray.push(filter);
                    $scope.subSubCategoryArray = [filter]
                }
                console.log("subSubCategoryArray filter",$scope.subSubCategoryArray);
                // $scope.itemFilterSubSubCategories.map(function (item) {
                //     if(item.subSubCategory_selected || item.subSubCategory_selected == ''){
                //         item.subSubCategory_selected = filter;
                //     } else {
                //         item.subSubCategory_selected = null;
                //     }
                // })
                $http.post("/dash/items/filterProduct/" + 'prodfilters', itemSearchObj)
                    .success(function (filterProduct) {
                        $scope.itemFilterProducts = '';
                        if(filterProduct.length){
                            console.log("prodfilters",filterProduct)
                            $scope.itemFilterProducts = filterProduct;
                            $scope.subSubCategoryFilter = true;
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
                if(filter){
                    var newArray = [];
                    if(filter)
                        newArray.push(filter);
                    itemSearchObj.searchBySubSubCategory = newArray //... Replace the array..
                    itemSearchObj.searchByFilterColumn = [];
                    itemSearchObj.searchbySelectedCheckbox = [];
                    $scope.productFilterArray1=[];
                    // if (itemSearchObj.searchBySubSubCategory.length)
                        loadItems(itemSearchObj, 'subSubCategory');
                 }
            }
            else if(type == 'clear'){
                $scope.item.category_selected = '';
                $scope.item.subCategory_selected = '';
                $scope.item.subSubCategory_selected = '';
                if(all){
                    console.log("entered into all")
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
                    itemSearchObj.searchByFilterColumn = [];
                    itemSearchObj.searchbySelectedCheckbox = [];
                    loadItems(itemSearchObj, 'Manufacturer');
                    $http.post("/dash/items/filterProduct/" + 'tags', itemSearchObj)
                        .success(function (filterProduct) {
                            $scope.itemFilterProducts = '';
                            if(filterProduct.length){
                                console.log("filtersss",filterProduct)
                                $scope.itemFilterProducts = filterProduct;
                            }
                        })
                }
            }
            else {
                $scope.itemFilterCategories = [];
                $scope.itemFilterSubCategories = [];
                $scope.itemFilterSubSubCategories = [];
            }
        }
        //.... Add a new Category....
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
                    $scope.filterBasedOnCategory(category,'edit');
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
                }
            }
            else{
                Settings.failurePopup("Error",'Enter a Category');
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
                        if(type == 'item'){
                            $('#newSubCategory').modal('hide');
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
                    }
                }
                else{
                    Settings.failurePopup("Error",'Please Add or Select a Category First');
                }
            }
            else{
                Settings.failurePopup("Error",'Enter a SubCategory');
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
                        if(type == 'item'){
                            $('#newSubSubCategory').modal('hide');
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
                    }
                }
                else{
                    Settings.failurePopup("Error",'Please Add or Select a subCategory First');
                }
            }
            else{
                Settings.failurePopup("Error",'Enter a Sub-Sub-Category');
            }
        }
        //End of Function which is used to Search or filter Items
        //..... Change of Shipping Address.....
        $scope.changeShippingAddress = function(){
            //console.log($scope.data.shippingAddress)
            if($scope.data.shippingAddress){
                if($scope.data.shippingAddress.Address)
                    $scope.data.tempnewOrderShipping_address = $scope.data.shippingAddress.Address;
                if($scope.data.shippingAddress.City)
                    $scope.data.tempCity = $scope.data.shippingAddress.City;
                if($scope.data.shippingAddress.State)
                    $scope.data.tempState = $scope.data.shippingAddress.State;
                if($scope.data.shippingAddress.Country)
                    $scope.data.tempCountry = $scope.data.shippingAddress.Country;
                $scope.data.newOrderShipping_address = $scope.data.tempnewOrderShipping_address ;
                if($scope.data.newOrderStore.StockistState && $scope.data.shippingAddress.State){
                    if($scope.data.newOrderStore.StockistState != $scope.data.shippingAddress.State)
                        $scope.calculateIGST = true;
                    else
                        $scope.calculateIGST = false;
                }else
                    $scope.calculateIGST = false;
            }
            else {
                $scope.data.newOrderShipping_address = $scope.data.newOrderStore.Address;
                $scope.data.tempCity = $scope.data.newOrderStore.City || '';
                $scope.data.tempState = $scope.data.newOrderStore.State || '';
                $scope.data.tempCountry = $scope.data.newOrderStore.Country || '';
            }
            $scope.changeInAddress();
        }
        //..... Get Role from users .....
        $scope.getRoleName = function(role){
            // console.log(role)
            let temp = '';
            if(role){
                if($scope.userRole){
                    for (let i = 0; i < $scope.userRole.length; i++){
                        if($scope.userRole[i].role.toUpperCase() == role.toUpperCase()){
                            temp = $scope.userRole[i].name;
                            break;
                        }
                    }
                }
            }
            return temp || role;
        };
        /*......
            Global Tax Calulcations ......
        ..... */
        //..... Calulcate Discount .....
        const discountCalculation = (old_price, new_price) => ((old_price - new_price) / old_price) * 100;
        //.... Finding taxable value of a price..... (Inclusive)
        const calculateTaxableValue = (quantity, price, CGST, SGST, IGST) => ((quantity * price) / (100 + CGST + SGST + IGST)) * 100;
        //.... Calculate tax for a value.... (Exclusive)
        const calculateTax = (price, CGST, SGST, IGST) => ((price) + ((CGST * price) / 100) + ((SGST * price) / 100)  + ((IGST * price) / 100) );
        $scope.CheckGstByState = function (orderItem,item ) {
            var type = '';
            if(!instanceDetails.companyState || !$scope.data.tempState){
                type = 'gst_total_intra';
            }else{
                if(instanceDetails.companyState ==  $scope.data.tempState){
                    type = 'gst_total_inter';
                }else{
                    type = 'gst_total_intra';
                }
            }
            switch (type) {
                case 'gst_total_inter' : {
                    console.log('gst_total_inter')
                    if(item.gst){
                        if(!item.gst.cgst && !item.gst.sgst && !item.gst.igst){
                            if(defaultTax){
                                orderItem.CGST = defaultTax.cgst ? defaultTax.cgst  : 0;
                                orderItem.SGST = defaultTax.sgst ? defaultTax.sgst : 0;
                                orderItem.IGST =  0;
                                orderItem.qbId = defaultTax.qbId ? defaultTax.qbId : 0
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
                            orderItem.qbId = item.qbId ? item.qbId  : 0;
                        }else if(defaultTax){
                            orderItem.CGST = defaultTax.cgst ? defaultTax.cgst  : 0;
                            orderItem.SGST = defaultTax.sgst ? defaultTax.sgst : 0;
                            orderItem.IGST =  0;
                            orderItem.qbId = defaultTax.qbId ? defaultTax.qbId : 0
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
                                orderItem.qbId = defaultTax.qbId ? defaultTax.qbId : 0
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
                            orderItem.qbId = item.qbId ? item.qbId  : 0;
                        }else if(defaultTax){
                            orderItem.CGST =  0;
                            orderItem.SGST =  0;
                            orderItem.IGST =  defaultTax.igst ? defaultTax.igst : 0;
                            orderItem.qbId = defaultTax.qbId ? defaultTax.qbId : 0
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
        /*.....
            Change In Address....
        ...... */
        $scope.changeInAddress = function () {
            if($scope.taxExclusive){
                for(let i = 0; i < $scope.newOrderItemList.length; i++){
                    $scope.CheckGstByState($scope.newOrderItemList[i],$scope.newOrderItemList[i].itemDetails)
                    if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice){
                        $scope.newOrderItemList[i].taxableValue =  $scope.newOrderItemList[i].itemDetails.BulkPrice * $scope.newOrderItemList[i].quantity;
                        //.... India tax....
                        if($scope.taxSetups.otherSetup != 'other'){
                            $scope.newOrderItemList[i].BulkPrice = calculateTax($scope.newOrderItemList[i].itemDetails.BulkPrice, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST)
                        }else if($scope.taxSetups.otherSetup == 'other' && $scope.newOrderItemList[i].otherTaxes){
                            var otherTaxesValue = 0;
                            for(let j = 0; j < $scope.newOrderItemList[i].otherTaxes.length; j++){
                                //if(itemIndex == j){
                                otherTaxesValue += (($scope.newOrderItemList[i].otherTaxes[j].value * $scope.newOrderItemList[i].itemDetails.BulkPrice)/100)
                                //}
                            }
                            $scope.newOrderItemList[i].BulkPrice = $scope.newOrderItemList[i].itemDetails.BulkPrice + otherTaxesValue;
                        }
                    }else{
                        //.... India tax....
                        if($scope.taxSetups.otherSetup != 'other') {
                            $scope.newOrderItemList[i].taxableValue =  $scope.newOrderItemList[i].itemDetails.orderMRP * $scope.newOrderItemList[i].quantity;
                            $scope.newOrderItemList[i].orderMRP = calculateTax($scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST);
                            //.... India tax....
                        }else if($scope.taxSetups.otherSetup == 'other' && $scope.newOrderItemList[i].otherTaxes){
                            var otherTaxesValue = 0;
                            $scope.newOrderItemList[i].taxableValue = $scope.newOrderItemList[i].itemDetails.orderMRP * $scope.newOrderItemList[i].quantity;
                            for(let j = 0; j < $scope.newOrderItemList[i].otherTaxes.length; j++){
                                otherTaxesValue += (($scope.newOrderItemList[i].otherTaxes[j].value * $scope.newOrderItemList[i].itemDetails.orderMRP)/100)
                            }
                            $scope.newOrderItemList[i].orderMRP = $scope.newOrderItemList[i].itemDetails.orderMRP + otherTaxesValue;
                        }
                    }
                }
            }else{
                for(let i = 0; i < $scope.newOrderItemList.length; i++){
                    $scope.CheckGstByState($scope.newOrderItemList[i], $scope.newOrderItemList[i].itemDetails);
                    if($scope.data.newOrderStore.customerVariant == 'bulk' &&  $scope.newOrderItemList[i].itemDetails.BulkPrice){
                        $scope.newOrderItemList[i].taxableValue =
                            (($scope.newOrderItemList[i].quantity  *
                                ($scope.newOrderItemList[i].itemDetails.BulkPrice -
                                    ($scope.newOrderItemList[i].itemDetails.BulkPrice * ($scope.getItemsDiscount($scope.newOrderItemList[i].itemDetails.itemCode) / 100)))) /
                                (100 + $scope.newOrderItemList[i].CGST + $scope.newOrderItemList[i].SGST + $scope.newOrderItemList[i].IGST)) * 100;
                    }else{
                        if($scope.taxSetups.otherSetup != 'other') {
                            $scope.newOrderItemList[i].taxableValue = calculateTaxableValue($scope.newOrderItemList[i].quantity, $scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST)
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
        //clear Shipping Address
        $scope.clearShippingAddress = function(){
            $scope.data.tempName = '';
            $scope.data.tempnewOrderShipping_address = '';
            $scope.data.tempCity = '';
            $scope.data.tempState = '';
            $scope.data.tempCountry = '';
            $scope.editShippingAddress.flag = true
        }
        $scope.mapAddress = false;
        $scope.recordAddress = function (type,page) {
            if(page == 'order'){
                if (type == 'new') {
                    var input = document.getElementById('shippingAddress');
                    // console.log('input',input);
                    var autocomplete = new google.maps.places.Autocomplete(input);
                    autocomplete.addListener('place_changed', function () {
                        var newplace = autocomplete.getPlace();
                        var jcity = '';
                        var jaddress = '';
                        var jarea = '';
                        var jcountry = '';
                        var jstate = '';
                        // console.log(place);
                        for(var i=0; i<newplace.address_components.length; i++){
                            if(newplace.address_components[i].types[0]=="locality"){
                                jcity = newplace.address_components[i].long_name;
                                jaddress= newplace.formatted_address;
                            }
                            if(newplace.address_components[i].types[1]=="sublocality")
                                jarea = newplace.address_components[i].long_name;
                            if(newplace.address_components[i].types[0]=="country")
                                jcountry = newplace.address_components[i].long_name;
                            if(newplace.address_components[i].types[0]=="administrative_area_level_1"){
                                jstate = newplace.address_components[i].long_name;
                                $scope.mapAddress = true;
                            }
                        }
                        // console.log("lat and long"+lat, long);
                        var scope = angular.element(document.getElementById('shippingAddress')).scope();
                        console.log("jcity", jcity);
                        scope.data.tempnewOrderShipping_address = jaddress;
                        scope.data.tempCity = jcity;
                        scope.data.tempState = jstate;
                        scope.data.tempCountry = jcountry;
                        $scope.$apply();
                        $('#shippingCity').val(jcity);
                    })
                }
            }
        }
        //New Order Shipping Address for edit
        $scope.changeInShippingAddress = function( )
        {
            //console.log($scope.data);
            if( !$scope.data.tempnewOrderShipping_address){
                Settings.alertPopup("Alert","Enter a valid Address");
                return;
            }else if(!$scope.data.tempState){
                Settings.alertPopup("Alert","Choose a valid State");
                return;
            }else if(!$scope.data.tempCity){
                Settings.alertPopup("Alert","Enter a valid City");
                return;
            }else if(!$scope.data.tempName){
                Settings.alertPopup("Alert","Enter a valid Address Name");
                return;
            }
            //console.log($scope.data);
            for(var i=0 ; i < $scope.shipping_addresses.length; i++){
                console.log($scope.shipping_addresses[i].AddressName);
                if($scope.data.tempName == $scope.shipping_addresses[i].AddressName){
                    Settings.alertPopup("Alert","Address Name already exists. Please choose a different Name");
                    return;
                }
            }
            if($scope.data.newOrderStore.StockistState && $scope.data.tempState){
                if($scope.data.newOrderStore.StockistState != $scope.data.tempState)
                    $scope.calculateIGST = true;
                else
                    $scope.calculateIGST = false;
            }else $scope.calculateIGST = false;
            $scope.data.newOrderShipping_address = $scope.data.tempnewOrderShipping_address ;
            $scope.data.shippingAddress = $scope.data.tempName;
            //console.log($scope.data.newOrderStore);
            if($scope.data.newOrderStore.Dealercode){
                var temp = new Date().getTime();
                var Id = 'ID'+temp;
                var newAddress = {
                    'Dealercode' : $scope.data.newOrderStore.Dealercode,
                    'AddressName' : $scope.data.tempName,
                    'Address' : $scope.data.tempnewOrderShipping_address,
                    'City' : $scope.data.tempCity,
                    'State' : $scope.data.tempState,
                    'Country': $scope.data.tempCountry,
                    'Id': Id
                }
                console.log(newAddress);
                $scope.shipping_addresses.push(newAddress);
                $scope.data.shippingAddress = newAddress;
                //POST New shipping address to mongo..
                $http.post("/dash/new-address", newAddress)
                    .success(function(response){
                        $scope.mapAddress = false;
                        $scope.editShippingAddress.flag = false;
                        Settings.success_toast("Success","New address "+$scope.data.tempName+" added successfully")
                        console.log("New Shipping Address is added to the list ------>");
                    })
            }else
                Settings.info_toast("Alert","Please select a Customer from the search above");
            $scope.changeInAddress();
        }//End of function changeInShippingAddress
        //Change GST for an orderLine
        $scope.changeGSTForOrderLine = function(order, gst){
            //..... Country Tax is India .....
            if($scope.tempCountryName != 'ghana'){
                if($scope.data.newOrderStore.customerVariant == 'bulk'){
                    if(gst){
                        $scope.newOrderItemList[i].CGST = gst.cgst;
                        $scope.newOrderItemList[i].SGST = gst.sgst;
                        $scope.newOrderItemList[i].IGST = gst.igst;
                        $scope.newOrderItemList[i].qbId = gst.qbId;
                        if(!$scope.taxExclusive){
                            for(let i = 0; i < $scope.newOrderItemList.length; i++){
                                if($scope.newOrderItemList[i].itemDetails.BulkPrice){
                                    if(order.itemDetails.itemCode == $scope.newOrderItemList[i].itemDetails.itemCode){
                                        $scope.newOrderItemList[i].BulkPrice = $scope.newOrderItemList[i].itemDetails.BulkPrice;
                                        $scope.newOrderItemList[i].taxableValue = calculateTaxableValue($scope.newOrderItemList[i].quantity, $scope.newOrderItemList[i].itemDetails.BulkPrice, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST)
                                    }
                                }else{
                                    if(order.itemDetails.itemCode == $scope.newOrderItemList[i].itemDetails.itemCode){
                                        $scope.newOrderItemList[i].orderMRP = $scope.newOrderItemList[i].itemDetails.orderMRP;
                                        $scope.newOrderItemList[i].taxableValue = calculateTaxableValue($scope.newOrderItemList[i].quantity, $scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST)
                                    }
                                }
                            }
                        }else{
                            for(let i = 0; i < $scope.newOrderItemList.length; i++){
                                if($scope.newOrderItemList[i].itemDetails.BulkPrice) {
                                    if (order.itemDetails.itemCode == $scope.newOrderItemList[i].itemDetails.itemCode) {
                                        $scope.newOrderItemList[i].taxableValue = $scope.newOrderItemList[i].itemDetails.BulkPrice * $scope.newOrderItemList[i].quantity;
                                        $scope.newOrderItemList[i].BulkPrice = calculateTax($scope.newOrderItemList[i].itemDetails.BulkPrice, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST);
                                    }
                                }else{
                                    if(order.itemDetails.itemCode == $scope.newOrderItemList[i].itemDetails.itemCode){
                                        $scope.newOrderItemList[i].taxableValue =  $scope.newOrderItemList[i].itemDetails.orderMRP * $scope.newOrderItemList[i].quantity;
                                        $scope.newOrderItemList[i].orderMRP = calculateTax($scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST);
                                    }
                                }
                            }
                        }
                    }else{
                        $scope.newOrderItemList[i].CGST = 0;
                        $scope.newOrderItemList[i].SGST = 0;
                        $scope.newOrderItemList[i].IGST = 0;
                        $scope.newOrderItemList[i].qbId = 0;
                        for(let i = 0; i < $scope.newOrderItemList.length; i++){
                            if($scope.newOrderItemList[i].itemDetails.BulkPrice) {
                                if (order.itemDetails.itemCode == $scope.newOrderItemList[i].itemDetails.itemCode) {
                                    $scope.newOrderItemList[i].BulkPrice = $scope.newOrderItemList[i].itemDetails.BulkPrice;
                                    $scope.newOrderItemList[i].taxableValue = calculateTaxableValue($scope.newOrderItemList[i].quantity, $scope.newOrderItemList[i].itemDetails.BulkPrice, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST);
                                }
                            }else{
                                if(order.itemDetails.itemCode == $scope.newOrderItemList[i].itemDetails.itemCode){
                                    $scope.newOrderItemList[i].orderMRP = $scope.newOrderItemList[i].itemDetails.orderMRP;
                                    $scope.newOrderItemList[i].taxableValue = calculateTaxableValue($scope.newOrderItemList[i].quantity, $scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST);
                                }
                            }
                        }
                    }
                }else{
                    if(gst){
                        $scope.newOrderItemList[i].CGST = gst.cgst;
                        $scope.newOrderItemList[i].SGST = gst.sgst;
                        $scope.newOrderItemList[i].IGST = gst.igst;
                        $scope.newOrderItemList[i].qbId = gst.qbId;
                        if(!$scope.taxExclusive){
                            for(let i = 0; i < $scope.newOrderItemList.length; i++){
                                if(order.itemDetails.itemCode == $scope.newOrderItemList[i].itemDetails.itemCode){
                                    $scope.newOrderItemList[i].orderMRP = $scope.newOrderItemList[i].itemDetails.orderMRP
                                    $scope.newOrderItemList[i].taxableValue = calculateTaxableValue($scope.newOrderItemList[i].quantity, $scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST)
                                }
                            }
                        }else{
                            for(let i=0; i< $scope.newOrderItemList.length; i++){
                                if(order.itemDetails.itemCode == $scope.newOrderItemList[i].itemDetails.itemCode){
                                    $scope.newOrderItemList[i].taxableValue =  $scope.newOrderItemList[i].itemDetails.orderMRP * $scope.newOrderItemList[i].quantity;
                                    $scope.newOrderItemList[i].orderMRP = calculateTax($scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST);
                                }
                            }
                        }
                    }else{
                        $scope.newOrderItemList[i].CGST = 0;
                        $scope.newOrderItemList[i].SGST = 0;
                        $scope.newOrderItemList[i].IGST = 0;
                        $scope.newOrderItemList[i].qbId = 0;
                        for(let i = 0; i < $scope.newOrderItemList.length; i++){
                            if(order.itemDetails.itemCode == $scope.newOrderItemList[i].itemDetails.itemCode){
                                $scope.newOrderItemList[i].orderMRP = $scope.newOrderItemList[i].itemDetails.orderMRP;
                                $scope.newOrderItemList[i].taxableValue = calculateTaxableValue($scope.newOrderItemList[i].quantity, $scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST)
                            }
                        }
                    }
                }
            }
        }
        //.... Remove items from cart......
        $scope.deleteItemFromOrder = function(item, index){
            Settings.confirmPopup('',"Are you sure you want to delete the item from cart?", function(result) {
                if (result) {
                    $scope.$apply(function(){
                        var indexInCatalogue = doesItemExistsInArray($scope.items, "itemCode", item.itemDetails);
                        if(indexInCatalogue >=0){
                            $scope.itemsInModal[indexInCatalogue].added        = -1;
                            $scope.itemsInModal[indexInCatalogue].itemQuantity = '';
                        }
                        //remove items from the order
                        $scope.newOrderItemList.splice(index, 1);
                    });
                    let temp = 0;
                    $scope.orderTotalPrice = $scope.dealerOrderTotalPrice;
                    for(let i = 0; i < $scope.newOrderItemList.length; i++) {
                        temp = $scope.newOrderItemList[i].quantity * $scope.newOrderItemList[i].MRP;
                        $scope.orderTotalPrice = $scope.orderTotalPrice + temp;
                    }
                }
            })
        };
        $scope.existingComment = [];
        $scope.renderDealerReport = function (type) {
            //console.log($scope.dealerReportFilter.startDate +" "+ $scope.dealerReportFilter.endDate);
            jQuery.noConflict();
            $('.refresh').css("display", "inline");
            if($scope.dealerReportFilter.startDate && $scope.dealerReportFilter.endDate){
                if (($scope.dealerReportFilter.startDate - $scope.dealerReportFilter.endDate) > 0){
                    $scope.dealerReportFilter.startDate = new Date();
                    $scope.dealerReportFilter.startDate.setDate($scope.dealerReportFilter.startDate.getDate() - 7);
                    $scope.dealerReportFilter.startDate.setHours(0, 0, 0, 0);
                    $scope.dealerReportFilter.endDate = new Date();
                    $scope.dealerReportFilter.endDate.setHours(23, 59, 59, 59);
                    return;
                }
            }
            topCustomerSearchObj.viewLength = 0;
            topCustomerSearchObj.viewBy = initialViewBy;
            topCustomerSearchObj.sDate = $scope.DateTimeFormat($scope.dealerReportFilter.startDate, 'start');
            topCustomerSearchObj.eDate = $scope.DateTimeFormat($scope.dealerReportFilter.endDate, 'end');
            topCustomerSearchObj.searchFor = '';
            topCustomerSearchObj.searchBy = topDealerSearchBy;
            if(!type){
                $scope.viewLength = 0;
                $scope.newViewBy = localViewBy;
            }
            $http.post("/dash/reports/dealers/", topCustomerSearchObj)
                .success(function(response){
                    console.log("GetAll Dealers reports-->" );
                    // console.log(response);
                    response.sort(function(a, b) {
                        return a.orderTotal < b.orderTotal ? 1 : -1;
                    });
                    $scope.dealerreport = response;
                    $scope.items10 = response;
                    $scope.totalItems1 = response.length;
                    $scope.FetchSelectedFromDelearList();
                    $scope.items10 = $scope.dealerreport;
                    $scope.viewby1 = 10;
                    $scope.totalItems1 = $scope.dealerreport.length;
                    $scope.currentPage1 = 1;
                    $scope.itemsPerPage1 = $scope.viewby1;
                    $scope.maxSize1 = 5;
                    $scope.case8bLength = $scope.dealerreport.length;
                    $http.post("/dash/reports/top/customer/count", topCustomerSearchObj)
                        .success(function (res) {
                            if(!type) {
                                $scope.reportsTransactionCount(res, 2);
                            }
                        })
                })
            setTimeout(function () {
                $('.refresh').css("display", "none");
            }, 3000);
        };
        $scope.intializeNewOrder = function(){
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
                "bankname": "",
                "courierName":"",
                "trackingNumber":""
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
                itemDetails : {},
                quantity : 1,
                total : 0,
                MRP : 0,
                orderMRP : 0,
                CGST : 0,
                SGST : 0,
                IGST : 0
            };
            $scope.clearFilter(2);
            $scope.newOrderTotalAmount = 0;
            // $scope.newOrderMRPTotalAmount = 0;
            //Clear order should clear the catalogue displayed selections
            if($scope.itemsInModal)
                for(var i=0; i < $scope.itemsInModal.length; i++ )
                {
                    $scope.itemsInModal[i].added = -1;
                    $scope.itemsInModal[i].itemQuantity = '';
                }
            if($scope.user.role == 'Dealer' && !$scope.OrderIdParam){
                console.log("Store assigned to Dealer user", $scope.user);
                $http.get("/dash/store/details/"+$scope.user.sellerphone)
                    .success(function(response){
                        console.log(response);
                        if(response.length){
                            newOrderSelectedStore = response[0];
                            $scope.a.selectedStores = newOrderSelectedStore;
                            $scope.data.newOrderStore = newOrderSelectedStore;
                            $scope.StoreSelectedFromTypeahead(newOrderSelectedStore);
                            console.log("newOrderSelectedStore",newOrderSelectedStore);
                            $scope.changeOrderView(1)
                        }
                    })
            }
            if($scope.OrderIdParam){
                $http.get("/dash/orders/" + $scope.OrderIdParam)
                    .success(function (orderRes) {
                        if(orderRes.length){
                            $scope.data.courierName = orderRes[0].courierName;
                            $scope.data.trackingNumber = orderRes[0].trackingNumber;
                            if(orderRes[0].comment){
                                $scope.existingComment = angular.copy(orderRes[0].comment);
                            }
                            $http.get("/dash/store/details/"+orderRes[0].dealerphone)
                                .success(function(response){
                                    if(response.length){
                                        newOrderSelectedStore = response[0];
                                        $scope.a.selectedStores = newOrderSelectedStore;
                                        $scope.data.newOrderStore = newOrderSelectedStore;
                                        $scope.StoreSelectedFromTypeahead(newOrderSelectedStore);
                                        if(orderRes.length){
                                            if(orderRes[0].shipping_address){
                                                $scope.data.newOrderShipping_address = orderRes[0].shipping_address;
                                            }
                                            if(orderRes[0].shipping_address_city){
                                                $scope.data.tempCity = orderRes[0].shipping_address_city;
                                                $scope.data.newOrderShipping_address_city = orderRes[0].shipping_address_city;
                                            }
                                            if(orderRes[0].shipping_address_state){
                                                $scope.data.tempState = orderRes[0].shipping_address_state;
                                                $scope.data.newOrderShipping_address_state = orderRes[0].shipping_address_state;
                                            }
                                            if(orderRes[0].shipping_address_country){
                                                $scope.data.newOrderShipping_address_country = orderRes[0].shipping_address_country;
                                            }
                                        }
                                        $scope.changeOrderView(1)
                                        var itemCodeArray=[];
                                        for(var i=0; i<orderRes.length; i++) {
                                            // console.log('delearcode2',$scope.allDealers[i].Dealercode);
                                            // console.log('$scope.dealerreport[i]',$scope.dealerreport[i])
                                            itemCodeArray.push({'itemCode': Number(orderRes[i].itemcode)});
                                            itemCodeArray.push({'itemCode': orderRes[i].itemcode})
                                        }
                                        $http.post("/dash/items/itemcode",itemCodeArray)
                                            .success(function (Itemres) {
                                                // $scope.popularDealerReport = response;
                                                // console.log('$scope.popularDelears',$scope.popularDealerReport);
                                                var defaultGstTax = {
                                                    cgst  : 0,
                                                    sgst  : 0,
                                                    igst : 0
                                                }
                                                if(Itemres.length){
                                                    for(var i=0;i<orderRes.length;i++){
                                                        for(var j=0;j<Itemres.length;j++){
                                                            if(orderRes[i].itemcode == Itemres[j].itemCode){
                                                                Itemres[j].MRP = orderRes[i].MRP;
                                                                Itemres[j].orderMRP = orderRes[i].orderMRP;
                                                                Itemres[j].olditem = true;
                                                                Itemres[j].itemQuantity = orderRes[i].quantity;
                                                                if(orderRes[i].GST){
                                                                    Itemres[j].gst = orderRes[i].GST;
                                                                }else{
                                                                    Itemres[j].gst = defaultGstTax;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    for(var i=0; i<Itemres.length; i++){
                                                        var item = Itemres[i];
                                                        $scope.addItemToOrder(item,item.itemQuantity, item.lineComment,'edit')
                                                    }
                                                    $scope.renderItemsMrp();
                                                }
                                                $scope.displayEditloader = false;
                                            })
                                    }
                                })
                        }
                    });
            }
        }
        //Data preparations that are needed before we take a new order
        $scope.addOrderInitialize = function(){
            $scope.edit =false;
            $scope.addOrderButton = false;
            $scope.addOrderDetailsButton = false;
            $scope.intializeNewOrder();		//Reset the new order page
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
            if($scope.user.role != 'Dealer'){
                //To get Stores
                $scope.clearFilter(4);
            }
            // $scope.handleChangeInCategory('Manufacturer', 'All');
            jQuery.noConflict();
            $('#newOrderDealerSearchBox').val(null);
        }//End of addOrderInitialize
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
        $scope.filterRecentOrderTransaction = function()
        {
            var orderDelearCode=[];
            // console.log('recentorder recent',recentorder);
            for(var i=0; i< recentorder.length; i++){
                if(recentorder[i].type[0] == 'Order'){
                    orderDelearCode.push({'Dealercode':recentorder[i].dealercode[0]});
                }
            }
            orderDelearCode= Array.from(new Set(orderDelearCode))
            if(orderDelearCode.length){
                $http.post("/dash/stores/dealercode", orderDelearCode)
                    .success(function (response) {
                        // console.log('response order',response);
                        $scope.recentDelears = response;
                        // console.log('$scope.recentDelears',$scope.recentDelears);
                    })
            }else{
                $scope.recentDelears = [];
            }
        }
        //Function to take care of things when a store is selected for the new order
        $scope.FetchSelectedFromDelearList = function(){
            // console.log('delearcode',delearcode);
            // console.log('delearcode',$scope.allDealers);
            var popularDealers=[];
            for(var i=0; i<$scope.dealerreport.length; i++){
                // console.log('delearcode2',$scope.allDealers[i].Dealercode);
                // console.log('$scope.dealerreport[i]',$scope.dealerreport[i])
                popularDealers.push({'Dealercode':$scope.dealerreport[i].dealer[0]});
            }
            $http.post("/dash/stores/dealercode", popularDealers)
                .success(function (response) {
                     console.log('response order',response);
                    $scope.popularDealerReport = response;
                    // console.log('$scope.popularDelears',$scope.popularDealerReport);
                })
        }
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
                                jQuery.noConflict();
                                $('.refresh').css("display", "inline");
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
        //Akash: Adding MRP and added attributes in array
        $scope.renderItemsMrp  = function(){
            var priceList = $scope.orderPriceList;
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
                    $scope.itemsInModal[i].added = doesItemExistsInCart(neworderList, "itemCode", $scope.itemsInModal[i]);
                    if($scope.itemsInModal[i].added >= 0 && $scope.newOrderItemList.length){
                        for(var j = 0; j < $scope.newOrderItemList.length; j++){
                            if($scope.itemsInModal[i]._id == $scope.newOrderItemList[j].itemDetails._id){
                                $scope.itemsInModal[i].itemQuantity = $scope.newOrderItemList[j].quantity;
                            }
                        }
                    }
                    //removing line tax for if country is ghana
                    if($scope.tempCountryName == 'ghana'){
                        $scope.itemsInModal[i].gst = {};
                    }
                    if( !$scope.itemsInModal[i].trackInventory && $scope.itemsInModal[i].trackInventory != false){
                        $scope.itemsInModal[i].trackInventory = true;
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
                    $scope.itemsInModal[i].added = doesItemExistsInCart(neworderList, "itemCode", $scope.itemsInModal[i]);
                    if($scope.itemsInModal[i].added >= 0 && $scope.newOrderItemList.length){
                        for(var j = 0; j < $scope.newOrderItemList.length; j++){
                            if($scope.itemsInModal[i]._id == $scope.newOrderItemList[j].itemDetails._id){
                                $scope.itemsInModal[i].itemQuantity = $scope.newOrderItemList[j].quantity;
                            }
                        }
                    }
                    //removing line tax for if country is ghana
                    if($scope.tempCountryName == 'ghana'){
                        $scope.itemsInModal[i].gst = {};
                    }
                    if( !$scope.itemsInModal[i].trackInventory && $scope.itemsInModal[i].trackInventory != false){
                        $scope.itemsInModal[i].trackInventory = true;
                    }
                }
            }
            if($scope.itemsInModal.length){
                for (var j = 0; j < $scope.newOrderItemList.length; j++) {
                    if( $scope.newOrderItemList.length){
                        for(var i = 0; i < $scope.itemsInModal.length; i++){
                            if($scope.itemsInModal[i]._id == $scope.newOrderItemList[j].itemDetails._id){
                                if($scope.newOrderItemList[j].itemDetails.olditem){
                                    $scope.itemsInModal.splice(i, 1)
                                    if(!$scope.itemsInModal.length)break;
                                }
                            }
                        }
                    }
                    if(!$scope.itemsInModal.length)break;
                }
            }
        }
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
        $scope.renderDealerReport('order');
        $scope.filterRecentOrderTransaction();
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
                        $scope.getAllCategories(true,'category');
                        $scope.getAllSubCategories(true,'subCategory');
                        $scope.getAllSubSubCategories(true,'subSubCategory');
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
        $scope.customerDiscount ='';
        $scope.renderItems = function (items_list,type) {
            // $scope.items = [];
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
            if($scope.user.role == 'Dealers'){
                if($scope.coID != 'GLGR'){
                    $http.get('dash/customprice/' + newOrderSelectedStore.Dealercode)
                        .success(function(pricelist){
                            console.log("Custom prices : " + pricelist.length)
                            $scope.items_count = pricelist.length;
                            dealerItemsCount = pricelist.length;
                            if(pricelist.length < $scope.newViewBy){
                                $scope.newViewBy = pricelist.length;
                                dealerNewViewBy = pricelist.length;
                            }
                            $scope.customPrices = pricelist;
                            $scope.items =[];
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
                                $scope.itemsInModal = $scope.items;
                                $scope.renderItemsMrp();
                            }
                        })
                }
                else{
                    console.log("Showing all items")
                    if($scope.data.newOrderStore.customerDiscount){
                        $scope.customerDiscount = $scope.data.newOrderStore.customerDiscount;
                        var Strdiscount = $scope.customerDiscount +"_special_discount"
                        var Strreduction =$scope.customerDiscount +"_special_reduction"
                    }
                    $scope.items = [];
                    for(var i = 0; i < items_list.length; i++){
                        items_list[i].inventory.forEach( function(item) {
                            items_list[i].totalInventory += item.Qty;
                        });
                        //Special is discount, netprice is actual price we get from csv file, MRP is actual price + discount price
                        items_list[i].special = items_list[i][$scope.data.newOrderStore.customerDiscount];
                        items_list[i].NetPrice = items_list[i].MRP ;
                        items_list[i].specialReduction = items_list[i][Strreduction] ? items_list[i][Strreduction] : 0;
                        items_list[i].specialDiscount = items_list[i][Strdiscount] ? items_list[i][Strdiscount] :  0;
                        items_list[i].finalDiscount =  parseFloat(items_list[i].special +  items_list[i].specialDiscount).toFixed(2);
                        items_list[i].price = parseFloat(items_list[i].MRP  - ( items_list[i].finalDiscount / 100 * items_list[i].MRP)).toFixed(2);
                        // items_list[i].MRP =  parseFloat(items_list[i].price  - ( items_list[i].specialReduction / 100 * items_list[i].price)).toFixed(2);
                        items_list[i].MRP =  items_list[i].specialReduction  ? (items_list[i].price  - ( items_list[i].specialReduction / 100 * items_list[i].price)).toFixed(2) : items_list[i].price;
                        $scope.items.push(items_list[i])
                        // console.log("NetPrice,special",items_list[i].NetPrice, items_list[i].NetPrice ,items_list[i].special)
                    }
                    $scope.itemsInModal = $scope.items;
                    $scope.renderItemsMrp();
                }
            }
            else{
                if($scope.data.newOrderStore.customerDiscount){
                    $scope.customerDiscount = $scope.data.newOrderStore.customerDiscount;
                    var Strdiscount = $scope.customerDiscount +"_special_discount"
                    var Strreduction =$scope.customerDiscount +"_special_reduction"
                }
                for(var i = 0; i < items_list.length; i++){
                    items_list[i].customPricelist = [];
                    items_list[i].totalInventory = 0;
                    items_list[i].special = 0;
                    items_list[i].NetPrice = 0;
                    items_list[i].inventory.forEach( function(item) {
                        items_list[i].totalInventory += item.Qty;
                    });
                    //Special is discount, netprice is actual price we get from csv file, MRP is actual price + discount price
                    items_list[i].special = items_list[i][$scope.data.newOrderStore.customerDiscount];
                    items_list[i].NetPrice = items_list[i].MRP ;
                    items_list[i].specialDiscount = items_list[i][Strdiscount] ? items_list[i][Strdiscount] :  0;
                    items_list[i].specialReduction = items_list[i][Strreduction] ? items_list[i][Strreduction] : 0;
                    items_list[i].finalDiscount = parseFloat(items_list[i].special +  items_list[i].specialDiscount).toFixed(2);
                    items_list[i].price = parseFloat(items_list[i].MRP  - ( items_list[i].finalDiscount / 100 * items_list[i].MRP)).toFixed(2);
                    items_list[i].MRP =  items_list[i].specialReduction  ? (items_list[i].price  - ( items_list[i].specialReduction / 100 * items_list[i].price)).toFixed(2) : items_list[i].price;
                    // items_list[i].MRP = items_list[i].MRP  - ( items_list[i].special / 100 * items_list[i].MRP  )
                    // console.log("NetPrice,special123",items_list[i].NetPrice, items_list[i].NetPrice ,items_list[i].special)
                    if($scope.priceListName){
                        for(var k = 0;k < $scope.priceListName.length;k++ ){
                            if($scope.priceListName[k] != 'master'){
                                if ( typeof items_list[i][$scope.priceListName[k]] !== 'undefined' &&  items_list[i][$scope.priceListName[k]] != null) {
                                    if( typeof items_list[i][$scope.priceListName[k]] == "string"){
                                        items_list[i].customPricelist.push({
                                            itemCode: items_list[i].itemCode,
                                            name: $scope.priceListName[k],
                                            price: null,
                                            status: false
                                        })
                                    }
                                    else{
                                        items_list[i].customPricelist.push({
                                            itemCode: items_list[i].itemCode,
                                            name: $scope.priceListName[k],
                                            price: items_list[i][$scope.priceListName[k]],
                                            status: true
                                        })
                                    }
                                }
                                else{
                                    items_list[i].customPricelist.push({
                                        itemCode: items_list[i].itemCode,
                                        name: $scope.priceListName[k],
                                        price: null,
                                        status: false
                                    })
                                }
                            }
                        }
                    }
                    $scope.items.push(items_list[i]);
                    if(items_list[i].subCategory){
                        obj.push(items_list[i]);
                    }
                }
                $scope.itemsInModal = $scope.items.slice();
                $scope.renderItemsMrp();
            }
            if (type == 'Manufacturer') {
                $scope.itemSubCategories = [];
                $scope.itemSubCategories = obj.unique('subCategory');
                // console.log($scope.itemSubCategories)
                $scope.itemSubCategories.map(function (item) {
                    // console.log( item.subCategory)
                    if ($scope.itemSelectAll.category) {
                        item.selected_subCategory = true;
                    } else {
                        item.selected_subCategory = true;
                    }
                    return item;
                })
            }
            if (type == 'subCategory') {
                $scope.itemSubSubCategories = [];
                $scope.itemSubSubCategories = obj.unique('subSubCategory');
                if ($scope.itemSubSubCategories && $scope.itemSubSubCategories.length) {
                    for (var i = 0; i < $scope.itemSubSubCategories.length; i++) {
                        if ((!$scope.itemSubSubCategories[i].subSubCategory) || $scope.itemSubSubCategories[i].subSubCategory == '') {
                            $scope.itemSubSubCategories.splice(i, 1);
                        }
                    }
                }
                $scope.itemSubSubCategories.map(function (item) {
                    // console.log( item.subSubCategory)
                    if ($scope.itemSelectAll.subCategory) {
                        item.selected_subSubCategory = true;
                    } else {
                        item.selected_subSubCategory = true;
                    }
                    return item;
                })
            }
            // $scope.itemSelectAll.subCategory = true;
            console.log("remove logs", $scope.items)
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
                    var button = {};
                    button.cancel = "No";
                    button.confirm = "OK";
                    button.cancel_class = "btn btn-covid-close";
                    button.confirm_class = "btn btn-covid-success";
                    $http.post("/dash/items",itemSearchObj).then(function successCallback(response) {
                        $scope.renderItems(response.data);
                    }, function errorCallback(response) {
                        if(response.status === 403){
                            //Settings.alertPopup("Alert","Your session has timed out, please login again")
                            Settings.loginRedirectPopup(
                                "ALERT",
                                "Your session has timed out, please login again",
                                button
                                , function (result) {
                                    if (result) {
                                        $window.location.href = '/login'
                                    }
                                })
                        }
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
                //clear Dealers
                case 4:
                    dealerSearchObj.viewLength = 0;
                    dealerSearchObj.viewBy = initialViewBy;
                    dealerSearchObj.searchFor = '';
                    dealerSearchObj.seller = '';
                    dealerSearchObj.stockist = '';
                    dealerSearchObj.class = '';
                    dealerSearchObj.searchBy = [];
                    dealerSearchObj.searchByArea = [];
                    dealerSearchObj.searchRegion = [];
                    dealerSearchObj.customerType = '';
                    // if($scope.customerType=='lead'){
                    //     dealerSearchObj.searchBycustomertype='Lead';
                    //
                    // }
                    // else{
                    //     dealerSearchObj.searchBycustomertype='';
                    //
                    // }
                    $scope.viewLength = 0;
                    $scope.newViewBy = viewBy.dealer;
                    $scope.dealerSearch.filter = '';
                    $scope.serviceClients = [];
                    $scope.cityText.filter = '';
                    $scope.filter.sales = "All";
                    $scope.filter.branch = "All";
                    $scope.filter.class = "All";
                    $scope.filter.customerType = "All";
                    $scope.dealer.selected_city = '';
                    $scope.dealer.selected_area = '';
                    $scope.showStoreFilter = false;
                    $scope.showListDealerDetail = false;
                    $scope.dealerSelectAll.city = true;
                    $scope.storeMarkershowMap = true;
                    $http.post("/dash/stores", dealerSearchObj)
                        .success(function(response){
                            $scope.multipleUsers(response);
                            // $scope.renderStoreMap(response);
                            $scope.displayDealerRefresh=  true
                        })
                    $http.post("/dash/stores/count", dealerSearchObj)
                        .success(function(res){
                            $scope.transactionCount(res,4);
                            $scope.displayDealerRefresh=  true
                        });
                    $scope.getAllStoreCities(true,'city');
                    $scope.getAllStoreAreas(true,'area');
                    break;
            }
        }
        //Change in stores changes billing address and so does the shipping address
        //But if shipping address of order is different from billing address and is been edited by the user
        //it should be prompted to the user if he wants to retain his new edited shipping address,
        //or set to new billing address
        $scope.updateBillingAddress = function(newStoreUpdated){
            var tempOldBillingAddress = $scope.data.newOrderBilling_address;
            //Display the Billing address - Store address is the billing address
            $scope.data.newOrderBilling_address =  newStoreUpdated.Address;
            if(	tempOldBillingAddress !== $scope.data.newOrderShipping_address
                &&	$scope.data.newOrderShipping_address != ""
                && 	typeof $scope.data.newOrderShipping_address != "undefined" )
            {
                var confirmChange =
                    confirm("You have edited shipping address different from billing address.\n" +
                        "Want to retain it ? Now you have changed Store ") ;
                if(confirmChange) return;
            }
            //Ask for shipping address - Its better to take it from html than prompt may be
            $scope.data.newOrderShipping_address  = $scope.data.newOrderBilling_address;
        };
        //Store filter function
        $scope.storeSearchFilter = function(){
            $scope.showListDealerDetail = false;
            dealerSearchObj.viewLength = 0;
            dealerSearchObj.viewBy = initialViewBy;
            $scope.viewLength = 0;
            $scope.newViewBy = localViewBy;
            if($scope.dealerSearch.filter){
                dealerSearchObj.searchFor = $scope.dealerSearch.filter;
                dealerSearchObj.searchBy = dealerSearchBy;
            }
            dealerSearchObj.stockist = {};
            if($scope.filter.branch != 'All'){
                dealerSearchObj.stockist = $scope.filter.branch;
            }
            else {
                dealerSearchObj.stockist = '';
            }
            if($scope.filter.sales != 'All'){
                dealerSearchObj.seller = $scope.filter.sales;
            }
            else{
                dealerSearchObj.seller = '';
            }
            if($scope.filter.class != 'All'){
                dealerSearchObj.class = $scope.filter.class;
            }
            else{
                dealerSearchObj.class = '';
            }
            if($scope.filter.customerType !='All'){
                dealerSearchObj.customerType = $scope.filter.customerType;
            }
            else{
                dealerSearchObj.customerType = '';
            }
            $scope.serviceClients = [];
            if($scope.dealerSelectAll.city){
                $http.post('/dash/stores', dealerSearchObj)
                    .success(function(res){
                        $scope.multipleUsers(res)
                    });
                $http.post("/dash/stores/count", dealerSearchObj)
                    .success(function(res){
                        $scope.transactionCount(res,4);
                    });
            }
            $scope.showStoreFilter = true;
            if($scope.dealerSearch.filter == '' && $scope.filter.branch == 'All' && $scope.filter.sales == 'All' && $scope.filter.class == 'All'&& $scope.filter.customerType == 'All')
                $scope.showStoreFilter = false;
        };
        //Function to see if order already exists in the list.
        const doesItemExistsInCart = function (objectList, key, object) {
            for (var i = 0; i < objectList.length; i++) {
                if (objectList[i].itemDetails[key] === object[key]) {
                    return i;
                }
            }
            return -1;
        }//End of function
        //Function to see if order already exists in the list.
        const doesItemExistsInArray = (objectList, key, object) => {
            for (var i = 0; i < objectList.length; i++) {
                if (objectList[i][key] === object[key]) {
                    return i;
                }
            }
            return -1;
        }//End of function
        $scope.getRewardPoints = function(flag){
            if(flag){
                for(var i=0; i<$scope.orders.length; i++) {
                    for (var j = 0; j < $scope.serviceClients.length; j++) {
                        if (!$scope.serviceClients[j].Revenue)
                            $scope.serviceClients[j].Revenue = 0;
                        if ((Number($scope.orders[i].dealerphone[0])) == $scope.serviceClients[j].Phone) {
                            $scope.serviceClients[j].Revenue += (Number($scope.orders[i].total_amount[0]) / 100);
                        }
                    }
                }
            }
        }
        $scope.multipleUsers = function(response, type){
            var obj = [];
            if($scope.filter.branch == 'All')
                $scope.allStockistFromDealer = [];
            allStockist = [];
            // check for seller name by searching it in number
            for(var i = 0; i < response.length; i++){
                response[i].multipleSeller = false;
                response[i].multipleStockist = false;
                if((typeof(response[i].Seller) == 'string' || typeof(response[i].Seller == 'number')) && !angular.isObject(response[i].Seller)){
                    response[i].SellerName = $scope.getSellerName(response[i].Seller) ?  $scope.getSellerName(response[i].Seller) : response[i].SellerName;
                }
                else if(angular.isObject(response[i].Seller)){
                    response[i].SellerName = '';
                    response[i].multipleSeller = true;
                    for(var j=0; j< response[i].Seller.length; j++){
                        if(j < response[i].Seller.length - 1)
                            response[i].SellerName += $scope.getSellerName(response[i].Seller[j])+", ";
                        else
                            response[i].SellerName += $scope.getSellerName(response[i].Seller[j]);
                    }
                }
                if(typeof(response[i].Stockist) == 'string' || typeof(response[i].Stockist) == 'number'){
                }
                else if(response[i].Stockist){
                    response[i].multipleStockist = true;
                }
                $scope.serviceClients.push(response[i]);
                if(response[i].Area){
                    obj.push(response[i]);
                }
            }
            if(type == 'City'){
                $scope.dealer_area = [];
                $scope.dealer_area = obj.unique('Area');
                $scope.dealer_area.map(function (dealer) {
                    if($scope.dealerSelectAll.city){
                        dealer.selected_area = true;
                    }else{
                        dealer.selected_area = true
                    }
                    return dealer;
                })
            }
            $scope.serviceClients = $filter('orderBy')( $scope.serviceClients, 'DealerName');
            if($scope.filter.branch == 'All'){
                $http.get("/dash/stores/stockist").success(function(response){
                    allStockist = response || [];
                    $scope.allStockistFromDealer = allStockist.unique('_id');
                    for(var i = 0; i < response.length; i++)
                        $scope.sellerNames[response[i].Stockist[0]] = response[i]._id;
                })
            }
        }
        /*....
            Refresh Names
        ..*/
        $scope.refreshSellerNames = function(){
            if(typeof $scope.roleSalesrep == 'object'){
                for(var j=0;j<$scope.roleSalesrep.length;j++){
                    if($scope.roleSalesrep[j].userStatus == 'Active' || $scope.roleSalesrep[j].role != '')
                        $scope.sellerNames[$scope.roleSalesrep[j].sellerphone] = $scope.roleSalesrep[j].sellername;
                }
            }
        }
        /*....
            Get All User Names
        ..*/
        $scope.getSellerName = function(sellerNo, tag){
            /*---DynamicProgramming---*/
            /*---objects doesnt have length ---*/
            if(sellerNo){
                if(Object.keys($scope.sellerNames).length == 0){
                    $scope.refreshSellerNames();
                    if(tag == 'goals' || $scope.applicationType == 'Atmosphere') $scope.refreshGoalSellerNames()
                }
                if($scope.sellerNames[sellerNo]){
                    return $scope.sellerNames[sellerNo]
                }else if($scope.fulfillerNames[sellerNo]!=undefined){
                    return $scope.fulfillerNames[sellerNo];
                }
            }else return sellerNo;
        };
        /*....
            Get All Stores by Cities
        ..*/
        $scope.getAllStoreCities = function(param,type){
            $http.post("/dash/stores/filter/"+type, {viewBy : 0})
                .success(function(city){
                    $scope.dealer_city = city;
                    $scope.dealer_city.map(function (dealer) {
                        if($scope.dealerSelectAll.city){
                            dealer.selected_city = param;
                        }else{
                            dealer.dealer_city = true;
                        }
                        return dealer;
                    })
                })
        }
        /*....
            Get All Stores by Areas
        ..*/
        $scope.getAllStoreAreas = function(param,type){
            $http.post("/dash/stores/filter/"+type, {viewBy : 0})
                .success(function(area){
                    $scope.dealer_area = area;
                    $scope.dealer_area.map(function (dealer) {
                        if($scope.dealerSelectAll.city){
                            dealer.selected_area = true;
                        }else{
                            dealer.dealer_area = true
                            $scope.dealer_area= [];
                        }
                        return dealer;
                    })
                })
        }
        //Function to take care of things when a store is selected for the new order
        $scope.StoreSelectedFromTypeahead = function(item){
            $scope.a = {};
            jQuery.noConflict();
            $(".dealerDropdown").css("display", "none");
            $scope.searchDealerBox = item.DealerName;
            //If seller number is valid - access sellers array   and access seller information
            //else display all the salesperson
            if($scope.a.selectedSalesPerson!= ""){
                $scope.a.selectedSalesPerson = "";
                $scope.data.newOrderSalesPerson = {};
                $scope.disableSalesPersonSelection = true;
            }
            $scope.dealerSelected.flag = true;
            $scope.a.selectedStores = item;
            $scope.data.newOrderStore = item;
            $scope.data.tempCity = item.City || '';
            $scope.data.tempState = item.State || '';
            if(item.Country)
                $scope.data.tempCountry = item.Country;
            $scope.orderPriceList = "";
            // searching  orderPriceList value based on dealer class
            if($scope.data.newOrderStore.class && $scope.dealerClasses){
                for(var i=0;i<$scope.dealerClasses.length;i++){
                    if($scope.dealerClasses[i].name == $scope.data.newOrderStore.class){
                        $scope.orderPriceList = $scope.dealerClasses[i].priceList;
                    }
                }
            }
            $scope.clearFilterButton('',3);
            $scope.clearFilter(2);
            var sellerSearchObj = {};
            sellerSearchObj.viewLength = 0;
            sellerSearchObj.viewBy = initialUserViewBy;
            sellerSearchObj.searchFor = '';
            sellerSearchObj.statusFilter = 'allUsers';
            sellerSearchObj.searchBy = [];
            sellerSearchObj.userLoginDetails = $scope.user ;
            $scope.showDealerDetails = true;
            $http.post("/dash/users/list", sellerSearchObj)
                .then((res) => {
                $scope.sellers = res.data;
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
            if($scope.data.newOrderStore.StockistState && $scope.data.newOrderStore.State){
                if($scope.data.newOrderStore.StockistState != $scope.data.newOrderStore.State)
                    $scope.calculateIGST = true;
                else
                    $scope.calculateIGST = false;
            }else $scope.calculateIGST = false;
            $http.get("/dash/address-list/" + $scope.data.newOrderStore.Dealercode)
                .then((response) => {
                $scope.shipping_addresses = response.data;
        })
            $scope.updateBillingAddress($scope.data.newOrderStore);
            $scope.viewLength = 0;
            $scope.newViewBy = viewBy.items;
            if(Object.keys($scope.data.newOrderStore).length){
                var date = new Date(), y = date.getFullYear(), m = date.getMonth();
                $scope.dealerReportFilter.startDate = date;
                $scope.dealerReportFilter.startDate = new Date(y, m, 1);
                $scope.dealerReportFilter.endDate = new Date(y, m + 1, 0);
                topCustomerSearchObj.viewLength = 0;
                if($scope.newViewBy > initialViewBy ){
                    topCustomerSearchObj.viewBy = $scope.newViewBy;
                }else{
                    topCustomerSearchObj.viewBy = initialViewBy;
                }
                topCustomerSearchObj.sDate = '';
                topCustomerSearchObj.eDate = '';
                topCustomerSearchObj.searchFor = '';
                topCustomerSearchObj.searchBy = topDealerSearchBy;
                topCustomerSearchObj.dealercode = item.Dealercode ;
                $scope.viewLength = 0;
                $scope.newViewBy = parseInt(localViewBy);
                $scope.orderTotalPrice = 0;
                $scope.dealerOrderTotalPrice = 0;
                $http.post("/dash/reports/dealers", topCustomerSearchObj)
                    .success(function(response){
                        if(response.length){
                            for(var i = 0; i < response.length; i++){
                                $scope.orderTotalPrice =  $scope.orderTotalPrice + response[i].creditDealerTotal;
                                $scope.dealerOrderTotalPrice = $scope.orderTotalPrice;
                            }
                        }else{
                            $scope.orderTotalPrice = 0;
                            $scope.dealerOrderTotalPrice = 0;
                        }
                    })
            }
        }//End of function to take care of things when store is selected for new order
        //Apply item search Filter
        $scope.itemSearchFilter = function(){
            if($scope.itemSearch.filter == ''){
                $scope.clearFilterBy();
                Settings.warning_toast('Alert',"Please type text in search box")
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
        $scope.addItemQuantity = function(item,itemQuantity,comment,invqty) {
            var itemQty = itemQuantity || 0;
            for(var i=0;i<$scope.newOrderItemList.length;i++){
                if(item._id == $scope.newOrderItemList[i].itemDetails._id){
                    $scope.newOrderItemList[i].itemQuantity = Number(itemQty.toFixed(3));
                    $scope.changeInQuantity($scope.CTTOC, $scope.newOrderItemList[i], $scope.newOrderItemList[i].itemQuantity, 0,0,invqty);
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
        /*..............................................................................................
                      ......      Cart Calculations ......
         .............................................................................................*/
        $scope.changeOrderView = function(tab){
            // console.log(tab);
            var temp = 0;
            $scope.orderTotalPrice = $scope.dealerOrderTotalPrice;
            for(let i = 0; i < $scope.newOrderItemList.length; i++){
                temp = $scope.newOrderItemList[i].quantity * $scope.newOrderItemList[i].orderMRP;
                $scope.orderTotalPrice =  $scope.orderTotalPrice + temp;
                if($scope.newOrderItemList[i].itemDetails.looseQty){
                    if($scope.newOrderItemList[i].quantity <= 0 || !$scope.newOrderItemList[i].quantity){
                        Settings.alertPopup("Alert","Please Enter a Valid  Quantity for "+$scope.newOrderItemList[i].itemDetails.Product);
                        return;
                    }
                }else{
                    if($scope.newOrderItemList[i].quantity <= 0 || !$scope.newOrderItemList[i].quantity || ((typeof $scope.newOrderItemList[i].quantity === 'number') && ($scope.newOrderItemList[i].quantity % 1 != 0))){
                        if($scope.coID == 'GLGR')
                            Settings.alertPopup("Alert", "Please Add Phone Number For Packages Selected!");
                        else
                            Settings.alertPopup("Alert", "Please Enter a Valid  Quantity for "+$scope.newOrderItemList[i].itemDetails.Product);
                        return;
                    }
                }
            }
            if(tab == 1 && $scope.newOrderItemList.length){
                $scope.renderItemsMrp();
                if($scope.data.newOrderStore.customerVariant == 'bulk'){
                    if($scope.taxExclusive){
                        for(let i = 0; i < $scope.newOrderItemList.length; i++){
                            if($scope.newOrderItemList[i].itemDetails.BulkPrice){
                                if($scope.newOrderItemList[i].CGST || $scope.newOrderItemList[i].SGST || $scope.newOrderItemList[i].IGST){
                                    $scope.newOrderItemList[i].taxableValue =  $scope.newOrderItemList[i].itemDetails.BulkPrice * $scope.newOrderItemList[i].quantity;
                                    $scope.newOrderItemList[i].BulkPrice = calculateTax($scope.newOrderItemList[i].itemDetails.BulkPrice, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST);
                                }
                            }else{
                                if($scope.newOrderItemList[i].CGST || $scope.newOrderItemList[i].SGST || $scope.newOrderItemList[i].IGST){
                                    $scope.newOrderItemList[i].taxableValue =  $scope.newOrderItemList[i].itemDetails.orderMRP * $scope.newOrderItemList[i].quantity;
                                    $scope.newOrderItemList[i].orderMRP = calculateTax($scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST);
                                }
                            }
                        }
                    }
                }else{
                    if($scope.taxExclusive){
                        for(let i = 0; i< $scope.newOrderItemList.length; i++){
                            if($scope.newOrderItemList[i].CGST || $scope.newOrderItemList[i].SGST || $scope.newOrderItemList[i].IGST){
                                $scope.newOrderItemList[i].taxableValue =  $scope.newOrderItemList[i].itemDetails.orderMRP * $scope.newOrderItemList[i].quantity;
                                $scope.newOrderItemList[i].orderMRP = calculateTax($scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST);
                            }
                        }
                    }
                }
            }
            if(tab == 0){
                $scope.orderViewTab.tab = tab;
                $scope.displayBGWhite = true;
                $scope.viewLength = 0;
                $scope.newViewBy = viewBy.dealer;
            }
            if($scope.data.newOrderfreight >= 10000){
                $scope.data.newOrderfreight = 0;
            }
            if($scope.a.selectedStores.DealerName){
                if(!$scope.showDealerDetails){
                    $scope.orderViewTab.tab = tab;
                }
                else
                    $scope.orderViewTab.tab = tab;
            }
            else{
                if(tab != 0){
                    Settings.info_toast( "ERROR", "Please select a "+$scope.nav[2].tab);
                }
            }
        }
        ///...... Changing the price while order... Edit Price.....
        $scope.changeMrp = function(item, index) {
            if(item.itemDetails) {
                if (!item.itemDetails.orderMRP) {
                    Settings.alertPopup("Error", "Please Enter a Valid Order Price");
                    $scope.newOrderItemList[index].itemDetails.orderMRP = 0;
                    return;
                }
                let discount = 0;
                $scope.newOrderItemList[index].orderTotal = $scope.newOrderItemList[index].quantity * $scope.newOrderItemList[index].itemDetails.orderMRP;
                $scope.newOrderItemList[index].MRP = $scope.newOrderItemList[index].itemDetails.MRP;
                $scope.newOrderItemList[index].orderMRP = $scope.newOrderItemList[index].itemDetails.orderMRP;
                //.... If Dealerprice is included, then it takes precedence .....
                if($scope.newOrderItemList[index].itemDetails.DealerPrice){
                    $scope.newOrderItemList[index].total = $scope.newOrderItemList[index].quantity * $scope.newOrderItemList[index].itemDetails.DealerPrice;
                    //... Calculate discount
                    discount = discountCalculation($scope.newOrderItemList[index].itemDetails.DealerPrice, $scope.newOrderItemList[index].orderMRP);
                    if (discount > 0)
                        $scope.newOrderItemList[index].Specials = discount.toFixed(2);
                    else
                        $scope.newOrderItemList[index].Specials = 0;
                }else{
                    $scope.newOrderItemList[index].total = $scope.newOrderItemList[index].quantity * $scope.newOrderItemList[index].itemDetails.MRP;
                    //... Calculate discount
                    discount = discountCalculation($scope.newOrderItemList[index].MRP, $scope.newOrderItemList[index].orderMRP);
                    if (discount > 0)
                        $scope.newOrderItemList[index].Specials = discount.toFixed(2);
                    else
                        $scope.newOrderItemList[index].Specials = 0;
                }
                //.... If tax is exclusive, then we add tax to the line / order total....
                let otherTaxesValue = 0;
                console.log("MRP : Tax Exclusivity --> ", $scope.taxExclusive);
                if(!$scope.taxExclusive) {
                    //.... India Tax calculation .....
                    if($scope.taxSetups.otherSetup != 'other'){
                        $scope.newOrderItemList[index].taxableValue = calculateTaxableValue($scope.newOrderItemList[index].quantity, $scope.newOrderItemList[index].orderMRP, $scope.newOrderItemList[index].CGST, $scope.newOrderItemList[index].SGST, $scope.newOrderItemList[index].IGST);
                        //.... Ghana Tax....
                    }else if($scope.taxSetups.otherSetup == 'other'){
                        for(let i = 0; i < $scope.newOrderItemList[index].otherTaxes.length; i++){
                            otherTaxesValue += $scope.newOrderItemList[index].otherTaxes[i].value;
                        }
                        $scope.newOrderItemList[index].taxableValue =
                            (($scope.newOrderItemList[index].quantity * $scope.newOrderItemList[index].orderMRP) /
                                (100 + otherTaxesValue)) * 100;
                    }
                }else{
                    $scope.newOrderItemList[index].taxableValue =  $scope.newOrderItemList[index].itemDetails.orderMRP * $scope.newOrderItemList[index].quantity;
                    if($scope.taxSetups.otherSetup != 'other'){
                        $scope.newOrderItemList[index].orderMRP = calculateTax($scope.newOrderItemList[index].itemDetails.orderMRP,  $scope.newOrderItemList[index].CGST, $scope.newOrderItemList[index].SGST, $scope.newOrderItemList[index].IGST);
                    }else if($scope.taxSetups.otherSetup == 'other'){
                        otherTaxesValue = 0;
                        for(let i = 0; i < $scope.newOrderItemList[index].otherTaxes.length; i++){
                            otherTaxesValue += ($scope.newOrderItemList[index].otherTaxes[i].value * $scope.newOrderItemList[index].itemDetails.orderMRP)/100;
                        }
                        $scope.newOrderItemList[index].orderMRP = ( $scope.newOrderItemList[index].itemDetails.orderMRP) + otherTaxesValue;
                    }
                }
            }
        };
        $scope.changeInQuantity = function(direction, item, itemQuantity,flag,neworderflag,invQty){
            console.log('changeInQuantity',itemQuantity,direction)
            if(itemQuantity)
                itemQuantity = Number(itemQuantity.toFixed(3));
            switch(direction){
                case $scope.CTOCT :
                    //Check if the item is already in the order
                    var itemIndex = doesItemExistsInCart($scope.newOrderItemList, "itemCode", item);
                    if( $scope.newOrderItemList.length != 0 && itemIndex >= 0 && ( itemQuantity <= 0  ) )
                        Settings.alertPopup( "Alert","ZERO quantity not accepted. Press delete icon to delete item");
                    if( itemIndex >= 0 ){
                        if( itemQuantity > 0 )
                            $scope.newOrderItemList[itemIndex].quantity = Math.round(itemQuantity);
                        else
                            item.itemQuantity = Math.round($scope.newOrderItemList[itemIndex].quantity);
                    }
                    break;
                case $scope.CTTOC :
                    //Check if the item is already in the order
                    var itemIndex = doesItemExistsInArray($scope.itemsInModal, "itemCode", item.itemDetails);
                    if(itemQuantity > invQty && item.itemDetails.trackInventory){
                        Settings.alertPopup( "Alert","Quantity should be lesser than inventory quantity");
                        item.quantity='';
                        item.itemQuantity = '';
                        $scope.renderItemsMrp();
                        break;
                    }
                    if(itemQuantity > invQty && item.itemDetails.trackInventory){
                        Settings.alertPopup( "Alert","Quantity should be lesser than inventory quantity");
                        item.quantity='';
                        item.itemQuantity = '';
                        $scope.renderItemsMrp();
                        break;
                    }
                    if( $scope.newOrderItemList.length != 0 && (!itemQuantity && itemQuantity < 0 ) ){
                        Settings.alertPopup( "Alert", "ZERO quantity not accepted. Press delete icon to delete item");
                    }
                    if( itemIndex >= 0 ){
                        $scope.itemsInModal[itemIndex].itemQuantity = itemQuantity;
                        item.itemQuantity = $scope.itemsInModal[itemIndex].itemQuantity;
                        item.quantity = $scope.itemsInModal[itemIndex].itemQuantity* $scope.stepQuantity ;
                        console.log("QTY : Tax Exclusivity --> ", $scope.taxExclusive);
                        if($scope.taxExclusive){
                            for(var i=0; i< $scope.newOrderItemList.length; i++){
                                //.... If it's a Bulk order customer.....
                                if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice){
                                    //.... Taxable is simple.... Price X Qty...
                                    $scope.newOrderItemList[i].taxableValue =  $scope.newOrderItemList[i].itemDetails.BulkPrice * $scope.newOrderItemList[i].quantity;
                                    //..... Tax setup is India....
                                    if($scope.taxSetups.otherSetup != 'other'){
                                        $scope.newOrderItemList[i].BulkPrice = calculateTax($scope.newOrderItemList[i].itemDetails.BulkPrice, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST);
                                        //..... Tax is Ghana....
                                    }else if($scope.taxSetups.otherSetup == 'other' && $scope.newOrderItemList[i].otherTaxes){
                                        let otherTaxesValue = 0;
                                        for(let j = 0; i < $scope.newOrderItemList[i].otherTaxes.length; j++){
                                            if(itemIndex == j){
                                                otherTaxesValue += (($scope.newOrderItemList[i].otherTaxes[j].value * $scope.newOrderItemList[i].itemDetails.BulkPrice)/100)
                                            }
                                        }
                                        $scope.newOrderItemList[i].BulkPrice = $scope.newOrderItemList[i].itemDetails.BulkPrice + otherTaxesValue;
                                    }
                                }else{
                                    if($scope.taxSetups.otherSetup != 'other') {
                                        $scope.newOrderItemList[i].taxableValue =  $scope.newOrderItemList[i].itemDetails.orderMRP * $scope.newOrderItemList[i].quantity;
                                        $scope.newOrderItemList[i].orderMRP = calculateTax($scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST , $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST);
                                    }else if($scope.taxSetups.otherSetup == 'other' && $scope.newOrderItemList[i].otherTaxes){
                                        let otherTaxesValue = 0;
                                        $scope.newOrderItemList[i].taxableValue = $scope.newOrderItemList[i].itemDetails.orderMRP * $scope.newOrderItemList[i].quantity;
                                        for(let j = 0; j < $scope.newOrderItemList[i].otherTaxes.length; j++){
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
                                        $scope.newOrderItemList[i].taxableValue = calculateTaxableValue($scope.newOrderItemList[i].quantity, $scope.newOrderItemList[i].itemDetails.orderMRP, $scope.newOrderItemList[i].CGST, $scope.newOrderItemList[i].SGST, $scope.newOrderItemList[i].IGST)
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
        $scope.addItemToOrder = function( item, itemQuantity, lineComment,flag,invtQty){
            $scope.selectedOrder = true;
            console.log("$scope.tempCountryName",$scope.tempCountryName)
            switch($scope.tempCountryName){
                case 'india': {
                    $scope.addItemToOrderIndia(item, itemQuantity || 1, lineComment,flag,invtQty);
                    break;
                }
                case 'ghana': {
                    $scope.addItemToOrderGhana(item, itemQuantity, lineComment,flag,invtQty);
                    break;
                }
                default:
                    $scope.addItemToOrderIndia(item, itemQuantity || 1, lineComment,flag,invtQty);
                    console.log("Default Tax, India chosen --->" );
                    break;
            }
        }//End of addItemToOrder
        //Adding item based on india country
        $scope.addItemToOrderIndia = function( item, itemQuantity, lineComment,flag,invtQty){
            if(itemQuantity){
                item.itemQuantity = itemQuantity;
            }else{
                itemQuantity = 1;
                item.itemQuantity = 1;
            }
            $scope.newOrderItem.itemDetails = angular.copy(item);
            console.log("  $scope.newOrderItem.itemDetails ",  $scope.newOrderItem.itemDetails )
            $scope.CheckGstByState($scope.newOrderItem, item);
            if($scope.taxSetups.otherSetup != 'other'){
                //.... Left Empty for India setups....
                ///.... Will be configured some day....
            }else if($scope.taxSetups.otherSetup == 'other'){
                if(!item.otherTaxes || (item.otherTaxes && !item.otherTaxes.length) ){
                    $scope.newOrderItem.otherTaxes = [];
                    if($scope.otherTaxDefault && $scope.otherTaxDefault.taxs && $scope.otherTaxDefault.taxs.length){
                        for(let i = 0; i < $scope.otherTaxDefault.taxs.length; i++){
                            $scope.newOrderItem.otherTaxes.push($scope.otherTaxDefault.taxs[i]);
                        }
                        item.otherTaxes = $scope.newOrderItem.otherTaxes;
                    }
                }else if(item.otherTaxes){
                    $scope.newOrderItem.otherTaxes = [];
                    if(item.otherTaxes && item.otherTaxes.length){
                        for(let i = 0; i< item.otherTaxes.length; i++){
                            $scope.newOrderItem.otherTaxes.push(item.otherTaxes[i]);
                        }
                    }
                }
            }
            //.... If the item is marked as loose quantity....
            if($scope.newOrderItem.itemDetails.looseQty){
                //.... If we need to track inventory for this item....
                if($scope.newOrderItem.itemDetails.trackInventory){
                    //..... We check if quantity available in inventory.....
                    if(invtQty >= 0 && invtQty <= 1){
                        $scope.newOrderItem.quantity = (invtQty) * $scope.stepQuantity;
                    }else{
                        $scope.newOrderItem.quantity = itemQuantity * $scope.stepQuantity;
                    }
                }else{
                    $scope.newOrderItem.quantity = itemQuantity * $scope.stepQuantity;
                }
            }else{
                $scope.newOrderItem.quantity = Math.round(itemQuantity) * $scope.stepQuantity;
            }
            //.... If quantity requested is more than inventory quantity, and tracking is enabled....
            if($scope.newOrderItem.quantity > invtQty && $scope.newOrderItem.itemDetails.trackInventory){
                Settings.alertPopup("Alert", "Quantity should be lesser than inventory quantity for "+$scope.newOrderItem.itemDetails.Product);
                return;
            }
            console.log('Quantity Requested Approved --> ', $scope.newOrderItem.quantity);
            //..... We assign the quantity.....
            item.itemQuantity =  $scope.newOrderItem.quantity;
            //.... If quantity was not entered, then alert is displayed....
            if(!item.itemQuantity){
                Settings.alertPopup("Alert", "Please Enter a Valid Quantity");
                return;
            }
            //Validate Fields of an item
            if(!$scope.newOrderItem.itemDetails.Product) {
                //throw up modal for reConfirmation of  submission of order
                Settings.alertPopup( "Alert", "Item Not Selected");
                return;
            }
            //..... Check if item already exists in cart....
            if(doesItemExistsInCart($scope.newOrderItemList, "itemCode", $scope.newOrderItem.itemDetails) >= 0){
                Settings.alertPopup("Alert", "Item already exists in the order, please check");
                return;
            }
            //Price of Order
            $scope.newOrderItem.total = $scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.MRP;
            $scope.newOrderItem.orderTotal = $scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.orderMRP;
            $scope.newOrderItem.MRP = $scope.newOrderItem.itemDetails.MRP;
            $scope.newOrderItem.orderMRP = $scope.newOrderItem.itemDetails.orderMRP;
            //.... If inventory available...
            if(invtQty) $scope.newOrderItem.totalInventory = invtQty;
            if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItem.itemDetails.BulkPrice){
                $scope.newOrderItem.Specials = 0;
                //... If GST details available....
                if(item.gst){
                    if(!$scope.taxExclusive){
                        $scope.newOrderItem.taxableValue = calculateTaxableValue($scope.newOrderItem.quantity, $scope.newOrderItem.itemDetails.BulkPrice, $scope.newOrderItem.CGST, $scope.newOrderItem.SGST, $scope.newOrderItem.IGST);
                        $scope.newOrderItem.BulkPrice = $scope.newOrderItem.itemDetails.BulkPrice;
                    }else{
                        $scope.newOrderItem.taxableValue = $scope.newOrderItem.itemDetails.BulkPrice * $scope.newOrderItem.quantity;
                        $scope.newOrderItem.BulkPrice = calculateTax($scope.newOrderItem.itemDetails.BulkPrice, $scope.newOrderItem.CGST, $scope.newOrderItem.SGST, $scope.newOrderItem.IGST);
                    }
                }else{
                    if($scope.taxSetups.otherSetup != 'other'){
                        $scope.newOrderItem.taxableValue = calculateTaxableValue($scope.newOrderItem.quantity, $scope.newOrderItem.itemDetails.BulkPrice, $scope.newOrderItem.CGST, $scope.newOrderItem.SGST, $scope.newOrderItem.IGST);
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
                        $scope.newOrderItem.taxableValue = calculateTaxableValue($scope.newOrderItem.quantity, $scope.newOrderItem.orderMRP, $scope.newOrderItem.CGST, $scope.newOrderItem.SGST, $scope.newOrderItem.IGST);
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
            if(!flag){
                var indexInCatalogue = doesItemExistsInArray($scope.items, "itemCode", $scope.newOrderItem.itemDetails);
                $scope.itemsInModal[indexInCatalogue].added = $scope.newOrderItemList.length - 1 ;
            }
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
        $scope.addItemToOrderGhana = function ( item, itemQuantity, lineComment,flag,invtQty){
            if(itemQuantity){
                item.itemQuantity = itemQuantity;
            }else{
                itemQuantity = 1;
                item.itemQuantity = 1;
            }
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
                        $scope.newOrderItem.CGST = item.gst.cgst ? item.gst.cgst  : 0;
                        $scope.newOrderItem.SGST = item.gst.sgst ? item.gst.sgst  : 0;
                        $scope.newOrderItem.IGST = item.gst.igst ? item.gst.igst : 0;
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
                Settings.alertPopup("Alert",  "Quantity should be lesser than inventory quantity for "+$scope.newOrderItem.itemDetails.Product);
                return;
            }
            item.itemQuantity =  $scope.newOrderItem.quantity;
            if(!item.itemQuantity){
                Settings.alertPopup("Alert","Please Enter a Valid Quantity");
                return;
            }
            //Validate Fields of an item
            if(	   $scope.newOrderItem.itemDetails.Product == ""
                || typeof $scope.newOrderItem.itemDetails.Product == "undefined")
            {
                //throw up modal for reConfirmation of  submission of order
                Settings.alertPopup( "Alert",  "Item Not Selected");
                return;
            }
            //Check if the item is already in the order
            if(doesItemExistsInCart($scope.newOrderItemList, "itemCode", $scope.newOrderItem.itemDetails) >= 0){
                Settings.alertPopup("Alert", "Item already exists in the order, please check");
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
                $scope.newOrderItem.Specials = 0;
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
            if(!flag){
                var indexInCatalogue = doesItemExistsInArray($scope.items, "itemCode", $scope.newOrderItem.itemDetails);
                $scope.itemsInModal[indexInCatalogue].added        = $scope.newOrderItemList.length - 1 ;
            }
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
        $scope.addRechargeSubscription = function(amount) {
            if(amount<50){
                Settings.alertPopup("Alert", "Recharge of minimum " +$scope.currency+"50 required");
            }
            else{
                var obj = {
                    "itemCode" : "RCHG",
                    "packageId" : "RCHG",
                    "Product" : "Voice Recharge - Gling Gring App",
                    "MRP" : $scope.recharge.amt,
                    "orderMRP" : $scope.recharge.amt,
                    "sub_total" : $scope.recharge.amt
                }
                $scope.addTecknovateItemOrder(obj)
            }
        }
        $scope.addTecknovateItemOrder = function( item, lineComment){
            item.itemQuantity = 0;
            $scope.newOrderItem.itemDetails = angular.copy(item);
            $scope.newOrderItem.quantity = 0;
            item.itemQuantity =  $scope.newOrderItem.quantity;
            // if(!item.itemQuantity){
            //     Settings.alertPopup("Alert",  "Please Enter a Valid Quantity");
            //     return;
            // }
            // if(!item.orderMRP){
            //     $scope.alertMsg("danger", "In New Order Addition", "Please Enter a Valid Order MRP");
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
            //     $scope.alertMsg("danger", "In New Order Addition", MIN_ORDER + " is minimum number of items that must be ordered" );
            //     return;
            // }
            //Check if the item is already in the order
            if(doesItemExistsInCart($scope.newOrderItemList, "itemCode", $scope.newOrderItem.itemDetails) >= 0){
                Settings.alertPopup("Alert", "Item already exists in the order, please check");
                return;
            }
            //Price of Order
            $scope.newOrderItem.total = $scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.MRP;
            $scope.newOrderItem.orderTotal = $scope.newOrderItem.quantity  * $scope.newOrderItem.itemDetails.orderMRP;
            $scope.newOrderItem.MRP = $scope.newOrderItem.itemDetails.MRP;
            $scope.newOrderItem.orderMRP = $scope.newOrderItem.itemDetails.orderMRP;
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
                }else if(item.otherTaxes && item.otherTaxes.length && $scope.taxSetups.otherSetup == 'other')
                {
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
            $scope.newOrderItem.phone_numbers = [];
            //Push items to the order items list
            $scope.newOrderItemList.unshift($scope.newOrderItem);
            var indexInCatalogue = doesItemExistsInArray($scope.items, "itemCode", $scope.newOrderItem.itemDetails);
            if(indexInCatalogue>=0)
                $scope.itemsInModal[indexInCatalogue].added = $scope.newOrderItemList.length - 1 ;
            //Initialize
            $scope.newOrderItem = {
                itemDetails:{},
                quantity: 0,
                total: 0,
                MRP:0,
                orderMRP:0,
                CGST:0,
                SGST:0,
                IGST : 0,
                otherTaxes: [],
                phone_numbers : []
            };
            $scope.data.category = "";
            //To display option to add item need to be displayed
            $scope.displayAddItemOption = false;
            return $scope.newOrderItemList.length;
        }//End of addItemToOrder
        $scope.addPhoneNumbers = function(flag, item, number, index){
            if(number && number.length > 5 && number.length < 16){
                $scope.phone_number.number = [];
                for(var i=0;i<$scope.newOrderItemList.length;i++){
                    (function(i){
                        if(item.itemDetails._id == $scope.newOrderItemList[i].itemDetails._id){
                            if(flag){
                                $scope.newOrderItemList[i].phone_numbers.push({'number' : number, 'transaction_id' : $scope.generateOrderId() + i});
                                $scope.newOrderItemList[i].quantity = $scope.newOrderItemList[i].phone_numbers.length;
                                $scope.newOrderItemList[i].itemDetails.itemQuantity= $scope.newOrderItemList[i].phone_numbers.length;
                            }
                            else{
                                $scope.newOrderItemList[i].phone_numbers.splice(index,1);
                                $scope.newOrderItemList[i].quantity = $scope.newOrderItemList[i].phone_numbers.length;
                                $scope.newOrderItemList[i].itemDetails.itemQuantity= $scope.newOrderItemList[i].phone_numbers.length;
                            }
                            // $scope.newOrderItemList[i].taxableValue = $scope.newOrderItemList[i].quantity * $scope.newOrderItemList[i].itemDetails.orderMRP
                            // / (100 + $scope.newOrderItemList[i].CGST + $scope.newOrderItemList[i].SGST + $scope.newOrderItemList[i].IGST)) * 100;
                        }
                    })(i);
                }
            }
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
                var taxableValue = 0;
                if($scope.taxExclusive){
                    if($scope.taxSetups.otherSetup == 'other'){
                        if($scope.data.newOrderStore.customerVariant == 'bulk' && $scope.newOrderItemList[i].itemDetails.BulkPrice){
                            taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice)
                            $scope.GST.orderTotal[i] = ( parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice)) +
                                (( $scope.newOrderItemList[i].CGST * $scope.newOrderItemList[i].itemDetails.BulkPrice)/100 + ($scope.newOrderItemList[i].SGST* $scope.newOrderItemList[i].itemDetails.BulkPrice)/100 + ($scope.newOrderItemList[i].IGST* $scope.newOrderItemList[i].itemDetails.BulkPrice)/100);
                            $scope.GST.orderTotal[i] = $scope.GST.orderTotal[i] * Number($scope.newOrderItemList[i].quantity);
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
                            taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice)
                            $scope.GST.orderTotal[i] = ( parseFloat($scope.newOrderItemList[i].itemDetails.BulkPrice)) +
                                (( $scope.newOrderItemList[i].CGST * $scope.newOrderItemList[i].itemDetails.BulkPrice)/100 + ($scope.newOrderItemList[i].SGST* $scope.newOrderItemList[i].itemDetails.BulkPrice)/100 + ($scope.newOrderItemList[i].IGST* $scope.newOrderItemList[i].itemDetails.BulkPrice)/100);
                            $scope.GST.orderTotal[i] = $scope.GST.orderTotal[i] * Number($scope.newOrderItemList[i].quantity);
                            $scope.GST.taxableValue[i] = Number($scope.newOrderItemList[i].itemDetails.BulkPrice) * Number($scope.newOrderItemList[i].quantity)
                        }else{
                            taxableValue = parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP)
                            $scope.GST.orderTotal[i] = ( parseFloat($scope.newOrderItemList[i].itemDetails.orderMRP)) +
                                (( $scope.newOrderItemList[i].CGST * $scope.newOrderItemList[i].itemDetails.orderMRP)/100 + ($scope.newOrderItemList[i].SGST* $scope.newOrderItemList[i].itemDetails.orderMRP)/100 + ($scope.newOrderItemList[i].IGST* $scope.newOrderItemList[i].itemDetails.orderMRP)/100);
                            $scope.GST.orderTotal[i] = $scope.GST.orderTotal[i] * Number($scope.newOrderItemList[i].quantity);
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
                $scope.GST.CSGSTTotal += (parseFloat($scope.newOrderItemList[i].CGST/100) * taxableValue) * Number($scope.newOrderItemList[i].quantity) ;
                $scope.GST.SGSTTotal += (parseFloat($scope.newOrderItemList[i].SGST/100) * taxableValue) * Number($scope.newOrderItemList[i].quantity) ;
                $scope.GST.IGSTTotal += (parseFloat($scope.newOrderItemList[i].IGST/100) * taxableValue) * Number($scope.newOrderItemList[i].quantity) ;
                $scope.GST.listTotal[i] = Number($scope.newOrderItemList[i].quantity) * (parseFloat($scope.newOrderItemList[i].itemDetails.MRP));
                $scope.GST.Quantity += Number($scope.newOrderItemList[i].quantity);
                $scope.otherTaxCal.listTotal[i] = Number($scope.newOrderItemList[i].quantity) * (parseFloat($scope.newOrderItemList[i].itemDetails.MRP));
                $scope.otherTaxCal.Quantity += Number($scope.newOrderItemList[i].quantity);
            }
        }
        //order
        $scope.handleCancelNewOrder = function(){
            $scope.addOrderButton =	!$scope.addOrderButton;
            $scope.addPosButton = false;
            $scope.displayAddItemOption=false;
            $scope.data.newOrderStore = {};
            $scope.clearFilter(2);
            $scope.clearFilter(4);
            $scope.orderViewTab.tab = 1;
            $scope.data.newOrderSalesPerson = {};
            $scope.a.selectedSalesPerson = "";
            $scope.disableSalesPersonSelection = true;
            $scope.a.selectedStores = {};
            $scope.data.tempCity = "";
            $scope.data.tempState = "";
            $scope.data.tempCountry = "";
            $scope.showDealerDetails = false;
            $scope.newOrderItemList = [];
            $scope.dealerSelected.flag = false;
            $scope.searchDealer.DealerName = '';
            $window.scrollTo(0, 0);
            $scope.viewLength = 0;
            $scope.newViewBy = localViewBy;
            if($scope.user.role != 'Dealer' && $scope.order_count < localViewBy){
                $scope.newViewBy = $scope.order_count;
            }
            if($scope.user.role == 'Dealer' && $scope.order_count < localViewBy){
                $scope.newViewBy = $scope.order_count;
            }
            $scope.changeOrderView(0);
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
        $scope.recentTransactionType = 'all';
        var recentTransactionFromServer = {};
        var masterRecentTransactions = {};
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
        $scope.renderDashboardOrdersReport = function(){
            $http.get("/dash/reports/orders")
                .success(function(response) {
                    console.log("GetAll Dashboard Order Summary reports-->");
                    $scope.dashboardorderreport = response;
                    // ordersSummaryChart($scope, response);
                })
        };
        //Render Orders
        $scope.renderOrders = function (response) {
            console.log("GetAll Orders-->", response.length);
            //console.log(response);
            var oldOrder = [];
            var tempOrder = [];
            $scope.orders = [];
            for(var i=0; i<response.length;i++){
                var oldOrderObj = {};
                var tempOrderObj = {}
                var orderstatus = '';
                //... If ther delivery date is in any other format, we change it to the desired format for display....
                if(response[i].deliveryDate){
                    if(response[i].deliveryDate[0]){
                        // response[i].delivery = new Date(response[i].deliveryDate[0]);
                        response[i].delivery = moment(response[i].deliveryDate[0]).format("DD-MMM-YYYY");
                        response[i].deliveryDate[0] = moment(response[i].deliveryDate[0]).format("DD-MMM-YYYY");
                    }
                }
                //..... If Line status is an array of statuses, more than 1.....
                if(response[i].lineStatus){
                    console.log(response[i]);
                    if(response[i].lineStatus.length > 1){
                        var tempStatus = response[i].lineStatus[0];
                        var flag = 1;
                        var emptyStatus = 0;
                        for(var j=0; j<response[i].lineStatus.length; j++){
                            if(tempStatus != response[i].lineStatus[j])
                                flag = 0;
                            if(response[i].lineStatus[j] == ''){
                                emptyStatus = 1;
                                response[i].lineStatus[j] = $scope.nav[1].lineStatus[0];
                            }
                        }
                        if(flag == 1)
                            orderstatus = tempStatus;
                        else if(flag == 0)
                            orderstatus = $scope.nav[1].status[1];
                        if(emptyStatus){
                            orderstatus = $scope.nav[1].status[0];
                        }
                    }   //.... If Line status is an array with only single value....
                    else if(response[i].lineStatus.length == 1){
                        if(response[i].lineStatus[0] == '')
                            response[i].lineStatus[0] = $scope.nav[1].lineStatus[0];
                        orderstatus = response[i].lineStatus[0];
                    }   //... If Line status is a string....
                    else if(response[i].lineStatus == '' || response[i].lineStatus[0] == ''){
                        orderstatus = $scope.nav[1].lineStatus[0];
                        response[i].lineStatus = $scope.nav[1].lineStatus[0];
                    }   //...
                    else if(response[i].lineStatus != '' || response[i].lineStatus[0] != ''){
                        //console.log(response[i].orderId)
                        orderstatus = response[i].lineStatus;
                    }
                }
                //console.log(response[i].orderId, response[i].status)
                /*if(!(response[i].status[0] != '' || response[i].status[0] != undefined || response[i].status[0] != null)){
                 response[i].status = orderstatus;
                 oldOrderObj.status = orderstatus;
                 oldOrderObj.orderId = response[i].orderId[0];
                 oldOrder.push(oldOrderObj);
                 }
                 else if(response[i].status != orderstatus){
                 console.log(response[i].status, orderstatus)
                 response[i].status = orderstatus;
                 tempOrderObj.status = orderstatus;
                 tempOrderObj.orderId = response[i].orderId[0];
                 tempOrder.push(tempOrderObj);
                 }*/
                $scope.orders.push(response[i]);
            }
            /*if(oldOrder.length > 0){
             console.log("Create : Orderstatus for old orders")
             $http.put("/dash/orders/createStatus", oldOrder)
             .success(function(result){
             console.log(result);
             })
             }
             if(tempOrder.length > 0){
             console.log("Update : Orderstatus for order : "+tempOrder.length)
             $http.put("/dash/orders/updateStatus", tempOrder)
             .success(function(result){
             console.log(result);
             })
             }*/
            response.sort(function(a, b) {
                return new Date(a.date_added[0]) < new Date(b.date_added[0]) ? 1 : -1;
            });
            // $scope.items12 = $scope.orders;
            // $scope.viewby = 10;
            // $scope.totalItems = $scope.orders.length;
            // $scope.currentPage = 1;
            // $scope.itemsPerPage = $scope.viewby;
            // $scope.maxSize = 5;
            // $scope.case7Length = $scope.orders.length;
            // $scope.graphNumber = [];
            allOrders = $scope.orders;
            $scope.allOrdersTotalAmount = 0;
            var temp = '';
            for (var i =0; i < $scope.orders.length; i++){
                //console.log("Value - " + i + ", " + $scope.orders[i].seller[0]);
                if(typeof $scope.orders[i].status == "string"){
                    if (
                        (!$scope.orders[i].status)
                        || ($scope.orders[i].status == "")
                    )
                        $scope.orders[i].status = $scope.orderStatusSel;
                }else{
                    if (($scope.orders[i].status[0] == ""))
                        $scope.orders[i].status = $scope.orderStatusSel;
                    else
                        $scope.orders[i].status = $scope.orders[i].status[0];
                }
                //Index of seller name from seller list
                for (var j=0; j < $scope.sellers.length; j++){
                    if ($scope.orders[i].seller[0] == $scope.sellers[j].sellerid){
                        $scope.orders[i].seller[0] = $scope.sellers[j].sellername;
                    }
                }
                if($scope.orders[i].total_amount[0] && $scope.orders[i].total_amount[0]!='NaN'){
                    $scope.allOrdersTotalAmount += Number($scope.orders[i].total_amount[0]);
                }
                if(i==$scope.orders.length-1){
                    temp = $scope.allOrdersTotalAmount+"";
                    if(temp.length == 6 || temp.length == 7){
                        console.log("Total is over 1Lakh");
                        $scope.allOrdersTotalAmount = ($scope.allOrdersTotalAmount/100000).toFixed(2) + 'L';
                    }
                    else if(temp.length >= 8){
                        console.log("Total is over 1Crore");
                        $scope.allOrdersTotalAmount = ($scope.allOrdersTotalAmount/10000000).toFixed(2) + 'Cr';
                    }
                }
            }
            //$scope.sortOrderBy('orders', 0)//sort by date as soon as logged in
        };
        //Function to handle on submission of order
        $scope.submitOrder = function(flag){
            //Validate that item list is not empty
            $scope.newOrder = [];
            if($scope.newOrderItemList.length == 0){
                Settings.alertPopup("Alert", "Item list is empty for order");
                return;
            }
            for(var i=0;i<$scope.newOrderItemList.length;i++){
                if($scope.newOrderItemList[i].itemDetails.looseQty){
                    if($scope.newOrderItemList[i].quantity <= 0 || !$scope.newOrderItemList[i].quantity){
                        Settings.alertPopup("Alert",  "Please Enter a Valid  Quantity for "+$scope.newOrderItemList[i].itemDetails.Product);
                        return;
                    }
                }else{
                    if($scope.newOrderItemList[i].quantity <= 0 || !$scope.newOrderItemList[i].quantity || ((typeof $scope.newOrderItemList[i].quantity === 'number') && ($scope.newOrderItemList[i].quantity % 1 != 0))){
                        if($scope.coID == 'GLGR')
                            Settings.alertPopup("Alert", "Please add Phone Number");
                        else
                            Settings.alertPopup("Alert","Please Enter a Valid  Quantity for "+$scope.newOrderItemList[i].itemDetails.Product);
                        return;
                    }
                }
            }
            //Validate that sales person and store are not empty
            /*if(typeof $scope.data.newOrderSalesPerson.sellername === "undefined" ||
             $scope.data.newOrderSalesPerson.sellername === "")
             {
             $scope.alertMsg("danger", "In New Order Addition", "Sales person is not choosen for new Order");
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
            if(!flag && !$scope.OrderIdParam){
                //Lets generate order id
                $scope.data.newOrderId = $scope.generateOrderId();
            }
            if($scope.OrderIdParam){
                $scope.data.newOrderId = $scope.OrderIdParam;
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
            var cloudinary = [];
            if(flag){
                status = $scope.nav[1].status[$scope.nav[1].status.length-1];
                source = 'Pos';
            }else{
                status = $scope.nav[1].status[0];
                source = 'Order';
            }
            if($scope.delivery_date_Enable && !flag){
                var deliveryDate = new Date();
                deliveryDate.setDate(deliveryDate.getDate() + Number($scope.deliveryOrderDate));
                deliveryDate = $scope.DateTimeFormat(deliveryDate, 'start');
            }
            var Strdiscount = $scope.customerDiscount +"_special_discount"
            var Strreduction =$scope.customerDiscount +"_special_reduction"
            for(var i=0; i < $scope.newOrderItemList.length; i++) {
                var comment = [];
                console.log("Specials if any --> ", $scope.newOrderItemList[i].Specials);
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
                itemAsStoredInMongo = {
                    "date_added": $scope.data.newOrderDateTime,
                    "date": (new Date()) + "",
                    "orderId": $scope.data.newOrderId,
                    "dealercode": $scope.data.newOrderStore.Dealercode,
                    "dealername": $scope.data.newOrderStore.DealerName,
                    "dealerphone": $scope.data.newOrderStore.Phone,
                    "shipping_address": $scope.data.newOrderShipping_address,
                    "shipping_address_city": $scope.data.tempCity,
                    "shipping_address_state": $scope.data.tempState,
                    "shipping_address_country": $scope.data.tempCountry,
                    "Address": $scope.data.newOrderStore.Address,
                    "itemcode": $scope.newOrderItemList[i].itemDetails.itemCode,
                    "email": $scope.data.newOrderStore.email,
                    "paymentMode": $scope.data.newOrderStore.paymentMode || '',
                    "class": $scope.data.newOrderStore.class || '',
                    "item": "",
                    "quantity": $scope.newOrderItemList[i].quantity,
                    "seller": $scope.user.seller ? $scope.user.seller : ($scope.data.newOrderSalesPerson.sellerphone) ? $scope.data.newOrderSalesPerson.sellerphone : '',
                    // "seller":   $scope.data.newOrderStore.Seller  ? $scope.data.newOrderStore.Seller  :   $scope.user.seller,
                    "MRP": $scope.newOrderItemList[i].MRP,
                    "terms_conditions_accepted" : $scope.orderConditions.terms_conditions_order || '',
                    "GST": {
                        'cgst': $scope.newOrderItemList[i].CGST,
                        'sgst': $scope.newOrderItemList[i].SGST,
                        'igst': $scope.newOrderItemList[i].IGST,
                        'qbId': $scope.newOrderItemList[i].qbId || 24,
                    },
                    "orderMRP": $scope.newOrderItemList[i].itemDetails.orderMRP,
                    "BulkPrice": bulkprice,
                     "netPrice" : $scope.newOrderItemList[i].itemDetails.NetPrice ,
                    "Special": Number($scope.newOrderItemList[i].Specials),
                    "regularDiscount": $scope.newOrderItemList[i].itemDetails.special,
                    "specialReduction":$scope.newOrderItemList[i].itemDetails[Strreduction] || 0 ,
                    "specialDiscount":$scope.newOrderItemList[i].itemDetails[Strdiscount] || 0,
                    "finalDiscount":$scope.newOrderItemList[i].itemDetails.finalDiscount ,
                    "price" : $scope.newOrderItemList[i].itemDetails.price,
                    "sellername": $scope.user.username || $scope.data.newOrderSalesPerson.sellername || 'PORTAL',
                    // "sellername": $scope.data.newOrderStore.SellerName  ? $scope.data.newOrderStore.SellerName  : $scope.user.username,
                    "stockist": ($scope.data.newOrderStore.Stockist) ? $scope.data.newOrderStore.Stockist : "",
                    "stockistname": $scope.data.newOrderStore.StockistName,
                    "stockistname1": $scope.data.newOrderStore.StockistName1,
                    "billing_address": $scope.data.newOrderBilling_address,
                    "billing_address_city": $scope.data.newOrderStore.City,
                    "billing_address_state": $scope.data.newOrderStore.State,
                    "billing_address_country": $scope.data.newOrderStore.Country,
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
                    "source": source,
                    "taxExclusive":$scope.taxExclusive,
                    "line_id":i+1,
                    "courierName":$scope.data.courierName || "",
                    "trackingNumber":$scope.data.trackingNumber || "",
                    "attachments": $scope.data.attachments
                }
                if( !$scope.newOrderItemList[i].itemDetails.trackInventory && $scope.newOrderItemList[i].itemDetails.trackInventory != false){
                    itemAsStoredInMongo.trackInventory = true;
                }else{
                    itemAsStoredInMongo.trackInventory = $scope.newOrderItemList[i].itemDetails.trackInventory;
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
                if($scope.UOM){
                    itemAsStoredInMongo.unit = $scope.newOrderItemList[i].itemDetails.unit ? $scope.newOrderItemList[i].itemDetails.unit:$scope.UOM;
                }
                if($scope.data.salesPerson){
                    itemAsStoredInMongo.sellername = $scope.data.salesPerson.sellername;
                    // itemAsStoredInMongo.seller = $scope.data.salesPerson.sellerid;
                    itemAsStoredInMongo.seller = $scope.data.salesPerson.sellerphone;
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
                itemAsStoredInMongo.comment = [];
                if(!$scope.OrderIdParam){
                    if ($scope.data.newOrderComment != "") {
                        comment.unshift(
                            {
                                "comment" 	:	$scope.data.newOrderComment,
                                "date"    	:	$scope.data.newOrderDateTime,
                                "username"	:	"Portal",
                                "userphone"	:	""
                            });
                    }
                }else{
                    if ($scope.data.newOrderComment ) {
                        if($scope.existingComment.length){
                            comment = angular.copy($scope.existingComment);
                            comment.unshift(
                                {
                                    "comment" 	:	$scope.data.newOrderComment,
                                    "date"    	:	$scope.data.newOrderDateTime,
                                    "username"	:	"Portal",
                                    "userphone"	:	""
                                });
                        }else{
                            comment.unshift(
                                {
                                    "comment" 	:	$scope.data.newOrderComment,
                                    "date"    	:	$scope.data.newOrderDateTime,
                                    "username"	:	"Portal",
                                    "userphone"	:	""
                                });
                        }
                    }else{
                        if($scope.existingComment.length){
                            comment = angular.copy($scope.existingComment);
                        }
                    }
                }
                itemAsStoredInMongo.comment = angular.copy(comment);
                //Each Item is segregated into one element of newOrder Array
                //Thats how orders are stored in mongo
                $scope.newOrder.push(itemAsStoredInMongo);
            }
console.log("$scope.newOrder",$scope.newOrder)
            //Prompt user for prompt to add his comments to the order
            //Its better to give comment box in html than as prompt
            if($scope.currency)
                $scope.newOrder.currency = $scope.currency;
            Settings.confirmPopup('CONFIRM',"Confirm the order?",function(result){
                console.log('willDelete',result);
                if (result) {
                    console.log($scope.newOrder)
                    //HTTP Header is not being set here, Session id is being set in
                    //request in cookies.
                    //HTTP post to post order to the server
                    if($scope.OrderIdParam){
                        $http.post("/dash/orders/edit/" + $scope.data.newOrderId, $scope.newOrder)
                            .success(function (response) {
                                //Show up the add order button again
                                $scope.addOrderButton = true;
                                $scope.orderViewTab.tab = 0;
                                $scope.data.newOrderStore = {};
                                $scope.data.newOrderSalesPerson = {};
                                $scope.a.selectedSalesPerson = "";
                                $scope.disableSalesPersonSelection = true;
                                $scope.a.selectedStores = {};
                                $scope.data.tempCity = "";
                                $scope.data.tempState = "";
                                $scope.data.tempCountry = "";
                                $scope.showDealerDetails = false;
                                //to bring the latest addition to the top
                                $scope.sortOrder = false;
                                $scope.newOrder = [];
                                $scope.clearFilter(1);
                                renderWeeklyDashboard();
                                $scope.fetchRecentTranasctions();
                                $scope.renderDashboardOrdersReport();
                                $location.path('/ui-orders');
                            });
                    }else{
                        $http.post("/dash/orders/" + $scope.data.newOrderId, $scope.newOrder)
                            .success(function (response) {
                                //Show up the add order button again
                                $scope.addOrderButton = true;
                                $scope.orderViewTab.tab = 0;
                                $scope.data.newOrderStore = {};
                                $scope.data.newOrderSalesPerson = {};
                                $scope.a.selectedSalesPerson = "";
                                $scope.disableSalesPersonSelection = true;
                                $scope.a.selectedStores = {};
                                $scope.data.tempCity = "";
                                $scope.data.tempState = "";
                                $scope.data.tempCountry = "";
                                $scope.showDealerDetails = false;
                                //to bring the latest addition to the top
                                $scope.sortOrder = false;
                                $scope.newOrder = [];
                                $scope.clearFilter(1);
                                renderWeeklyDashboard();
                                $scope.fetchRecentTranasctions();
                                $scope.renderDashboardOrdersReport();
                                $location.path('/ui-orders');
                            });
                    }
                    $scope.orderDetails = [];
                    Settings.success_toast("Success","Order Created Successfully");
                    // toastr.success("New Order Successfully Submitted")
                    // $scope.alertMsg("green", "", "New Order Successfully Submitted");
                    if ($scope.settings.invoice) {
                        $http.put("/dash/enquiry/type/update", temp)
                            .success(function (response) {
                                console.log(response)
                                if (response == 'OK') {
                                    // swal("Successfully submitted");
                                    // bootbox.alert({
                                    //     title: "SUCCESS",
                                    //     message: "Successfully submitted",
                                    //     className: 'text-center'
                                    // })
                                }
                            })
                    }
                } else {
                    // swal("Your imaginary file is safe!");
                }
            });
            // }
        }//End of submitOrder
        //Render Tenants
        $scope.renderSettings = function (response) {
            $http.get("/dash/instanceDetails")
                .success(function(response) {
                    $scope.settings.invoice = response.invoice;
                });
        };
        $scope.renderSettings();
        $scope.addOrderInitialize();
        // $scope.$watch('calculateIGST', function () {
        //     // console.log('IGST : ' + $scope.calculateIGST);
        //     // console.log($scope.newOrderItemList);
        //     if ($scope.calculateIGST) {
        //         for (var i = 0; i < $scope.newOrderItemList.length; i++) {
        //             if(itemDetails.IGST)
        //             $scope.newOrderItemList[i].IGST = $scope.newOrderItemList[i].itemDetails.IGST;
        //             $scope.newOrderItemList[i].CGST = 0;
        //             $scope.newOrderItemList[i].SGST = 0;
        //         }
        //     } else {
        //         for (var i = 0; i < $scope.newOrderItemList.length; i++) {
        //             $scope.newOrderItemList[i].IGST = 0;
        //             $scope.newOrderItemList[i].CGST = $scope.newOrderItemList[i].itemDetails.CGST;
        //             $scope.newOrderItemList[i].SGST = $scope.newOrderItemList[i].itemDetails.SGST;
        //         }
        //     }
        // });
        $scope.taxCalc = function(value)
        {
            if(value){
                var with2Decimals = value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
                // rounded = with2Decimals;
                return Number(with2Decimals);
            }
        }
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
                // $scope.nhil = (orderTotal * tax.nhil)/100;
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
                //         var listTexableMrp = parseFloat(mrp);
                //
                //         if($scope.taxExclusive){
                //             var taxableMrp = parseFloat(BulkPrice);
                //
                //         }else{
                //             var taxableMrp = parseFloat(BulkPrice / (100 + $scope.ghanaTax.NHIL + $scope.ghanaTax.GETL + $scope.ghanaTax.VAT) * 100);
                //         }
                //
                //         $scope.orderTotal = (Number($scope.newOrderItemList[i].quantity) * taxableMrp);
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
                //             $scope.newOrderMRPTotalAmount = $scope.taxCalc($scope.newOrderMRPTotalAmount);
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
                //             $scope.newOrderExcTaxAmount1 = 0;
                //             $scope.newOrderExcTaxAmount2 = 0;
                //             $scope.newOrderExcTaxAmount3 = 0;
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
                //
                //             if($scope.taxExclusive){
                //                 var taxableMrp = parseFloat(orderMrp);
                //
                //             }else{
                //                 var taxableMrp = parseFloat(orderMrp / (100 + $scope.ghanaTax.NHIL + $scope.ghanaTax.GETL + $scope.ghanaTax.VAT) * 100);
                //             }
                //             // $scope.ghanaTax.VAT = 12.5;
                //             $scope.orderTotal = (Number($scope.newOrderItemList[i].quantity) * taxableMrp);
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
                //
                //             if($scope.calculateIGST){
                //                 $scope.newOrderMRPTotalAmount = ($scope.newOrderExcTaxAmount + grandTotalTax);
                //                 $scope.newOrderMRPTotalAmount = $scope.taxCalc($scope.newOrderMRPTotalAmount);
                //                 $scope.newOrderTotalAmount += ((listTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                //             }
                //             else{
                //                 $scope.newOrderMRPTotalAmount = ($scope.newOrderExcTaxAmount + grandTotalTax);
                //                 $scope.newOrderTotalAmount += ((listTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                //             }
                //
                //             $scope.newOrderTaxAmount.totalTax +=  (parseFloat($scope.ghanaTax.NHIL/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat($scope.ghanaTax.GETL/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity) + (parseFloat($scope.ghanaTax.VAT/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //             $scope.newOrderTaxAmount.totalCGST += (parseFloat($scope.ghanaTax.NHIL/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //             $scope.newOrderTaxAmount.totalSGST += (parseFloat($scope.ghanaTax.GETL/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
                //             $scope.newOrderTaxAmount.totalIGST += (parseFloat($scope.ghanaTax.VAT/100) * taxableMrp) * Number($scope.newOrderItemList[i].quantity);
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
                //                 $scope.newOrderTotalAmount += ((listTexableMrp + sumOflistTexableMrp ) * ($scope.newOrderItemList[i].quantity));
                //                 $scope.newOrderMRPTotalAmount = Math.trunc($scope.newOrderMRPTotalAmount * 100)/100;
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
            // $scope.discountCalculate($scope.posDiscount.value);
            // if($scope.data.newOrderfreight ){
            // $scope.newOrderMRPTotalAmount += $scope.data.newOrderfreight;
            // }
        }, true);
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
        //Function to handle on submission of Tecknovate Order
        $scope.submitTecknovateOrder = function(flag){
            // console.log($scope.subscriptions);
            if($scope.subscriptions.length)
                $scope.newOrderItemList = $scope.subscriptions;
            //Validate that item list is not empty
            if($scope.newOrderItemList.length == 0){
                Settings.alertPopup("Alert", "Item list is empty for order");
                return;
            }
            for(var i=0;i<$scope.newOrderItemList.length;i++){
                if($scope.newOrderItemList[i].quantity <= 0 || !$scope.newOrderItemList[i].quantity || ((typeof $scope.newOrderItemList[i].quantity === 'number') && ($scope.newOrderItemList[i].quantity % 1 != 0))){
                    if($scope.coID == 'GLGR')
                        Settings.alertPopup("Alert", "Please add Phone Number");
                    else
                        Settings.alertPopup("Alert","Please Enter a Valid  Quantity for "+$scope.newOrderItemList[i].itemDetails.Product);
                    return;
                }
            }
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
            var cloudinary = [];
            status = $scope.nav[1].status[0];
            source = 'Ecomm';
            if($scope.delivery_date_Enable && !flag){
                var deliveryDate = new Date();
                deliveryDate.setDate(deliveryDate.getDate() + Number($scope.deliveryOrderDate));
                deliveryDate = $scope.DateTimeFormat(deliveryDate, 'start');
            }
            $scope.newOrder = [];
            for(var i=0; i < $scope.newOrderItemList.length; i++) {
                var bulkprice = '';
                itemAsStoredInMongo = {
                    "date_added": $scope.data.newOrderDateTime,
                    "date": (new Date()) + "",
                    "orderId": $scope.data.newOrderId,
                    "dealercode": $scope.data.newOrderStore.Dealercode,
                    "dealername": $scope.data.newOrderStore.DealerName,
                    "dealerphone": $scope.data.newOrderStore.Phone,
                    "shipping_address": $scope.data.newOrderShipping_address,
                    "Address": $scope.data.newOrderStore.Address,
                    "itemcode": $scope.newOrderItemList[i].itemDetails.itemCode,
                    "packageId": $scope.newOrderItemList[i].itemDetails.packageId,
                    "email": $scope.data.newOrderStore.email,
                    "paymentMode": $scope.data.newOrderStore.paymentMode || '',
                    "class": $scope.data.newOrderStore.class || '',
                    "quantity": $scope.newOrderItemList[i].quantity,
                    "seller": ($scope.user.seller) ? $scope.user.seller : ($scope.data.newOrderSalesPerson.sellerphone) ? $scope.data.newOrderSalesPerson.sellerphone.toString() : '',
                    "MRP": $scope.newOrderItemList[i].MRP,
                    "GST": {
                        'cgst': $scope.newOrderItemList[i].CGST,
                        'sgst': $scope.newOrderItemList[i].SGST,
                        'igst': $scope.newOrderItemList[i].IGST,
                        'qbId': $scope.newOrderItemList[i].qbId || 24
                    },
                    "orderMRP": $scope.newOrderItemList[i].MRP,
                    "BulkPrice": bulkprice,
                    "Special": Number($scope.newOrderItemList[i].Specials),
                    "sellername": $scope.user.username || $scope.data.newOrderSalesPerson.sellername || 'PORTAL',
                    "billing_address": $scope.data.newOrderBilling_address,
                    "status": status,
                    "total": $scope.newOrderTotalAmount? Number(($scope.newOrderTotalAmount).toFixed(2)) : Number(($scope.newSubscriptionTotalAmount).toFixed(2)),
                    "orderTotal": $scope.newOrderTotalAmount? Number(($scope.newOrderTotalAmount).toFixed(2)) : Number(($scope.newSubscriptionTotalAmount).toFixed(2)),
                    "sub_total": $scope.newOrderItemList[i].MRP,
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
                    "validity": $scope.newOrderItemList[i].itemDetails.Validity,
                    "size": $scope.newOrderItemList[i].itemDetails.Size,
                    "cloudinaryURL": cloudinary[i],
                    "freight": $scope.data.newOrderfreight,
                    "freightChargeType": $scope.data.freightCharge,
                    "lineComment": [$scope.newOrderItemList[i].lineComment],
                    "lineStatus": $scope.nav[1].status[0],
                    "source": source,
                    "taxExclusive":$scope.taxExclusive,
                    "category": $scope.newOrderItemList[i].itemDetails.Manufacturer,
                    "msidn" : $scope.data.newOrderStore.msidn,
                    "paymentStatus" : '',
                    "line_id":i+1,
                };
                if($scope.newOrderItemList[i].phone_numbers){
                    itemAsStoredInMongo.phone_numbers = $scope.newOrderItemList[i].phone_numbers;
                }
                if($scope.data.salesPerson){
                    itemAsStoredInMongo.sellername = $scope.data.salesPerson.sellername;
                    itemAsStoredInMongo.seller = $scope.data.salesPerson.sellerid;
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
            if($scope.currency)
                $scope.newOrder.currency = $scope.currency;
            if($scope.data.newOrderStore.creditLimit && $scope.enforceCredit){
                if($scope.orderTotalPrice <= $scope.data.newOrderStore.creditLimit) {
                    Settings.confirmPopup('CONFIRM',"Are you sure?",function(result){
                        // console.log('willDelete',result);
                        if (result) {
                            jQuery.noConflict();
                            $('.refresh').css("display", "inline");
                            console.log($scope.newOrder)
                            //HTTP Header is not being set here, Session id is being set in
                            //request in cookies.
                            //HTTP post to post order to the server
                            $http.post("/dash/orders/" + $scope.data.newOrderId, $scope.newOrder)
                                .success(function (response) {
                                    //.... Delete Subscriptions ...........
                                    $http.delete("/dash/delete/subscription/" +$scope.tecknovateUser+"/NA").success(function(res) {
                                    });
                                    //Show up the add order button again
                                    $scope.addOrderButton = true;
                                    $scope.orderViewTab.tab = 0;
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
                                    renderWeeklyDashboard();
                                    $scope.fetchRecentTranasctions();
                                    $scope.renderDashboardOrdersReport();
                                    jQuery.noConflict();
                                    $('.refresh').css("display", "none");
                                    $location.path('/ui-orders');
                                });
                            $scope.orderDetails = [];
                            Settings.success_toast("Success","New Order Successfully Placed");
                        }
                    });
                }else{
                    Settings.failurePopup("Error",'Insufficient Credit Balance. Please clear any pending Dues.');
                }
            }else{
                Settings.confirmPopup('CONFIRM',"Are you sure?",function(result){
                    // console.log('willDelete',result);
                    if (result) {
                        jQuery.noConflict();
                        $('.refresh').css("display", "inline");
                        console.log($scope.newOrder)
                        //HTTP Header is not being set here, Session id is being set in
                        //request in cookies.
                        //HTTP post to post order to the server
                        $http.post("/dash/orders/" + $scope.data.newOrderId, $scope.newOrder)
                            .success(function (response) {
                                //.... Delete Subscriptions ...........
                                $http.delete("/dash/delete/subscription/" +$scope.tecknovateUser+"/NA").success(function(res) {
                                });
                                //Show up the add order button again
                                $scope.addOrderButton = true;
                                $scope.orderViewTab.tab = 0;
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
                                renderWeeklyDashboard();
                                $scope.fetchRecentTranasctions();
                                $scope.renderDashboardOrdersReport();
                                jQuery.noConflict();
                                $('.refresh').css("display", "none");
                                $location.path('/ui-orders');
                            });
                        $scope.orderDetails = [];
                        Settings.success_toast("Success","New Order Successfully Placed");
                    }
                });
            }
        }
        $scope.deleteSubscription = function(item, index){
            Settings.confirmPopup('warning',"Are you sure you want to delete the packages?", function(result) {
                // console.log(result);
                if (result) {
                    $scope.$apply(function(){
                        $http.delete("/dash/delete/subscription/"+ $scope.tecknovateUser + "/" +item).success(function(res) {
                            if(item!='NA') {
                                $scope.subscriptions.splice(index, 1)
                                $scope.newSubscriptionTotalAmount = 0;
                                for (var i = 0; i < $scope.subscriptions.length; i++) {
                                    temp = $scope.subscriptions[i].quantity * $scope.subscriptions[i].MRP;
                                    $scope.newSubscriptionTotalAmount += temp;
                                }
                            }
                            else{
                                $scope.subscriptions =[];
                            }
                        })
                    })
                }
            })
        };
        //.......... Razaorpay Payment ..............
        $scope.makeRazorpayPayment = function(){
            var data = getAmtForRazorpay();
            var options = {
                "amount": 100,
                "currency": 'INR',
                // "receipt": "657676467",
                "payment_capture": "1"
            };
            $http.post("/razorpay/order", options).then(function (order) {
                // console.log(order);
                if(order.data && !order.data.message && !order.data.error){
                    var options = {
                        "key": order.data.key_id,
                        "amount": order.data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                        "currency": order.data.currency,
                        // "name": "Test Payment",
                        // "description": "Test Transaction",
                        // "image": "https://example.com/your_logo",
                        "order_id": order.data.id,
                        "handler": function (response){
                            // console.log(response)
                            order.razorpay_payment_id = response.razorpay_payment_id;
                            order.razorpay_order_id = response.razorpay_order_id;
                            order.razorpay_signature = response.razorpay_signature;
                            console.log(order.razorpay_signature)
                            $http.post("/razorpay/payment/verify", order).then(function (res) {
                                if(res.data == true){
                                    Settings.successPopup('SUCCESS','Payment Successful!');
                                }
                            })
                        }
                    };
                    const rzp1 = Razorpay(options);
                    rzp1.open();
                }
                else if(order.data.statusCode){
                    Settings.failurePopup("Error", order.data.error.description);
                }
                else{
                    if(order.data.message)
                        Settings.failurePopup("Error", order.data.message);
                    else
                        Settings.failurePopup("Error",'Something went wrong! Please contact Admin.');
                }
            })
            function getAmtForRazorpay() {
                if($scope.tempCountryName == 'india'){
                    var data = {
                        amount : ($scope.newOrderMRPTotalAmount + $scope.data.newOrderfreight) * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                        currency : 'INR'
                    }
                }
                return data;
            }
        }
        $scope.showCompAcc = false;
        $scope.productFilterArray =[];
        $scope.productFilterArray1 =[];
        $scope.productFilterArray2 =[];
        $scope.selectedDataArray =[];
        $scope.openProductFilterLoader = false ;
        // to open the accordion values
        $scope.openProductFilter = function(selectedData,value) {
            // value is coming from selectedData now call APi for the selectedProductFilter Data
            // $scope.productFilterArray2 = [];
            // $scope.selectedKey = selectedData;
            $scope.openProductFilterLoader = false ;
            var newArray = [];
            $scope.FilterProductCategories = '';
             if (selectedData){
                newArray.push(selectedData);
            itemSearchObj.searchByFilterColumn = newArray;
                $http.post("/dash/items/filterRexItems/" + 'FilterColumn', itemSearchObj)
                .success(function (filterColumn) {
                    if (filterColumn.length) {
                            $scope.openProductFilterLoader = true ;
                            $scope.FilterProductCategories = filterColumn;
                            if(tempProductFilterArray[selectedData]){
                                $scope.FilterProductCategories = tempProductFilterArray[selectedData];
                            }
                    }
                })
         }
        }
        $scope.productfiltername ='';
        $scope.sidemenuFilter ;
        $scope.lst = [];
        $scope.filtervalue = [];
        //calling the filtered accordion values
        $scope.tempSelectedProdFilter = function(filtername){
            tempProductFilterArray[filtername] = $scope.FilterProductCategories;
        }
        $scope.selectedProductFilter = function(value,active,filtername,index){
           console.log("Filter --- Filter Name - " + filtername + ", Value - " + value + ", Index ? - " + index)
            $scope.items = [];
            $scope.viewLength = 0;
            const loadItems = (data, type) => {
                jQuery.noConflict();
                $('.refresh').css("display", "inline");
                $http.post("/dash/item/count", data)
                    .success(function (res) {
                        $scope.transactionCount(res, 2);
                        $http.post("/dash/items", data)
                            .success(function (response) {
                                $scope.renderItems(response);
                                jQuery.noConflict();
                                $('.refresh').css("display", "none");
                            });
                    });
            };
            itemSearchObj.searchByFilterColumn = '';
            if ($scope.FilterProductCategories[index].status) {
                // let temp ={};
                // temp[filtername] = value;
                // $scope.productFilterArray1.push(temp);
                // itemSearchObj.searchbySelectedCheckbox =  $scope.productFilterArray1;
                if(filterArr[filtername].indexOf(value) != -1){
                    filterArr[filtername].splice(filterArr[filtername].indexOf(value), 1)
                }
                $scope.productFilterArray= filterArr;
                itemSearchObj.searchbySelectedCheckbox = $scope.productFilterArray;
            }else{
                if(!filterArr[filtername])filterArr[filtername] =[value]
                else if(filterArr[filtername].length == 0 || filterArr[filtername].length){
                    filterArr[filtername].push(value);
                }
                $scope.productFilterArray= filterArr;
                itemSearchObj.searchbySelectedCheckbox =  $scope.productFilterArray;
            }
            if(filterArr[filtername].length)$scope.productFilterArray1 = [filterArr];
            else delete $scope.productFilterArray1[0][filtername]
            // value is coming from checkbox now call APi for the Data
            loadItems(itemSearchObj, 'FilterColumn');
        }
        $scope.showItemModalFlag = false ;
        $scope.showItemModal = function(){
            $scope.showItemModalFlag = !$scope.showItemModalFlag;
        };
        $scope.clicking = function(index,type) {
            console.log("index",index)
            switch (type) {
                case 'cat':
                    $scope.catActive = index;
                    $scope.subcatActive = '';
                    $scope.subSubCatActive = '';
                    break;
                case 'subcat':
                    $scope.subcatActive = index;
                    $scope.subSubCatActive = '';
                    break;
                case  'subSubCat':
                    $scope.subSubCatActive = index;
                    break;
            }
        };
        //Function to filter stores based on lead type
        $scope.filterDealerByLead=function(){
            $scope.serviceClients=[];
            dealerSearchObj.searchBycustomertype='Lead';
            $scope.customerType='lead';
            $scope.clearFilter(4)
            // $http.post("/dash/stores", dealerSearchObj)
            //     .success(function (response) {
            //         $scope.serviceClients=response;
            //
            //         // console.log($scope.dealerbylead)
            //         // $scope.multipleUsers(response);
            //         // $scope.transactionCount(response.length, 4);
            //         // $scope.renderStoreMap(response);
            //
            //     });
            // $http.post("/dash/stores/count", dealerSearchObj)
            //     .success(function (res) {
            //         $scope.transactionCount(res, 4);
            //     });
        }
        $scope.removeOrderAttachments = function(index){
            // console.log('remove attachment ', index)
            $scope.data.attachments.splice(index, 1)
        }
        $scope.data.attachments = [];
        let attachmentPublicId = $scope.generateOrderId();
        $scope.newUploadDocuments = function(step){
            if(document.getElementById('order-input_upload').value){
                console.log('length-=> ',document.getElementById('order-input_upload').files.length)
                if(document.getElementById('order-input_upload').files.length && document.getElementById('order-input_upload').files[0].size < 2097152){
                    jQuery.noConflict();
                        $('.refresh').css("display", "inline");
                    var reader = new FileReader();
                    var tempObj = {};
                    let image =[];
                    tempObj.publicId = $scope.generateOrderId();
                    tempObj.path = attachmentPublicId+'/new-order';
                    image = document.getElementById('order-input_upload').files;
                    reader.onloadend = function() {
                        tempObj.image = reader.result;
                        $http.post("/dash/upload/order/attachment", tempObj)
                            .success(function(docs){
                                if(docs){
                                    if(step == 1){
                                        console.log('docs', docs.url)
                                        document.getElementById("order-input_upload").value = "";
                                        $scope.data.attachments.push(docs);
                                    }
                                    Settings.successPopup('SUCCESS','Successfully uploaded.');
                                }
                                else{
                                    Settings.failurePopup('ERROR','Failed to upload. Please try after sometime.');
                                }
                                jQuery.noConflict();
                                    $('.refresh').css("display", "none");
                            })
                            .error(function(error, status){
                                if(status >= 400 && status < 404)
                                    $window.location.href = '/404';
                                else if(status >= 500)
                                    $window.location.href = '/500';
                                else
                                    $window.location.href = '/404';
                            });
                    }
                    reader.readAsDataURL(image[0]);
                }else{
                    Settings.warning_toast('Alert',"Please Select a file smaller than 2 MB");
                    document.getElementById("order-input_upload").value = "";
                }
            }
        }
        //Function to filter stores based on customer type
        $scope.filterDealerByCustomer=function(){
            $scope.serviceClients=[];
            dealerSearchObj.searchBycustomertype='';
            $scope.customerType='';
            $scope.clearFilter(4)
            // $http.post("/dash/stores", dealerSearchObj)
            //     .success(function (response) {
            //         $scope.serviceClients=response;
            //         // console.log($scope.dealerbylead)
            //         // $scope.multipleUsers(response);
            //         // $scope.transactionCount(response.length, 4);
            //         // $scope.renderStoreMap(response);
            //
            //     });
            // $http.post("/dash/stores/count", dealerSearchObj)
            //     .success(function (res) {
            //         $scope.transactionCount(res, 4);
            //     });
        }
        if(user_details){
            if(user_details.sellerObject){
                if(user_details.sellerObject.inventoryLocation){
                    $scope.tempHouseLoc.loc = user_details.sellerObject.inventoryLocation ;
                    $scope.locUpdate(user_details.sellerObject.inventoryLocation);
                    $scope.inventoryLocationFlag = true ;
                }
            }
        };
        $scope.typeOfSales=function (data)
        { return typeof data }
    })
