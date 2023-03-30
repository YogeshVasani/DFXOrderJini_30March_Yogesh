/**
 * Created by shreyasgombi on 05/07/22.
 */
 angular.module('ebs.controller')
 .controller("ShopifyCtrl", function($scope, $routeParams, $http, $window, Settings){
     console.log("Hello From Shopify Settings Controller .... !!!!");
     $scope.shopify = {};
     $scope.shopifyArray = [];
     //... Nav tabs...
     $scope.nav = [];
     Settings.getNav(false, nav => {
        $scope.nav = nav;
     });
    const startLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "inline");
    }
    const stopLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "none");
    }
     const refreshShopifySettings = () => {
        $http.get("/dash/shopify/settings")
                .then(response => {
                    console.log(response.data);
                    if(response.data && response.data.obj)
                        $scope.shopifyArray = response.data.obj;
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
     }
     const getShopifyDetails = () => {
        $http.get("/dash/shopify/creds/fetch")
                .then(response => {
                    console.log("Shopify Credentials Fetched --->");
                    if(response.data && response.data.length){
                        $scope.shopify.api_key = response.data[0].shopify_api_key;
                        $scope.shopify.password = response.data[0].shopify_password;
                        $scope.shopify.host = response.data[0].shopify_host;
                        $scope.shopify.store_name = response.data[0].shopify_store_name;
                    }
                    refreshShopifySettings();
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
     getShopifyDetails();
     $scope.shopifySchedularUpdate = (boolean, type, category) => {
        $scope.shopifyArray[category][type] = boolean;
        $http.put("/dash/shopify/settings/update/properties", $scope.shopifyArray)
            .then(response => {
                console.log(response.data);
            });
    }
    $scope.getShopifyCatalog = function(){
        startLoader();
        $http.get("/dash/shopify/pull/catalog")
            .success(function (response) {
                console.log("Shopify Catalog Updation initiated")
                console.log(response)
                stopLoader();
                if(response){
                    Settings.success_toast('SUCCESS', "Shopify Products will be synced in the background!")
                }
                else{
                    Settings.failurePopup('ERROR', "Products importing failed, Check the credentials and try again");
                }
            })
            .error(function (error){
                stopLoader();
                console.log(error);
                Settings.failurePopup('ERROR',"Products importing failed");
            })
    }
    $scope.getShopifyStores = function(){
        startLoader();
        $http.get("/dash/shopify/pull/customers")
            .success(function (response) {
                console.log("!!! Shopify Stores Updation Initiated");
                stopLoader();
                if(response){
                    Settings.success_toast('SUCCESS', "Shopify Stores will be synced in the background");
                }
                else{
                    Settings.failurePopup('ERROR',"Dealers importing failed, Check the credentials and try again");
                }
            })
            .error(function (error){
                stopLoader();
                console.log(error);
                Settings.failurePopup('ERROR', "Stores importing failed");
            })
    }
    $scope.getShopifyOrders = function(){
        startLoader();
        $http.get("/dash/shopify/pull/orders")
            .success(function (response) {
                console.log("Shopify Orders Updation initiated");
                stopLoader();
                if(response){
                    Settings.success_toast('SUCCESS',"Shopify Orders will be synced in the background");
                }
                else{
                    Settings.failurePopup('ERROR', "Orders importing failed, Check the credentials and try again");
                }
            })
            .error(function (error){
                stopLoader();
                console.log(error);
                Settings.failurePopup('ERROR',"Orders importing failed");
            })
    };
    $scope.deleteShopifyCreds = function(){
        if($scope.shopify.api_key!='' && $scope.shopify.password !='' && $scope.shopify.host !=''){
            Settings.confirmPopup("Confirm", "Are you sure to disconnect?", (result) => {
                if (result) {
                    startLoader();
                    $http.delete("/dash/shopify/creds/remove", $scope.shopify)
                        .then(response => {
                            stopLoader();
                            if(response.data){
                                $scope.shopify.api_key = '';
                                $scope.shopify.password = '';
                                $scope.shopify.host = '';
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
                }
            })
        }else{
            Settings.popupAlert("Enter all the shopify credentials")
        }
    };
 });