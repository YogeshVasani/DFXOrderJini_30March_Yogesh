/**
 * Created by shreyasgombi on 05/07/22.
 */
 angular.module('ebs.controller')
    .controller("ModuleAdminCtrl", ($scope, $routeParams, $http, $window, Settings) => {
        console.log("Hello From Module Settings Controller .... !!!! ");
        $scope.tab = 'overview';
        $scope.application_type = "B2BOMS";
        $scope.order_status = {"order_status" : false, "line_status" : false, "default_delivery_days" : "0"};
        $scope.orderConditions = {"enabled" : false, "type" : terms_conditions_order, "terms_conditions" : ""};
        $scope.customer_config = {};
        $scope.invoice_prefix = {};
        $scope.inventory_config = {"type" : "quantity"};
        $scope.new_location = {"type" : "Real Location"};
        $scope.edited_location = {};
        //....Atmosphere....
        $scope.newEvaluationType = {};
        $scope.settingsEvaluation = [];
        $scope.settingsDepartment = [];
        $scope.editEvaluationType = [];
        $scope.editDepartmentSetup = [];
        $scope.settings = {};
        $scope.settings.token = false;
        $scope.settings.application_type = "";
        $scope.settings.standard_order_fulfilment = false;
        $scope.settings.attendance = false;
        $scope.settings.van_sales = false;
        $scope.country = {};
        $scope.country.name = 'India';
        //... Google Maps API Key....
        $scope.gMapAPI = {};
        $scope.token = false;
        $scope.applicationType = "";
        $scope.standardOrderFulfilFlag = false;
        let instance_details = Settings.getInstance();
        $scope.token = instance_details.token;
        $scope.country.name = instance_details.country || 'India';
        $scope.settings.invoice = instance_details.invoice;
        $scope.settings.attendance = instance_details.attendance;
        $scope.settings.currency = instance_details.currency || '₹';
        $scope.settings.van_sales = instance_details.vanSalesEnable;
        $scope.goalsConfigArray = instance_details.goalsConfig ? instance_details.goalsConfig : {};
        $scope.gMapAPI = instance_details.gMapAPI;
        $scope.applicationType = (!instance_details.applicationType || instance_details.applicationType == "B2BOMS" ? "" : instance_details.applicationType);
        if($scope.applicationType == "Atmosphere") $scope.tab = "atmosphere";
        console.log(instance_details);
        //.... Users...
        $scope.user_roles = [];
        $scope.nav = [];
        $scope.editSetupRoles = [];
        Settings.getNav(false, nav => {
            $scope.nav = nav;
            if($scope.nav && $scope.nav[4].roles && $scope.nav[4].roles.length){
                $scope.user_roles = $scope.nav[4].roles;
                for(let i = 0; i < $scope.user_roles.length; i++){
                    $scope.editSetupRoles.push({
                        name :$scope.user_roles[i].name,
                        role :$scope.user_roles[i].role.toLowerCase()
                    });
                }
                $http.put("/dash/settings/update/roles", $scope.user_roles)
                    .then(response => {
                        if(response.data && response.data.status == "success"){
                            console.log("Updated Role Configuration for W/R Permission Settings --->");
                        }
                    });
            }
        })
        $scope.add_new_items = instance_details.addItems;
        //.... Lead Statuses...
        $scope.lead_statuses = [];
        $scope.lead_sources = [];
        $scope.warehouse_locations = [];
        $scope.customer_category = [];
        //... Country Data....
        $scope.countryCode = {};
        if(instance_details.applicationType)
            $scope.application_type = instance_details.applicationType;
        //.... Tabs ....
        if($routeParams.tab) $scope.tab = $routeParams.tab;
        //... Zeita ...
        $scope.mpg = [];
        $scope.orderType = [];
        $scope.salesUOM = [];
        $scope.newmpg = {};
        $scope.neworderType = {};
        $scope.newUOM = {};
        const startLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "inline");
        };
        const stopLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "none");
        }
        $http.get("/country/countryCode")
            .then(countries =>  {
                if(countries.data)
                    $scope.countryCode = countries.data;
            }, (error, status) => {
                console.log(error, status);
                if(status >= 400 && status < 500)
                    $window.location.href = '/404';
                else if(status >= 500)
                    $window.location.href = '/500';
            })
        const fetchDealerTab = () => {
            $http.get("/dash/settings/details/DealerTabs")
                .then(pincode => {
                    if(pincode.data){
                        $scope.settings.pincode_mandatory = pincode.data.PinCodeMadatory;
                    }else{
                        $scope.settings.pincode_mandatory = false;
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
            $http.get("/dash/settings/details/customer_setup")
                .then(setup => {
                    if(setup.data){
                        $scope.settings.category_mandatory = setup.data.category_mandatory || false;
                    }else{
                        $scope.settings.category_mandatory = false;
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
        const fetchTaxExclusive = () => {
            $http.get("/dash/settings/details/tax")
                .then(tax => {
                    if(tax.data){
                        $scope.settings.tax_exclusive = tax.data.taxExclusive;
                    }else{
                        $scope.settings.tax_exclusive = false;
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
        const fetchOrderSetup = () => {
            startLoader();
            $http.get("/dash/settings/details/order_setup")
                .then(status => {
                    stopLoader();
                    if(status.data){
                        if(status.data.default_delivery_days || status.data.default_delivery_days === 0) status.data.default_delivery_days = status.data.default_delivery_days.toString();
                        else if(!status.data.default_delivery_days) status.data.default_delivery_days = "0";
                        $scope.order_status = status.data;
                    }else{
                        $scope.order_status = {"order_status" : false, "line_status" : false, "default_delivery_days" : "0"};
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
        const fetchOrderTermsAndCondition = () => {
            startLoader();
            $http.get("/dash/settings/details/terms_conditions_order")
                .then(terms => {
                    console.log("Terms & Conditions ---> ", terms);
                    stopLoader();
                    if(terms.data){
                        $scope.orderConditions.terms_conditions_order = terms.data.enabled;
                        $scope.orderConditions.terms_conditions = terms.data.terms_conditions;
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
        const fetchCustomerSetup = () => {
            startLoader();
            $http.get("/dash/settings/details/customer_setup")
                .then(setup => {
                    stopLoader();
                    if(setup.data){
                        $scope.customer_config = setup.data;
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
        const fetchInvoiceRunningID = () => {
            $http.get("/dash/settings/invoice/recent/id")
                .then(response => {
                    if(!response.data){
                        $scope.invoice_prefix.num = Settings.zeroPad(1, 5);
                    }else{
                        $scope.invoice_prefix.num = Settings.zeroPad(response.data.invoiceID, 5);
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
        const fetchInvoiceSettings = () => {
            $http.get("/dash/settings/details/invoice")
                .then(invoice => {
                    if(invoice.data){
                        $scope.invoice_prefix = invoice.data;
                        fetchInvoiceRunningID();
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
        const fetchLeadStatuses = () => {
            $http.get("/dash/settings/details/leadStatus")
                .then(leads => {
                    if(leads.data){
                        $scope.lead_statuses = leads.data.obj;
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
        const fetchLeadSources = () => {
            $http.get("/dash/settings/details/leadSource")
                .then(sources => {
                    if(sources.data){
                        $scope.lead_sources = sources.data.obj;
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
        const fetchInventoryMode = () => {
            $http.get("/dash/settings/details/inventory")
                .then(inventory => {
                    if(inventory.data){
                        $scope.inventory_config.type = inventory.data.inventoryType;
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
        const fetchWarehouseLocations = () => {
            $http.get("/dash/settings/inventory/locations")
                .then(response => {
                    if(response.data && response.data.length){
                        $scope.warehouse_locations = response.data[0].location;
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
        const fetchStandardOrderFulfilment = () => {
            $http.get('/dash/settings/standard/fulfilment')
                .then(response => {
                    if(response.data.length){
                        $scope.standardOrderFulfilFlag = response.data[0].standardOrderFulfilFlag;
                        $scope.settings.standard_order_fulfilment = response.data[0].standardOrderFulfilFlag;
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
        const fetchAppUpdateNotification = () => {
            $http.get('/dash/settings/app/update/status')
                .then((response) => {
                    if(response.data && response.data.length){
                        $scope.settings.app_update_notification = response.data[0].updateNotification;
                        $scope.settings.app_force_update = response.data[0].enforceUpdate;
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
        const fetchPermissions = () => {
            $http.get('/dash/settings/details/editByRoles')
                .then((response) => {
                    if(response.data && response.data.roles){
                        $scope.editByRoles = response.data.roles;
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
        // Fetch Customer Category
        const fetchCustomerType = () => {
            $http.get("/dash/settings/details/customerCategory")
                .then(type => {
                    if(type.data){
                        $scope.customer_category = type.data.obj;
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
        const loadMPGList = () => {
            $http.get("/dash/settings/details/mpg")
                .then(type => {
                    if(type.data){
                        $scope.mpg = type.data.obj;
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
        const loadUOMList = () => {
            $http.get("/dash/settings/details/salesUOM")
                .then(type => {
                    if(type.data){
                        $scope.salesUOM = type.data.obj;
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
        const loadOrderTypeList = () => {
            $http.get("/dash/settings/details/orderType")
                .then(type => {
                    if(type.data){
                        $scope.orderType = type.data.obj;
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
        const loadPercentageDiscount = () => {
            $http.get("/dash/settings/details/percentageDiscount")
                .then((settings) => {
                    console.log(settings);
                    if(settings && settings.data){
                        if(!settings.data.value || settings.data.value != 'error'){
                            $scope.settings.percentage_discount = settings.data.value;
                            if($scope.settings.percentage_discount){
                                loadMPGList();
                                loadUOMList();
                                loadOrderTypeList();
                            }
                        }else
                            console.log("Invalid Request : ", settings);
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
        //.... Changing the line status setting....
        $scope.lineStatus = () => {
            startLoader();
            $http.put("/dash/settings/enable/status/line", {status: $scope.order_status.line_status})
                .then(status => {
                    stopLoader();
                    if (status.data) {
                        Settings.success_toast("Success", "Line Settings Updated");
                        Settings.setInstanceDetails('lineStatusChange', $scope.order_status.line_status);
                        fetchOrderSetup();
                        console.log("!!!! Update Line Status Enable / Disable option --->");
                    }
                })
        };
        $scope.orderStatus = () => {
            startLoader();
            $http.put("/dash/settings/enable/status/order", {status: $scope.order_status.order_status})
                .then(status => {
                    stopLoader();
                    if (status.data) {
                        Settings.success_toast("Success", "Order Status Settings Updated");
                        Settings.setInstanceDetails('statusChange', $scope.order_status.order_status);
                        fetchOrderSetup();
                        console.log("!!!! Update Order Status Enable / Disable option --->");
                    }
                })
        };
        $scope.stockistTagging = () => {
            startLoader();
            $http.put("/dash/settings/enable/status/stockist", {"status" : $scope.order_status.order_stockist_tagging})
                .then(response => {
                    stopLoader();
                    if(response.data){
                        Settings.success_toast("Success", "Order Status Settings Updated");
                        fetchOrderSetup();
                    }
                })
        };
        $scope.recordPayment = () => {
            startLoader();
            $http.put("/dash/settings/enable/status/payment", {"status" : $scope.order_status.record_payment})
                .then(response => {
                    stopLoader();
                    if(response.data){
                        Settings.success_toast("Success", "Record Payment Settings Updated");
                        fetchOrderSetup();
                    }
                })
        };
        $scope.creditLimit = () => {
            startLoader();
            $http.put("/dash/settings/enable/status/credit", {"status" : $scope.order_status.credit_limit})
                .then(response => {
                    stopLoader();
                    if(response.data){
                        Settings.success_toast("Success", "Credit Limit Settings Updated");
                        fetchOrderSetup();
                    }
                })
        };
        $scope.editPrice = () => {
            startLoader();
            $http.put("/dash/settings/enable/status/price", {"status" : $scope.order_status.edit_price})
                .then(response => {
                    stopLoader();
                    if(response.data){
                        Settings.success_toast("Success", "Edit Price Settings Updated");
                        fetchOrderSetup();
                    }
                })
        };
        $scope.inventoryControl = () => {
            startLoader();
            $http.put("/dash/settings/enable/status/inventory", {"status" : $scope.order_status.inventory_control})
                .then(response => {
                    stopLoader();
                    if(response.data){
                        Settings.success_toast("Success", "Inventory Control Settings Updated");
                        fetchOrderSetup();
                    }
                })
        };
        $scope.termsConditionsOrder = (abc) => {
                startLoader();
    // $scope.orderConditions.enabled = $scope.orderConditions.terms_conditions_order
                if (abc) {
                    $http.put("/dash/settings/enable/orderstatus/terms_conditions_order", {
                        "enabled": $scope.orderConditions.terms_conditions_order,
                        "terms_conditions": $scope.orderConditions.terms_conditions})
                        .then(response => {
                        stopLoader();
                    if (response.data) {
                        Settings.success_toast("Success", "terms_conditions_order Control Settings Updated");
                        fetchOrderTermsAndCondition();
                    }
                })
                } else {
                $http.put("/dash/settings/enable/orderstatus/terms_conditions_order", {"enabled": $scope.orderConditions.terms_conditions_order})
                    .then(response => {
                    stopLoader();
                if (response.data) {
                    Settings.success_toast("Success", "terms_conditions_order Control Settings Updated");
                    fetchOrderTermsAndCondition();
                }
            })
            }
        };
        $scope.newCustomerAsUser = () => {
            startLoader();
            $http.put("/dash/settings/enable/customer/setup", {"type" : "customer_as_user", "status" : $scope.customer_config.customer_as_user})
                .then(response => {
                    stopLoader();
                    if(response.data){
                        Settings.setInstanceDetails('dealerAsUserFlag', $scope.customer_config.customer_as_user)
                        Settings.success_toast("Success", "Customer As User Settings Updated");
                        fetchCustomerSetup();
                    }
                })
        };
        $scope.customerNotification = () => {
            startLoader();
            $http.put("/dash/settings/enable/customer/setup", {"type" : "customer_onboard_notification", "status" : $scope.customer_config.customer_onboard_notification})
                .then(response => {
                    stopLoader();
                    if(response.data){
                        Settings.setInstanceDetails('newDealerNotification', $scope.customer_config.customer_onboard_notification)
                        Settings.success_toast("Success", "Customer Onboarding SMS Settings Updated");
                        fetchCustomerSetup();
                    }
                })
        };
        $scope.customerToMaster = (status) => {
             startLoader();
            $http.put("/dash/settings/enable/customer/setup", {"type" : "customer_user_to_master", "status" : $scope.customer_config.customer_user_to_master})
                .then(response => {
                    stopLoader();
                    if(response.data){
                        Settings.setInstanceDetails('customer_setup', $scope.customer_config.customer_user_to_master)
                        Settings.success_toast("Success", "Customer User To Customer Master Settings Updated");
                        fetchCustomerSetup();
                    }
                })
        };
        $scope.deliveryDate = () => {
            startLoader();
            $http.put("/dash/settings/enable/status/delivery", {"status" : $scope.order_status.delivery_date})
                .then(response => {
                    stopLoader();
                    if(response.data){
                        Settings.success_toast("Success", "Default Delivery Date Settings Updated");
                        fetchOrderSetup();
                    }
                })
        };
        $scope.orderDeliveryDateSet = () => {
            startLoader();
            $http.put("/dash/settings/enable/status/delivery-days", {"days" : parseInt($scope.order_status.default_delivery_days)})
                .then(response => {
                    stopLoader();
                    if(response.data){
                        Settings.success_toast("Success", "Default Order Delivery Days Settings Updated");
                        fetchOrderSetup();
                    }
                })
        };
        $scope.editOrderStatus = (status, index) => {
            console.log(status);
            if(!status) Settings.fail_toast('Error', "Please enter the new status name");
            else{
                startLoader();
                $scope.nav[1].status[index] = status;
                $http.put("/dash/nav/order/status", $scope.nav[1].status)
                    .then(res => {
                        stopLoader();
                        if(res && res.data){
                            Settings.success_toast("SUCCESS", "Order status name successfully updated!");
                            Settings.setNav($scope.nav);
                        } else {
                            Settings.fail_toast("Error", "Could not update order status name!");
                        }
                    })
            }
        };
        // Select the inventory type in the instance
        $scope.inventoryType = type => {
            Settings.confirmPopup("Confirm", "Are you sure to change the Inventory Mode - " + (type == "serial" ? "Serial No. Based" : "Quantity Based"),
                (result) => {
                    if(result){
                        startLoader();
                        $http.put("/dash/settings/inventory/mode/" + type)
                            .then(response => {
                                stopLoader();
                                if(response.data.status == 'success'){
                                    $scope.inventory_config.type = type;
                                    Settings.success_toast("SUCCESS", "Inventory Mode Updated!");
                                    Settings.setInstanceDetails('inventoryType', $scope.inventoryType)
                                }
                            })
                    }
                })
        }
        $scope.reorderOrderStatus = (dir, value) => {
            let temp = $scope.nav[1].status[value];
            if(dir == 'up'){
                $scope.nav[1].status[value] = $scope.nav[1].status[value - 1];
                $scope.nav[1].status[value - 1] = temp;
            } else if(dir == 'down'){
                $scope.nav[1].status[value] = $scope.nav[1].status[value + 1];
                $scope.nav[1].status[value + 1] = temp;
            }
            startLoader();
            $http.put("/dash/nav/order/status", $scope.nav[1].status)
                .then(res => {
                    stopLoader();
                    if(res && res.data){
                        Settings.success_toast("SUCCESS", "Order status sequence successfully updated!");
                    }
                })
        };
        $scope.customerCategoryMandatory = enable => {
            startLoader();
            $http.put("/dash/settings/customer/category/mandatory", {"customer_category_mandatory" : enable})
                .then(response => {
                    stopLoader();
                    if(response.data && response.data.status == "success"){
                        fetchDealerTab();
                        Settings.success_toast("Success", "Customer Category Mandatory - " + (enable ? "Enabled" : "Disabled"));
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
        $scope.customerPincodeMandatory = enable => {
            startLoader();
            $http.put("/dash/settings/customer/pincode/mandatory", {"type" : "DealerTabs", "PinCodeMadatory" : enable})
                .then(response => {
                    stopLoader();
                    if(response.data && response.data.status == "success"){
                        fetchDealerTab();
                        Settings.success_toast("Success", "Pincode Mandatory - " + (enable ? "Enabled" : "Disabled"));
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
        $scope.toggleTaxExclusive = exclusive => {
            startLoader();
            $http.put("/dash/settings/catalog/prices/tax/exclusive", {activate : exclusive})
                .then(response => {
                    stopLoader();
                    if(response.data && response.data.status == "success"){
                        $scope.taxExclusive = exclusive;
                        Settings.success_toast("Success", "Tax Exclusive - " + (exclusive ? "Yes" : "No"))
                        Settings.setInstanceDetails('taxExclusive', exclusive);
                    }
                })
        }
        $scope.addNewOrderStatus = status => {
            if(status){
                let statuses = $scope.nav[1].status;
                if(statuses && statuses.length){
                    statuses = statuses.map(el => el.toLowerCase());
                    if(statuses.indexOf(status.toLowerCase()) == -1){
                        $scope.nav[1].status.push(status);
                        $http.put("/dash/nav/order/status", $scope.nav[1].status)
                            .then(res => {
                                if(res && res.data){
                                    Settings.success_toast("SUCCESS", "New Order Status was added successfully!");
                                    $scope.new_order_status = "";
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
                    }else{
                        Settings.fail_toast("ERROR", "Status Already Exists!");
                    }
                }else{
                    Settings.fail_toast("ERROR", "No Statuses Available. Add atleast 1 status!");
                }
            }
        };
        $scope.toggleEditOrderDealer = (user, action, type, flag) => {
            startLoader();
            if(type == 'shipment'){
                $scope.editByRoles[user][action == 'edit' ? 0 : 1]['status'][type] = flag;
                $http.put("/dash/settings/admin/update/role/access", $scope.editByRoles)
                    .then(response => {
                        stopLoader();
                        console.log(response.data);
                        if(response.data)
                            Settings.success_toast("Success", "Shipment for " + user + " has been " + (flag ? "Enabled" : "Disabled"));
                        if(!response.data)
                            $scope.editByRoles[user][action == 'shipment' ? 0 : 1][0][type] = !flag;
                        Settings.setInstanceDetails('editByRoles', $scope.editByRoles);       
                    })
                    .catch((error, status) => {
                        console.log(error, status);
                        stopLoader();
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
            }else{
                $scope.editByRoles[user][action == 'edit' ? 0 : 1]['status'][type] = flag;
                $http.put("/dash/settings/admin/update/role/access", $scope.editByRoles)
                    .then(response => {
                        stopLoader();
                        console.log(response.data);
                        if(response.data)
                            Settings.success_toast("Success", "Module " + type + " : " + (action == 'edit' ? "Edit access" : "Delete access") + " for " + user + " has been " + (flag ? "Enabled" : "Disabled"));
                        if(!response.data)
                            $scope.editByRoles[user][action == 'edit' ? 0 : 1][0]['status'][type] = !flag;
                        Settings.setInstanceDetails('editByRoles', $scope.editByRoles);
                    })
                    .catch((error, status) => {
                        stopLoader();
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
        };
        /*..........
                Remove order status from settings page
         .........*/
         $scope.removeStatus = status => {
            let index = $scope.nav[1].status.indexOf(status);
            if(index != -1 && ($scope.nav[1].status.length > 1)){
                Settings.confirmCustomPopup("Confirm", "Are you sure you want to remove the status " + status + " from the list?",
                {"cancel" : "No", "confirm" : "Yes"},
                (result) => {
                    if(result){
                        $scope.nav[1].status.splice(index, 1);
                        $http.put("/dash/nav/order/status", $scope.nav[1].status)
                            .then(res => {
                                if(res && res.data){
                                    Settings.success_toast("SUCCESS", "Status " + status + " was removed successfully!");
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
                });
            } else Settings.fail_toast("ERROR","Alteast 1 Status Needs to be available!");
        }
        $scope.setInvoice = (data, type) => {
            if(type == 'name'){
                $http.put("/dash/settings/invoice/prefix", {value : data || "INV"})
                    .then(response => {
                        if(response.data){
                            $scope.invoice_prefix.name = data;
                            Settings.success_toast('SUCCESS', 'Invoice Prefix Updated Successfully!');
                            Settings.setInstanceDetails('invoiceID', response.data)
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
            } else {
                Settings.confirmPopup("Confirm", "Generation of new invoice numbers will start from "+ data +"?", 
                    result => {
                        if (result) {
                            let number = parseInt(data);
                            //let date = new Date();
                            $http.post("/dash/settings/invoice/set/id", {id:'INV', invoiceID : number, type : 'settings'})
                                .then(res => {
                                    if(res && res.data){
                                        $scope.invoice_prefix.num = Settings.zeroPad(res.data.value.invoiceID, 5);
                                        Settings.success_toast('SUCCESS','Invoice ID Updated Successfully!');
                                        fetchInvoiceSettings();
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
                        }else fetchInvoiceRunningID();
                    });
            }
        };
        $scope.setOrderSequence = (data, type) => {
            console.log('data, type', data, type);
            if(type == 'name'){
                $http.put("/dash/settings/order/sequence/prefix", {value : data || "ORD"})
                    .then(response => {
                        if(response.data){
                            $scope.order_prefix.name = data;
                            Settings.success_toast('SUCCESS', 'Order Prefix Updated Successfully!');
                        }
                    })
                    .catch((error, status) => {
                        // console.log(error, status);
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
            } else {
                Settings.confirmPopup("Confirm", "Generation of new order numbers will start from "+ data +"?", 
                    result => {
                        if (result) {
                            let number = parseInt(data);
                            //let date = new Date();
                            $http.post("/dash/settings/order/sequence/set/id", {id:'ORD', orderID : number, type : 'settings'})
                                .then(res => {
                                    if(res && res.data){
                                        $scope.order_prefix.initOrderID = Settings.zeroPad(res.data.value.orderID, 5);
                                        // console.log('orderprefix numb is ', $scope.order_prefix.initOrderID, res.data)
                                        Settings.success_toast('SUCCESS','Order ID Updated Successfully!');
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
                        }else fetchInvoiceRunningID();
                    });
            }
        };
        $scope.getOrderIdSequence = ()=> {
            $http.post("/dash/settings/order/sequence/set/id", {type: ''})
                .then(res => {
                    if(res && res.data){
                        $scope.order_prefix = res.data;
                    }else
                        $scope.order_prefix = {};
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
        $scope.getOrderIdSequence();
        $scope.addNewItems = () => {
            console.log("Add Items Access --> " + $scope.add_new_items);
            $http.put("/dash/items/add/update", {addItems: $scope.add_new_items})
                .then(response => {
                    if (response.data) {
                        Settings.success_toast('SUCCESS','Add New Catalog Items Settings Updated!');
                        Settings.setInstanceDetails('addItems', $scope.add_new_items)
                    }
                })
        };
        /*..........
                Edit lead status from settings page
         .........*/
        $scope.editLeadStatus = (status, index) => {
            if(!status) Settings.failurePopup('ERROR',"Please enter text");
            else{
                if($scope.lead_statuses.length){
                    if($scope.lead_statuses.indexOf(status.toLowerCase()) == -1){
                        var statusObj = [];
                        statusObj = $scope.lead_statuses;
                        statusObj[index] = status.toLowerCase();
                        $http.post("/dash/settings/leadstatus", statusObj)
                            .then(response => {
                                if(response.data){
                                    Settings.success_toast("SUCCESS", "Lead Status Successfully Updated!");
                                    $scope.lead_statuses[index] = status.toLowerCase();
                                    Settings.setInstanceDetails('leadStatus', $scope.lead_statuses);
                                }
                                else{
                                    Settings.fail_toast("ERROR", "Could not update lead status!");
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
                    else{
                        Settings.fail_toast("ERROR", "Status Name Already Exist");
                    }
                }
            }
        };
        $scope.editLeadSource = (source, index) => {
            if(!source) Settings.failurePopup('ERROR',"Please enter text");
            else{
                if($scope.lead_sources.length){
                    if($scope.lead_sources.indexOf(source.toLowerCase()) == -1){
                        let sources = [];
                        sources = $scope.lead_sources;
                        sources[index] = source.toLowerCase();
                        $http.post("/dash/settings/leadsource", sources)
                            .then(response => {
                                if(response.data){
                                    Settings.success_toast("SUCCESS", "Lead Source Successfully Updated!");
                                    $scope.lead_sources[index] = source.toLowerCase();
                                    Settings.setInstanceDetails('leadSource', $scope.lead_sources)
                                } else {
                                    Settings.fail_toast("ERROR","Could not update lead source!");
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
                    } else Settings.fail_toast("ERROR","Source name already exist");
                }
            }
        };
        $scope.addLeadStatus = status => {
            const addLead = () => {
                let temp = $scope.lead_statuses;
                temp.push(status.toLowerCase())
                $http.post("/dash/settings/leadstatus", temp)
                    .then(response => {
                        if(response.data){
                            Settings.success_toast("SUCCESS", "Lead Status Successfully Added!");
                            $scope.lead_statuses = temp;
                            $scope.new_lead_status = '';
                            Settings.setInstanceDetails('leadStatus', $scope.lead_statuses);
                        } else {
                            Settings.fail_toast("ERROR", "Could not update lead status!");
                        }
                    })
            }
            if(status){
                if($scope.lead_statuses.length){
                    if($scope.lead_statuses.indexOf(status.toLowerCase()) == -1){
                        addLead();
                    }
                    else{
                        Settings.failurePopup("ERROR", "Status Name Already Exist");
                    }
                } else addLead();
            }
            else Settings.fail_toast("ERROR", "Please enter text!");
        };
        $scope.editUserRolesFromSettings = (role, index) => {
            if(!role ) Settings.failurePopup('ERROR',"Please enter text");
            else{
                if($scope.user_roles.length){
                    if($scope.user_roles.indexOf(role.toLowerCase()) == -1){
                        let rolesObj = [];
                        rolesObj = $scope.user_roles;
                        rolesObj[index].name = role;
                        $http.put("/dash/nav/roles/update", rolesObj)
                            .then(response => {
                                if(response.data){
                                    Settings.successPopup("SUCCESS",
                                    "Role " + rolesObj[index].role + " updated with Display Name - " + rolesObj[index].name + "!");
                                }
                                else{
                                    Settings.failurePopup("ERROR", "Error while updating user roles");
                                }
                            })
                    }else{
                        Settings.fail_toast("ERROR", "Role Name Already Exist");
                    }
                }else{
                    Settings.failurePopup("ERROR", "Error while updating user roles - Roles not defined");
                }
            }
        };
        $scope.enableUserRole = (status, index) => {
            if($scope.user_roles.length){
                $scope.user_roles[index].status = status;
                $http.put("/dash/nav/roles/update", $scope.user_roles)
                .then(response => {
                    if(response.data){
                        Settings.success_toast("SUCCESS", "Role " + $scope.user_roles[index].name + ($scope.user_roles[index].status ? " Enabled" : " Disabled" ) + "  Successfully!");
                    }
                    else{
                        Settings.failurePopup('ERROR',"Error while updating user roles");
                    }
                })
            }
        };
        $scope.enableVanSalesToggle = value => {
            $http.put("/dash/settings/van/sales", {"value" : value})
                .then(response => {
                    if(response.data){
                        Settings.success_toast("SUCCESS", "Van Sales " + (value ? " Enabled" : " Disabled" ) + " Successfully!");
                    } else{
                        Settings.fail_toast("Error", "Error Enabling Van Sales");
                    }
                })
        };
        $scope.forceUpdateToggle = (type, value) => {
            if(type == 'updateNotification'){
                $scope.settings.app_update_notification = value;
                //.... If we are turning off the App Update Notification, then we also disable the App Force Update....
                if(!value){
                    $scope.settings.app_force_update = value;
                }
            }
            $http.post("/dash/settings/app/update", {"type" : type, "value" : value})
                .then((response) => {
                    if(response.data){
                        Settings.success_toast("Success", "App Notification : " + (value ? "Enabled" : "Disabled"))
                        fetchAppUpdateNotification();
                    } else Settings.fail_toast("Error", "Error Updating the settings");
                })
        }
        $scope.tokenAccess = () => {
            console.log("Token Access --> " + $scope.token);
            $http.put("/dash/settings/token", {token : $scope.token})
                .then(response => {
                    if (!response.data) {
                        $scope.token = !$scope.token;
                    }else {
                        Settings.success_toast("SUCCESS", "Token " + ($scope.token ? "Enabled" : "Disabled"));
                        Settings.setInstanceDetails('token', $scope.token);
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
        $scope.standredOrderFulfilment = status => {
            $http.put("/dash/settings/update/standard/order/fulfilment", 
                {"type" : "standardOrderFulfilFlag", "standardOrderFulfilFlag" : status})
                    .then(response => {
                        if(response.data){
                            Settings.success_toast("Success", "Standard Fulfilment " + (status ? "Enabled" : "Disabled"))
                            if(status) {
                                let status = ["New", "Approved", "Packing", "Ready for Delivery", "Out for Delivery", "Delivered", "Closed", "Cancelled"];
                                let order_status = [];
                                for (let i = 0; i < status.length; i++){
                                    let obj = {};
                                    obj.status = status[i];
                                    if(i == 0) obj.editable = true;
                                    else obj.editable = false;
                                    order_status.push(obj);
                                }
                                $http.put("/dash/nav/order/status", status)
                                    .then(response => {
                                        if(response.data){
                                            $scope.nav[1].status = status
                                            $http.put("/dash/settings/update/order/edit/access", order_status)
                                                .then(response => {
                                                    if(response.data){
                                                        Settings.setInstanceDetails('orderEditForStatus', response.data);
                                                    }
                                                })
                                        }
                                    })  
                            }
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
        // Select the application type in the instance
        $scope.changeApplicationType = type => {
            $http.put("/dash/settings/application/" + type)
                .then(response => {
                    if(response.data && response.data.status == 'success') {
                        Settings.success_toast("SUCCESS", "Application Type has been set to " + type);
                        $scope.applicationType = type;
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
        //..... Update the invoice module setting, to enable users to create invoice for orders, etc 'on-portal'...
        //... Currently designed for B&B Formork customer....
        $scope.invoicingType = () => {
            console.log($scope.settings.invoice);
            $http.put("/dash/settings/invoice", {invoice: $scope.settings.invoice})
                .then(response => {
                    if (response.data && response.data.status == "success") {
                        Settings.success_toast("SUCCESS", "Invoicing set to " + ($scope.settings.invoice || "One Time" ));
                        Settings.setInstanceDetails('invoice', $scope.settings.invoice)
                        console.log("!! Update Invoicing --->")
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
        $scope.attendanceEnable = () => {
            console.log("Enable/Disable attendance Access --> ", $scope.settings.attendance);
            $http.put("/dash/settings/attendance", {attendance: $scope.settings.attendance})
                .then((response) => {
                    if (response.data) {
                        Settings.success_toast("SUCCESS", "Attendance Module : " + ($scope.settings.attendance ? "Enabled" : "Disabled"));
                        Settings.setInstanceDetails('attendance', $scope.settings.attendance)
                    }else $scope.settings.attendance = !$scope.settings.attendance;
                })
        };
        $scope.checkInDistCalEnable = () => {
            // console.log("Enable/Disable checkin previous distance caluculate --> ", $scope.settings.checkInDistCalStatus);
            let checkinObject = {
                checkInDistCalStatus: $scope.settings.checkInDistCalStatus,
                checkIn2WheelerDist : $scope.settings.checkIn2WheelerDist,
                checkIn4WheelerDist : $scope.settings.checkIn4WheelerDist
            }
            $http.put("/dash/settings/checkin/distance", checkinObject)
                .then((response) => {
                    if (response.data) {
                        Settings.success_toast("SUCCESS", "Checkin Distance Calculation : " + ($scope.settings.checkInDistCalStatus ? "Enabled" : "Disabled"));
                        // Settings.setInstanceDetails('checkInDistCal', $scope.settings.checkInDistCal)
                    }else $scope.settings.checkInDistCalStatus = !$scope.settings.checkInDistCalStatus;
                })
        };
        const fetchCheckInPrevDist = () => {
            let checkInDistPrevType = 'checkInPreviousDistance'
            $http.get("/dash/settings/type/"+ checkInDistPrevType)
                .then(type => {
                    // console.log('type is checkin ',type.data)
                if(type.data){
                    $scope.settings.checkInDistCalStatus = type.data.checkInDistCalStatus;
                    $scope.settings.checkIn2WheelerDist = type.data.checkIn2WheelerDist;
                    $scope.settings.checkIn4WheelerDist = type.data.checkIn4WheelerDist;
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
        fetchCheckInPrevDist();
        //... Set the instance's currency....
        $scope.setCurrency = currency => {
            console.log("Setting Currency --> " + currency);
            $http.post("/dash/settings/currency", {"currency" : currency})
                .then(response => {
                    if(response.data && response.data.status == "success"){
                        Settings.success_toast("SUCCESS", "Instance Currency : " + currency);
                        $scope.settings.currency = currency;
                        Settings.setInstanceDetails('currency', currency);
                    }
                });
        };
        //Function to update GMAP API KEY from SETTINGS PAGE. Only by Admin
        $scope.editGoogleMapsAPIKey = (gMapKey, index,type) => {
            if(!gMapKey) Settings.fail_toast('ERROR',"Please Enter the API Key");
            else{
                $scope.gMapAPI = {"api_key" : gMapKey};
                $http.post("/dash/settings/google/maps", $scope.gMapAPI)
                    .then(response => {
                        if(response.data){
                            Settings.success_toast('SUCCESS',"API Key Successfully Updated!");
                            $scope.newEditGMapAPI = $scope.gMapAPI.api_key;
                            Settings.setInstanceDetails('gMapAPI', $scope.gMapAPI.api_key)
                        } else Settings.fail_toast('ERROR',"Could not update API Key!");
                    })
            }
        }
        $scope.addgMapAPI = gMapKey => {
            $scope.gMapAPI = {"api_key" : gMapKey};
            if(gMapKey){
                $http.post("/dash/settings/google/maps", $scope.gMapAPI)
                    .then(response => {
                        if(response.data){
                            Settings.success_toast('SUCCESS',"Google Maps API Key Successfully Added!");
                            Settings.setInstanceDetails('gMapAPI', $scope.gMapAPI);
                        }
                    })
            } else Settings.fail_toast("ERROR","Please Enter a Valid API KEY!");
        }
        $scope.editGmap = () => {
            $scope.newEditGMapAPI = $scope.gMapAPI;
        }
        $scope.setCountry = country => {
            console.log("Setting Country --> " + country);
            if(country){
                let dial_code = '';
                if($scope.countryCode){
                    for(let i = 0; i < 245; i++){
                        //... If country matches, we set it's dial_code and currency....
                        if(country == $scope.countryCode[i].name){
                            dial_code = $scope.countryCode[i].dial_code;
                            if($scope.countryCode[i].currency) $scope.setCurrency($scope.countryCode[i].currency);
                        }
                    }
                }
                $http.post("/dash/settings/country", {"country" : country, "dial_code" : dial_code})
                    .then(response => {
                        if(response.data && response.data.status == 'success'){
                            $scope.settings.country = country;
                            Settings.setInstanceDetails('countryCode', dial_code);
                            Settings.setInstanceDetails('country', country)
                            Settings.success_toast("SUCCESS", "Country Set To : " + country);
                        }
                    });
            }
        }
        $scope.addLeadSource = source => {
            const addSource = () => {
                let temp = $scope.lead_sources;
                temp.push(source.toLowerCase())
                $http.post("/dash/settings/leadsource", temp)
                    .then(response => {
                        if(response.data){
                            $scope.lead_sources = temp;
                            $scope.new_lead_source = '';
                            Settings.success_toast("SUCCESS","Lead Source Successfully Added!");
                            Settings.setInstanceDetails('leadSource', $scope.lead_sources);
                        }else {
                            Settings.fail_toast("ERROR", "Could not update lead source!");
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
            if(source){
                if($scope.lead_sources.length){
                    if($scope.lead_sources.indexOf(source.toLowerCase()) == -1){
                        addSource();
                    } else {
                        Settings.fail_toast("ERROR", "Source Name Already Exist");
                    }
                } else addSource();
            } else Settings.fail_toast("ERROR", "Please enter text!");
        }
        /*..........
                Remove lead status from settings page
         .........*/
         $scope.removeleadStatus = index => {
            let leads = $scope.lead_statuses;
            leads.splice(index, 1);
            $http.post("/dash/settings/leadstatus", leads)
                .then(response => {
                    if(response.data){
                        Settings.success_toast('SUCCESS', "Lead Status Successfully Removed!");
                        $scope.lead_statuses = leads;
                        Settings.setInstanceDetails('leadStatus', $scope.lead_statuses)
                    } else Settings.fail_toast("ERROR", "Could not update lead status!");
                })
        };
        /*..........
         Remove  lead source from settings page
         .........*/
         $scope.removeleadSource = index => {
            let sources = $scope.lead_sources;
            sources.splice(index,1);
            $http.post("/dash/settings/leadsource", sources)
                .success(function(res){
                    if(res){
                        Settings.success_toast("SUCCESS", "Lead Source Successfully Removed!");
                        $scope.lead_sources = sources;
                        Settings.setInstanceDetails('leadSource', $scope.lead_sources);
                    } else Settings.fail_toast("ERROR", "Could not update lead source!");
                })
        };
        $scope.editWarehouse = (location, index) => {
            if(location) {
                $http.put("/dash/settings/update/inventory/locations", {location : location, type : 'edit', index : index})
                    .then(response => {
                        if(response.data){
                            fetchWarehouseLocations();
                            Settings.success_toast("SUCCESS", "Warehouse Location Successfully Updated!");
                            //... Location refresh...
                        } else Settings.fail_toast("ERROR", "Could not update warehouse location details!");
                    })
            }
        };
        // Remove warehouse location from settings collection.....
        $scope.removeWarehouseLocation = location => {
            $http.put("/dash/settings/update/inventory/locations", {location : location, type : 'remove'})
                .then(response => {
                    if(response.data){
                        fetchWarehouseLocations();
                        Settings.success_toast("SUCCESS", "Warehouse Location Successfully Updated!");
                        $scope.warehouse_locations.splice($scope.warehouse_locations.indexOf(location), 1);
                    } else Settings.fail_toast("ERROR", "Could not delete warehouse location!");
                })
        };
        $scope.customerDiscount = enable => {
            $http.put("/dash/settings/update/percentage/discount", {customerDiscount :enable})
                .then(response => {
                    if(response.data){
                        Settings.success_toast("SUCCESS", "Percentage Discount (Zeita) " + (enable ? "Enabled" : "Disbled") + " Successfully!");
                    } else Settings.fail_toast("ERROR", "Could not enable percentage discount (zeita)!");
                })
        }
        // Adding warehouse location to settings collection.....
        $scope.addWarehouseLocation = location => {
            if(location.name){
                location.name = location.name.toUpperCase();
                location.latitude = parseFloat(location.latitude);
                location.longitude = parseFloat(location.longitude);
                if(JSON.stringify($scope.warehouse_locations).indexOf(location.name) != -1){
                    Settings.fail_toast("Error","Location Name Already Exist");
                    return;
                };
                $http.put("/dash/settings/update/inventory/locations",{location : location})
                    .then(response => {
                        if(response.data) {
                            fetchWarehouseLocations();
                            $scope.new_location.name = '';
                            $scope.new_location.type = 'Real Location';
                            $scope.new_location.latitude = '';
                            $scope.new_location.longitude = '';
                            Settings.success_toast("Success", "Warehouse Location Added Successfully");
                        }
                    }).catch(function(error){
                    console.log(error)
                })
            } else Settings.fail_toast("ERROR", "Please enter warehouse name");
        }
        /*.....................................
                Atmosphere
        ....................................*/
        const fetchEvaluations = () => {
            $http.get("/dash/settings/get/evaluation")
                .then(response => {
                    console.log("Evaluation Types --> " + response.data.length);
                    stopLoader();
                    $scope.settingsEvaluation = response.data[0].obj;
                })
        }
        const fetchDepartments = () => {
            if(!$scope.settingsDepartment.length){
                $http.get("/dash/settings/get/department")
                .success(function(response){
                    console.log("Department from settings ---> " + response.length);
                    if(!$scope.settingsDepartment.length){
                        $http.get("/dash/userDepartments")
                            .success(function(response){
                                console.log("All departments" + response.length);
                                if(response.length) $scope.allDepartments = response;
                                $http.put("/dash/settings/update/department",   $scope.allDepartments)
                                    .success(function(res){
                                        $http.get("/dash/settings/get/department")
                                            .success(function(response){
                                                if(response.length) $scope.settingsDepartment = response[0].obj;
                                            })
                                    })
                            });
                    }
                    else{
                        console.log("departments exists");
                        $http.get("/dash/settings/get/department")
                            .success(function(response){
                                console.log(response)
                                if(response.length) $scope.settingsDepartment = response[0].obj;
                            })
                    }
                })
            }
        }
        //Atmosphere....Functions for settings --->Author shradha
            $scope.addEvaluationType = function(type,days){
                var length = $scope.settingsEvaluation.length - 1;
                if(type != '' && type != undefined && days != '' && days != undefined){
                    var typeCaps = type.charAt(0).toUpperCase();
                    $scope.settingsEvaluation[length+1] = {
                        'name' : typeCaps+type.slice(1),
                        'days' : days
                    };
                    $scope.newEvaluationType.type = '';
                    $scope.newEvaluationType.days = '';
                    $http.put("/dash/settings/update/evaluationType",  $scope.settingsEvaluation)
                        .success(function(res){
                            console.log(res);
                        })
                }
            }
            $scope.editEvaluationTypeFromSettings = function(roles, index){
                if(roles == undefined){
                    Settings.popupAlert("Please enter some text!")
                }
                else{
                    var rolesObj = [];
                    rolesObj = $scope.settingsEvaluation;
                    rolesObj[index] = {
                        name : $scope.settingsEvaluation[index].name,
                        days : roles
                    };
                    console.log(rolesObj)
                    $http.put("/dash/settings/update/evaluationType",  $scope.settingsEvaluation)
                        .success(function(res){
                            console.log(res);
                            if(res) {
                                Settings.popupAlert("Evaluation type successfully updated");
                            } else Settings.popupAlert("Error while updating evaluation type");
                        })
                }
            };
        $scope.removeEvaluationType = function(roles){
            var index = $scope.settingsEvaluation.map(function(o) { return o.name; }).indexOf(roles);
            console.log(index);
            if(index != -1 && ($scope.settingsEvaluation.length > 1)){
                console.log(index);
                $scope.settingsEvaluation.splice(index, 1);
                console.log($scope.settingsEvaluation)
                $http.put("/dash/settings/update/evaluationType", $scope.settingsEvaluation)
                    .success(function(res){
                        //console.log(res);
                        // $scope.userRole = res;
                    })
            }
            else Settings.popupAlert("A minimum of one type has to be present.");
        }
        $scope.addDepartment = function(name){
            var length = $scope.settingsDepartment.length-1
            if(name != '' && name != undefined){
                var typeCaps = name.charAt(0).toUpperCase();
                $scope.settingsDepartment[length+1] = {
                    'name' : typeCaps+name.slice(1)
                };
                $scope.newEvaluationType.dept = '';
                $http.put("/dash/settings/update/department",  $scope.settingsDepartment)
                    .success(function(res){
                        console.log(res);
                    })
            } else Settings.popupAlert("Please enter both the fields.");
        }
        $scope.removeDepartmentFormSetup = function(roles){
            var index = $scope.settingsDepartment.map(function(o) { return o.name; }).indexOf(roles);
            if(index != -1 && ($scope.settingsDepartment.length > 1)){
                $scope.settingsDepartment.splice(index, 1);
                $http.put("/dash/settings/update/department", $scope.settingsDepartment)
                    .success(function(res){
                        console.log(res);
                    })
            } else Settings.popupAlert("A minimum of one type has to be present.");
        }
        $scope.editDepartmentFromSettings = function(roles, index){
            if(roles == undefined){
                Settings.popupAlert("Please enter some text");
            }
            else{
                var rolesObj = [];
                var typeCaps = roles.charAt(0).toUpperCase();
                rolesObj = $scope.settingsDepartment;
                rolesObj[index] = {
                    name : typeCaps+roles.slice(1)
                };
                $http.put("/dash/settings/update/department",  rolesObj)
                    .success(function(res){
                        console.log(res);
                        if(res) {
                            Settings.popupAlert("Department successfully updated")
                        } else Settings.popupAlert("Error while updating department")
                    })
            }
        };
        $scope.addGoalsConfiguration = function(evaluation) {
            if(evaluation != '' && evaluation != undefined){
                $scope.goalsConfigArray= {
                    'holiday' : evaluation.holiday,
                    'week_start' : evaluation.week_start,
                    'week_end' : evaluation.week_end
                }
                $http.put("/dash/settings/update/goalsConfig",  $scope.goalsConfigArray)
                    .success(function(res){
                        Settings.popupAlert("Goals configuration successfully updated")
                    })
            } else Settings.popupAlert("Please enter text.");
        };
        if($scope.applicationType == "Atmosphere"){
            startLoader();
            fetchEvaluations();
            fetchDepartments();
        }else{
            fetchOrderSetup();
            fetchInvoiceSettings();
            fetchLeadStatuses();
            fetchLeadSources();
            fetchInventoryMode();
            fetchWarehouseLocations();
            fetchCustomerSetup();
            fetchStandardOrderFulfilment();
            fetchAppUpdateNotification();
            fetchPermissions();
            fetchDealerTab();
            fetchTaxExclusive();
            fetchCustomerType();
            fetchOrderTermsAndCondition();
            loadPercentageDiscount();
        }
        /*..........
            ADD Customer Category  from settings page
        .........*/
        $scope.addCustomerType = category => {
            const addType = () => {
                let temp = $scope.customer_category;
                temp.push(category.toUpperCase())
                $http.post("/dash/settings/customercategory", temp)
                    .then(response => {
                        if(response.data){
                        $scope.customer_category = temp;
                        $scope.new_customer_category = '';
                        Settings.success_toast("SUCCESS","customer type Successfully Added!");
                        Settings.setInstanceDetails('customerCategory', $scope.customer_category);
                    }else {
                        Settings.fail_toast("ERROR", "Could not update customer_category!");
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
            if(category){
                        console.log("category",category)
                if($scope.customer_category.length){
                    if($scope.customer_category.indexOf(category.toUpperCase()) == -1){
                        addType();
                    } else {
                        Settings.fail_toast("ERROR", "Customer Category  Already Exist");
                    }
                } else addType();
            } else Settings.fail_toast("ERROR", "Please enter text!");
        }
        /*..........
            Edit Customer Category  from settings page
        .........*/
        $scope.editCustomerType = (category, index) => {
            if(!category) Settings.failurePopup('ERROR',"Please enter text");
            else{
                if($scope.customer_category.length){
                    if($scope.customer_category.indexOf(category.toUpperCase()) == -1){
                        let custCategory = [];
                        custCategory = $scope.customer_category;
                        custCategory[index] = category.toUpperCase();
                        $http.post("/dash/settings/customercategory", custCategory)
                            .then(response => {
                            if(response.data){
                            Settings.success_toast("SUCCESS", "Customer category Successfully Updated!");
                            $scope.customer_category[index] = category.toUpperCase();
                            Settings.setInstanceDetails('customerCategory', $scope.customer_category)
                        } else {
                            Settings.fail_toast("ERROR","Could not update Customer category!");
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
                    } else Settings.fail_toast("ERROR","Source name already exist");
                }
            }
        };
        /*..........
         Remove  Customer Type from settings page
         .........*/
        $scope.removeCustomerType = index => {
            let custCategory = $scope.customer_category;
            custCategory.splice(index,1);
            $http.post("/dash/settings/customercategory", custCategory)
                .success(function(res){
                    if(res){
                        Settings.success_toast("SUCCESS", "Customer Category Successfully Removed!");
                        $scope.customer_category = custCategory;
                        Settings.setInstanceDetails('customerCategory', $scope.customer_category);
                    } else Settings.fail_toast("ERROR", "Could not update Customer Category!");
                })
        };
        /*...
            Zeita Functions
        ...*/
        //Function to update MPG from SETTINGS PAGE. Only by Admin
        $scope.editMPGFromSettings = (source, index, type) => {
            if(!source){
                Settings.failurePopup('ERROR',"Please enter text");
            } else {
                if($scope.mpg.length){
                    if($scope.mpg.indexOf(source.toLowerCase()) == -1){
                        editMPGFunc ();
                    }
                    else{
                        Settings.failurePopup('ERROR',"Source name already exist");
                    }
                }
                function editMPGFunc(){
                    var sourceObj = [];
                    sourceObj = $scope.mpg;
                    sourceObj[index] = source.toLowerCase();
                    $http.post("/dash/settings/mpg", sourceObj)
                        .success(function(res){
                            if(res){
                                Settings.success_toast('SUCCESS',"MPG successfully updated!");
                                $scope.mpg[index] = source.toLowerCase();
                                Settings.setInstanceDetails('mpg', $scope.mpg)
                            }
                            else{
                                Settings.failurePopup('ERROR',"Could not update MPG!");
                            }
                        })
                }
            }
        }
        //Function to update OrderType from SETTINGS PAGE. Only by Admin
        $scope.editOrderTypeFromSettings = function(source, index,type){
            if(!source)
                Settings.failurePopup('ERROR',"Please enter text");
            else{
                if($scope.orderType.length){
                    if($scope.orderType.indexOf(source.toLowerCase()) == -1){
                        editOrderTypeFunc();
                    } else {
                        Settings.failurePopup('ERROR',"OrderType already exist");
                    }
                }
                function editOrderTypeFunc(){
                    var sourceObj = [];
                    sourceObj = $scope.orderType;
                    sourceObj[index] = source.toLowerCase();
                    $http.post("/dash/settings/orderType", sourceObj)
                        .success(function(res){
                            if(res){
                                Settings.success_toast('SUCCESS',"orderType successfully updated!");
                                $scope.orderType[index] = source.toLowerCase();
                                Settings.setInstanceDetails('orderType', $scope.orderType)
                            }
                            else{
                                Settings.failurePopup('ERROR',"Could not update orderType!");
                            }
                        })
                }
            }
        }
        //Function to update sales UOM from SETTINGS PAGE. Only by Admin
        $scope.editSalesUOMFromSettings = function(source, index,type){
            if(!source)
                Settings.failurePopup('ERROR',"Please enter text");
            else {
                if($scope.salesUOM.length){
                    if($scope.salesUOM.indexOf(source.toLowerCase()) == -1){
                        editSalesUomFunc ();
                    }
                    else{
                        Settings.failurePopup('ERROR',"sales UOM already exist");
                    }
                }
                function editSalesUomFunc(){
                    var sourceObj = [];
                    sourceObj = $scope.salesUOM;
                    sourceObj[index] = source.toLowerCase();
                    $http.post("/dash/settings/salesUOM", sourceObj)
                        .success(function(res){
                            if(res){
                                Settings.success_toast('SUCCESS',"salesUOM successfully updated!");
                                $scope.orderType[index] = source.toLowerCase();
                                Settings.setInstanceDetails('salesUOM', $scope.salesUOM)
                            }
                            else{
                                Settings.failurePopup('ERROR',"Could not update salesUOM!");
                            }
                        })
                }
            }
        }
        // Add MPG to settings
        $scope.addMPG = function(source){
            if(source){
                if($scope.mpg.length){
                    if($scope.mpg.indexOf(source.toLowerCase()) == -1){
                        mpgSourceFunc ();
                    }
                    else{
                        Settings.failurePopup('ERROR',"MPG name already exist");
                    }
                }
                else{
                    mpgSourceFunc ();
                }
                function mpgSourceFunc (){
                    var temp = $scope.mpg;
                    temp.push(source)
                    $http.post("/dash/settings/mpg", temp)
                        .success(function(res){
                            $scope.mpg = temp;
                            $scope.newmpg.mpgValue = '';
                            Settings.success_toast('SUCCESS',"MPG successfully added!");
                            Settings.setInstanceDetails('mpg', $scope.mpg)
                        })
                }
            }
            else{
                Settings.failurePopup('ERROR',"Please enter text!");
            }
        }
        // Add OrderType to settings
        $scope.addOrderType = function(source){
            if(source){
                if($scope.orderType.length){
                    if($scope.orderType.indexOf(source) == -1){
                        orderTypeFunc ();
                    }
                    else{
                        Settings.failurePopup('ERROR',"Order Type already exist");
                    }
                }
                else{
                    orderTypeFunc ();
                }
                function orderTypeFunc (){
                    var temp = $scope.orderType;
                    temp.push(source)
                    $http.post("/dash/settings/orderType", temp)
                        .success(function(res){
                            $scope.orderType = temp;
                            $scope.neworderType.orderType = '';
                            Settings.success_toast('SUCCESS',"OrderType successfully added!");
                            Settings.setInstanceDetails('orderType', $scope.orderType)
                        })
                }
            }
            else{
                Settings.failurePopup('ERROR',"Please enter text!");
            }
        };
        // Add UOM to settings
        $scope.addUOM = function(source){
            if(source){
                if($scope.salesUOM.length){
                    if($scope.salesUOM.indexOf(source.toLowerCase()) == -1){
                        salesUOMFunc ();
                    }
                    else{
                        Settings.failurePopup('ERROR',"Sales UOM already exist");
                    }
                }
                else{
                    salesUOMFunc ();
                }
                function salesUOMFunc (){
                    var temp = $scope.salesUOM;
                    temp.push(source.toLowerCase())
                    $http.post("/dash/settings/salesUOM", temp)
                        .success(function(res){
                            $scope.salesUOM = temp;
                            $scope.newUOM.UOM = '';
                            Settings.success_toast('SUCCESS',"Sales UOM successfully added!");
                            Settings.setInstanceDetails('salesUOM', $scope.salesUOM)
                        })
                }
            }
            else{
                Settings.failurePopup('ERROR',"Please enter text!");
            }
        }
        /*..........
            Remove  MPG from settings page
        .........*/
        $scope.removeMPG = function(index){
            // console.log(index)
            var obj = $scope.mpg;
            obj.splice(index,1);
            $http.post("/dash/settings/mpg", obj)
                .success(function(res){
                    if(res){
                        Settings.success_toast('SUCCESS',"MPG successfully updated!");
                        $scope.mpg = obj;
                        Settings.setInstanceDetails('mpg', $scope.mpg)
                    }
                    else{
                        Settings.failurePopup('ERROR',"Could not update MPG!");
                    }
                })
        };
        /*..........
            Remove  salesUOM from settings page
        .........*/
        $scope.removeSalesUOM = function(index){
            // console.log(index)
            var obj = $scope.salesUOM;
            obj.splice(index,1);
            $http.post("/dash/settings/salesUOM", obj)
                .success(function(res){
                    if(res){
                        Settings.success_toast('SUCCESS',"sales UOM successfully updated!");
                        $scope.orderType = obj;
                        Settings.setInstanceDetails('salesUOM', $scope.salesUOM)
                    }
                    else{
                        Settings.failurePopup('ERROR',"Could not update sales UOM!");
                    }
                })
        };
        /*..........
            Remove  orderType from settings page
        .........*/
        $scope.removeorderType = function(index){
            // console.log(index)
            var obj = $scope.orderType;
            obj.splice(index,1);
            $http.post("/dash/settings/orderType", obj)
                .success(function(res){
                    if(res){
                        Settings.success_toast('SUCCESS',"OrderType successfully updated!");
                        $scope.orderType = obj;
                        Settings.setInstanceDetails('orderType', $scope.orderType)
                    }
                    else{
                        Settings.failurePopup('ERROR',"Could not update OrderType!");
                    }
                })
        };
    });