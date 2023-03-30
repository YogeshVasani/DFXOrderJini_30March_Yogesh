/**
 * Created by shreyasgombi on 05/07/22.
 */
 angular.module('ebs.controller')
.controller("FTPCtrl", ($scope, $routeParams, $http, $window, Settings) => {
    console.log("Hello From FTP Settings Controller .... !!!!");
    $scope.tenant = {};
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
    //.... Fetch all FTP tenants....
    const fetchFTPTenants = () => {
        startLoader();
        $http.get("/dash/tenants")
            .then(response => {
                stopLoader();
                console.log("GetAll Tenants-->");
                $scope.tenants = response.data;
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
    //.... Create a new tenant....
    $scope.createTenant = function(){
        console.log("Tenant Details --> ", $scope.tenant);
        if($scope.tenant.itemshost && $scope.tenant.itemsport){
            if ($scope.tenant && $scope.tenant._id)
            $scope.tenant._id = null;
            $http.post("/dash/tenants", $scope.tenant)
                .then((response) => {
                    console.log("Create -->" + response);
                    fetchFTPTenants();
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
        }else Settings.fail_toast("Error", "Enter the Host and Port address")
    };
    //.... Remove a tenant.....
    $scope.removeTenant = function(id) {
        $http.delete("/dash/tenants/" + id)
            .then((response) => {
                console.log("Delete -->" + response);
                fetchFTPTenants();
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
    //..... Choose a tenant....
    $scope.selectTenant = function(id) {
        $http.get("/dash/tenants/" + id)
            .then((response) => {
                console.log("Select -->" + response);
                $scope.tenant = response.data;
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
    //..... Update the tenant information.....
    $scope.updateTenant = function() {
        $http.put("/dash/tenants/" + $scope.tenant._id, $scope.tenant)
            .then((response) => {
                console.log("Update -->" + response);
                Settings.success_toast("Success", "FTP Details Updated!");
                fetchFTPTenants();
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
    $scope.downloadStorecsv = function(){
        $http.get("/dash/stores/ftp/refresh")
            .then(() => {
                console.log('Downloaded');
                Settings.popupAlert("Download Complete! Please refresh with F5.");
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
    $scope.downloadcsv = function(){
        //$http.get("/dash/items/download")
        $http.get("/dash/items/refresh")
            .then(() => {
                console.log('Downloaded');
                Settings.popupAlert("Download Complete! Please refresh with F5.");
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
    $scope.downloadSellerscsv = function(){
        //$http.get("/dash/items/download")
        $http.get("/dash/sellersrefresh")
            .then(() => {
                console.log('Downloaded');
                Settings.popupAlert("Download Complete! Please refresh with F5.");
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
    fetchFTPTenants();
});