/**
 * Created by shreyasgombi on 30/07/22.
 */
 angular.module('ebs.controller')
 .controller("NavCtrl", function($scope, $location, $http, $window, Settings){
     console.log("Hello From Admin Settings Nav Controller .... !!!!");
     $scope.nav = [];
     $scope.otherTabs = [];
     $scope.reportTab = [];
     const startLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "inline");
    };
    const stopLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "none");
    }
     $scope.leaveType = [ 
        {
            "name" : "Casual Leave",
            "type" : "casual",
            "enable" : false
        }, 
        {
            "name" : "Paid Leave",
            "type" : "paid",
            "enable" : false
        }, 
        {
            "name" : "Compensatory Leave",
            "type" : "compensatory",
            "enable" : false
        }, 
        {
            "name" : "Sick Leave",
            "type" : "sick",
            "enable" : false
        }, 
        {
            "name" : "Maternity Leave",
            "type" : "maternity",
            "enable" : false
        }, 
        {
            "name" : "Paternity Leave",
            "type" : "paternity",
            "enable" : false
        }
    ];
     Settings.getNav(false, nav => {
        $scope.nav = nav;
        $scope.reportTab = $scope.nav[8].cols;
     });
     const fetchOtherTabs = () => {
        startLoader();
        $http.get("/dash/settings/fetch/other/tabs")
            .then(tabs => {
                $scope.otherTabs = [];
                stopLoader();
                if (tabs.data.length) {
                    $scope.otherTabs = tabs.data[0].tabs || tabs.data[0].Tabs;
                } else {
                    $scope.otherTabs = [
                        {
                            'tab': 'Expense',
                            'tabIndex': 1,
                            'enable': false
                        },
                        {
                            'tab': 'Meetings',
                            'tabIndex': 2,
                            'enable': false
                        },
                        {
                            'tab': 'Payments',
                            'tabIndex': 3,
                            'enable': false
                        }
                    ];
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
     const updateNav = nav => {
        $http.put("/dash/nav/tabs/update", nav)
            .then(update => {
                if(update.data){
                    Settings.success_toast("Successful", "Nav Settings Updated");
                    Settings.getNav(true, nav => {
                        $scope.nav = nav;
                        $scope.reportTab = $scope.nav[8].cols;
                    });
                } else Settings.fail_toast("Error", "Could not update the tab's name");
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
     const updateOtherTabs = nav => {
        $http.put("/dash/nav/others/update", nav)
            .then(response => {
                console.log(response.data);
                Settings.success_toast("Successful", nav.tab + " Tab " + (nav.enable ? "Enabled" : "Disabled"));
                fetchOtherTabs();
                // $scope.taxSetup = flag
            })
     }
     const fetchLeaves = () => {
        $http.get("/dash/settings/details/leave")
            .then(leave => {
                if(leave.data && leave.data.leaveType){
                    $scope.leaveType = leave.data.leaveType;
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
     //... When you update the nav name...
     $scope.updateTabName = (new_name, nav) => {
        if(new_name){
            if(nav.tab != new_name){
                Settings.confirmPopup("Confirm", 
                "Renaming " + nav.tab + " to " + new_name + ".\nAre you sure?", 
                result => {
                    if(result){
                        nav.tab = new_name;
                        let update = {};
                        update.task = 'name';
                        update.nav = nav;
                        updateNav(update);
                    }
                });
            }
        } else Settings.fail_toast("Error", "Enter a name for the tab");
    }
    $scope.toggleNav = (nav) => {
        Settings.confirmPopup("Confirm", 
            (nav.activated ? "Enable " : "Disable " ) + nav.tab + "?",
            result => {
                if(result){
                    let update = {};
                    update.task = 'toggle';
                    update.nav = nav;
                    updateNav(update);
                }
            })
    };
    $scope.toggleLeaves = leave => {
        Settings.confirmPopup("Confirm", 
            (leave.enable ? "Enable " : "Disable " ) + leave.name + " for all users?",
            result => {
                if(result){
                    $http.put("/dash/nav/leave/update", leave)
                        .then(update => {
                            if(update.data){
                                Settings.success_toast("Success", "Leave Setting Updated");
                                fetchLeaves();
                            }else Settings.fail_toast("Error", "Could not update the setting");
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
            });
    };
    //Report tab toggle
    $scope.toggleReportTab = report => {
        report.task = 'reportToggle';
        $http.put("/dash/nav/tabs/update", report)
            .then(response => {
                if(response.data && response.data.status == "success"){
                    Settings.success_toast("Success", report.tabName + " tab " + (report.enabled ? "Enabled" : "Disabled" ));
                    Settings.getNav(true, (nav) => {
                        $scope.nav = nav;
                        $scope.reportTab = $scope.nav[8].cols;
                    });
                } else Settings.fail_toast("Error", "Error Enabling the Report Tab");
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
    $scope.renameReportChange = (new_name, nav) => {
        if(new_name){
            Settings.confirmPopup("Confirm", "Renaming " + nav.tabName + " to " + new_name, result => {
                if(result){
                    nav.tab = new_name;
                    nav.task = 'report';
                    $http.put("/dash/nav/tabs/update", nav)
                        .then(response => {
                            if(response.data && response.data.status == "success"){
                                Settings.success_toast("Success", nav.tabName + " tab was renamed to " + new_name);
                                Settings.getNav(true, (nav) => {
                                    $scope.nav = nav;
                                    $scope.reportTab = $scope.nav[8].cols;
                                });
                            } else Settings.fail_toast("Error", "Error Renaming the Report Tab");
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
        }
        else{
            Settings.popupAlert("Enter a name for the tab")
        }
    }
    $scope.otherTabSetup = (tab) => {
        Settings.confirmPopup("Confirm", 
            (tab.enable ? "Enable " : "Disable " ) + tab.tab + "?",
            result => {
                if(result){
                    updateOtherTabs(tab);
                }else
                    fetchOtherTabs();
            })
    }
    fetchOtherTabs();
    fetchLeaves();
 });