/**
 * Created by shreyasgombi on 31/07/22.
 */
 angular.module('ebs.controller')
 .controller("NotificationsAdminCtrl", function($scope, $routeParams, $location, $http, $window, Settings){
     console.log("Hello From Admin Settings Notifications Controller .... !!!!");
     $scope.tab = 'sms';
     //.... Tabs ....
     if($routeParams.tab) $scope.tab = $routeParams.tab;
     $scope.text_local = {};
     $scope.email_setup = {};
     $scope.push_notification = {};
     const startLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "inline");
    };
    const stopLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "none");
    }
     const fetchTextLocalCredentials = () => {
        startLoader();
        $http.get("/dash/settings/sms/configuration")
            .then(response => {
                stopLoader();
                if(response.data) $scope.text_local = response.data;
                else $scope.text_local = {};
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
     const fetchPushNotification = () => {
        startLoader();
        $http.get("/dash/settings/details/notification")
            .then(response => {
                stopLoader();
                if(response.data && response.data.obj) $scope.push_notification = response.data.obj;
                else $scope.push_notification = {};
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
     const fetchEmailSetup = () => {
        startLoader();
            $http.get("/dash/settings/details/email_notification")
                .then(setup => {
                    stopLoader();
                    if(setup.data){
                        $scope.email_setup = setup.data;
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
     $scope.smsSetup = () => {
        if($scope.text_local.api_key && $scope.text_local.sender_id){
            $http.put("/dash/settings/update/sms/credentials", $scope.text_local)
                .then(response => {
                    if(response.data && response.data.status == "success"){
                        Settings.success_toast("SUCCESS", "Successfully Setup SMS with Text Local!");
                    }else{
                        Settings.fail_toast("Error", "Error Setting up Text Local");
                        fetchTextLocalCredentials();
                    }
                })
        } else {
            Settings.fail_toast("ERROR", "Enter API Key and Sender ID");
        }
    };
    $scope.dropSMS = () => {
        Settings.confirmPopup("CONFIRM", "Are you sure? This will switch to default B2BOMS's SMS Configuration.", result => {
            if(result){
                $http.delete("/dash/settings/sms/drop")
                    .then(response => {
                        if(response.data && response.data.status == "success"){
                            fetchTextLocalCredentials();
                            Settings.success_toast("SUCCESS", "Successfully Dropped SMS Setup!");
                        }else {
                            Settings.fail_toast("Error", "Error Dropping Credentials");
                            fetchTextLocalCredentials();
                        }
                    })
            }
        })
    }
    /*....
        Email Notifications Setup
    ...*/
    $scope.saveEmailConfig = () => {
        Settings.confirmPopup("Confirm", "Save Email Configuration?", result => {
            if (result) {
                $http.put("/dash/settings/email/notification/setup", $scope.email_setup)
                    .then(response => {
                        //console.log(response)
                        if (response.data && response.data.status == "success") {
                            Settings.setInstanceDetails("email", $scope.email_setup)
                            Settings.success_toast("SUCCESS", "Notification Setup Updated Successfully!");
                            fetchEmailSetup();
                        } else {
                            Settings.fail_toast("Error", "Could Not Update. Something went wrong");
                            $scope.email_setup = {};
                        }
                    })
            }
            else {
                //console.log("company logo URL not updated")
            }
        });
    }
    $scope.dropEmailConfig = () => {
        Settings.confirmPopup("Confirm", "Are you sure?", result => {
            if (result) {
                $http.delete("/dash/settings/email/setup/drop")
                    .then(response => {
                        //console.log(response)
                        if (response.data && response.data.status == "success") {
                            $scope.email_setup = {};
                            Settings.setInstanceDetails("email", {});
                            Settings.success_toast("SUCCESS", "Notification Setup Dropped Successfully!");
                            fetchEmailSetup();
                        } else {
                            Settings.fail_toast("Error", "Could Not Update. Something went wrong");
                            $scope.email_setup = {};
                        }
                    })
            }
            else {
                //console.log("company logo URL not updated")
            }
        });
    }
        /*.........
            Turn ON/OFF a notification
        .........*/
        $scope.toggleNotification = (user, platform, type, flag) => {
            $scope.notificationConfig[user][platform == 'email' ? 0 : 1]['status'][type] = flag;
            $http.put("/dash/settings/update/push/notification", $scope.notificationConfig)
                .then(response => {
                    if(response.data && response.data.status == "success"){
                        Settings.success_toast("Success", "Push Notification Setup Updated!");
                    }
                    else if(!response.data || response.data.status == "error"){
                        $scope.notificationConfig[user][platform == 'email' ? 0 : 1]['status'][type] = !flag;
                        Settings.fail_toast("Error", "Error updating Push Notification Setup");
                    }
                })
        };
        $scope.toggleSendSms = (type, flag) => {
            $scope.sendSms[type] = flag;
            $http.put("/dash/settings/update/sms/notification", $scope.sendSms)
                .then(response => {
                    if(response.data && response.data.status == "success"){
                        Settings.success_toast("Success", "SMS Notification Setup Updated!");
                    }
                    else if(!response.data || response.data.status == "error"){
                        $scope.sendSms[type] = !flag;
                        Settings.fail_toast("Error", "Error updating SMS Notification Setup");
                    }
                })
        }
    fetchTextLocalCredentials();
    fetchEmailSetup();
    fetchPushNotification();
 });