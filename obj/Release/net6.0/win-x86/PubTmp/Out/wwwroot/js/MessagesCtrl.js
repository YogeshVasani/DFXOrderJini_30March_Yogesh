/**
 * Created by shreyasgombi on 05/03/20.
 */
angular.module('ebs.controller')
    .controller("MessagesCtrl",function ($scope, $filter, $http, Settings, $window) {
        console.log("Hello From Messages Controller .... !!!!");
        //... Initialize the master lists....
        $scope.masterSmsList_dealers = [];
        $scope.masterSmsList_admin = [];
        $scope.masterSmsList_stockist = [];
        $scope.masterSmsList_manager = [];
        $scope.masterSmsList_fulfiller = [];
        $scope.masterSmsList_salesperson = [];
        $scope.smsRequest = {};
        $scope.smslist = [];
        $scope.salespersonLength = 0;
        $scope.messageSource = 'sms';
        //Variable to store all dealers
        $scope.roleDealers = [];
        $scope.roleFulfiller = [];
        if ($scope.roleDealers.length == 0) {
            //console.log("Fetching all dealers");
            $http.get("/dash/stores")
                .success(function (res) {
                    //console.log(res)
                    $scope.roleDealers = res;
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
        }
        sellerSearchObj = {};
        sellerSearchObj.viewLength = 0;
        sellerSearchObj.viewBy = 60;
        sellerSearchObj.searchFor = '';
        sellerSearchObj.searchBy = [];
        sellerSearchObj.userLoginDetails = $scope.user;
        $http.post("/dash/users/list", sellerSearchObj)
            .success(function (res) {
                console.log("Users !! --> ", res);
                $scope.sellers = res;
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
        //.... Filter users by role / category .....
        $scope.changeSmsCategory = function(index){
            $scope.smsRole = '';
            if(index == 1)
                $scope.smsRole = 'dealer';
            else if(index == 2)
                $scope.smsRole = 'admin';
            else if(index == 3)
                $scope.smsRole = 'manager';
            else if(index == 4)
                $scope.smsRole = 'salesperson';
            else if(index == 5)
                $scope.smsRole = 'stockist';
            else
                $scope.smsRole = 'fulfiller';
        };
        $http.get("/dash/role/sellers/Salesperson")
            .success(function (salesperson) {
                console.log("Salesperson : ", salesperson);
                if(salesperson && salesperson.length){
                    for(var i = 0; i < salesperson.length; i++){
                        $scope.roleSalesrep.push({sellername : salesperson[i].sellername, sellerphone : salesperson[i].sellerphone});
                        //$scope.fulfillerNames[fulfillers[i].sellerphone] = fulfillers[i].sellername;
                    }
                }
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
        $http.get("/dash/role/sellers/Fulfiller")
            .success(function (fulfillers) {
                console.log("Fulfillers : ", fulfillers);
                if(fulfillers && fulfillers.length){
                    $scope.roleFulfiller = [];
                    for(var i = 0; i < fulfillers.length; i++){
                        $scope.roleFulfiller.push({sellername : fulfillers[i].sellername, sellerphone : fulfillers[i].sellerphone});
                    }
                }
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
        //Add people to sms  TO list
        $scope.addToSmsList = function(index, object, value){
            switch(index){
                case 1:
                    if(object) {
                        $scope.masterSmsList_dealers.push({'sellername' : object.DealerName[0], 'sellerphone' : object.Phone[0] });
                    }
                    else
                        $scope.masterSmsList_dealers = [];
                    break;
                case 2:
                    if(object) {
                        $scope.masterSmsList_admin.push({'sellername' : object.sellername, 'sellerphone' : object.sellerphone });
                    }
                    else
                        $scope.masterSmsList_admin = [];
                    break;
                case 3:
                    if(object) {
                        $scope.masterSmsList_manager.push({'sellername' : object.sellername, 'sellerphone' : object.sellerphone });
                    }
                    else
                        $scope.masterSmsList_manager = [];
                    break;
                case 4:
                    if (object) {
                        $scope.masterSmsList_salesperson.push({'sellername' : object.sellername, 'sellerphone' : object.sellerphone });
                    }
                    else
                        $scope.masterSmsList_salesperson = [];
                    break;
                case 5:
                    if(object) {
                        $scope.masterSmsList_stockist.push({'sellername' : object.sellername, 'sellerphone' : object.sellerphone });
                    }
                    else
                        $scope.masterSmsList_stockist = [];
                    break;
                case 6:
                    if(object) {
                        $scope.masterSmsList_fulfiller.push({'sellername' : object.sellername, 'sellerphone' : object.sellerphone });
                    }
                    else
                        $scope.masterSmsList_fulfiller = [];
                    break;
                case 7:
                    if(value){
                        if($scope.roleDealers){
                            $scope.masterSmsList_dealers = [];
                            $scope.masterSmsList_dealers = $scope.roleDealers;
                        }
                    }
                    else
                        $scope.masterSmsList_dealers = [];
                    break;
                case 8:
                    if(value){
                        if($scope.roleAdmin){
                            $scope.masterSmsList_admin = [];
                            $scope.masterSmsList_admin = $scope.roleAdmin;
                        }
                    }
                    else
                        $scope.masterSmsList_admin = [];
                    break;
                case 9:
                    if(value){
                        if($scope.roleManager){
                            $scope.masterSmsList_manager = [];
                            $scope.masterSmsList_manager = $scope.roleManager;
                        }
                    }
                    else
                        $scope.masterSmsList_manager = [];
                    break;
                case 10:
                    if(value){
                        $scope.masterSmsList_salesperson = [];
                        $scope.masterSmsList_salesperson = $scope.roleSalesrep;
                    }
                    else
                        $scope.masterSmsList_salesperson = [];
                    break;
                case 11:
                    if(value){
                        if($scope.roleStockist){
                            $scope.masterSmsList_stockist = [];
                            $scope.masterSmsList_stockist = $scope.roleStockist;
                        }
                    }
                    else
                        $scope.masterSmsList_stockist = [];
                    break;
                case 12:
                    if(value){
                        if($scope.roleFulfiller){
                            $scope.masterSmsList_fulfiller = [];
                            $scope.masterSmsList_fulfiller = $scope.roleFulfiller;
                        }
                    }
                    else
                        $scope.masterSmsList_fulfiller = [];
                    break;
                case 13:
                    if(value){
                        if($scope.roleDealerPortalApp){
                            $scope.masterSmsList_dealers = [];
                            $scope.masterSmsList_dealers = $scope.roleDealerPortalApp;
                        }
                    }
                    else
                        $scope.masterSmsList_dealers = [];
                    break;
                case 14:
                    if(object) {
                        $scope.masterSmsList_dealers.push({'sellername' : object.sellername, 'sellerphone' : object.sellerphone });
                    }
                    else
                        $scope.masterSmsList_dealers = [];
                    break;
            }
            $scope.smsTotal = $scope.masterSmsList_dealers.length +
                $scope.masterSmsList_admin.length + $scope.masterSmsList_manager.length +
                $scope.masterSmsList_salesperson.length + $scope.masterSmsList_stockist.length +
                $scope.masterSmsList_fulfiller.length;
        }
        //SMS
        $scope.sendSMS = function () {
            $scope.selectedPeople = [];
            /*.... Send SMS to either a selected store/dealer ... Or send it to all dealers/stores ........*/
            if ($scope.masterSmsList_dealers.length > 0)
                $scope.selectedPeople.push($scope.masterSmsList_dealers);
            if ($scope.masterSmsList_admin.length > 0)
                $scope.selectedPeople.push($scope.masterSmsList_admin);
            if ($scope.masterSmsList_salesperson.length > 0)
                $scope.selectedPeople.push($scope.masterSmsList_salesperson);
            if ($scope.masterSmsList_stockist.length > 0)
                $scope.selectedPeople.push($scope.masterSmsList_stockist);
            if ($scope.masterSmsList_manager.length > 0)
                $scope.selectedPeople.push($scope.masterSmsList_manager);
            if ($scope.masterSmsList_fulfiller.length > 0)
                $scope.selectedPeople.push($scope.masterSmsList_fulfiller);
            //console.log($scope.selectedPeople)
            if (($scope.selectedPeople.length > 0) && ($scope.smsRequest.message && $scope.smsRequest.message != '')) {
                var phoneNumbers = [];
                $scope.smsRequest.Phone = "";
                for (var i = 0; i < $scope.selectedPeople.length; i++) {
                    for (var j = 0; j < $scope.selectedPeople[i].length; j++) {
                        if (!phoneNumbers[$scope.selectedPeople[i][j].sellerphone]) {
                            phoneNumbers[$scope.selectedPeople[i][j].sellerphone] = $scope.selectedPeople[i][j].sellerphone;
                            if (j == $scope.selectedPeople[i].length - 1 && i < $scope.selectedPeople.length - 1) {
                                $scope.smsRequest.Phone += phoneNumbers[$scope.selectedPeople[i][j].sellerphone] + ","
                            }
                            else if (j == $scope.selectedPeople[i].length - 1 && i == $scope.selectedPeople.length - 1) {
                                $scope.smsRequest.Phone += phoneNumbers[$scope.selectedPeople[i][j].sellerphone];
                            }
                            else
                                $scope.smsRequest.Phone += phoneNumbers[$scope.selectedPeople[i][j].sellerphone] + ",";
                        }
                    }
                }
                Settings.confirmPopup("CONFIRM", "Press OK to confirm sending messages to " + $scope.smsTotal + " numbers", function(result){
                    if (result) {
                        $http.post("/dash/sms/send", $scope.smsRequest)
                            .success(function (response) {
                                //console.log("Create -->" + response);
                                $http.get("/dash/sms")
                                    .success($scope.renderSMS)
                                    .error(function(error, status){
                                        console.log(error, status);
                                        if(status >= 400 && status < 404)
                                            $window.location.href = '/404';
                                        else if(status >= 500)
                                            $window.location.href = '/500';
                                        else
                                            $window.location.href = '/404';
                                    });
                                $scope.smsRequest = {};
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
                    }
                });
            }
        }
        $scope.renderSMS = function (response) {
            console.log("GetAll SMS History-->");
            //.... To display correctly, we need to split numbers from ',' to ', '.
            for(var i=0; i<response.length;i++) response[i].Phone = (response[i].Phone+"").replace(/,/g, ', ');
            $scope.smslist = response;
        };
        $http.get("/dash/sms")
            .success($scope.renderSMS)
            .error(function(error, status){
                console.log(error, status);
                if(status >= 400 && status < 404)
                    $window.location.href = '/404';
                else if(status >= 500)
                    $window.location.href = '/500';
                else
                    $window.location.href = '/404';
            });
        $scope.clearSMS = function () {
            console.log("Clearing Senders ------> ");
            $scope.selectedSeller = $scope.sellers[0];
            $scope.smsRequest.message = '';
        }
        $scope.changeMessageSource = function(source){
            $scope.messageSource = source;
            $scope.masterSmsList_dealers = [];
            $scope.masterSmsList_admin = [];
            $scope.masterSmsList_manager = [];
            $scope.masterSmsList_salesperson = [];
            $scope.masterSmsList_stockist = [];
            $scope.masterSmsList_fulfiller = [];
            $scope.smsTotal = 0;
            $scope.selectValue = false;
            $scope.clearSMS();
        }
        $scope.sendNotification = function(heading, body){
            var selectedPeople = [];
            if($scope.masterSmsList_dealers.length > 0)
                selectedPeople.push($scope.masterSmsList_dealers);
            if($scope.masterSmsList_admin.length > 0)
                selectedPeople.push($scope.masterSmsList_admin);
            if($scope.masterSmsList_salesperson.length > 0)
                selectedPeople.push($scope.masterSmsList_salesperson);
            if($scope.masterSmsList_stockist.length > 0)
                selectedPeople.push($scope.masterSmsList_stockist);
            if($scope.masterSmsList_manager.length > 0)
                selectedPeople.push($scope.masterSmsList_manager);
            if($scope.masterSmsList_fulfiller.length > 0)
                selectedPeople.push($scope.masterSmsList_fulfiller);
            var pushNotificationObj = {};
            pushNotificationObj.heading = heading;
            pushNotificationObj.body = body;
            pushNotificationObj.seller = [];
            for(var i=0; i< selectedPeople.length; i++){
                for(var j=0; j< selectedPeople[i].length; j++){
                    pushNotificationObj.seller.push(selectedPeople[i][j].sellerphone);
                }
            }
            Settings.confirmPopup("CONFIRM", "Send push notifications to "+pushNotificationObj.seller.length+" users?", function(result){
                if(result){
                    $http.post("/dash/sendPushNotification", pushNotificationObj)
                        .success(function(res){
                            if(res){
                                Settings.success_toast("SUCCESS", "Notifications sent");
                                $scope.changeMessageSource('pushNotification')
                            }
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
                }
            });
        }
    })