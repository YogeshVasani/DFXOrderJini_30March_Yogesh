/**
 * Created by shreyasgombi on 05/03/20.
 */
angular.module('ebs.controller')
    .controller("UsersCtrl",function ($scope,$rootScope, $location, $http,Settings, $modal, $window, toastr, $interval,$sce,$mdDialog) {
        console.log("Hello From Users Controller .... !!!!");
        // User page declaration
        //.... TODO : Depecrate these as adding new users and editing should be moved to their own page + controller....
        $scope.userListPage = true ;
        $scope.userAddPage = false ;
        $scope.userEditPage = false ;
        ///.... User object....
        $scope.user = {};
        $scope.user.role = '';
        $scope.user.status = '';
        //..... All users....
        $scope.sellers = [];
        $scope.sellersMasterList = [];
        //.... Device details....
        $scope.devices = null;
        $scope.deviceStatus = false;
        //.... Search Object.....
        var sellerSearchObj = {};
        var searchObj = {};
        var sellerSearchBy = ['sellername','sellerphone','role','email','userStatus', 'appVersion','EMPLOYEE_ID','Resort'];
        //.... Pagination.....
        var initialUserViewBy = 60;
        $scope.viewLength = 0;
        $scope.newViewBy = 10;
        var viewBy = {};
        viewBy.sellers = 10;
        //..... Count.....
        $scope.allUserLength = 0;
        ///.... Search Filters.....
        $scope.userSearch = {};
        $scope.userSearch.filter = '';
        $scope.userSearch.filterBy = '';
        $scope.userSearch.rolefilter = 'allUsers';
        //.... Roles.....
        $scope.userRoles = {};
        $scope.userRoles.Roles = true;
        //..... Selected role....
        $scope.userSelectedRole = true;
        $scope.disableFlag = false;
        //.... Editing of the user.....
        $scope.edit = {};
        $scope.seller = {};
        $scope.editSeller = {};
        //.... User Names....
        $scope.sellerNames = [];
        $scope.roleSalesrep = [];
        $scope.locSeller = [];
        $scope.roleAdmin = [];
        $scope.roleStockist = [];
        $scope.roleDealerPortalApp = [];
        $scope.roleManager = [];
        //.... TODO : Deprecate these as they will be moved to their own screens under Editing and Adding....
        $scope.countryCode = [];
        $scope.default_CountryCode = '+91';
        $scope.filter = {};
        $scope.applicationType ='';
        var OneSignal = window.OneSignal || [];
        var a = 0;
        var presentNumber;
        $scope.appTabs = [];
        $scope.appTabs = ["New Order","Order History","Catalog","Leave Management","Chat","Inventory","Task Management","New Payment","New Meeting","Payment History","Meeting History","Visit History","Expense History"];
        Settings.getNav(false, nav => {
            $scope.nav = nav;
            $scope.newNav = nav;
            $scope.userRole = $scope.nav[4].roles;
        });
        $scope.warehouseLocation = Settings.getInstanceDetails('inventoryLocation');
        var instanceDetails =  Settings.getInstance();
        $scope.coID = instanceDetails.coID;
        $scope.applicationType = instanceDetails.applicationType;
        $scope.default_CountryCode = instanceDetails.countryCode;
        $scope.dealerAsUserFlag = instanceDetails.dealerAsUserFlag || false;
        $('html, body').animate({scrollTop: '0px'}, 0);
        //... Start a loader....
        const startLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "inline");
        }
        const stopLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "none");
        }
        //.... TODO : Deprecate this as we have separate screens for Adding and Removing users.....
        $scope.countryCodeGet = () => {
            $http.get("/country/countryCode")
                .then(res => {
                    if(res){
                        $scope.countryCode = res;
                    }else{
                        $scope.countryCode = {"0" : {"name":"India","dial_code":"+91","code":"IN","currency":"₹"}};
                    }
                })
        };
        $scope.countryCodeGet();
        //.... Salesperson Refresh for fetching user names....
        $scope.refreshSellerNames = function(){
            if(typeof $scope.roleSalesrep == 'object'){
                for(let i = 0; i < $scope.roleSalesrep.length; i++){
                    if($scope.roleSalesrep[i].userStatus == 'Active' || $scope.roleSalesrep[i].role != '')
                        $scope.sellerNames[$scope.roleSalesrep[i].sellerphone] = $scope.roleSalesrep[i].sellername;
                }
            }
            if($scope.roleManager.length){
                for(let i = 0; i < $scope.roleManager.length; i++){
                    if($scope.roleManager[i].userStatus == 'Active' || $scope.roleManager[i].role != '')
                        $scope.sellerNames[$scope.roleManager[i].sellerphone] = $scope.roleManager[i].sellername;
                }
            }
        }
        //..... Call all Salespersons.... (Not sure why we have this function, might need to be deprecated.....)
        $http.get("/dash/role/sellers/Salesperson")
            .then(salesperson => {
                if(salesperson.data && salesperson.data.length){
                    $scope.roleSalesrep = [];
                    for(var i = 0; i < salesperson.data.length; i++){
                        $scope.roleSalesrep.push({sellername : salesperson.data[i].sellername, sellerphone : salesperson.data[i].sellerphone});
                    }
                    $scope.salespersonLength = $scope.roleSalesrep.length;
                    $scope.refreshSellerNames();
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
        /*--- Check the phone no is valid or not---*/
        $scope.isPhoneNo = function (data) {
            var x = Number.parseInt(data);
            if(data){
                if (data.toString().length >= 10) {
                    if (Number.isInteger(x) && ((x.toString().length >= 10)) && (data.toString().length >= 10))
                        return true;
                    else
                        return false;
                }
                return false;
            }
            return false;
        };
        // ..... Render Users....
        $scope.renderSellers = response => {
            console.log("Get All Users --> " + response.length);
            $scope.activeUsers = [];
            for(let i = 0; i < response.length; i++)
                $scope.sellers.push(response[i]);
            stopLoader();
            //Manager list
            $http.get("/dash/userManagers")
                .success(function (response) {
                    console.log("All Users Managers--------->>>" + response.length);
                    $scope.roleManager = response;
                    $scope.refreshSellerNames();
                });
        };
        const loadUsers = sellerSearchObj => {
            startLoader();
            $http.post("/dash/users/list", sellerSearchObj)
                .success($scope.renderSellers)
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
        const loadUsersCount = sellerSearchObj => {
            $http.post("/dash/users/count", sellerSearchObj)
                .success($scope.transactionCount)
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
        $scope.renderPortal = () => {
            // $http.get("/dash/devices")
            //     .success($scope.renderDevices);
            sellerSearchObj.viewLength = 0;
            sellerSearchObj.viewBy = initialUserViewBy;
            sellerSearchObj.searchFor = '';
            sellerSearchObj.searchBy = [];
            //.... To be removed....
            sellerSearchObj.userLoginDetails = $scope.user;
            if($scope.applicationType == 'Atmosphere' && $scope.user.sellerObject) {
                sellerSearchObj.resort = $scope.user.sellerObject.Resort;
            }
            loadUsers(sellerSearchObj);
            loadUsersCount(sellerSearchObj);
            $http.get("/dash/role/sellers/Salesperson")
                .success(function (salesperson) {
                    //console.log("Salesperson : ", salesperson);
                    if(salesperson && salesperson.length){
                        $scope.roleSalesrep = [];
                        for(var i = 0; i < salesperson.length; i++){
                            $scope.roleSalesrep.push({sellername : salesperson[i].sellername, sellerphone : salesperson[i].sellerphone});
                            //$scope.fulfillerNames[fulfillers[i].sellerphone] = fulfillers[i].sellername;
                        }
                        $scope.salespersonLength = $scope.roleSalesrep.length;
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
        $scope.transactionCount = response => {
            // Sellers Total Count
            if(response){
                if(response > $scope.newViewBy){
                    $scope.sellers_count = response;
                    $scope.viewLength = 0;
                }
                else if(response <= $scope.newViewBy){
                    $scope.sellers_count = response;
                    $scope.newViewBy = response;
                    $scope.viewLength = 0;
                }
                else{
                    $scope.sellers = [];
                    $scope.newViewBy = 1;
                    $scope.sellers_count = 0;
                    $scope.viewLength = -1;
                }
            }
            else{
                $scope.sellers = [];
                $scope.newViewBy = 1;
                $scope.sellers_count = 0;
                $scope.viewLength = -1;
            }
        };
        const loadOneSignal = appId => {
            OneSignal.push(function () {
                OneSignal.init({
                    appId : appId || "52fc93cf-00e5-4f13-be71-eabeed41d6e6",
                    autoRegister: false,
                    notifyButton: {
                        enable: true
                    }
                });
                OneSignal.getUserId(function (userId) {
                    console.log("OneSignal User ID : ", userId);
                    if (userId) {
                        var onesignal_player = {};
                        onesignal_player.player_id = userId;
                        onesignal_player.app_id = onesignal_app_id;
                        $scope.user.onesignal_player_id = userId;
                        $http.post("/dash/settings/onesignal/portal", onesignal_player);
                    }
                });
            });
        }
        const checkRoleAccessLevel = () => {
            $http.get("/dash/user/role/access")
                .then(res => {
                    var onesignal_app_id = '';
                    if(res.data.role){
                        $scope.user = res.data;
                        if(res.data.onesignal_app_id) onesignal_app_id = res.data.onesignal_app_id;
                        if($scope.user.role != 'Portal Access'){
                            $scope.renderPortal();
                        }
                    }else $scope.renderPortal();
                    /*....
                    OneSignal Desktop Notification Enabling....
                    ..... */
                    //.... This will be enabled based on the project...
                    loadOneSignal(onesignal_app_id);
                    // ....... Submit NC goals on refresh for atmosphere.......
                    if(($scope.coID == 'ATMS' || $scope.coID == 'ATOM')) {
                        $scope.distinctperformance=[];
                        $http.get("/dash/performance/distinctPerformanceId")
                            .success(function(response){
                                if(response){
                                    // console.log("Distinct response")
                                    $scope.distinctperformance=response;
                                    // console.log($scope.distinctperformance)
                                }
                            })
                        $http.get("/dash/atms/members/nc")
                            .success(function(nc){
                                console.log('----- nc -----' + nc)
                                if(!nc){
                                    $scope.submitNcGoals();
                                    $http.put("/dash/atms/update/members/nc/"+true)
                                        .success(function(data){
                                            // console.log(data)
                                        })
                                }
                            })
                    }
                });
        };
        checkRoleAccessLevel();
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
        };
        $scope.getRoleName = role => {
            let temp = '';
            if(role){
                temp = role;
                if($scope.userRole && $scope.userRole.length){
                    for (let i = 0 ; i < $scope.userRole.length; i++){
                        if($scope.userRole[i].role.toUpperCase() == role.toUpperCase()){
                            temp = $scope.userRole[i].name;
                            break;
                        }
                    }
                }
            }
            return temp;
        };
        $scope.changeUserButton = function (flag) {
            if (flag == 0) {
                $scope.userListPage = true ;
                $scope.userAddPage = false ;
                $scope.userEditPage = false ;
            }
            else if (flag == 1){
                $scope.userListPage = false ;
                $scope.userAddPage = true ;
                $scope.disableFlag = false;
                $scope.seller = {};
                $scope.seller.countryCode = $scope.default_CountryCode;
                $('#new-user-picture').val('');
                $('#profilePicturePreview').attr('src', '');
            }
            else if (flag == 2){
                $scope.userListPage = false ;
                $scope.userEditPage = true ;
                $('#edit-user-picture').val('');
                $('#editUserPreview').attr('src', '');
            }
        };
        $scope.viewDeviceDetails = function (id) {
            $http.get("/dash/devices/views/"+id)
                .success( function(response) {
                    // console.log(response);
                    $scope.deviceDetails = response;
                    if (!response) {
                        $scope.deviceStatus = false;
                    }
                    else {
                        $scope.deviceStatus = true;
                    }
                });
        };
        var existingPhoneNumber = '';
        var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
        var checkForSpecialChar = function(string){
            for(i = 0; i < specialChars.length;i++){
                if(string.indexOf(specialChars[i]) > -1){
                    return true
                }
            }
            return false;
        }
        $scope.selectSeller = function(id){
           $scope.editSeller = {};
           $scope.edit = {};
           $rootScope.currentId = id;
            // console.log($scope.sellerDetails.id);  
            console.log("User ID : " + id);
            $http.get("/dash/sellers/" + id)
                .success( function(response) {
                    existingPhoneNumber = angular.copy(response.sellerphone);
                    if(response.countryCode){
                        var sellerphoneNo = (""+response.sellerphone).split("");
                        if(response.countryCode == '+91'){
                            if(sellerphoneNo.length > 10){
                                // var sellerphoneNo = (""+response.sellerphone).split("");
                                var phoneNo = sellerphoneNo.splice(response.countryCode.length -1);
                                response.sellerphone = phoneNo.join("");
                                console.log(response);
                            }
                        }
                        else if(response.countryCode == '91'){
                            if(sellerphoneNo.length > 10){
                                // var sellerphoneNo = (""+response.sellerphone).split("");
                                var phoneNo = sellerphoneNo.splice(response.countryCode.length);
                                response.sellerphone = phoneNo.join("");
                                console.log(response);
                            }
                        }else{
                            if(checkForSpecialChar(response.countryCode)){
                                var phoneNo = sellerphoneNo.splice(response.countryCode.length -1);
                                response.sellerphone = phoneNo.join("");
                            } else {
                                var phoneNo = sellerphoneNo.splice(response.countryCode.length);
                                response.sellerphone = phoneNo.join("");
                            }
                            // var sellerphoneNo = (""+response.sellerphone).split("");
                        }
                    }else{
                        response.countryCode = '+91'
                    }
                    $scope.sellerDetails = response;
                    // $scope.seller = response;
                    /*       if($scope.seller.Manager_Name){
                               $scope.ATMSmanagers.tempManager = $scope.seller.Manager_Name;
                           }
                           console.log($scope.ATMSmanagers.tempManager);*/
                    oldUser = response;
                    // if($scope.sellerDetails.managerid){
                    //    $scope.managerName = $scope.getSellerName($scope.sellerDetails.managerid);
                    // }
                    // else
                    //     $scope.managerName = "Not Assigned";
                    $scope.userDevice = $scope.viewDeviceDetails($scope.sellerDetails.sellerphone);
                    // jQuery.noConflict();
                    // $('#userDetails').modal('show');
                });
        };
        $scope.getSellerName = function(sellerNo,tag){
            // console.log('SellerNumber',sellerNo,'Tag',tag)
            /*---DynamicProgramming---*/
            /*---objects doesnt have length ---*/
            if(sellerNo){
                if(Object.keys($scope.sellerNames).length==0){
                    //console.log('Seller name array is empty and being initialized')
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
        $scope.navPage = direction => {
            var viewLength = $scope.viewLength;
            var viewBy = $scope.newViewBy;
            if(direction){
                //  console.log("NEXT");
                if(viewLength + viewBy >= $scope.sellers.length){
                    if(viewLength + viewBy < $scope.sellers_count){
                        viewLength += viewBy;
                        sellerSearchObj.viewLength = viewLength;
                        sellerSearchObj.viewBy = initialUserViewBy;
                        sellerSearchObj.userLoginDetails = $scope.user;
                        if($scope.applicationType == 'Atmosphere'){
                            if($scope.user.sellerObject)
                                sellerSearchObj.resort = $scope.user.sellerObject.Resort;
                        }
                        sellerSearchObj.searchFor = $scope.userSearch.filter;
                        sellerSearchObj.statusFilter = $scope.statusFilter;
                        sellerSearchObj.searchBy = sellerSearchBy;
                        loadUsers(sellerSearchObj);
                        if(viewLength + viewBy > $scope.sellers_count){
                            a = viewLength + viewBy - $scope.sellers_count;
                            viewBy -= a;
                            $scope.newViewBy = viewBy;
                        }
                        $scope.viewLength = viewLength;
                    }
                    else{
                        //  console.log("Out of data")
                        if(viewLength + viewBy > $scope.sellers_count){
                            a = viewLength + viewBy - $scope.sellers_count;
                            viewBy -= a;
                            $scope.newViewBy = viewBy;
                        }
                    }
                }
                else{
                    //  console.log("Minus viewby")
                    viewLength += viewBy;
                    if(viewLength + viewBy > $scope.sellers_count){
                        a = viewLength + viewBy - $scope.sellers_count;
                        viewBy -= a;
                    }
                    $scope.newViewBy = viewBy;
                    $scope.viewLength = viewLength;
                }
            }
            else{
                //   console.log("BACK");
                if(viewLength < viewBy){
                    //      console.log("NO DATA")
                }
                else{
                    if(viewLength + viewBy >= $scope.sellers_count){
                        viewBy += a;
                        a = 0;
                    }
                    viewLength -= viewBy;
                    $scope.viewLength = viewLength;
                    $scope.newViewBy = viewBy;
                }
            }
        };
        $scope.clearFilter = () => {
            var sellerSearchObj = {};
            sellerSearchObj.viewLength = 0;
            sellerSearchObj.viewBy = initialUserViewBy;
            sellerSearchObj.searchFor = '';
            sellerSearchObj.searchBy = [];
            sellerSearchObj.userLoginDetails = $scope.user;
            if($scope.applicationType == 'Atmosphere' && $scope.user.sellerObject) {
                sellerSearchObj.resort = $scope.user.sellerObject.Resort;
            }
            $scope.viewLength = 0;
            $scope.newViewBy = viewBy.sellers;
            $scope.userSearch.filter = '';
            $scope.sellers = [];
            loadUsers(sellerSearchObj);
            loadUsersCount(sellerSearchObj);
            $scope.userFilterStatus = 'allUsers';
            $scope.userSearch.filter = '';
            $scope.statusFilter = '';
            $scope.userRoles.Roles = true;
            for(var i = 0 ;i < $scope.userRole.length; i++){
                $scope.userRole[i].status = true;
            }
            $scope.showSellerFilter = false;
        };
        $scope.removeSeller = function(id, number){
            /*
             Bootbox change for atmosphere
             */
            if($scope.applicationType == 'Atmosphere'){
//                bootbox.confirm("Deleting the user will delete all the goals for "+ $scope.sellerDetails.sellername +". Are you sure, you want to delete the user ?", function(result){
                Settings.confirmPopup("Confirm", "Deleting the user will delete all the goals for "+ $scope.sellerDetails.sellername +" ?",function (result) {
                    if(result) {
                        $http.delete("/dash/sellers/" + id)
                            .success(function (response) {
                                //console.log(response)
                                if($scope.seller.userStatus) {
                                    if($scope.seller.userStatus == "Deleted") {
                                        $scope.seller.userStatus = "Deleted";
                                        $scope.seller.showOperations = false;
                                    }
                                }
                                $scope.clearFilter();
                                Settings.success_toast('Success','User '+$scope.sellerDetails.sellername +' deleted successfully');
                                $scope.changeUserButton(0);
                            });
                    }
                    else {
                        console.log("Seller deletion cancelled")
                    }
                });
            }
            else{
                Settings.confirmPopup("Confirm","Are you sure, you want to delete user "+ $scope.sellerDetails.sellername +" ?",function (result) {
                    if(result) {
                        $http.delete("/dash/sellers/" + id)
                            .success(function (response) {
                                //console.log(response)
                                if($scope.seller.userStatus) {
                                    if($scope.seller.userStatus == "Deleted") {
                                        $scope.seller.userStatus = "Deleted";
                                        $scope.seller.showOperations = false;
                                    }
                                }
                                $scope.clearFilter();
                                Settings.success_toast('Success','User '+$scope.sellerDetails.sellername +' deleted successfully');
                                $scope.changeUserButton(0);
                                // toastr.success('User '+$scope.seller.sellername +' deleted successfully')
                                // jQuery.noConflict();
                                // $('#myModalAddUser').modal('hide');
                                // $("#userDeleteSuccess").fadeIn(1000,function(){
                                //     $("#userDeleteSuccess").fadeOut(3000);
                                // })
                            });
                    }
                    else {
                        console.log("Seller deletion cancelled")
                    }
                })
            }
        };
        $scope.generateOTP = function(id){
            Settings.confirmPopup("Confirm","Are you sure, you want to send OTP to user "+ $scope.seller.sellername +" ?",function (result) {
                console.log(result)
                if(result) {
                    console.log(id)
                    $http.get("/dash/sellers/OTP/" + id)
                        .success( function(response) {
                            Settings.success_toast('Success','OTP Successfully Sent');
                            console.log("Select -->" + response);
                            // $scope.all();
                        });
                }
                else {
                    console.log("OTP Cancelled")
                }
            })
        };
        $scope.sellerSearchFilter = function(filter) {
            searchObj.viewLength = 0;
            searchObj.viewBy = initialUserViewBy;
            $scope.viewLength = 0;
            $scope.newViewBy = viewBy.sellers;
            //.... Atmosphere.....
            searchObj.userLoginDetails = $scope.user;
            $scope.statusFilter = filter || '';
            searchObj.statusFilter = filter || '';
            if ($scope.userSearch.filter) {
                searchObj.searchFor = $scope.userSearch.filter;
                searchObj.searchBy = sellerSearchBy;
            }else{
                searchObj.searchFor = '';
            }
            $scope.sellers = [];
            if($scope.applicationType == 'Atmosphere' && $scope.user.sellerObject) {
                searchObj.resort = $scope.user.sellerObject.Resort;
            }
            loadUsers(searchObj);
            loadUsersCount(searchObj);
            $scope.userRoles.Roles = true;
            for(var i = 0 ;i < $scope.userRole.length; i++){
                $scope.userRole[i].status = true;
            }
            $scope.showSellerFilter = true;
        };
        $scope.clearFilterButton = function (search,tab) {
            if (search === '') {
                searchObj.viewLength = 0;
                searchObj.viewBy = initialUserViewBy;
                searchObj.filter = '';
                searchObj.searchFor = [];
                searchObj.searchBy = [];
                searchObj.userLoginDetails = $scope.user ;
                if($scope.applicationType == 'Atmosphere' && $scope.user.sellerObject) {
                    searchObj.resort = $scope.user.sellerObject.Resort;
                }
                $scope.viewLength = 0;
                $scope.newViewBy = viewBy.sellers;
                $scope.userSearch.filter = '';
                $scope.sellers = [];
                loadUsers(searchObj);
                loadUsersCount(searchObj);
                $scope.userSearch.filter = '';
                $scope.showSellerFilter = false;
                $scope.userFilterStatus = 'allUsers';
            }
        };
        $scope.lastFunc = function (id) {
            if(id == "add-user") {
                // document.getElementById("addUpdateButton").innerHTML = "Add";
                $scope.createSeller();
                // $('#myModalAddUser').modal({'show':false});
                // alert("entry");
            }
            else if(id == "update-user") {
                // document.getElementById("addUpdateButton").innerHTML = "Update";
                $scope.updateSeller();
            }
        };
        $scope.goToUserDetails = id => $location.path("/user/details/" + id);
        $scope.createSeller = function() {
            var p_tabs = [];
            var app_tabs = [];
            var tabs = {};
            $scope.disableFlag = true;
            if($scope.seller.p_tabs){
                for(var i=0; i < $scope.newNav.length; i++) {
                    if ($scope.seller.p_tabs[i]) {
                        if ($scope.seller.p_tabs[i].active) {
                            tabs[i] = {
                                "tab": $scope.newNav[i].tab,
                                "active": true
                            }
                            p_tabs[i] = tabs[i];
                        } else {
                            tabs[i] = {
                                "tab": $scope.newNav[i].tab,
                                "active": false
                            }
                            p_tabs[i] = tabs[i];
                        }
                    } else {
                        tabs[i] = {
                            "tab": $scope.newNav[i].tab,
                            "active": false
                        }
                        p_tabs[i] = tabs[i];
                    }
                }
                $scope.seller.p_tabs = p_tabs;
            }else{
                for(var i=0; i < $scope.newNav.length; i++) {
                    tabs[i] = {
                        "tab": $scope.newNav[i].tab,
                        "active": false
                    }
                    p_tabs[i] = tabs[i];
                }
                $scope.seller.p_tabs = p_tabs;
            }
            if($scope.seller.app_tabs){
                for(var i=0; i < $scope.appTabs.length; i++){
                    if($scope.seller.app_tabs[i]){
                        if($scope.seller.app_tabs[i].active){
                            tabs[i] = {
                                "tab" : $scope.appTabs[i],
                                "active" : true
                            }
                            app_tabs[i] = (tabs[i]);
                        }else{
                            tabs[i] = {
                                "tab" : $scope.appTabs[i],
                                "active" : false
                            }
                            app_tabs[i] = (tabs[i]);
                        }
                    }else{
                        tabs[i] = {
                            "tab" : $scope.appTabs[i],
                            "active" : false
                        }
                        app_tabs[i] = (tabs[i]);
                    }
                }
                $scope.seller.app_tabs = app_tabs;
            }else{
                for(var i=0; i < $scope.appTabs.length; i++){
                    tabs[i] = {
                        "tab" : $scope.appTabs[i],
                        "active" : false
                    }
                    app_tabs[i] = (tabs[i]);
                }
                $scope.seller.app_tabs = app_tabs;
            }
            $scope.seller.userStatus = "Active";
            $scope.seller.showOperations = true;
            $scope.seller.emailOtp = true;
            $scope.seller.salesrep = false;
            $scope.seller.admin = false;
            $scope.seller.stockist = false;
            $scope.seller.fulfiller = false;
            $scope.seller.manager = false;
            $scope.seller.dealer = false;
            $scope.seller.branchManager = false;
            $scope.seller.portal_role = false;
            $scope.seller.portal = true;
            $scope.seller.location = $scope.seller.location ? $scope.seller.location : '';
            // $scope.seller.managerName = $scope.getSellerName($scope.seller.managerid);
            if(!$scope.seller.managerName && $scope.applicationType == 'B2BOMS'){
                if($scope.roleManager.length){
                    for(var i=0 ; i< $scope.roleManager.length;i++){
                        if($scope.roleManager[i].sellerphone == $scope.seller.managerid){
                            $scope.seller.managerName = $scope.roleManager[i].sellername;
                        }
                    }
                }
            }
            if($scope.applicationType == 'Atmosphere') $scope.seller.managerid = Number($scope.seller.managerid);
            var date1 = new Date();
            $scope.seller.date_added = [date1.getFullYear(),(date1.getMonth()+1).padLeft(), date1.getDate().padLeft() ].join('-') + ' '
                + [date1.getHours().padLeft(), date1.getMinutes().padLeft(), date1.getSeconds().padLeft()].join (':');
            if ($scope.seller.role == "Salesperson") {
                $scope.seller.salesrep = true;
            }
            else if ($scope.seller.role == "Admin") {
                $scope.seller.admin = true;
            }
            else if ($scope.seller.role == "Stockist") {
                $scope.seller.stockist = true;
            }
            else if ($scope.seller.role == "Fulfiller") {
                $scope.seller.fulfiller = true;
            }
            else if ($scope.seller.role == "Manager") {
                $scope.seller.manager = true;
            }
            else if ($scope.seller.role == "Dealer") {
                $scope.seller.dealer = true;
            }
            else if ($scope.seller.role == "BranchManager") {
                $scope.seller.branchManager = true;
            }
            else if ($scope.seller.role == "Portal") {
                $scope.seller.portal_role = true;
            }
            else{
                /*
                 Changes for atmosphere ; Author : Aditi!
                 */
                for(var i=0;i<$scope.userRole.length;i++){
                    if($scope.seller.role == $scope.userRole[i].name){
                        $scope.seller.user_role = $scope.userRole[i].role;
                        if($scope.seller.user_role == 'Manager'){
                            $scope.seller.manager = true;
                        }
                    }
                }
            }
            if ($scope.seller && $scope.seller._id != null)
                $scope.seller._id = null;
            if(!$scope.seller.sellername) {
                $scope.disableFlag = false;
                document.getElementById('submitbutton').disabled = false;
                Settings.alertPopup('Error',"Please enter your name");
                return false;
            }
            else if (!$scope.seller.countryCode && !$scope.isPhoneNo($scope.seller.sellerphone)) {
                $scope.disableFlag = false;
                document.getElementById('submitbutton').disabled = false;
                Settings.alertPopup('Error',"Please enter a valid phone number");
                return false;
            }
            else if (!$scope.seller.sellerphone) {
                $scope.disableFlag = false;
                document.getElementById('submitbutton').disabled = false;
                Settings.alertPopup('Error',"Please enter a phone number");
                return false;
            }
            else if (!$scope.seller.email) {
                $scope.disableFlag = false;
                Settings.alertPopup('Error',"Please enter a mail id");
                return false;
            }
            else if (!$scope.seller.role) {
                $scope.disableFlag = false;
                document.getElementById('submitbutton').disabled = false;
                Settings.alertPopup('Error',"Please select any role");
                return false;
            }
            else {
                $scope.seller.leave = [
                    {
                        "type" : "casual",
                        "balance" : 0,
                        "consumed" : 0
                    },
                    {
                        "type" : "paid",
                        "balance" : 0,
                        "consumed" : 0
                    },
                    {
                        "type" : "compensatory",
                        "balance" : 0,
                        "consumed" : 0
                    },
                    {
                        "type" : "sick",
                        "balance" : 0,
                        "consumed" : 0
                    },
                    {
                        "type" : "maternity",
                        "balance" : 0,
                        "consumed" : 0
                    },
                    {
                        "type" : "paternity",
                        "balance" : 0,
                        "consumed" : 0
                    },
                    {
                        "type" : "emergency",
                        "balance" : 0,
                        "consumed" : 0
                    },
                    {
                        "type" : "marriage",
                        "balance" : 0,
                        "consumed" : 0
                    },
                    {
                        "type" : "bereavement",
                        "balance" : 0,
                        "consumed" : 0
                    }
                ];
                if(!$scope.seller.countryCode)
                    $scope.seller.countryCode = "";
                else if($scope.seller.countryCode == '+91'){
                    $scope.seller.sellerphone = $scope.seller.sellerphone;
                }else{
                    $scope.seller.sellerphone = $scope.seller.countryCode + $scope.seller.sellerphone;
                }
                $http.get("/dash/getsellerDetails/" + $scope.seller.sellerphone)
                    .success(function (response) {
                        //console.log(response)
                        $scope.sellers1 = response;
                        // $scope.sellers1 = response;
                        if(!response) {
                            $scope.seller.sellerid = $scope.seller.sellerphone;
                            jQuery.noConflict();
                            $('.refresh').css("display", "inline");
                            $http.post("/dash/sellers", $scope.seller)
                                .success(function (response) {
                                    console.log("Create -->" + response);
                                    $scope.refreshSellerNames();
                                    $scope.sellers.push($scope.seller);
                                    Settings.successPopup('Success','User '+ $scope.seller.sellername +' added successfully as '+ $scope.seller.role);
                                    var image = document.getElementById('new-user-picture').files;
                                    if (image.length) {
                                        if ((image[0].size / 1024) <= 200) {
                                            console.log("image")
                                            var reader = new FileReader();
                                            reader.onloadend = function () {
                                                var tempObj = {};
                                                tempObj.image = reader.result;
                                                tempObj.seller = $scope.seller.sellerphone;
                                                console.log(tempObj)
                                                $http.put("/dash/upload/user/image", tempObj)
                                                    .success(function (res) {
                                                        console.log(res);
                                                        if (res) {
                                                            $scope.clearFilter();
                                                            console.log("image uploaded successfully")
                                                        } else {
                                                            $scope.clearFilter();
                                                            console.log("image uploaded failed");
                                                            jQuery.noConflict()
                                                            $('.refresh').css("display", "none");
                                                        }
                                                    })
                                            }
                                            reader.readAsDataURL(image[0]);
                                        }
                                    }
                                    else{
                                        $scope.clearFilter();
                                    }
                                    $scope.userAddPage = false;
                                    // jQuery.noConflict();
                                    // $('#myModalAddUser').modal('hide');
                                    //
                                    // $("#userAddSuccess").fadeIn(1000, function () {
                                    //     $("#userAddSuccess").fadeOut(3000);
                                    // })
                                });
                        }
                        else {
                            if ($scope.sellers1.userStatus == 'Active') {
                                $scope.disableFlag = false;
                                document.getElementById('submitbutton').disabled = false;
                                Settings.alertPopup('Error',"User phone number: " + $scope.sellers1.sellerphone + " already exists for " + $scope.sellers1.sellername);
                                // bootbox.alert({
                                //     title : 'ERROR',
                                //     message : "User phone number: " + $scope.sellers1.sellerphone + " already exists for " + $scope.sellers1.sellername,
                                //     className : 'text-center'
                                // });
                            }
                            else if ($scope.sellers1.userStatus == 'Deleted') {
                                document.getElementById('submitbutton').disabled = false;
                                $scope.disableFlag = false;
                                $scope.enableUsers();
                                // jQuery.noConflict();
                            }
                        }
                    });
            }
        };
        $scope.updateSeller = function(){
            var p_tabs = [];
            var app_tabs = [];
            var tabs = {};
            $scope.seller = $scope.editSeller ;
            // console.log($scope.seller)
            $scope.seller.oldPhoneNumber = existingPhoneNumber;
            $scope.seller.dealerAsUserFlag = $scope.dealerAsUserFlag;
            if($scope.seller.p_tabs){
                for(var i = 0; i < $scope.newNav.length; i++) {
                    if ($scope.seller.p_tabs[i]) {
                        if ($scope.seller.p_tabs[i].active) {
                            tabs[i] = {
                                "tab": $scope.newNav[i].tab,
                                "active": true
                            }
                            p_tabs[i] = tabs[i];
                        } else {
                            tabs[i] = {
                                "tab": $scope.newNav[i].tab,
                                "active": false
                            }
                            p_tabs[i] = tabs[i];
                        }
                    } else {
                        tabs[i] = {
                            "tab": $scope.newNav[i].tab,
                            "active": false
                        }
                        p_tabs[i] = tabs[i];
                    }
                }
                $scope.seller.p_tabs = p_tabs;
            }else{
                for(var i=0; i < $scope.newNav.length; i++) {
                    tabs[i] = {
                        "tab": $scope.newNav[i].tab,
                        "active": false
                    }
                    p_tabs[i] = tabs[i];
                }
                $scope.seller.p_tabs = p_tabs;
            }
            if($scope.seller.app_tabs){
                for(var i=0; i < $scope.appTabs.length; i++){
                    if($scope.seller.app_tabs[i]){
                        if($scope.seller.app_tabs[i].active){
                            tabs[i] = {
                                "tab" : $scope.appTabs[i],
                                "active" : true
                            }
                            app_tabs[i] = (tabs[i]);
                        }else{
                            tabs[i] = {
                                "tab" : $scope.appTabs[i],
                                "active" : false
                            }
                            app_tabs[i] = (tabs[i]);
                        }
                    }else{
                        tabs[i] = {
                            "tab" : $scope.appTabs[i],
                            "active" : false
                        }
                        app_tabs[i] = (tabs[i]);
                    }
                }
                $scope.seller.app_tabs = app_tabs;
            }else{
                for(var i=0; i < $scope.appTabs.length; i++){
                    tabs[i] = {
                        "tab" : $scope.appTabs[i],
                        "active" : false
                    }
                    app_tabs[i] = (tabs[i]);
                }
                $scope.seller.app_tabs = app_tabs;
            }
            $scope.seller.emailOtp = true;
            $scope.seller.salesrep = false;
            $scope.seller.admin = false;
            $scope.seller.stockist = false;
            $scope.seller.fulfiller = false;
            $scope.seller.manager = false;
            $scope.seller.dealer = false;
            $scope.seller.branchManager = false;
            $scope.seller.portal_role = false;
            $scope.seller.location = $scope.seller.inventoryLocation ? $scope.seller.inventoryLocation : '';
            $scope.seller.userStatus = 'Active';
            // $scope.seller.managerName = $scope.getSellerName($scope.seller.managerid,'goals');
            if(!$scope.seller.managerName && $scope.applicationType == 'B2BOMS'){
                if($scope.roleManager.length){
                    for(var i=0 ; i< $scope.roleManager.length;i++){
                        if($scope.roleManager[i].sellerphone == $scope.seller.managerid){
                            $scope.seller.managerName = $scope.roleManager[i].sellername;
                        }
                    }
                }
            }
            var date1 = new Date();
            $scope.seller.last_updated = [date1.getFullYear(),(date1.getMonth()+1).padLeft(), date1.getDate().padLeft() ].join('-') + ' '
                + [date1.getHours().padLeft(), date1.getMinutes().padLeft(), date1.getSeconds().padLeft()].join (':');
            if ($scope.seller.role == "Salesperson") {
                $scope.seller.salesrep = true;
            }
            else if ($scope.seller.role == "Admin") {
                $scope.seller.admin = true;
            }
            else if ($scope.seller.role == "Stockist") {
                $scope.seller.stockist = true;
            }
            else if ($scope.seller.role == "Fulfiller") {
                $scope.seller.fulfiller = true;
            }
            else if ($scope.seller.role == "Manager") {
                $scope.seller.manager = true;
            }
            else if ($scope.seller.role == "Dealer") {
                $scope.seller.dealer = true;
            }
            else if ($scope.seller.role == "BranchManager")
                $scope.seller.branchManager = true;
            else if ($scope.seller.role == "Portal")
                $scope.seller.portal_role = true;
            else{
                /*
                 Changes for atmosphere ; Author : Aditi!
                 */
                for(var i=0;i<$scope.userRole.length;i++){
                    if($scope.seller.role == $scope.userRole[i].name){
                        $scope.seller.user_role = $scope.userRole[i].role;
                        if($scope.seller.user_role == 'Manager'){
                            $scope.seller.manager = true;
                        }
                    }
                }
            }
            if(!$scope.seller.sellername) {
                Settings.alertPopup('Error',"Please enter your name");
                return false;
            }
            else if (!$scope.seller.countryCode && !$scope.isPhoneNo($scope.seller.sellerphone)) {
                Settings.alertPopup('Error',"Please enter a valid phone number");
                return false;
            }
            else if (!$scope.seller.sellerphone) {
                Settings.alertPopup('Error',"Please enter a phone number");
                return false;
            }
            else if (!$scope.seller.email) {
                Settings.alertPopup('Error',"Please enter a mail id");
                return false;
            }
            else if (!$scope.seller.role) {
                Settings.alertPopup('Error',"Please select any role");
                return false;
            }
            else {
                if(!$scope.seller.countryCode)
                {
                    $scope.seller.countryCode = "";
                }
                else if($scope.seller.countryCode == '+91'){
                    $scope.seller.sellerphone = $scope.seller.sellerphone;
                }
                else{
                    $scope.seller.sellerphone = $scope.seller.countryCode + $scope.seller.sellerphone;
                }
                // console.log($scope.seller)
                var checkSellerPhone = 0;
                checkSellerPhone = $scope.seller.sellerphone;
                jQuery.noConflict();
                $('.refresh').css("display", "inline");
                $http.get("/dash/getsellerDetails/" + checkSellerPhone)
                    .success(function (response) {
                        // console.log(response);
                        $scope.sellers1 = response;
                        // alert($scope.sellers1.sellerphone)
                        if(response == null || presentNumber == $scope.seller.sellerphone) {
                            $scope.seller.sellerphone = Number(checkSellerPhone);
                            $scope.seller.sellerid = Number($scope.seller.sellerphone);
                            $http.put("/dash/sellers/" + $scope.seller._id, $scope.seller)
                                .success(function (response) {
                                    console.log("Update -->", response);
                                    Settings.setUserInfo('');
                                    var image = document.getElementById('edit-user-picture').files;
                                    if (image.length) {
                                        if ((image[0].size / 1024) <= 200) {
                                            console.log("image")
                                            var reader = new FileReader();
                                            reader.onloadend = function () {
                                                var tempObj = {};
                                                tempObj.image = reader.result;
                                                tempObj.seller = $scope.seller.sellerphone;
                                                console.log(tempObj)
                                                $http.put("/dash/upload/user/image", tempObj)
                                                    .success(function (res) {
                                                        console.log(res);
                                                        if (res) {
                                                            console.log("image uploaded successfully")
                                                            $scope.selectSeller($scope.editSeller._id)
                                                            $scope.clearFilter();
                                                        } else {
                                                            console.log("image uploaded failed")
                                                            jQuery.noConflict()
                                                            $('.refresh').css("display", "none");
                                                            // bootbox.alert({
                                                            //     title: 'ERROR',
                                                            //     message: 'Failed to upload. Please try after sometime.',
                                                            //     className: 'text-center'
                                                            // })
                                                        }
                                                    })
                                            }
                                            reader.readAsDataURL(image[0]);
                                        }
                                    }
                                    $scope.clearFilter();
                                    Settings.successPopup('Success','User ' +$scope.seller.sellername +' updated successfully ');
                                    $scope.sellerDetails = $scope.editSeller;
                                    $scope.edit.user = false ;
                                    // jQuery.noConflict();
                                    // $('#myModalAddUser').modal('hide');
                                    // $("#userUpdateSuccess").fadeIn(1000,function(){
                                    //
                                    //     $("#userUpdateSuccess").fadeOut(3000);
                                    // });
                                    $scope.userFilterStatus='allUsers';
                                });
                        }
                        else if($scope.seller.sellerphone == $scope.sellers1.sellerphone ) {
                            jQuery.noConflict();
                            $('.refresh').css("display", "none");
                            Settings.alertPopup('Error',"User phone number: " + $scope.seller.sellerphone + " already exists for " + $scope.sellers1.sellername);
                            if($scope.editSeller.countryCode){
                                var sellerphoneNo = (""+$scope.editSeller.sellerphone).split("");
                                if($scope.editSeller.countryCode == '+91' ){
                                    presentNumber = response.sellerphone;
                                    if(sellerphoneNo.length > 10){
                                        var phoneNo = sellerphoneNo.splice($scope.editSeller.countryCode.length -1);
                                        $scope.editSeller.sellerphone = phoneNo.join("");
                                    }
                                }else if(response.countryCode == '91'){
                                    if(sellerphoneNo.length > 10){
                                        var phoneNo = sellerphoneNo.splice($scope.editSeller.countryCode.length);
                                        $scope.editSeller.sellerphone = phoneNo.join("");
                                        console.log(response);
                                    }
                                    $scope.editSeller.countryCode = '+'+$scope.editSeller.countryCode;
                                }else{
                                    presentNumber = $scope.editSeller.sellerphone;
                                    // var sellerphoneNo = (""+response.sellerphone).split("");
                                    var phoneNo = sellerphoneNo.splice($scope.editSeller.countryCode.length);
                                    $scope.editSeller.sellerphone = phoneNo.join("");
                                }
                            }
                        }
                    });
            }
            // || $scope.sellers1.sellerphone == var1
            // if(!$scope.isPhoneNo($scope.seller.sellerphone))
            // {
            //     alert("Please enter a valid phone number");
            //     return;
            // }
            // ||
            //
            // $scope.seller.salesrep = false;
            // $scope.seller.admin = false;
            // $scope.seller.stockist = false;
            // $scope.seller.fulfiller = false;
            // $scope.seller.manager = false;
            // $scope.seller.dealer = false;
            //
            // if ($scope.seller.role == "salesrep") {
            //     $scope.seller.salesrep = true;
            // }
            // else if ($scope.seller.role == "admin") {
            //     $scope.seller.admin = true;
            // }
            // else if ($scope.seller.role == "stockist") {
            //     $scope.seller.stockist = true;
            // }
            // else if ($scope.seller.role == "fulfiller") {
            //     $scope.seller.fulfiller = true;
            // }
            // else if ($scope.seller.role == "manager") {
            //     $scope.seller.manager = true;
            // }
            // else if ($scope.seller.role == "dealer") {
            //     $scope.seller.dealer = true;
            // }
            //
            // $scope.seller.sellerid = $scope.seller.sellerphone;
            //
        };
        $scope.enableUsers = function () {
            $scope.seller.salesrep = false;
            $scope.seller.admin = false;
            $scope.seller.stockist = false;
            $scope.seller.fulfiller = false;
            $scope.seller.manager = false;
            $scope.seller.dealer = false;
            $scope.seller.branchManager = false;
            $scope.seller.portal_role = false;
            $scope.seller.userStatus = "Active";
            $scope.seller.showOperations = true;
            var date1 = new Date();
            $scope.seller.last_updated = [date1.getFullYear(),(date1.getMonth()+1).padLeft(), date1.getDate().padLeft() ].join('-') + ' '
                + [date1.getHours().padLeft(), date1.getMinutes().padLeft(), date1.getSeconds().padLeft()].join (':');
            if ($scope.seller.role == "Salesperson") {
                $scope.seller.salesrep = true;
            }
            else if ($scope.seller.role == "Admin") {
                $scope.seller.admin = true;
            }
            else if ($scope.seller.role == "Stockist") {
                $scope.seller.stockist = true;
            }
            else if ($scope.seller.role == "Fulfiller") {
                $scope.seller.fulfiller = true;
            }
            else if ($scope.seller.role == "Manager") {
                $scope.seller.manager = true;
            }
            else if ($scope.seller.role == "Dealer") {
                $scope.seller.dealer = true;
            }else if ($scope.seller.role == "BranchManager") {
                $scope.seller.branchManager = true;
            }
            else if ($scope.seller.role == "Portal") {
                $scope.seller.portal_role = true;
            }
            else{
                /*
                 Changes for atmosphere ; Author : Aditi!
                 */
                for(var i=0;i<$scope.userRole.length;i++){
                    if($scope.seller.role == $scope.userRole[i].name){
                        $scope.seller.user_role = $scope.userRole[i].role;
                        if($scope.seller.user_role == 'Manager'){
                            $scope.seller.manager = true;
                        }
                    }
                }
            }
            Settings.confirmPopup('Confirm',"The user was deleted. Do you want to re-enable?",function (result) {
                if(result){
                    jQuery.noConflict();
                    $('.refresh').css("display", "inline");
                    $scope.seller.sellerid = $scope.seller.sellerphone;
                    $http.put("/dash/seller/enable/"+$scope.sellers1._id, $scope.seller)
                        .success( function(response){
                            $scope.editedsellers = response;
                            Settings.successPopup('Success','User '+$scope.seller.sellername +' enabled successfully as '+ $scope.seller.role);
                            $scope.clearFilter();
                            jQuery.noConflict()
                            setTimeout(function(){
                                $('.refresh').css("display", "none");
                            }, 1000);
                            // $scope.all();
                            $scope.refreshSellerNames();
                            // jQuery.noConflict();
                            // $('#myModalAddUser').modal('hide');
                            $scope.userAddPage = false;
                        });
                }
                else {
                    console.log("Deleted re addition cancelled")
                }
            });
            // bootbox.confirm("The user was deleted. Do you want to re-enable?", function(result){
            //     if(result) {
            //         $scope.seller.sellerid = $scope.seller.sellerphone;
            //         $http.put("/dash/seller/enable/"+$scope.sellers1._id, $scope.seller)
            //             .success( function(response) {
            //                 $scope.editedsellers = response;
            //                 // $scope.all();
            //                 $scope.refreshSellerNames();
            //                 jQuery.noConflict();
            //                 $('#myModalAddUser').modal('hide');
            //             });
            //     }
            //     else {
            //         console.log("Deleted re addition cancelled")
            //     }
            // });
        };
        $scope.assignValues = function (id) {
            console.log(id)
            console.log("edit user pAGE ",$scope.userEditPage) ;
            $scope.managerSelectedList = [];
            $scope.editSeller = {};
            $http.get("/dash/seller/details/"+id)
                .success( function(response) {
                    if(response){
                        if(response.countryCode){
                            var sellerphoneNo = (""+response.sellerphone).split("");
                            if(response.countryCode == '+91' ){
                                presentNumber = response.sellerphone;
                                if(sellerphoneNo.length > 10){
                                    // var sellerphoneNo = (""+response.sellerphone).split("");
                                    var phoneNo = sellerphoneNo.splice(response.countryCode.length -1);
                                    response.sellerphone = phoneNo.join("");
                                    // console.log(response);
                                }
                            }else if(response.countryCode == '91'){
                                if(sellerphoneNo.length > 10){
                                    // var sellerphoneNo = (""+response.sellerphone).split("");
                                    var phoneNo = sellerphoneNo.splice(response.countryCode.length);
                                    response.sellerphone = phoneNo.join("");
                                    console.log(response);
                                }
                                response.countryCode = '+'+response.countryCode;
                            }else{
                                presentNumber = response.sellerphone;
                                // var sellerphoneNo = (""+response.sellerphone).split("");
                                if(checkForSpecialChar(response.countryCode)){
                                    var phoneNo = sellerphoneNo.splice(response.countryCode.length -1);
                                    response.sellerphone = phoneNo.join("");
                                } else {
                                    var phoneNo = sellerphoneNo.splice(response.countryCode.length);
                                    response.sellerphone = phoneNo.join("");
                                    response.countryCode = '+'+response.countryCode;
                                }
                            }
                        }else{
                            presentNumber = response.sellerphone;
                            response.countryCode = $scope.default_CountryCode;
                        }
                        if(response.cloudinaryURL){
                            $('#editUserPreview').attr('src', response.cloudinaryURL).fadeIn('slow');
                        }
                        $scope.managerSelectedList = response.managerid;
                        $scope.seller = response;
                        // console.log(presentNumber)
                        $scope.editSeller = response;
                        $scope.edit.user = true ;
                        if($scope.seller.Manager_Name){
                            $scope.ATMSmanagers.tempManager = $scope.seller.Manager_Name;
                        }
                        if($scope.seller.Assistant_Manager_Name){
                            $scope.ATMSmanagers.tempManager1 = $scope.seller.Assistant_Manager_Name;
                        }
                        if($scope.seller.Supervisor_Name){
                            $scope.ATMSmanagers.tempManager2 = $scope.seller.Supervisor_Name;
                        }
                    }
                });
            // $http.get("/dash/seller/details/"+id)
            //     .success( function(response) {
            //         if(response){
            //             if(response.countryCode){
            //                 var sellerphoneNo = (""+response.sellerphone).split("");
            //                 var phoneNo = sellerphoneNo.splice(response.countryCode.length -1);
            //                 response.sellerphone = phoneNo.join("");
            //             }
            //             $scope.managerSelectedList = response.managerid;
            //             console.log(response)
            //             if(response.cloudinaryURL){
            //                 $('#editUserPreview').attr('src', response.cloudinaryURL).fadeIn('slow');
            //             }
            //             $scope.editSeller = response;
            //             $scope.edit.user = true ;
            //             presentNumber = $scope.editSeller.sellerphone;
            //         }
            //     });
        };
        $scope.filterByRole = type => {
            console.log("Filter By Role -- " + type);
            var searchObjByRole = {};
            searchObjByRole.viewLength = 0;
            searchObjByRole.viewBy = initialUserViewBy;
            searchObjByRole.role = type;
            if($scope.userSearch.filter){
                searchObjByRole.searchFor = $scope.userSearch.filter;
                searchObjByRole.searchBy = sellerSearchBy;
            }else{
                searchObjByRole.searchBy = [];
            }
            $scope.viewLength = 0;
            $scope.newViewBy = viewBy.sellers;
            $scope.sellers = [];
            if($scope.applicationType == 'Atmosphere' && $scope.user.sellerObject) {
                searchObjByRole.resort = $scope.user.sellerObject.Resort;
            }
            loadUsers(searchObjByRole);
            loadUsersCount(searchObjByRole);
            $scope.userFilterStatus = 'allUsers';
            $scope.statusFilter = '';
            $scope.showSellerFilter = false;
        }
        // Branch function
        $scope.branchSearch = {};
        $scope.branch = {};
        $scope.newBranch = {};
        $http.post("/dash/allBranches")
            .success(function(branches){
                console.log("all branches"+branches.length)
                $scope.branches = branches;
            });
        $scope.recordBranchAddress = function(type){
            if(type == 'new'){
                var input = document.getElementById('branchAddress');
                var autocomplete = new google.maps.places.Autocomplete(input);
                autocomplete.addListener('place_changed', function () {
                    var place = autocomplete.getPlace();
                    //console.log(place);
                    var lat = place.geometry.location.lat();
                    var long = place.geometry.location.lng();
                    for (var i = 0; i < place.address_components.length; i++) {
                        if (place.address_components[i].types[0] == "locality") {
                            var jcity = place.address_components[i].long_name;
                            var jaddress = place.formatted_address;
                        }
                        if (place.address_components[i].types[1] == "sublocality")
                            var jarea = place.address_components[i].long_name;
                        if (place.address_components[i].types[0] == "administrative_area_level_1")
                            var state = place.address_components[i].long_name;
                        if (place.address_components[i].types[0] == "country")
                            var country = place.address_components[i].long_name;
                        if (place.address_components[i].types[0] == "postal_code")
                            var pincode = place.address_components[i].long_name;
                    }
                    $scope.newBranch.city = jcity ? jcity : '';
                    $scope.newBranch.area = jarea ? jarea : '';
                    $scope.newBranch.address = jaddress ? jaddress : '';
                    $scope.newBranch.latitude = lat ? lat : '';
                    $scope.newBranch.longitude = long ? long : '';
                    $scope.newBranch.state = state ? state : '';
                    $scope.newBranch.country = country ? country : '';
                    $scope.newBranch.pincode = pincode ? pincode : '';
                })
            }
            else if(type == 'edit'){
                var input = document.getElementById('editbranchAddress');
                var autocomplete = new google.maps.places.Autocomplete(input);
                autocomplete.addListener('place_changed', function () {
                    var place = autocomplete.getPlace();
                    //console.log(place);
                    var lat = place.geometry.location.lat();
                    var long = place.geometry.location.lng();
                    for (var i = 0; i < place.address_components.length; i++) {
                        if (place.address_components[i].types[0] == "locality") {
                            var jcity = place.address_components[i].long_name;
                            var jaddress = place.formatted_address;
                        }
                        if (place.address_components[i].types[1] == "sublocality")
                            var jarea = place.address_components[i].long_name;
                        if (place.address_components[i].types[0] == "administrative_area_level_1")
                            var state = place.address_components[i].long_name;
                        if (place.address_components[i].types[0] == "country")
                            var country = place.address_components[i].long_name;
                        if (place.address_components[i].types[0] == "postal_code")
                            var pincode = place.address_components[i].long_name;
                    }
                    $scope.branchDetails.city = jcity ? jcity : '';
                    $scope.branchDetails.area = jarea ? jarea : '';
                    $scope.branchDetails.address = jaddress ? jaddress : '';
                    $scope.branchDetails.latitude = lat ? lat : '';
                    $scope.branchDetails.longitude = long ? long : '';
                    $scope.branchDetails.state = state ? state : '';
                    $scope.branchDetails.country = country ? country : '';
                    $scope.branchDetails.pincode = pincode ? pincode : '';
                })
            }
        };
        $scope.initializeNewBranch = function(){
            $scope.newBranch = {};
            $scope.newBranch.branchCode = '';
            $scope.newBranch.branchName = '';
            $scope.newBranch.address = '';
            $scope.newBranch.phone = '';
            $scope.newBranch.city = '';
            $scope.newBranch.area = '';
            $scope.newBranch.state = '';
            $scope.newBranch.country = '';
            $scope.newBranch.latitude = '';
            $scope.newBranch.longitude = '';
            $scope.newBranch.pincode = '';
        };
        $scope.addNewBranch = function(){
            //console.log($scope.newBranch);
            if($scope.newBranch.branchName != ''){
                if($scope.newBranch.address != ''){
                    // jQuery.noConflict();
                    // $('.refresh').css("display", "inline");
                    $scope.newBranch.phone = ($scope.newBranch.phone != '') ? Number($scope.newBranch.phone) : '';
                    $http.post("/dash/branch/insert",$scope.newBranch)
                        .success(function(res){
                            //console.log(res);
                            if(res){
                                $scope.branches.push(res);
                                // $('#addBranch').modal('hide');
                                Settings.successPopup('Success','Successfully added branch');
                                // bootbox.alert({
                                //     title : 'SUCCESS',
                                //     message : 'Successfully added branch',
                                //     className : 'text-center'
                                // })
                            }
                            // setTimeout(function(){
                            //     $('.refresh').css("display", "none");
                            // }, 500)
                        })
                }
                else{
                    Settings.failurePopup('Error','Please enter branch address');
                    // bootbox.alert({
                    //     title : 'ERROR',
                    //     message : 'Please enter branch address.',
                    //     className : 'text-center'
                    // })
                }
            }
            else{
                Settings.failurePopup('Error','Please enter branch name');
                // bootbox.alert({
                //     title : 'ERROR',
                //     message : 'Please enter branch name.',
                //     className : 'text-center'
                // })
            }
        };
        $scope.clearFilterBranch = function(tab){
            $http.post("/dash/allBranches")
                .success(function(branches){
                    console.log("all branches"+branches.length)
                    $scope.branches = branches;
                });
        };
        $scope.regenerateUserEmail = function (phone) {
            phone = Number(phone);
            if(phone) {
                Settings.confirmPopup("Confirm","Are you sure you want to resend welcome email ?",function (result) {
                    if (result) {
                        $http.get("/dash/getsellerDetails/" + phone)
                            .success(function (response) {
                                if(response){
                                    $http.put("/dash/seller/regenerate/email/" + phone, response)
                                        .success(function (sellerResp) {
                                            if(sellerResp == 'failed'){
                                                Settings.failurePopup('Error','Please add valid phone number');
                                            }else if(sellerResp == 'success'){
                                                Settings.successPopup('Success','Email Regenerated Successfully');
                                            }
                                        });
                                }else{
                                    Settings.failurePopup('Error','User Not Found');
                                }
                            })
                    }
                })
            }
        }
        $scope.branchTab = function (){
            $scope.viewby = 10;
            $scope.totalItems = $scope.branches.length;
            $scope.currentPage = 1;
            $scope.itemsPerPage = $scope.viewby;
            $scope.maxSize = 5;
            $scope.items41 = $scope.branches;
        };
        setTimeout(function(){
            $('.refresh').css("display", "none");
        }, 2000);
        //$scope.assignValues("5f5927ba4e5fe134145cc666");
        //Atmosphere Functions........
            $scope.atmsFormatedDate = function(d){
                if(d){
                    var date = new Date(d);
                    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                    var year = date.getUTCFullYear();
                    var month =  monthNames[date.getMonth()];
                    var d = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate();
                    var hour = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours();
                    var minute = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();
                    var seconds = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds();
                    var ampm = hour >= 12 ? ' PM' : ' AM';
                    var dateformat = d + '-' + month + '-' + year + ' ' + hour + ':' + minute + ' ' + ampm ;
                    return dateformat
                }
                else
                    return '';
            }
    $scope.downloadAllColleagues = function(){
        var sellerObj = {}
        if($scope.user.sellerObject){
            if($scope.user.sellerObject.Resort){
                sellerObj.resort = $scope.user.sellerObject.Resort;
            }
            else{
                sellerObj.resort = ''
            }
        }
        else{
            sellerObj.resort = ''
        }
        $http.post('/dash/sellers/atms/download',sellerObj)
            .success(function(res){
           // console.log(res);
                var output = "EMPLOYEE_ID  , sellername , countryCode  , sellerphone ,  sellerid , DEPARTMENT  , role , user_role , Designation , email ,  Resort , manager , managerid, Supervisor_Code , Supervisor_Name , Supervisor_Designation , Supervisor_Phone_Number, Assistant_Manager_Code , Assistant_Manager_Name , Assistant_Manager_Designation , Assistant_Manager_Phone_Number , Manager_Code , Manager_Name , Manager_Designation , Manager_Phone_Number , last_updated ,last_updated_by, userStatus\n";
                for(var i=0; i< res.length; i++){
                     console.log(res[i])
                    output += res[i].EMPLOYEE_ID;
                    output += ',';
                    output += res[i].sellername;
                    output += ',';
                    if(res[i].countryCode){
                        output += res[i].countryCode;
                        output += ',';
                    }
                    else{
                        res[i].countryCode = '';
                        output += res[i].countryCode;
                        output += ',';
                    }
                    if(res[i].sellerphone){
                        output += res[i].sellerphone;
                        output += ',';
                    }
                    else{
                        res[i].sellerphone = '';
                        output += res[i].sellerphone;
                        output += ',';
                    }
                    if(res[i].sellerid){
                        output += res[i].sellerid;
                        output += ',';
                    }
                    else{
                        res[i].sellerid = '';
                        output += res[i].sellerid;
                        output += ',';
                    }
                    if(res[i].DEPARTMENT){
                        if (res[i].DEPARTMENT.toString().indexOf(',') != -1) {
                            var quotesWrapped = '"' + res[i].DEPARTMENT + '"';
                            res[i].DEPARTMENT = quotesWrapped;
                        }
                        if (res[i].DEPARTMENT.toString().indexOf('\n') != -1) {
                            var quotesWrapped = res[i].DEPARTMENT.replace('\n', ' ');
                            res[i].DEPARTMENT = quotesWrapped;
                        }
                        if (res[i].DEPARTMENT.toString().indexOf('\t') != -1) {
                            var quotesWrapped = res[i].DEPARTMENT.replace('\t', ' ');
                            res[i].DEPARTMENT = quotesWrapped;
                        }
                        output += res[i].DEPARTMENT;
                        output += ',';
                    }else
                        output += ',';
                    if(res[i].role){
                        if (res[i].role.toString().indexOf(',') != -1) {
                            var quotesWrapped = '"' + res[i].role + '"';
                            res[i].role = quotesWrapped;
                        }
                        if (res[i].role.toString().indexOf('\n') != -1) {
                            var quotesWrapped = res[i].role.replace('\n', ' ');
                            res[i].role = quotesWrapped;
                        }
                        if (res[i].role.toString().indexOf('\t') != -1) {
                            var quotesWrapped = res[i].role.replace('\t', ' ');
                            res[i].role = quotesWrapped;
                        }
                        output += res[i].role;
                        output += ',';
                    }else
                        output += ',';
                    if(res[i].user_role){
                        output += res[i].user_role;
                        output += ',';
                    }
                    else{
                        res[i].user_role = '';
                        output += res[i].user_role;
                        output += ',';
                    }
                    if(res[i].Designation){
                        if (res[i].Designation.toString().indexOf(',') != -1) {
                            var quotesWrapped = '"' + res[i].Designation + '"';
                            res[i].Designation = quotesWrapped;
                        }
                        if (res[i].Designation.toString().indexOf('\n') != -1) {
                            var quotesWrapped = res[i].Designation.replace('\n', ' ');
                            res[i].Designation = quotesWrapped;
                        }
                        if (res[i].Designation.toString().indexOf('\t') != -1) {
                            var quotesWrapped = res[i].Designation.replace('\t', ' ');
                            res[i].Designation = quotesWrapped;
                        }
                        output += res[i].Designation;
                        output += ',';
                    }else{
                        output += res[i].Designation;
                        output += ',';
                    }
                    if(res[i].email){
                        output += res[i].email;
                        output += ',';
                    }
                    else{
                        res[i].email = '';
                        output += res[i].email;
                        output += ',';
                    }
                    if(res[i].Resort){
                        output += res[i].Resort;
                        output += ',';
                    }
                    else{
                        res[i].Resort = '';
                        output += res[i].Resort;
                        output += ',';
                    }
                    if(res[i].manager){
                        output += res[i].manager;
                        output += ',';
                    }
                    else{
                        res[i].manager = '';
                        output += res[i].manager;
                        output += ',';
                    }
                    if (res[i].managerid)
                    {
                        for(var k=0; k<res[i].managerid.length; k++)
                        {
                            output += res[i].managerid[k];
                            output += ' ';
                        }
                        output += ',';
                    }
                    else {
                        output += ',';
                    }
                    if(res[i].Supervisor_Code){
                        output += res[i].Supervisor_Code;
                        output += ',';
                    }
                    else{
                        res[i].Supervisor_Code = '';
                        output += res[i].Supervisor_Code;
                        output += ',';
                    }
                    if(res[i].Supervisor_Name){
                        output += res[i].Supervisor_Name;
                        output += ',';
                    }
                    else{
                        res[i].Supervisor_Name = '';
                        output += res[i].Supervisor_Name;
                        output += ',';
                    }
                    if(res[i].Supervisor_Designation) {
                        if (res[i].Supervisor_Designation.toString().indexOf(',') != -1) {
                            var quotesWrapped = '"' + res[i].Supervisor_Designation + '"';
                            res[i].Supervisor_Designation = quotesWrapped;
                        }
                        if (res[i].Supervisor_Designation.toString().indexOf('\n') != -1) {
                            var quotesWrapped = res[i].Supervisor_Designation.replace('\n', ' ');
                            res[i].Supervisor_Designation = quotesWrapped;
                        }
                        if (res[i].Supervisor_Designation.toString().indexOf('\t') != -1) {
                            var quotesWrapped = res[i].Supervisor_Designation.replace('\t', ' ');
                            res[i].Supervisor_Designation = quotesWrapped;
                        }
                        output += res[i].Supervisor_Designation
                        output += ',';
                    }else
                        output += ',';
                    if(res[i].Supervisor_Phone_Number){
                        output += res[i].Supervisor_Phone_Number;
                        output += ',';
                    }
                    else{
                        res[i].Supervisor_Phone_Number = '';
                        output += res[i].Supervisor_Phone_Number;
                        output += ',';
                    }
                    if(res[i].Assistant_Manager_Code){
                        output += res[i].Assistant_Manager_Code;
                        output += ',';
                    }
                    else{
                        res[i].Assistant_Manager_Code = '';
                        output += res[i].Assistant_Manager_Code;
                        output += ',';
                    }
                    if(res[i].Assistant_Manager_Name){
                        output += res[i].Assistant_Manager_Name;
                        output += ',';
                    }
                    else{
                        res[i].Assistant_Manager_Name = '';
                        output += res[i].Assistant_Manager_Name;
                        output += ',';
                    }
                    if(res[i].Assistant_Manager_Designation) {
                        if (res[i].Assistant_Manager_Designation.toString().indexOf(',') != -1) {
                            var quotesWrapped = '"' + res[i].Assistant_Manager_Designation + '"';
                            res[i].Assistant_Manager_Designation = quotesWrapped;
                        }
                        if (res[i].Assistant_Manager_Designation.toString().indexOf('\n') != -1) {
                            var quotesWrapped = res[i].Assistant_Manager_Designation.replace('\n', ' ');
                            res[i].Assistant_Manager_Designation = quotesWrapped;
                        }
                        if (res[i].Assistant_Manager_Designation.toString().indexOf('\t') != -1) {
                            var quotesWrapped = res[i].Assistant_Manager_Designation.replace('\t', ' ');
                            res[i].Assistant_Manager_Designation = quotesWrapped;
                        }
                        output += res[i].Assistant_Manager_Designation;
                        output += ',';
                    }else
                        output += ',';
                    if(res[i].Assistant_Manager_Phone_Number){
                        output += res[i].Assistant_Manager_Phone_Number;
                        output += ',';
                    }
                    else{
                        res[i].Assistant_Manager_Phone_Number = '';
                        output += res[i].Assistant_Manager_Phone_Number;
                        output += ',';
                    }
                    if(res[i].Manager_Code){
                        output += res[i].Manager_Code;
                        output += ',';
                    }
                    else{
                        res[i].Manager_Code = '';
                        output += res[i].Manager_Code;
                        output += ',';
                    }
                    if(res[i].Manager_Name){
                        output += res[i].Manager_Name;
                        output += ',';
                    }
                    else{
                        res[i].Manager_Name = '';
                        output += res[i].Manager_Name;
                        output += ',';
                    }
                    if(res[i].Manager_Designation) {
                        if (res[i].Manager_Designation.toString().indexOf(',') != -1) {
                            var quotesWrapped = '"' + res[i].Manager_Designation + '"';
                            result[i].Manager_Designation = quotesWrapped;
                        }
                        if (res[i].Manager_Designation.toString().indexOf('\n') != -1) {
                            var quotesWrapped = res[i].Manager_Designation.replace('\n', ' ');
                            res[i].Manager_Designation = quotesWrapped;
                        }
                        if (res[i].Manager_Designation.toString().indexOf('\t') != -1) {
                            var quotesWrapped = res[i].Manager_Designation.replace('\t', ' ');
                            res[i].Manager_Designation = quotesWrapped;
                        }
                        output += res[i].Manager_Designation;
                        output += ',';
                    }else
                        output += ',';
                    if(res[i].Manager_Phone_Number){
                        output += res[i].Manager_Phone_Number;
                        output += ',';
                    }
                    else{
                        res[i].Manager_Phone_Number = '';
                        output += res[i].Manager_Phone_Number;
                        output += ',';
                    }
                    if(res[i].last_updated) {
                        output += $scope.atmsFormatedDate(res[i].last_updated);
                        output += ',';
                    }
                    else{
                        res[i].last_updated = '';
                        output += ',';
                    }
                    if(res[i].last_updated_by) {
                        output += res[i].last_updated_by;
                        output += ',';
                    }
                    else{
                        output[i].last_updated_by = '';
                        output += ',';
                    }
                    if(res[i].userStatus) {
                        output += res[i].userStatus;
                        output += ',';
                    }
                    else{
                        output[i].userStatus = '';
                        output += ',';
                    }
                    output += '\n';
                }
                var blob = new Blob([output], {type : "text/csv;charset=UTF-8"});
                //console.log(blob);
                window.URL = window.webkitURL || window.URL;
                var url = window.URL.createObjectURL(blob);
                var d = new Date();
                var anchor = angular.element('<a/>');
                anchor.attr({
                    href: url,
                    target: '_blank',
                    download: 'Colleauges_Reports_'+d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+'.csv'
                })[0].click();
        });
    }
    });