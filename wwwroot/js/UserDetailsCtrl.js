angular.module('ebs.controller')
.controller("UserDetailsCtrl",function ($scope, $http, $routeParams, Settings, $location, $window) {
    let id = $routeParams.id;
    console.log("Hello From User Details Controller .... !!!! - ", id);
    ///.... User object....
    $scope.user = {};
    $scope.device_details = {};
    $scope.devices = [];
    $scope.managers = [];
    $scope.user_info = {};
    $scope.nav = {};
    //... Load all devices user has logged in....
    Settings.getNav(false, nav => {
        $scope.nav = nav;
        $scope.user_roles = nav[4].roles;
    });
    Settings.getUserInfo(user_details => {
        $scope.user_info = user_details;
    });
    //... Start a loader....
    const startLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "inline");
    }
    const stopLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "none");
    }
    const loadDevices = id => {
        $http.get("/dash/devices/list/" + id)
            .then(devices => {
                if(devices.data && devices.data.length){
                    $scope.device_details = devices.data[0];
                    if(devices.data[0] && devices.data[0].devices){
                        for(let i = 0; i < devices.data[0].devices.length; i++){
                            switch(devices.data[0].devices[i].platform){
                                case "Android" : {
                                    devices.data[0].devices[i].image_url = "https://cdn-icons-png.flaticon.com/512/518/518705.png";
                                    break;
                                }
                                case "iOS" : {
                                    devices.data[0].devices[i].image_url = "https://w7.pngwing.com/pngs/302/500/png-transparent-apple-worldwide-developers-conference-mobile-app-development-android-android-text-logo-monochrome-thumbnail.png";
                                    break;
                                }
                                case "Web" : {
                                    devices.data[0].devices[i].image_url = "https://www.pinclipart.com/picdir/middle/386-3867475_news-01-web-flat-icon-png-clipart.png";
                                    break;
                                }
                                default : {
                                    devices.data[0].devices[i].image_url = "https://cdn-icons-png.flaticon.com/512/187/187178.png";
                                    break;
                                }
                            }
                        }
                    }
                    $scope.devices = devices.data[0].devices;   
                }
            })
            .catch((error, status) => {
                console.log(error, status);
                if(status >= 400 && status < 404)
                    $window.location.href = '/404';
                else if(status >= 500)
                    $window.location.href = '/500';
                else
                    $window.location.href = '/404';
            });
    }
    const loadManagers = () => {
        $http.get("/dash/users/managers")
            .then(response => {
                console.log("Managers ---->" + response.data.length);
                if(response.data && response.data.length){
                    for(let i = 0; i < response.data.length; i++)
                        $scope.managers[response.data[i].sellerid] = response.data[i].sellername;
                }
            });
    }
    //... Setup notification object
    const setUpNotification = () => {
        if($scope.user){
            if(!$scope.user.notifications){
                $scope.user.notifications = [
                    {
                        "tab" : 1,
                        "description" : "New Order Confirmation",
                        "category" : "Orders",
                        "email" : false,
                        "push" : false
                    },
                    {
                        "tab" : 2,
                        "description" : "Order Status Updates",
                        "category" : "Orders",
                        "email" : false,
                        "push" : false
                    },
                    {
                        "tab" : 3,
                        "description" : "Shipment Notifications",
                        "category" : "Orders",
                        "email" : false,
                        "push" : false
                    },
                    {
                        "tab" : 4,
                        "description" : "Invoice Notifications",
                        "category" : "Orders",
                        "email" : false,
                        "push" : false
                    },
                    {
                        "tab" : 5,
                        "description" : "Payment Received Notifications",
                        "category" : "Orders",
                        "email" : false,
                        "push" : false
                    },
                    {
                        "tab" : 1,
                        "description" : "Catalog Master Update",
                        "category" : "Items",
                        "email" : false,
                        "push" : false
                    },
                    {
                        "tab" : 2,
                        "description" : "Pricing Update",
                        "category" : "Items",
                        "email" : false,
                        "push" : false
                    },
                    {
                        "tab" : 1,
                        "description" : "Customer Master Update",
                        "category" : "Stores",
                        "email" : false,
                        "push" : false
                    },
                    {
                        "tab" : 2,
                        "description" : "Customer Information Update",
                        "category" : "Stores",
                        "email" : false,
                        "push" : false
                    },
                    {
                        "tab" : 3,
                        "description" : "Customer Master Update",
                        "category" : "Stores",
                        "email" : false,
                        "push" : false
                    },
                    {
                        "tab" : 4,
                        "description" : "Check In Update",
                        "category" : "Stores",
                        "email" : false,
                        "push" : false,
                    },
                    {
                        "tab" : 5,
                        "description" : "Check Out Update",
                        "category" : "Stores",
                        "email" : false,
                        "push" : false
                    }
                ]
            }
        }
    };
    //... Reload User details....
    const loadUserDetails = id => {
        startLoader();
        $http.get("/dash/user/detail/" + id)
            .then(user_details => {
                stopLoader();
                console.log(user_details);
                if(user_details && user_details.data){
                    $scope.user = user_details.data;
                    setUpNotification();
                    loadDevices(user_details.data.sellerid || user_details.data.email);
                    loadManagers();
                }else
                    $location.path('/');
            })
            .catch((error, status) => {
                console.log(error, status);
                if(status >= 400 && status < 404)
                    $window.location.href = '/404';
                else if(status >= 500)
                    $window.location.href = '/500';
                else
                    $window.location.href = '/404';
            });
    };
    $scope.deleteUserDevice = (device) => {
        if(device){
            Settings.confirmPopup("CONFIRM", 
            "Are you sure, you want to delete the user device "+ device.model +" ?", 
            res => {
                if (res) {
                    $http.delete("/dash/devices/remove/" + $scope.device_details.sellerid + "/" + device.uuid)
                        .then(response => {
                            if(response && response.data){
                                if(!response.data.status){
                                    loadDevices($scope.user.sellerid || $scope.user.email);
                                    Settings.success_toast('Success','Device Access Removed');
                                }else{
                                    Settings.fail_toast("Error", "Unable to remove access");
                                }
                            }
                        })
                }
            });
        }
    };
    $scope.removeUser = () => {
        Settings.confirmPopup("Confirm", "Are you sure, you want to delete user "+ $scope.user.sellername +" ?", result => {
            if(result) {
                $http.delete("/dash/user/remove/" + $scope.user._id)
                    .then(response => {
                        if(response && response.data){
                            Settings.success_toast('Success','User '+$scope.user.sellername +' was deleted successfully');
                            $window.history.back();
                        }
                    })
                    .catch((error, status) => {
                        console.log(error, status);
                        if(status >= 400 && status < 404)
                            $window.location.href = '/404';
                        else if(status >= 500)
                            $window.location.href = '/500';
                        else
                            $window.location.href = '/404';
                    });
            }
        })
    }
    const updateUserNotification = (notification, index) => {
        $http.put("/dash/user/notification/update/" + id, notification)
            .then(update => {
                if(update.data){
                    Settings.success_toast("Successful", notification[index].description + " : Notification Updated");
                    loadUserDetails(id);
                } else Settings.fail_toast("Error", "Could not update the user's notification setting");
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
    $scope.toggleNotification = (index, type) => {
        console.log(index, type);
        console.log($scope.user.notifications[index]);
        switch(type){
            case "email" : {
                Settings.confirmPopup("Confirm", 
                    ($scope.user.notifications[index].email ? "Enable " : "Disable " ) + $scope.user.notifications[index].description + " Email Notification?",
                    result => {
                        if(result){
                            updateUserNotification($scope.user.notifications, index);
                        }else loadUserDetails(id);
                    })
                break;
            }
            case "push" : {
                Settings.confirmPopup("Confirm", 
                    ($scope.user.notifications[index].push ? "Enable " : "Disable " ) + $scope.user.notifications[index].description + " Push Notification?",
                    result => {
                        if(result){
                            updateUserNotification($scope.user.notifications, index);
                        }else loadUserDetails(id);
                    })
                break;
            }
        }
    };
    $scope.resendEmail = () => {
        Settings.confirmPopup("Confirm","Are you sure you want to resend welcome email?", result => {
            if (result) {
                $http.get("/dash/user/resend/email/" + $scope.user._id)
                .then(result => {
                    if(result.data && result.data.status == 'success'){
                        Settings.success_toast("Success", "Resent Sign Up Email to user");
                    }
                })
            }
        })
    }
    $scope.getRoleName = role => {
        let temp = '';
        if(role){
            temp = role;
            if($scope.user_roles && $scope.user_roles.length){
                for (let i = 0 ; i < $scope.user_roles.length; i++){
                    if($scope.user_roles[i].role.toUpperCase() == role.toUpperCase()){
                        temp = $scope.user_roles[i].name;
                        break;
                    }
                }
            }
        }
        return temp;
    };
    if(id) loadUserDetails(id);
})