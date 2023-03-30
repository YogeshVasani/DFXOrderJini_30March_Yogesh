angular.module('ebs.controller')
    .controller("OrderRoutePlanCtrl",function ($scope, $filter, $http, $modal, $window,Settings, toastr, $interval,$sce,$mdDialog) {
        console.log("Hello From OrderRoutePlanCtrl Controller .... !!!!");
        //... Pagination......
        var initialViewBy = 60;
        $scope.newViewBy = 10;
        var localViewBy = $scope.newViewBy;
        var map='';
        var gmarkers = [];
        var flightPath;
        //.... Search Object....
        var searchObj = {};
        var orderSearchBy = ['orderId', 'sellername', 'seller', 'dealername', 'dealerphone', 'quantity', 'stockistname', 'total_amount','deliveryTimeSlot'];
        //.... Time Slots Array.....
        $scope.timeslotArray = [];
        $scope.timeslotList = [];
        var instanceDetails;
        $scope.coID = '';
        $scope.userRole = '';
        Settings.getNav(false, function(nav){
            $scope.nav = nav;
            instanceDetails =  Settings.getInstance();
            $scope.coID = instanceDetails.coID;
            console.log("Company ID --> ", $scope.coID);
            $scope.userRole = $scope.nav[4].roles;
            if($scope.coID != 'DSGR'){
                //... Pull the slots.....
                $http.get("/dash/orders/config/timeslot").then(function (result) {
                    if(result.data.length){
                        $scope.timeslotList = result.data[0].options;
                    }
                });
            }
        });
        //.... Order Status Count.....
        $scope.OrderStausCount = {};
        $scope.orderSearch = {};
        $scope.AssignedFulfiller = [];
        $scope.fulfillerDetails = '';
        $scope.orderDate = {};
        $scope.orderDate.dateFilter = new Date();
        $scope.timeslotValue = {};
        //.... Maps.....
        $scope.DisplayMap = false;
        $scope.DisplaySaveRide = false;
        $scope.UnassignedOrder = [];
        $scope.DistanceCalculate = [];
        $scope.showDeliveryLocation = false;
        var companyLatLong = {};
        $scope.orderFulfiller = '';
        $scope.warehouseLocation = [];
        $scope.DisplayFulfiller = true;
        $scope.editAddress = {};
        $scope.editAddress.display = false;
        $scope.deliveryAddress = {};
        $scope.editOrderStatus = [];
        $scope.userLatLong = {};
        var userRoletype = '';
        $scope.sortObj = [{value:'Distance'},{value:'Delivery Date'}];
        $scope.timeObj = {};
        $scope.timeObj.startType = 'AM';
        $scope.timeObj.endType = 'AM';
        $scope.timeSlotApplied  = false;
        $scope.sortByValue = 'Distance';
        $scope.timeSlotformat = ['AM','PM'];
        $scope.zoneArray = [];
        $scope.editorderObj = {};
        $scope.zoneCount = [];
        $scope.orderStatusCount = {};
        $scope.data = {};
        var existingFulfiller = '';
        $scope.dateFormat = 'dd-MMM-yyyy';
        $scope.zoneFilter = '';
        $scope.zoneArray = [];
        $scope.zoneArrayList = [];
        const startLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "inline");
        }
        const stopLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "none");
        }
        Settings.getUserInfo(function(user_details){
            console.log('User Details --> ', user_details);
            $http.get("/dash/settings/inventory/locations")
                .then(res => {
                    console.log('Inventory Locations ---> ', res);
                    if(res.data.length){
                        $scope.warehouseLocation = res.data[0].location;
                        for(var i = 0; i < $scope.warehouseLocation.length; i++){
                            if(user_details.sellerObject){
                                if(user_details.sellerObject.inventoryLocation == $scope.warehouseLocation[i].name){
                                    if(res.data[0].location[i].latitude && $scope.warehouseLocation[i].longitude){
                                        $scope.userLatLong.latitude = $scope.warehouseLocation[i].latitude;
                                        $scope.userLatLong.longitude = $scope.warehouseLocation[i].longitude;
                                    }
                                }
                            }
                        }
                        $scope.refreshTransactions();
                    }else
                        $scope.refreshTransactions();
                }).catch(err => {
                    console.log(err);
                })
            $scope.user = user_details;
            if($scope.user.role){
                userRoletype = $scope.user.role.toLowerCase();
            }
        });
         $scope.formatAMPM = function(date) {
             date = new Date(date);
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }
        const loadScript = (key, type, charset) => {
            if(!google || !google.maps){
                console.log("No google SDK found, loading a new one - " + key);
                let url = 'https://maps.google.com/maps/api/js?key=' + key + '&libraries=geometry,places';
                let heads = document.getElementsByTagName("head");
                if (heads && heads.length) {
                    let head = heads[0];
                    if (head) {
                        var script = document.createElement('script');
                        script.setAttribute('src', url);
                        script.setAttribute('type', type);
                        if (charset) script.setAttribute('charset', charset);
                        head.appendChild(script);
                    }
                }
            }else
                console.log("Voila! Google is already loaded on your browser ---> ");
        };
        loadScript(Settings.getInstanceDetails('gMapAPI'), 'text/javascript', 'utf-8');
        function IndiaTime(D) {
            D = D || new Date();
            D.setUTCMinutes(D.getUTCMinutes() + 330);
            var A = [D.getUTCFullYear(), D.getUTCMonth(), D.getUTCDate()];
            A[1]++;
            if (A[1] < 10) A[1] = '0' + A[1];
            if (A[2] < 10) A[2] = '0' + A[2];
            A = A.join('/');
            var B = [D.getUTCHours(), D.getUTCMinutes(), D.getUTCSeconds()];
            B = B.join(':');
            return A + " " + B;
        };
        function formatDateTime(d){
            var date = new Date(d);
            var new_date = [date.getFullYear(),(date.getMonth()+1).padLeft(), date.getDate().padLeft() ].join('-') + ' '
                + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join (':');
            return new_date;
        }
        generateDate = function (date) {
            date = new Date(date);
            var tempDate = [date.getFullYear(),(date.getMonth()+1).padLeft(), date.getDate().padLeft() ].join('-') + ' '
                + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join (':');
            return tempDate;
        }
        $scope.DateTimeFormat = (date, when) => Settings.dateFilterFormat(date, when);
        function convertTo24Hour(time) {
            var hours = parseInt(time.substr(0, 2));
            if(time.indexOf('am') != -1 && hours == 12) {
                time = time.replace('12', '0');
            }
            if(time.indexOf('pm')  != -1 && hours < 12) {
                time = time.replace(hours, (hours + 12));
            }
            return time.replace(/(am|pm)/, '');
        }
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
        };
        //.... Edit Order ......
        $scope.editorderFunc = function (order) {
            console.log('Edit Order -- ', order);
            $scope.editorderObj = order;
            existingFulfiller = '';
            if(order.newOrderaddress && order.newOrderaddress[0]){
                $scope.deliveryAddress.tempnewOrderaddress = order.newOrderaddress[0];
                $scope.data.tempnewOrderShipping_address = order.newOrderaddress[0];
                $scope.deliveryAddress.longitude = order.longitude[0]
                $scope.deliveryAddress.latitude = order.latitude[0]
            }
            if(order.fulfiller){
                $scope.editorderObj.fulfiller = order.fulfiller+'';
                existingFulfiller = $scope.editorderObj.fulfiller;
            }
            if(order.delivery_zone){
                $scope.editorderObj.delivery_zone = order.delivery_zone;
            }
        }
        //.... Generate 12 slots..... (12 hours)
        for(var i = 1; i <= 12; i++){
            $scope.timeslotArray.push(parseInt(i));
        }
        //... Get all Delivery Zones......
        $http.get("/dash/delivery/zone")
            .then(result => {
                if(result.data.length){
                    $scope.zoneArrayList = result.data;
                }
            });
        //.... Get Order Status Count.....
        $scope.getOrderStatusCount = obj => {
            $http.post("/dash/delivery/status/count", obj)
                .then(result => {
                    console.log('Delivery Status By Zone Count ---> ', result.data);
                    var zoneCount = result.data;
                    $scope.zoneArray = result.data;
                    var delayedData = [];
                    var SOSData = [];
                    if(result.data.length){
                        for(var i = 0; i < result.data.length; i++){
                            if(result.data[i].type == 'delayed'){
                                delayedData = result.data[i].data
                            }
                            if(result.data[i].type == 'sos'){
                                SOSData = result.data[i].data
                            }
                        }
                    }
                    if($scope.orders.length) {
                        for (var i = 0; i < $scope.orders.length; i++) {
                            if(delayedData.length){
                                for(var j = 0; j < delayedData.length; j++){
                                    if($scope.orders[i]._id == delayedData[j]._id){
                                        $scope.orders[i].delayedFlag = true
                                    }
                                }
                            }
                            if(SOSData.length){
                                for(var j = 0; j < SOSData.length; j++){
                                    if($scope.orders[i]._id == SOSData[j]._id){
                                        $scope.orders[i].sosFlag = true
                                    }
                                }
                            }
                        }
                    }
                })
        }
        /*---fetches sellername if phone is provided---*/
        $scope.getfulfillersName = function(sellerNo,tag){
            // console.log('SellerNumber',sellerNo,'Tag',tag)
            /*---DynamicProgramming---*/
            /*---objects doesnt have length ---*/
            if(sellerNo){
                if($scope.roleFulfiller && $scope.roleFulfiller.length){
                    for(var i=0; i< $scope.roleFulfiller.length; i++){
                        if($scope.roleFulfiller[i].sellerphone == sellerNo){
                            if($scope.roleFulfiller[i].sellername)
                                return $scope.roleFulfiller[i].sellername;
                            else
                                return sellerNo;
                        }
                    }
                }else{
                    return sellerNo;
                }
            }else return sellerNo;
        };
        $scope.timeSlotFilter = function () {
            $scope.timeSlotApplied  = true;
            //.... Start Hour.....
            var time = $scope.timeObj.startHour + ':' + $scope.timeObj.startType;
            var convertedTime = convertTo24Hour(time.toLowerCase());
            convertedTime =  convertedTime.slice(0,convertedTime.lastIndexOf(':'));
            var reverseDate =  $scope.orderDate.dateFilter;
            var dateChanged = new Date(reverseDate);
            dateChanged.setHours(Number(convertedTime));
            dateChanged.setMinutes(0);
            dateChanged.setSeconds(0);
            searchObj.from_date = generateDate(dateChanged);
            //.... End Hour.....
            var time = $scope.timeObj.endHour+':'+$scope.timeObj.endType;
            var convertedTime = convertTo24Hour(time.toLowerCase());
            convertedTime =  convertedTime.slice(0,convertedTime.lastIndexOf(':'))
            var reverseDate =  $scope.orderDate.dateFilter;
            var dateChanged = new Date(reverseDate);
            dateChanged.setHours(Number(convertedTime));
            dateChanged.setMinutes(0);
            dateChanged.setSeconds(0);
            searchObj.to_date = generateDate(dateChanged);
            $scope.orderSearchFilter();
        }
        //.... Map Markers......
        $scope.checkinIcons = [];
        $scope.checkinIcons['startVisit'] = 'https://maps.google.com/mapfiles/ms/micons/blue-dot.png';
        $scope.checkinIcons['endVisit'] = 'https://maps.google.com/mapfiles/ms/micons/red-dot.png';
        $scope.checkinIcons['Customer'] = 'https://maps.google.com/mapfiles/ms/micons/orange-dot.png';
        $scope.checkinIcons['pjp'] = 'https://maps.google.com/mapfiles/ms/micons/green-dot.png';
        $scope.toDay = toDay;
        function toDay( history ) {
            var date = new Date(history.deliveryDate[0]);
            var options = {weekday : "long", year : "numeric", month : "long", day : "numeric"};
            var dformat = date.toLocaleDateString("en-US", options);
            history.deliveryDate[0] = dformat;
            return history;
        };
        function reverseGeocode(latlng){
            if(latlng){
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({"address" : latlng}, (results, status) => {
                    if (status !== google.maps.GeocoderStatus.OK) {
                        console.log(status);
                    }
                    if (status == google.maps.GeocoderStatus.OK) {
                        console.log(results);
                        console.log("Latitude: "+results[0].geometry.location.lat());
                        console.log("Longitude: "+results[0].geometry.location.lng());
                    }
                });
            }
        }
        $scope.getRoleName = function(role){
            let temp = role;
            if(role){
                if($scope.userRole){
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
        //Render Orders
        $scope.renderOrders = response => {
            console.log("GetAll Orders--> ", response);
            $scope.orders = [];
            response.sort(function(a, b) {
                return new Date(a.deliveryDate[0]) < new Date(b.deliveryDate[0]) ? 1 : -1;
            });
            for(var i = 0; i < response.length; i++){
                var orderstatus = '';
                var tempDate;
                //... If ther delivery date is in any other format, we change it to the desired format for display....
                if(response[i].deliveryDate){
                    if(response[i].deliveryDate[0]){
                        response[i].delivery = moment(response[i].deliveryDate[0]).format("DD-MMM-YYYY");
                        tempDate = new Date(response[i].deliveryDate[0]);
                        response[i].deliveryDate[0] = moment(tempDate).format("DD-MMM-YYYY hh:mm A");
                    }
                }
                if($scope.AssignedFulfiller.length){
                    for( var j = 0;j < $scope.AssignedFulfiller.length; j++){
                        if($scope.AssignedFulfiller[j].orderId[0] == response[i].orderId[0] ){
                            response[i].assign = true;
                        }
                    }
                }
                if(response[i].tripId){
                    if(response[i].tripId[0]){
                        response[i].tripId = response[i].tripId[0]
                    }else{
                        response[i].tripId = '';
                    }
                }
                if(response[i].status){
                    if(typeof response[i].status == 'string'){
                        response[i].status = response[i].status.toLowerCase();
                    }else if(typeof response[i].status == 'object'  ){
                        if(response[i].status[0]){
                            response[i].status = response[i].status[0].toLowerCase();
                        }
                    }
                }
                var distance = '';
                if($scope.sortByValue != 'DeliveryDate'){
                    if (response[i].latitude && response[i].longitude) {
                        if (typeof response[i].latitude == 'object' && typeof response[i].longitude == 'object') {
                            if (response[i].latitude[0] && response[i].longitude[0] && response[i].latitude[0] != 1 && response[i].latitude[0] != 2 &&
                                response[i].latitude[0] != 3 && response[i].latitude[0] != 4) {
                                distance = distanceCalculateToHub($scope.userLatLong.latitude,$scope.userLatLong.longitude,response[i].latitude[0],response[0].longitude[0]);
                            }
                        }
                        else {
                            if (response[i].latitude && response[i].longitude && response[i].latitude != 1 && response[i].latitude != 2 &&
                                response[i].latitude != 3 && response[i].latitude != 4) {
                                distance = distanceCalculateToHub($scope.userLatLong.latitude,$scope.userLatLong.longitude,response[i].latitude,response[0].longitude);
                            }
                        }
                    }
                }
                if(response[i].delivery_zone){
                    if(response[i].delivery_zone[0]){
                        response[i].delivery_zone = response[i].delivery_zone[0];
                    }else{
                        response[i].delivery_zone = '';
                    }
                }
                response[i].distance = distance;
                if(response[i].fulfiller){
                     if(!response[i].fulfiller[0]){
                         response[i].fulfiller = '';
                         response[i].assignType = 'unassign'
                         $scope.UnassignedOrder.push(response[i])
                         $scope.orders.push(response[i]);
                         response[i].delivery_status = 'unassigned'
                     }else{
                         if($scope.coID == 'AUBR'){
                             if(response[i].status != 'delivered' || response[i].status != 'out for delivery'){
                                 response[i].delivery_status = 'assigned'
                             }else if(response[i].status == 'out for delivery') {
                                 response[i].delivery_status = 'assigned'
                             }else if(response[i].status == 'delivered') {
                                 response[i].delivery_status = 'delivered'
                             }
                             response[i].fulfiller = response[i].fulfiller[0]
                             $scope.orders.push(response[i]);
                         }
                     }
                }else{
                    response[i].fulfiller = '';
                    response[i].assignType = 'unassign';
                    response[i].delivery_status = 'unassigned';
                    $scope.UnassignedOrder.push(response[i]);
                    $scope.orders.push(response[i]);
                }
            }
            stopLoader();
            $scope.getFulfillerOrder();
            $scope.getOrderStatusCount(searchObj);
        };
        //.... TODO : Check if this function is a Copy + Paste....
        ///... Not sure if this function is being used anywhere???
        $scope.transactionCount = (response) => {
            if (response) {
                if (response > localViewBy) {
                    $scope.order_count = response;
                }
                else if (response <= localViewBy) {
                    $scope.order_count = response;
                    dealerOrderCount = response;
                    $scope.orderNewViewBy = response;
                }
                else {
                    $scope.orders = [];
                    $scope.orderNewViewBy = 1;
                    $scope.order_count = 0;
                    $scope.orderViewLength = -1;
                }
            }
            else {
                $scope.orders = [];
                $scope.orderNewViewBy = 1;
                $scope.order_count = 0;
                $scope.orderViewLength = -1;
            }
        }
        const loadOrders = searchObj => {
            startLoader();
            $http.post("/dash/orders/delivery", searchObj)
                .success($scope.renderOrders)
                .error((error, status) => {
                    console.log(error, status);
                    if(status >= 400 && status < 404)
                        $window.location.href = '/404';
                    else if(status >= 500)
                        $window.location.href = '/500';
                    else
                        $window.location.href = '/404';
                });
        }
        const loadCount = searchObj => {
            $http.post("/dash/pjp/zones/count", searchObj)
                .then(result => {
                    $scope.zoneCount = result.data;
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
        $scope.refreshTransactions = () => {
            searchObj.viewLength = 0;
            searchObj.viewBy = initialViewBy;
            searchObj.from_date = 0;
            searchObj.to_date = 0;
            searchObj.filter = '';
            searchObj.searchFor = '';
            searchObj.source = '';
            searchObj.paymentStatus = '';
            searchObj.fulfillmentStatus = '';
            searchObj.dealer = '';
            searchObj.filterStockist = '';
            searchObj.sort = '';
            searchObj.zoneFilter = '';
            $scope.fulfillerDetails = '';
            $scope.timeslotValue.obj = '';
            $scope.timeObj = {};
            $scope.timeObj.startHour = '';
            $scope.timeObj.endHour = '';
            $scope.timeObj.startType = 'AM';
            $scope.timeObj.endType = 'AM';
            $scope.sortByValue = 'Distance';
            $scope.zoneFilter = '';
            $scope.orderDate = {};
            $scope.orderDate.dateFilter = new Date();
            $scope.orderSearch.date_from = new Date();
            $scope.orderSearch.date_to = new Date();
            if($scope.orderSearch.date_from)
                $scope.orderSearch.date_from.setHours(0, 0, 0, 0);
                searchObj.from_date = $scope.orderSearch.date_from;
            if($scope.orderSearch.date_to){
                $scope.orderSearch.date_to.setHours(23,59,59)
                searchObj.to_date = $scope.orderSearch.date_to;
            }
            if($scope.sortByValue && $scope.coID == 'DSGR'){
                searchObj.sort = $scope.sortByValue;
            }else{
                searchObj.sort = 'Delivery Date' ;
            }
            $scope.filterStatusSelect = '';
            $scope.orderViewLength = 0;
            $scope.orderSearch.filter = '';
            $scope.orderSearch.source = '';
            $scope.orderSearch.paymentStatus = '';
            $scope.orderSearch.fulfillmentStatus = '';
            $scope.orderSearch.dealerPhone_Name = '';
            $scope.orderSearch.dealer = '';
            $scope.orderSearch.filterStockist = '';
            $scope.orderNewViewBy = localViewBy;
            $scope.orders = [];
            $scope.timeSlotApplied  = false;
            loadOrders(searchObj);
            loadCount(searchObj);
            $scope.showOrderFilter = false;
        }
        var ExisingFulfiller = [];
        $scope.MarkOrderAssign = (order, value) => {
            if(value){
                $scope.AssignedFulfiller.push(order);
                if(order.fulfiller){
                    ExisingFulfiller.push(angular.copy(order));
                }
            }else{
                var idx = $scope.AssignedFulfiller.indexOf(order);
                if (idx > -1) {
                    $scope.AssignedFulfiller.splice(idx, 1);
                }
                var id2 = ExisingFulfiller.indexOf(order);
                if (id2 > -1) {
                    ExisingFulfiller.splice(id2, 1);
                }
            }
        }
        //.... Assign a Zone to the rider.....
        $scope.AssignMultiZone = function (zone) {
            var obj = {};
            obj.type = 'Zone'
            obj.delivery_zone = zone;
            var AssignedArray = [];
            for(var i = 0; i < $scope.AssignedFulfiller.length; i++) {
                AssignedArray.push({"orderId": $scope.AssignedFulfiller[i]._id})
            }
            obj.order = AssignedArray;
            $http.post('/dash/orders/fulfiller/multi', obj)
                .then(result => {
                    if(!result.data){
                        Settings.alertPopup('WARNING',"Could not update. Please refresh and try");
                    }else{
                        Settings.success_toast("Success", zone+" zone Assigned Successfully");
                        $scope.getFulfillerOrder();
                        $scope.AssignedFulfiller = [];
                        $scope.refreshTransactions();
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
        //.... Assigning Fulfiller or Rider.....
        $scope.AssignFulfiller = function (orderFulfiller) {
            var obj = {};
            var orderFulfillerObj = angular.copy(orderFulfiller);
            orderFulfillerObj = JSON.parse(orderFulfillerObj)
            var AssignedArray = [];
            var AssignedDetails = [];
            companyLatLong = {};
            for(var i = 0; i < $scope.warehouseLocation.length; i++){
                if(orderFulfillerObj.inventoryLocation){
                    if(orderFulfillerObj.inventoryLocation == $scope.warehouseLocation[i].name){
                        if($scope.warehouseLocation[i].latitude && $scope.warehouseLocation[i].longitude){
                            companyLatLong.latitude = $scope.warehouseLocation[i].latitude;
                            companyLatLong.longitude = $scope.warehouseLocation[i].longitude;
                            companyLatLong.deliveryLocation = $scope.warehouseLocation[i].name;
                            companyLatLong.orderId = "WareHouse"
                        }
                    }
                }
            }
            var tempfulfillererArray = [];
            for( var i = 0; i < ExisingFulfiller.length; i++){
                if(ExisingFulfiller[i].fulfiller != orderFulfillerObj.sellerphone){
                    tempfulfillererArray.push(ExisingFulfiller[i]);
                }
            }
            ExisingFulfiller = tempfulfillererArray;
            var tempOrderArray = [];
            for( var i = 0; i < $scope.AssignedFulfiller.length; i++){
                if($scope.AssignedFulfiller[i].fulfiller != orderFulfillerObj.sellerphone){
                    tempOrderArray.push($scope.AssignedFulfiller[i])
                }
            }
            $scope.AssignedFulfiller = tempOrderArray;
            if(!$scope.AssignedFulfiller.length){
                $scope.refreshTransactions();
                Settings.alertPopup('WARNING', $scope.getRoleName('Fulfiller')+" "+orderFulfillerObj.sellername +" already assigned.");
            }
            if(!orderFulfillerObj.orderList  && companyLatLong.latitude){
                AssignedDetails.push(companyLatLong)
            }else if(orderFulfillerObj.orderList){
                if(!orderFulfillerObj.orderList.length && companyLatLong.latitude){
                    AssignedDetails.push(companyLatLong)
                }
            }
            for(var i = 0; i < $scope.AssignedFulfiller.length; i++){
                AssignedArray.push({"orderId":$scope.AssignedFulfiller[i]._id})
                if($scope.AssignedFulfiller[i].tripId){
                    AssignedDetails.push({"orderId":$scope.AssignedFulfiller[i]._id,"latitude":$scope.AssignedFulfiller[i].latitude,
                        "longitude":$scope.AssignedFulfiller[i].longitude,"order":$scope.AssignedFulfiller[i],"tripId":$scope.AssignedFulfiller[i].tripId
                    })
                }else{
                    AssignedDetails.push({"orderId":$scope.AssignedFulfiller[i]._id,"latitude":$scope.AssignedFulfiller[i].latitude,
                        "longitude":$scope.AssignedFulfiller[i].longitude,"order":$scope.AssignedFulfiller[i]
                    })
                }
            }
            obj.fulfiller = orderFulfillerObj.sellerphone;
            obj.fulfillerName = orderFulfillerObj.sellername;
            obj.order = AssignedArray;
            obj.orderArray = AssignedDetails;
            obj.fulfiller_assigned_time = Settings.newDate();
            if(ExisingFulfiller.length){
                obj.ExisingFulfiller = ExisingFulfiller;
                obj.ExisingFulfillerFlag = true
            }else{
                obj.ExisingFulfillerFlag = false
            }
            $scope.orderFulfiller = '';
            if(orderFulfillerObj.tripId){
                Settings.alertPopup('WARNING', $scope.getRoleName('Fulfiller') + " Already started trip");
            }else{
                if($scope.AssignedFulfiller.length){
                    $http.post('/dash/orders/fulfiller/multi', obj)
                        .then(result => {
                            if(!result.data){
                                Settings.alertPopup('WARNING',"Could not update. Please refresh and try");
                            }else{
                                $scope.orderFulfiller = '';
                                Settings.success_toast("Success", $scope.getRoleName('Fulfiller')+" Assigned Successfully");
                                $scope.getFulfillerOrder();
                                $scope.AssignedFulfiller = [];
                                $scope.refreshTransactions();
                                if(orderFulfillerObj.sellerphone){
                                    $scope.showFulfillerDetails(orderFulfillerObj.sellerphone)
                                }
                                document.getElementById("ridermodal").style.display = "none";
                                //hide the modal
                                $('body').removeClass('modal-open');
                                //modal-open class is added on body so it has to be removed
                                $('.modal-backdrop').remove();
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
                    if($scope.coID == 'DSGR' || $scope.coID == 'DSGT'){
                        $http.put("/dash/orders/assignment/update", obj)
                            .then(response => {
                                // console.log("trip assignment res---->",response)
                            })
                            // .catch((error, status) => {
                            //     console.log(error, status);
                            //     if(status >= 400 && status < 404)
                            //         $window.location.href = '/404';
                            //     else if(status >= 500)
                            //         $window.location.href = '/500';
                            //     else
                            //         $window.location.href = '/404';
                            // });
                    }
                }
            }
        }
        function geocode_address(result, type){
            if(type == 'ATD'){
                //console.log(result)
                $scope.attendance_address = result;
                $scope.$apply();
            }
            else if(type == 'customer'){
                $scope.checkinMapLocation.dealer = result;
                $scope.$apply();
            }
            else if(type == 'startVisit'){
                $scope.checkinMapLocation.sVisit = result;
                $scope.$apply();
            }
            else if(type == 'endVisit'){
                $scope.checkinMapLocation.eVisit = result;
                $scope.$apply();
            }
            else if(type == 'bidhistory'){
                $scope.checkinMapLocation.BidHistoryAddress = result;
                $scope.$apply();
            }
        }
        $scope.showFulfillerDetails = (value) => {
            console.log(value);
            // if(!flag){
            //     $scope.DisplayMap = false
            // }
            $http.get('/dash/fulfiller/orderslist/' + value)
                .then(result => {
                    console.log(result);
                    if(result.data && result.data.length){
                        $scope.fulfillerDetails = result.data[0];
                        var fulfillerData = angular.copy(result.data[0]);
                        if(!$scope.fulfillerDetails.fulfillerName){
                            for(var i=0;i<$scope.roleFulfiller.length;i++){
                                if($scope.roleFulfiller[i].sellerphone == $scope.fulfillerDetails.fulfiller){
                                    $scope.fulfillerDetails.fulfillerName = $scope.roleFulfiller[i].sellername;
                                }
                            }
                        }
                        var count = 0;
                        if($scope.fulfillerDetails.orderList.length){
                            for(var i=0;i<$scope.fulfillerDetails.orderList.length;i++){
                                if($scope.fulfillerDetails.orderList[i].orderId != 'WareHouse'){
                                    count = count+1;
                                }
                            }
                            $scope.fulfillerDetails.deliveryCount = count;
                            $scope.renderPjpMap(fulfillerData.orderList,'map_order');
                            $scope.renderPjpMapDistance();
                        }else{
                            $scope.closeFulfillerDetails();
                        }
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
        $scope.firstSort = true;
        $scope.sortableOptions = {
            stop : (e, ui) => {
                // this callback has the changed model
                ui.item.css('margin-top', 0);
                $scope.DisplaySaveRide = true;
                $scope.renderPjpMap($scope.fulfillerDetails.orderList,'map_order')
                $scope.renderPjpMapDistance();
            }
        };
        $scope.DistanceCalculateArray = (order, count) => {
            return new Promise((resolve, reject) => {
                $scope.DistanceCalculate = [];
                for (var i = 0; i < order.length; i++) {
                    if (order[i].latitude && order[i].longitude) {
                        if (typeof order[i].latitude == 'object' && typeof order[i].longitude == 'object') {
                            if (order[i].latitude[0] && order[i].longitude[0] && order[i].latitude[0] != 1 && order[i].latitude[0] != 2 &&
                                order[i].latitude[0] != 3 && order[i].latitude[0] != 4) {
                                $scope.DistanceCalculate.push(order[i]);
                            }
                        }
                        else {
                            if (order[i].latitude && order[i].longitude && order[i].latitude != 1 && order[i].latitude != 2 &&
                                order[i].latitude != 3 && order[i].latitude != 4) {
                                $scope.DistanceCalculate.push(order[i]);
                            }
                        }
                    }
                }
                if($scope.DistanceCalculate.length <= 24 ){
                    if($scope.DistanceCalculate.length >=2){
                        var directionsService = new google.maps.DirectionsService;
                        var directionsDisplay = new google.maps.DirectionsRenderer;
                        var waypts = [];
                        var startpoint = '';
                        var endpoint =  '';
                        var startindex = 0;
                        var lastindex = 0;
                        var tempArray = [];
                        if($scope.DistanceCalculate.length){
                            for (var j = 0 ; j < $scope.DistanceCalculate.length; j++) {
                                lastindex += 24;
                                waypts = [];
                                if( $scope.DistanceCalculate.length <= lastindex ) {
                                    startindex=$scope.DistanceCalculate.length;
                                }else{
                                    startindex += 24;
                                }
                                for (i = j; i < startindex; i++){
                                    if($scope.DistanceCalculate[i].latitude[0] && $scope.DistanceCalculate[j].longitude[0]){
                                        if(i == 0){
                                            startpoint = new google.maps.LatLng($scope.DistanceCalculate[i].latitude[0],$scope.DistanceCalculate[i].longitude[0]);
                                        }else if(i == startindex-1){
                                            endpoint =new google.maps.LatLng($scope.DistanceCalculate[i].latitude[0],$scope.DistanceCalculate[i].longitude[0]);
                                        }else{
                                            waypts.push({
                                                location: new google.maps.LatLng($scope.DistanceCalculate[i].latitude[0],$scope.DistanceCalculate[i].longitude[0]),
                                                stopover: true
                                            });
                                        }
                                    }else if($scope.DistanceCalculate[i].latitude && $scope.DistanceCalculate[i].longitude ){
                                        if(i == 0){
                                            startpoint = new google.maps.LatLng($scope.DistanceCalculate[i].latitude,$scope.DistanceCalculate[i].longitude);
                                        }else if(i == startindex-1){
                                            endpoint =new google.maps.LatLng($scope.DistanceCalculate[i].latitude,$scope.DistanceCalculate[i].longitude);
                                        }else{
                                            waypts.push({
                                                location: new google.maps.LatLng($scope.DistanceCalculate[i].latitude,$scope.DistanceCalculate[i].longitude),
                                                stopover: true
                                            });
                                        }
                                    }
                                }
                                j = startindex;
                                directionsService.route({
                                    origin: startpoint,
                                    destination: endpoint,
                                    waypoints: waypts,
                                    optimizeWaypoints: true,
                                    travelMode: 'DRIVING'
                                }, function(response, status) {
                                    if (status === 'OK') {
                                        directionsDisplay.setDirections(response);
                                        var route = response.routes[0];
                                        var riderDistance = 0
                                        // var summaryPanel = document.getElementById('directions-panel');
                                        // summaryPanel.innerHTML = '';
                                        // For each route, display summary information.
                                        for (var i = 0; i < route.legs.length; i++) {
                                            riderDistance += route.legs[i].distance.value
                                        }
                                        riderDistance = riderDistance / 1000;
                                        resolve(riderDistance);
                                        waypts = [];
                                    } else {
                                        resolve(0);
                                    }
                                });
                            }
                        }else{
                            resolve(0);
                        }
                    }else{
                        resolve(0);
                    }
                }else{
                    resolve(0);
                }
            })
        }
        $scope.renderPjpMapBasic = (order, mapvalue) => {
            startLoader();
            $scope.DistanceCalculate = [];
            $scope.showPjpMap = false;
            gmarkers = [];
            $scope.checkinIcons['Customer'] = 'https://maps.google.com/mapfiles/ms/micons/orange-dot.png';
            var myOptions = {
                zoom : zoomLevel,
                center : latlng,
                scaleControl : false,
                mapTypeControl : false,
                streetViewControl : false,
                mapTypeId : google.maps.MapTypeId.ROADMAP
            };
            ///... Defaul the deliveries location to Delhi.....
            var latlng = new google.maps.LatLng(20.5937, 78.9629);
            var zoomLevel = 5;
            var latlngList = [];
            var flightPlanCoordinates = [];
            //.... We create a new map, based on the basic value....
            map = new google.maps.Map(document.getElementById(mapvalue), myOptions);
            //.... We plot all orders received from Riders as well as from orders pending to be assigned for the day....
            for (var i = 0; i < order.length; i++) {
                var demolatlang = {};
                if (order[i].latitude && order[i].longitude) {
                    if (typeof order[i].latitude == 'object' && typeof order[i].longitude == 'object') {
                        //console.log('array')
                        if (order[i].latitude[0] && order[i].longitude[0] && order[i].latitude[0] != 1 && order[i].latitude[0] != 2 &&
                            order[i].latitude[0] != 3 && order[i].latitude[0] != 4) {
                            $scope.DistanceCalculate.push(order[i]);
                            demolatlang.lat = order[i].latitude[0];
                            demolatlang.lng = order[i].longitude[0];
                            flightPlanCoordinates.push(demolatlang);
                            $scope.showPjpMap = true;
                            latlngList.push(new google.maps.LatLng(parseFloat(order[i].latitude[0]), parseFloat(order[i].longitude[0])))
                        }
                    }
                    else {
                        if (order[i].latitude && order[i].longitude && order[i].latitude != 1 && order[i].latitude != 2 &&
                            order[i].latitude != 3 && order[i].latitude != 4) {
                            $scope.DistanceCalculate.push(order[i]);
                            demolatlang.lat = order[i].latitude;
                            demolatlang.lng = order[i].longitude;
                            flightPlanCoordinates.push(demolatlang);
                            $scope.showPjpMap = true;
                            latlngList.push(new google.maps.LatLng(parseFloat(order[i].latitude), parseFloat(order[i].longitude)))
                        }
                    }
                }
            }
            for(var i = 0; i < $scope.DistanceCalculate.length; i++){
                if ($scope.DistanceCalculate[i].latitude && $scope.DistanceCalculate[i].longitude) {
                    if (typeof $scope.DistanceCalculate[i].latitude == 'object' && typeof $scope.DistanceCalculate[i].longitude == 'object') {
                        if ($scope.DistanceCalculate[i].latitude[0] && $scope.DistanceCalculate[i].longitude[0] && $scope.DistanceCalculate[i].latitude[0] != 1 && $scope.DistanceCalculate[i].latitude[0] != 2 &&
                            $scope.DistanceCalculate[i].latitude[0] != 3 && $scope.DistanceCalculate[i].latitude[0] != 4) {
                            latlng = new google.maps.LatLng(parseFloat($scope.DistanceCalculate[i].latitude[0]), parseFloat($scope.DistanceCalculate[i].longitude[0]));
                            addMarker(latlng, 0,$scope.DistanceCalculate[i].assignType);
                        }
                    }
                    else {
                        if ($scope.DistanceCalculate[i].latitude && $scope.DistanceCalculate[i].longitude && $scope.DistanceCalculate[i].latitude != 1 && $scope.DistanceCalculate[i].latitude != 2 &&
                            $scope.DistanceCalculate[i].latitude != 3 && $scope.DistanceCalculate[i].latitude != 4) {
                            latlng = new google.maps.LatLng(parseFloat($scope.DistanceCalculate[i].latitude), parseFloat($scope.DistanceCalculate[i].longitude));
                            addMarker(latlng, 0,$scope.DistanceCalculate[i].assignType);
                        }
                    }
                }
                function addMarker(latlng, id,type) {
                    var contentString = '';
                    if (type == 'unassign') {
                        contentString = $scope.DistanceCalculate[i].orderId +"<br />"+ $scope.DistanceCalculate[i].deliveryLocation[0];
                    }else{
                        if($scope.DistanceCalculate[i].orderId == 'WareHouse'){
                            contentString = $scope.DistanceCalculate[i].orderId +"<br />"+ $scope.DistanceCalculate[i].deliveryLocation;
                        }else{
                            if($scope.DistanceCalculate[i].order && $scope.DistanceCalculate[i].order.deliveryLocation){
                                contentString = $scope.DistanceCalculate[i].orderId +"<br />"+ $scope.DistanceCalculate[i].order.deliveryLocation[0];
                            }
                        }
                    }
                    if (id == 0) {
                        var marker = new google.maps.Marker({
                            position: latlng,
                            map: map,
                            title: contentString,
                        });
                        if (type == 'unassign') {
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
                        } else {
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
                        }
                        //reverseGeocode(geocode_address, latlng, 'customer');
                    }
                    var infowindow = new google.maps.InfoWindow({
                        content : contentString
                    });
                    marker.addListener('click', function () {
                        infowindow.open(map, marker);
                    });
                    gmarkers.push(marker);
                }
            }
            //Set zoom based on the location latlongs
            if (latlngList.length > 0) {
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < latlngList.length; i++) {
                    bounds.extend(latlngList[i]);
                }
                map.setCenter(bounds.getCenter()); //or use custom center
                map.fitBounds(bounds);
            }
            var mcOptions = {gridSize: 6, maxZoom: 20,
                imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"};
            var markerCluster = new MarkerClusterer(map, gmarkers,mcOptions); //clusters the nearby points
            google.maps.event.trigger(map, 'resize');
            $('a[href="#profile"]').on('shown', function (e) {
                google.maps.event.trigger(map, 'resize');
            });
            stopLoader();
        }
        $scope.renderPjpMap = (order, mapvalue) => {
            // clear previous markers
            console.log('Clearing Markers...!!! ', gmarkers.length);
            for (var i = 0; i < gmarkers.length; i++) {
                gmarkers[i].setVisible(false);
                gmarkers[i].setMap(null);
            }
            // clear previous polylines
            if(flightPath)
                flightPath.setMap(null);
            $scope.DistanceCalculate = [];
            $scope.showPjpMap = false;
            gmarkers = [];
            $scope.checkinIcons = [];
            $scope.checkinIcons['Customer'] = 'https://maps.google.com/mapfiles/ms/micons/orange-dot.png';
            var myOptions = {
                zoom: zoomLevel,
                center: latlng,
                scaleControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var latlng = new google.maps.LatLng(20.5937, 78.9629);
            var zoomLevel = 5;
            var latlngList = [];
            var flightPlanCoordinates = [];
            if(!map){
                map = new google.maps.Map(document.getElementById(mapvalue), myOptions);
            }
            for (var i = 0; i < order.length; i++) {
                var demolatlang = {};
                if (order[i].latitude && order[i].longitude) {
                    if (typeof order[i].latitude == 'object' && typeof order[i].longitude == 'object') {
                        if (order[i].latitude[0] && order[i].longitude[0] && order[i].latitude[0] != 1 && order[i].latitude[0] != 2 &&
                            order[i].latitude[0] != 3 && order[i].latitude[0] != 4) {
                            $scope.DistanceCalculate.push(order[i]);
                            demolatlang.lat = order[i].latitude[0];
                            demolatlang.lng = order[i].longitude[0];
                            flightPlanCoordinates.push(demolatlang);
                            $scope.showPjpMap = true;
                            latlngList.push(new google.maps.LatLng(parseFloat(order[i].latitude[0]), parseFloat(order[i].longitude[0])))
                        }
                    }
                    else {
                        if (order[i].latitude && order[i].longitude && order[i].latitude != 1 && order[i].latitude != 2 &&
                            order[i].latitude != 3 && order[i].latitude != 4) {
                            $scope.DistanceCalculate.push(order[i]);
                            demolatlang.lat = order[i].latitude;
                            demolatlang.lng = order[i].longitude;
                            flightPlanCoordinates.push(demolatlang);
                            $scope.showPjpMap = true;
                            latlngList.push(new google.maps.LatLng(parseFloat(order[i].latitude), parseFloat(order[i].longitude)))
                        }
                    }
                }
            }
            for(var i = 0; i < $scope.DistanceCalculate.length; i++){
                if ($scope.DistanceCalculate[i].latitude && $scope.DistanceCalculate[i].longitude) {
                    if (typeof $scope.DistanceCalculate[i].latitude == 'object' && typeof $scope.DistanceCalculate[i].longitude == 'object') {
                        if ($scope.DistanceCalculate[i].latitude[0] && $scope.DistanceCalculate[i].longitude[0] && $scope.DistanceCalculate[i].latitude[0] != 1 && $scope.DistanceCalculate[i].latitude[0] != 2 &&
                            $scope.DistanceCalculate[i].latitude[0] != 3 && $scope.DistanceCalculate[i].latitude[0] != 4) {
                            latlng = new google.maps.LatLng(parseFloat($scope.DistanceCalculate[i].latitude[0]), parseFloat($scope.DistanceCalculate[i].longitude[0]));
                            addMarker(latlng, 0);
                        }
                    }
                    else {
                        if ($scope.DistanceCalculate[i].latitude && $scope.DistanceCalculate[i].longitude && $scope.DistanceCalculate[i].latitude != 1 && $scope.DistanceCalculate[i].latitude != 2 &&
                            $scope.DistanceCalculate[i].latitude != 3 && $scope.DistanceCalculate[i].latitude != 4) {
                            latlng = new google.maps.LatLng(parseFloat($scope.DistanceCalculate[i].latitude), parseFloat($scope.DistanceCalculate[i].longitude));
                            addMarker(latlng, 0);
                        }
                    }
                }
                function addMarker(latlng, id) {
                    var markertitle = i + 1;
                    var contentString = '';
                    if($scope.DistanceCalculate[i].orderId == 'WareHouse'){
                        contentString =$scope.DistanceCalculate[i].orderId +"<br />"+  $scope.DistanceCalculate[i].deliveryLocation;
                    }else{
                        if($scope.DistanceCalculate[i].order.deliveryLocation){
                            contentString =$scope.DistanceCalculate[i].orderId +"<br />"+  $scope.DistanceCalculate[i].order.deliveryLocation[0];
                        }
                    }
                    if (id == 0) {
                        var marker = new google.maps.Marker({
                            position: latlng,
                            map: map,
                            title: contentString,
                        });
                        if (i == 0) {
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
                        } else if (i == $scope.DistanceCalculate.length - 1 ) {
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
                        } else {
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png')
                        }
                        reverseGeocode(geocode_address, latlng, 'customer');
                    }
                    var infowindow = new google.maps.InfoWindow({
                        content:contentString
                    });
                    marker.addListener('click', function () {
                        infowindow.open(map, marker);
                    });
                    gmarkers.push(marker);
                }
            }
            //Set zoom based on the location latlongs
            if (latlngList.length > 0) {
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < latlngList.length; i++) {
                    bounds.extend(latlngList[i]);
                }
                map.setCenter(bounds.getCenter()); //or use custom center
                map.fitBounds(bounds);
                // map.invalidatesize(true);
            }
            var mcOptions = {gridSize: 6, maxZoom: 20,
                imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"};
            var markerCluster = new MarkerClusterer(map, gmarkers,mcOptions); //clusters the nearby points
            google.maps.event.trigger(map, 'resize');
            $('a[href="#profile"]').on('shown', function (e) {
                google.maps.event.trigger(map, 'resize');
            });
            flightPath = new google.maps.Polyline({
                path: flightPlanCoordinates,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            flightPath.setMap(map);
        }
        $scope.beatDistance = 0;
        $scope.renderPjpMapDistance = () => {
            if($scope.DistanceCalculate.length <= 24){
                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;
                $scope.beatDistance = 0;
                var waypts = [];
                // var checkboxArray = document.getElementById('waypoints');
                var startpoint = '';
                var endpoint =  '';
                var startindex = 0;
                var lastindex = 0;
                var tempArray = [];
                for (var j = 0 ; j < $scope.DistanceCalculate.length; j++) {
                    lastindex += 24;
                    waypts = [];
                    if( $scope.DistanceCalculate.length <= lastindex ) {
                        startindex=$scope.DistanceCalculate.length;
                    }else{
                        startindex += 24;
                    }
                    for (i=j;i<startindex;i++){
                        if($scope.DistanceCalculate[i].latitude[0] && $scope.DistanceCalculate[j].longitude[0]){
                            if(i == 0){
                                startpoint = new google.maps.LatLng($scope.DistanceCalculate[i].latitude[0],$scope.DistanceCalculate[i].longitude[0]);
                            }else if(i == startindex-1){
                                endpoint =new google.maps.LatLng($scope.DistanceCalculate[i].latitude[0],$scope.DistanceCalculate[i].longitude[0]);
                            }else{
                                waypts.push({
                                    location: new google.maps.LatLng($scope.DistanceCalculate[i].latitude[0],$scope.DistanceCalculate[i].longitude[0]),
                                    stopover: true
                                });
                            }
                        }else if($scope.DistanceCalculate[i].latitude && $scope.DistanceCalculate[i].longitude ){
                            if(i == 0){
                                startpoint = new google.maps.LatLng($scope.DistanceCalculate[i].latitude,$scope.DistanceCalculate[i].longitude);
                            }else if(i == startindex-1){
                                endpoint =new google.maps.LatLng($scope.DistanceCalculate[i].latitude,$scope.DistanceCalculate[i].longitude);
                            }else{
                                waypts.push({
                                    location: new google.maps.LatLng($scope.DistanceCalculate[i].latitude,$scope.DistanceCalculate[i].longitude),
                                    stopover: true
                                });
                            }
                        }
                    }
                    j = startindex;
                    directionsService.route({
                        origin: startpoint,
                        destination: endpoint,
                        waypoints: waypts,
                        optimizeWaypoints: true,
                        travelMode: 'DRIVING'
                    }, function(response, status) {
                        if (status === 'OK') {
                            directionsDisplay.setDirections(response);
                            var route = response.routes[0];
                            for (var i = 0; i < route.legs.length; i++) {
                                $scope.beatDistance  += route.legs[i].distance.value
                            }
                            $scope.beatDistance = $scope.beatDistance / 1000;
                            $scope.$apply();
                            return new Promise((resolve, reject) => {
                                if ($scope.beatDistance) {
                                    resolve($scope.beatDistance);
                                } else {
                                    reject()
                                }
                            })
                        }
                    });
                }
            }else Settings.alertPopup('WARNING','Distance can be calculated for only 25 '+$scope.nav[1].tab);
        }
        //..... Get orders for a fulfiller.....
        $scope.getFulfillerOrder = () => {
            startLoader();
            $scope.DisplayFulfiller = false;
            let obj = {};
            //... Check if this is a user not an admin.....
            if(userRoletype  && userRoletype != 'admin'){
                //.... We take the tagged location.....
                obj.warehouse = $scope.user.sellerObject.inventoryLocation;
            }
            $http.post("/dash/role/rider/fulfiller", obj)
                .success(fulfillers => {
                    var allDeliveryOrders = [];
                    $scope.roleFulfiller = [];
                    if(fulfillers && fulfillers.length){
                        $scope.roleFulfiller = [];
                        for(var i = 0; i < fulfillers.length; i++){
                            var count = 0;
                            if(fulfillers[i].orderList){
                                allDeliveryOrders = allDeliveryOrders.concat(fulfillers[i].orderList)
                                for(var j = 0; j < fulfillers[i].orderList.length; j++){
                                    if(fulfillers[i].orderList[j].orderId != 'WareHouse'){
                                        count++;
                                    }
                                }
                            }
                            $scope.roleFulfiller.push({
                                sellername : fulfillers[i].sellername,
                                sellerphone : fulfillers[i].sellerphone,
                                orderList : fulfillers[i].orderList,
                                tripId : fulfillers[i].tripId,
                                inventoryLocation : fulfillers[i].inventoryLocation,
                                deliveryCount : count,
                                delivered_count : fulfillers[i].delivered_count
                            });
                        }
                        if($scope.orders.length){
                            allDeliveryOrders = allDeliveryOrders.concat($scope.orders)
                        }
                        // if(allDeliveryOrders.length && !$scope.fulfillerDetails){
                            // $scope.DisplayMap = true
                            // $scope.renderPjpMapBasic(allDeliveryOrders, 'map_order');
                        // }
                        stopLoader();
                    }
                });
        }
        $scope.RenderFulfillerDistance = count => {
            if(count < $scope.roleFulfiller.length){
                if($scope.roleFulfiller[count].orderList && $scope.roleFulfiller[count].orderList.length){
                    $scope.DistanceCalculateArray($scope.roleFulfiller[count].orderList,count)
                        .then(result => {
                            if(result){
                                $scope.roleFulfiller[count].distance = result;
                                $scope.$apply();
                            }
                            if(count <= $scope.roleFulfiller.length){
                                count = ++count;
                                $scope.RenderFulfillerDistance(count)
                            }else{
                                $scope.DisplayFulfiller = true;
                                $scope.$apply();
                            }
                        });
                }else{
                    $scope.roleFulfiller[count].distance = 0;
                    if(count <= $scope.roleFulfiller.length){
                        count = ++count;
                        $scope.RenderFulfillerDistance(count)
                    }else{
                        $scope.DisplayFulfiller = true;
                        $scope.$apply();
                    }
                }
            }else{
                $scope.DisplayFulfiller = true;
                $scope.$apply();
            }
        }
        $scope.closeFulfillerDetails = function () {
            $scope.fulfillerDetails = '';
            $scope.getFulfillerOrder();
        }
        $scope.SaveRide = function () {
            delete $scope.fulfillerDetails._id;
            $http.post('/dash/edit/fulfiller/route', $scope.fulfillerDetails)
                .then(result => {
                    $scope.DisplaySaveRide = false;
                    Settings.success_toast("Success","Ride Saved Successfully");
                })
        }
        //Apply order filter
        $scope.orderSearchFilter = function(filter,data) {
            jQuery.noConflict();
            debugger;
            $('.refresh').css("display", "inline");
            $scope.orderFilter = filter;
            $scope.fulfillerDetails = '';
            if(filter != 'all' && filter != undefined){
                $scope.filterStatusSelect = filter;
                // toastr.info('Showing orders of '+filter+' status!!')
            }
            else
                $scope.filterStatusSelect = '';
            //toastr.info('Showing all orders')
            searchObj.viewLength = 0;
            searchObj.viewBy = initialViewBy;
            // if($scope.sortByValue){
            //     searchObj.sort = $scope.sortByValue;
            // }
            var SOSArray = [];
            if(filter == 'sos' || filter == 'delayed'){
                for(var i=0;i<data.length;i++){
                    var obj = {};
                    obj.orderId = data[i]._id;
                    SOSArray.push(obj);
                }
            }
            if($scope.sortByValue && $scope.coID == 'DSGR'){
                searchObj.sort = $scope.sortByValue;
            }else{
                searchObj.sort = 'Delivery Date' ;
            }
            $scope.orderViewLength = 0;
            $scope.orderNewViewBy = localViewBy;
            if(!$scope.timeObj.startHour || !$scope.timeObj.startHour){
                if($scope.orderSearch.date_from)
                    searchObj.from_date =$scope.DateTimeFormat($scope.orderSearch.date_from,'start');
                if($scope.orderSearch.date_to){
                    searchObj.to_date = $scope.DateTimeFormat($scope.orderSearch.date_to,'end');
                }
            }
            if(filter != 'all' && filter != 'others')
                searchObj.filter = filter;
            else if(filter == 'others')
                searchObj.filter = $scope.orderStatus;
            else
                searchObj.filter = '';
            if($scope.orderSearch.filter){
                searchObj.searchFor = $scope.orderSearch.filter;
                searchObj.searchBy = orderSearchBy;
            }
            if($scope.orderSearch.timeSlot){
                searchObj.deliveryTimeSlot = $scope.orderSearch.timeSlot;
            }
            searchObj.dealer = {};
            if($scope.orderSearch.dealer){
                searchObj.dealer.dealerID = $scope.orderSearch.dealer.DealerID ? $scope.orderSearch.dealer.DealerID : '';
                searchObj.dealer.dealercode = $scope.orderSearch.dealer.Dealercode ? $scope.orderSearch.dealer.Dealercode : '';
            }
            if($scope.orderSearch.seller){
                searchObj.seller = $scope.orderSearch.seller.sellerphone;
            }
            else{
                searchObj.seller = '';
            }
            if($scope.orderSearch.source){
                searchObj.source = $scope.orderSearch.source;
            }
            else{
                searchObj.source = '';
            }
            if($scope.orderSearch.filterStockist && $scope.orderSearch.filterStockist.Stockist){
                searchObj.filterStockist = $scope.orderSearch.filterStockist.Stockist;
            }
            else{
                searchObj.filterStockist = '';
            }
            if($scope.orderSearch.paymentStatus){
                searchObj.paymentStatus = $scope.orderSearch.paymentStatus;
            }else{
                searchObj.paymentStatus = '';
            }
            if($scope.orderSearch.fulfillmentStatus){
                searchObj.fulfillmentStatus = $scope.orderSearch.fulfillmentStatus;
            }else{
                searchObj.fulfillmentStatus = '';
            }
            $scope.orders = [];
            loadOrders(searchObj);
            if(!$scope.zoneFilter){
                // $scope.getOrderStatusCount(searchObj)
                searchObj.sosArray = SOSArray;
                loadCount(searchObj);
            }
            $scope.showOrderFilter = true;
            if(filter == 'all' && $scope.orderSearch.filter == '' && $scope.orderSearch.date_from == '' && $scope.orderSearch.date_to == '')
                $scope.showOrderFilter = false;
            setTimeout(function(){
                $('.refresh').css("display", "none");
            }, 2000);
        };
        $scope.DateSearch = function (dateValue) {
            $scope.orderDate.dateFilter = dateValue;
            $scope.orderSearch.date_from = new Date(dateValue);
            $scope.orderSearch.date_to = new Date(dateValue);
            $scope.orderSearchFilter()
        }
        $scope.clearFilterButton = function (search,tab) {
            if (search === '') {
                switch (tab) {
                    //order
                    case 1:
                        $scope.refreshTransactions();
                }
            }
        }
        $scope.unAssigneOrder = function (value) {
           var obj = {};
           obj = value;
           obj.type = 'unassign';
           console.log($scope.fulfillerDetails.fulfiller);
           obj.fulfiller = $scope.fulfillerDetails.fulfiller;
            Settings.confirmPopup('CONFIRM', "Are you sure?", result => {
                if (result) {
                    $http.post('/dash/orders/fulfiller/multi', obj)
                        .then(result => {
                            $scope.getFulfillerOrder('map');
                            $scope.refreshTransactions();
                            $scope.showFulfillerDetails(obj.fulfiller);
                        })
                }
            })
        }
        $scope.displayDeliveryFn = () => {
            $scope.showDeliveryLocation = !$scope.showDeliveryLocation
        }
        //.... Start the Trip.....
        $scope.startTrip = orderObj => {
            var AssignedArray = [];
            var obj = {};
            var id = Settings.generateId(true, 8);
            for(var i = 0; i < orderObj.orderList.length; i++){
                AssignedArray.push({"orderId":orderObj.orderList[i].orderId});
            }
            obj.type = 'AssignTrip';
            obj.order = AssignedArray;
            obj.tripId = id;
            obj.fulfiller = orderObj.fulfiller;
            obj.fulfillerName = orderObj.fulfillerName
            obj.startedOn = Settings.newDate();
            if($scope.coID == 'AUBR'){
                obj.changeStatus = true
                obj.status = 'out for delivery'
            }else{
                obj.changeStatus = false
            }
            $http.post('/dash/orders/fulfiller/multi', obj).then(function (result) {
                Settings.success_toast("Success", $scope.getRoleName('Fulfiller')+" started trip");
                $scope.getFulfillerOrder();
                $scope.fulfillerDetails.tripId =id;
                $scope.showFulfillerDetails($scope.fulfillerDetails.fulfiller)
                $scope.refreshTransactions();
                document.getElementById("ridermodal").style.display = "none";
                //hide the modal
                $('body').removeClass('modal-open');
                //modal-open class is added on body so it has to be removed
                $('.modal-backdrop').remove();
            })
            if($scope.coID == 'DSGR' || $scope.coID == 'DSGT'){
                $http.put("/dash/orders/update/orangemantra", obj)
                    .success(function(response) {
                        console.log(response)
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
        }
        //.... End / Close the Trip.....
        $scope.closeTrip = orderObj => {
           $scope.deliveryCloseTrip = false;
            if(orderObj){
                if (orderObj.OrderDetails && orderObj.OrderDetails.length) {
                    for (var i = 0; i < orderObj.OrderDetails.length; i++) {
                        if (orderObj.OrderDetails[i].status != "delivered") {
                            $scope.deliveryCloseTrip = true;
                        }
                    }
                }
                if (!$scope.deliveryCloseTrip) {
                    var AssignedArray = [];
                    var obj = {};
                    for (var i = 0; i < orderObj.orderList.length; i++) {
                        AssignedArray.push({"orderId": orderObj.orderList[i].orderId});
                    }
                    obj.type = 'CloseOrder';
                    obj.order = AssignedArray;
                    obj.status = 'closed';
                    obj.fulfiller = orderObj.fulfiller;
                    obj.endOn = Settings.newDate();
                    $http.post('/dash/orders/fulfiller/multi', obj)
                        .then(result => {
                            Settings.success_toast("Success", $scope.getRoleName('Fulfiller') + " closed trip");
                            $scope.getFulfillerOrder();
                            $scope.AssignedFulfiller = [];
                            $scope.fulfillerDetails = {};
                            $scope.refreshTransactions();
                            $scope.closeFulfillerDetails();
                            document.getElementById("ridermodal").style.display = "none";
                            //hide the modal
                            $('body').removeClass('modal-open');
                            //modal-open class is added on body so it has to be removed
                            $('.modal-backdrop').remove();
                        })
                } else Settings.alertPopup('Warning', "One Or More Orders Not Yet Delivered,(Please Refresh The Page and Try Again)");
            }
        }
        //.... Refresh Trip Details.....
        $scope.refreshTrip = value => {
            $http.get('/dash/fulfiller/orderslist/' + value.fulfiller)
                .then(result => {
                    if(result.data){
                        $scope.fulfillerDetails = result.data[0];
                        var fulfillerData = angular.copy(result.data[0]);
                        if(!$scope.fulfillerDetails.fulfillerName){
                            for(var i=0;i<$scope.roleFulfiller.length;i++){
                                if($scope.roleFulfiller[i].sellerphone == $scope.fulfillerDetails.fulfiller){
                                    $scope.fulfillerDetails.fulfillerName = $scope.roleFulfiller[i].sellername;
                                }
                            }
                        }
                        var count = 0;
                        if($scope.fulfillerDetails.orderList.length){
                            for(var i=0;i<$scope.fulfillerDetails.orderList.length;i++){
                                if($scope.fulfillerDetails.orderList[i].orderId != 'WareHouse'){
                                    count = count+1;
                                }
                            }
                            $scope.fulfillerDetails.deliveryCount = count;
                            $scope.renderPjpMap(fulfillerData.orderList,'map_order');
                            $scope.renderPjpMapDistance();
                        }else{
                            $scope.closeFulfillerDetails();
                        }
                    }
                })
        }
        $scope.recordAddress = function (type,page,id) {
            if(page == 'order'){
                if (type == 'new') {
                    var input = document.getElementById(id);
                    var autocomplete = new google.maps.places.Autocomplete(input);
                    autocomplete.addListener('place_changed', function () {
                        var newplace = autocomplete.getPlace();
                        var jcity = '';
                        var jaddress = '';
                        var jarea = '';
                        var jcountry = '';
                        var jstate = '';
                        var lat = newplace.geometry.location.lat();
                        var long = newplace.geometry.location.lng();
                        // console.log(place);
                        for(var i = 0; i < newplace.address_components.length; i++){
                            if(newplace.address_components[i].types[0] == "locality"){
                                jcity = newplace.address_components[i].long_name;
                                jaddress= newplace.formatted_address;
                            }
                            if(newplace.address_components[i].types[1] == "sublocality")
                                jarea = newplace.address_components[i].long_name;
                            if(newplace.address_components[i].types[0] == "country")
                                jcountry = newplace.address_components[i].long_name;
                            if(newplace.address_components[i].types[0] == "administrative_area_level_1"){
                                jstate = newplace.address_components[i].long_name;
                                $scope.mapAddress = true;
                            }
                        }
                        // console.log("lat and long"+lat, long);
                        var scope = angular.element(document.getElementById(id)).scope();
                        console.log("jcity", jcity);
                        scope.deliveryAddress.tempnewOrderaddress = jaddress;
                        scope.deliveryAddress.tempCity = jcity;
                        scope.deliveryAddress.tempState = jstate;
                        scope.deliveryAddress.tempCountry = jcountry;
                        scope.deliveryAddress.latitude = lat;
                        scope.deliveryAddress.longitude = long;
                        $scope.$apply();
                        $('#shippingCity').val(jcity);
                    })
                }
            }
        }
        function degreesToRadians(degrees) {
            return degrees * Math.PI / 180;
        }
        var distanceCalculateToHub = function (lat1,lon1,lat2,lon2) {
            var earthRadiusKm = 6371;
            var dLat = degreesToRadians(lat2-lat1);
            var dLon = degreesToRadians(lon2-lon1);
            lat1 = degreesToRadians(lat1);
            lat2 = degreesToRadians(lat2);
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = earthRadiusKm * c;
            return Math.round(d);
        }
        $scope.AlterAddress = function (order) {
            console.log('order',order)
            console.log('scope.deliveryAddress',$scope.deliveryAddress)
           var obj = {}
           obj.orderId = order.orderId[0];
            obj.tempnewOrderaddress = $scope.deliveryAddress.tempnewOrderaddress;
            obj.latitude = $scope.deliveryAddress.latitude;
            obj.longitude = $scope.deliveryAddress.longitude;
            $http.post('/dash/orders/delivery/editaddress', obj)
                .then(result => {
                    if(result.data){
                        Settings.success_toast("Success","Address added successfully")
                        $scope.refreshTransactions()
                    }
                })
        }
        $scope.editOrderDetails = order => {
            var obj = {}
            obj.orderId = order.orderId[0];
            obj.tempnewOrderaddress = $scope.deliveryAddress.tempnewOrderaddress;
            obj.latitude = $scope.deliveryAddress.latitude;
            obj.longitude = $scope.deliveryAddress.longitude;
            obj.delivery_zone = order.delivery_zone;
            if(order.fulfiller){
                if(existingFulfiller != order.fulfiller){
                    obj.fulfiller = order.fulfiller
                    obj.fulfiller_assigned_time = Settings.newDate();
                    obj.fulfillerName = $scope.getfulfillersName(order.fulfiller);
                    var tempArray = [];
                    tempArray.push({
                        "orderId" : order._id,
                        "latitude" : order.latitude,
                        "longitude" : order.longitude,
                        "order" : order
                    });
                    obj.orderArray = tempArray;
                }
            }
            if(existingFulfiller){
                obj.existingFulfiller  = existingFulfiller;
            }
            if(obj.tempnewOrderaddress || obj.delivery_zone || obj.fulfiller){
                $http.post('/dash/orders/delivery/editorder', obj)
                    .then(result => {
                        if(result.data){
                            Settings.success_toast("Success", "Address added successfully");
                            $scope.refreshTransactions()
                        }
                        document.getElementById("editridermodal").style.display = "none";
                        //hide the modal
                        $('body').removeClass('modal-open');
                        //modal-open class is added on body so it has to be removed
                        $('.modal-backdrop').remove();
                    })
            }
        }
        $scope.editAddressFunc = function (index) {
            for(let i = 0; i < $scope.orders.length; i++){
                if(i != index){
                    $scope.editOrderStatus[i]= false;
                }
            }
        }
        $scope.filterZone = function (zone) {
            searchObj.zoneFilter = zone || 'UNMAPPED';
            $scope.zoneFilter = searchObj.zoneFilter;
            $scope.orderSearchFilter();
        }
        $scope.AssignTimeslot = function (value) {
            $scope.timeObj = {};
            if(value){
                value = JSON.parse(value);
                $scope.timeObj.startHour = value.start_hour;
                $scope.timeObj.startType = value.start_period;
                $scope.timeObj.endHour = value.end_hour
                $scope.timeObj.endType = value.end_period
                $scope.timeObj.name = value.name
                $scope.timeSlotFilter();
            }   
        }
    })
    .config(function($mdDateLocaleProvider) {
        $mdDateLocaleProvider.formatDate = function(date) {
            return date ? moment(date).format('DD-MMM-YYYY') : '';
        };
        $mdDateLocaleProvider.parseDate = function(dateString) {
            var m = moment(dateString, 'DD-MM-YYYY', true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };
    });