/**
 * Created by shreyasgombi on 05/03/20.
 */
angular.module('ebs.controller')
    .controller("MapsCtrl",function ($scope, Settings, $http, $location, $window) {
        console.log("Hello From Maps Controller .... !!!!");
        //... Maps Filter...
        $scope.maps = {};
        $scope.mapsFilter = {};
        $scope.mapsFilter.locationSeller = '';
        $scope.allLocation = {};
        $scope.mapsFilter.from = new Date();
        //$scope.mapsFilter.from.setDate($scope.mapsFilter.from.getDate()-1);
        $scope.mapsFilter.from.setHours(0, 0, 0, 0);
        $scope.mapsFilter.to = new Date();
        $scope.mapsFilter.to.setHours(23, 59, 59, 59);
        $scope.mapsFilter.seller = {};
        $scope.mapsFilter.dealer = {};
        $scope.mapsFilter.type = {};
        $scope.mapsFilter.type.val = 'all';
        $scope.mapsFilter.type.all = true;
        $scope.mapsFilter.type.orders = false;
        $scope.mapsFilter.type.payments = false;
        $scope.mapsFilter.type.checkins = false;
        $scope.mapsFilter.type.meetings = false;
        $scope.mapsFilter.type.quotations = false;
        $scope.gmarkers = [];
        $scope.renderMaps = function(){
            $scope.showMap = false;
            $scope.mapSellernameDisp = '';
            // Clear Present Markers
            for (var i = 0; i < $scope.gmarkers.length; i++) {
                $scope.gmarkers[i].setMap(null);
            }
            $scope.gmarkers = [];
            $scope.mapsOrdersAll = [];
            $scope.mapsFilter.seller = {};
            $scope.mapsFilter.to.setHours(23, 59, 59, 59);
            $scope.mapsFilter.loc_available = true;
            $scope.mapsFilter.loc_notAvailable = true;
            //API to fetch ORDERS, PAYMENTS, CHECK_IN AND MEETINGS
            $http.post("/dash/orders/maps/" + DateTimeStampFormat($scope.mapsFilter.from) + "/" + DateTimeStampFormat($scope.mapsFilter.to), $scope.mapsFilter)
                .success(function (response) {
                    $scope.allTransactions = 0;
                    console.log("Maps Orders -->", response.length);
                    // console.log(response)
                    $scope.mapsOrdersAll = response;
                    $scope.markerType.all = true;
                    $scope.markerType.order = false;
                    $scope.markerType.payment = false;
                    $scope.markerType.checkin = false;
                    $scope.markerType.meeting = false;
                    $scope.showMapDetails = false;
                    $scope.changeMapTransactionType(1);
                    initializeMap();
                    initializeOrderMap();
                    var d1 = moment($scope.mapsFilter.from);
                    var d2 = moment($scope.mapsFilter.to);
                    $scope.mapReportDuration = moment.duration(d2.diff(d1)).asDays();
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
        $scope.showMap = false;
        $scope.mapSellernameDisp = '';
        // Clear Present Markers
        for (var i = 0; i < $scope.gmarkers.length; i++) {
            $scope.gmarkers[i].setMap(null);
        }
        $scope.gmarkers = [];
        $scope.mapsOrdersAll = [];
        $scope.mapsFilter.seller = {};
        $scope.mapsFilter.to.setHours(23, 59, 59, 59);
        $scope.mapsFilter.loc_available = true;
        $scope.mapsFilter.loc_notAvailable = true;
        $scope.markerType = {};
        $scope.icons = [];
        //.....Format the date in datetime stamp format (2017-04-23 11:03:40) ....
        function DateTimeStampFormat(date_added) {
            if (date_added) {
                //This is to format the date in dd-mm-yy hh:mm:ss format, also padding 0's if values are <10 using above function
                var date = new Date(date_added);
                var dformat = [date.getFullYear(), (date.getMonth() + 1).padLeft(), date.getDate().padLeft()].join('-') + ' '
                    + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join(':');
                return (dformat);
            }
            else
                return null;
        }
        const loadGoogleMapOrders = () => {
            //API to fetch ORDERS, PAYMENTS, CHECK_IN AND MEETINGS
            $http.post("/dash/orders/maps/" + DateTimeStampFormat($scope.mapsFilter.from) + "/" + DateTimeStampFormat($scope.mapsFilter.to), $scope.mapsFilter)
            .success(function (response) {
                $scope.allTransactions = 0;
                console.log("Maps Orders -->", response.length);
                // console.log(response)
                $scope.mapsOrdersAll = response;
                $scope.markerType.all = true;
                $scope.markerType.order = false;
                $scope.markerType.payment = false;
                $scope.markerType.checkin = false;
                $scope.markerType.meeting = false;
                $scope.showMapDetails = false;
                $scope.changeMapTransactionType(1);
                initializeMap();
                initializeOrderMap();
                var d1 = moment($scope.mapsFilter.from);
                var d2 = moment($scope.mapsFilter.to);
                $scope.mapReportDuration = moment.duration(d2.diff(d1)).asDays();
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
        function initializeOrderMap(lat, long, mapOrder1) {
            console.log("mapOrder1");
            console.log(mapOrder1);
            $scope.icons['Order'] = '/assets/images/map_icons/Orders.png';
            try {
                var latlng = new google.maps.LatLng(20.5937, 78.9629);
                var zoomLevel = 4; //Initial zoom to INDIA
                //If a marker is present then zoom it to 14 and sent LATLNG as per order's lat and long
                if (lat && long) {
                    zoomLevel = 14;
                    latlng = new google.maps.LatLng(lat, long);
                }
                var myOptions = {
                    zoom: zoomLevel,
                    center: latlng,
                    scaleControl: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;
                map = new google.maps.Map(document.getElementById("map_canvas1"), myOptions);
                directionsDisplay.setMap(map);
            }
            catch (e) {
                console.log(e)
                setTimeout(function () {
                    console.log("Calling initializeMap after Map API is loaded")
                    initializeMap();
                }, 10000)
            }
            function addMarker(order, latlng) {
                var salesguy = order.sellername ? order.sellername : $scope.getSellerName(order.seller) ;
                var contentString = '<div id="content" >' +
                    '<div id="siteNotice">' +
                    '</div>' +
                    '<div>';
                if (order.type[0]) {
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        zoom: 14,
                        title: 'Click to view',
                        icon: $scope.icons[order.type]
                    });
                }
                else {
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        title: 'Click to view'
                    });
                }
                marker.addListener('click', function () {
                    //map.setZoom(8);
                    //map.setCenter(marker.getPosition());
                    // infowindow.open(map, marker);
                    $location.path('/order-details/' + order.orderId);
                    $scope.showMapDetails = true;
                    $scope.$apply();
                });
                $scope.gmarkers.push(marker);
            }
            if(lat && long)
                addMarker(mapOrder1, latlng);
        }
        function initializeMap(lat, long, mapOrder){
            $scope.icons['Order'] = '/assets/images/map_icons/Orders.png';
            $scope.icons['Quotation'] = 'https://maps.google.com/mapfiles/ms/micons/purple-dot.png';
            $scope.icons['Payment'] = '/assets/images/map_icons/Payment.png';
            $scope.icons['Check_In'] = '/assets/images/map_icons/Check_In.png';
            $scope.icons['Meeting'] = '/assets/images/map_icons/Meeting.png';
            $scope.icons['Attendance'] = '/assets/images/map_icons/Attendance.png';
            $scope.icons['User'] = 'https://maps.google.com/mapfiles/ms/micons/pink-dot.png';
            try{
                var latlng = new google.maps.LatLng(20.5937, 78.9629);
                var zoomLevel = 4; //Initial zoom to INDIA
                //If a marker is present then zoom it to 14 and sent LATLNG as per order's lat and long
                if(lat && long){
                    zoomLevel = 14;
                    latlng = new google.maps.LatLng(lat, long);
                }
                var myOptions = {
                    zoom: zoomLevel,
                    center: latlng,
                    scaleControl: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;
                map = new google.maps.Map(document.getElementById("map_canvas1"), myOptions);
                directionsDisplay.setMap(map);
            }
            catch(e){
                console.log(e)
                setTimeout(function(){
                    console.log("Calling initializeMap after Map API is loaded")
                    initializeMap();
                }, 10000)
            }
            function addMarker(order, latlng) {
                var salesguy = order.sellername ? order.sellername : $scope.getSellerName(order.seller) ;
                var contentString = '<div id="content" >' +
                    '<div id="siteNotice">' +
                    '</div>' +
                    '<div>';
                if (order.type[0]) {
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        zoom: 14,
                        title: 'Click to view',
                        icon: $scope.icons[order.type[0]]
                    });
                }
                else {
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        title: 'Click to view'
                    });
                }
                marker.addListener('click', function () {
                    //map.setZoom(8);
                    //map.setCenter(marker.getPosition());
                    // infowindow.open(map, marker);
                    $location.path('/order-details/' + order.orderId);
                    $scope.showMapDetails = true;
                    $scope.$apply();
                });
                $scope.gmarkers.push(marker);
            }
            if(lat && long)
                addMarker(mapOrder, latlng);
        }
        //Filter Map Transactions based on Location Available, Location Not Available, User
        $scope.filterMapTransaction = function(user){
            $scope.mapSellername = '';
            $scope.mapOrders = [];
            $scope.dropDownHide = true;
            if(user){
                $scope.mapSellernameDisp = user.sellername;
                $scope.mapsFilter.seller = user;
                $scope.mapSellername = user.sellername;
            }else{
                $scope.mapsFilter.seller = '';
            }
            var mapOrders = [];
            //Filter by transaction type
            if($scope.markerType.all){
                $scope.markerType.order = false;
                $scope.markerType.payment = false;
                $scope.markerType.checkin = false;
                $scope.markerType.meeting = false;
                //Filter By user
                if($scope.mapsFilter.seller){
                    if($scope.mapsFilter.seller.sellername){
                        var tempMapOrders = $scope.mapsOrdersAll;
                        mapOrders = [];
                        for(var i=0; i< tempMapOrders.length; i++) {
                            if ($scope.mapsFilter.seller.sellername == tempMapOrders[i].sellername[0])
                                mapOrders.push(tempMapOrders[i]);
                        }
                    }else{
                        mapOrders = $scope.mapsOrdersAll;
                    }
                }else{
                    mapOrders = $scope.mapsOrdersAll;
                }
            }else if($scope.mapsFilter.seller){
                if($scope.mapsFilter.seller.sellername){
                    for(var i=0; i<$scope.mapsOrdersAll.length; i++){
                        if($scope.mapsOrdersAll[i].type[0] == 'Order' && $scope.markerType.order && user.sellername == $scope.mapsOrdersAll[i].sellername[0]){
                            mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                        else if($scope.mapsOrdersAll[i].type[0] == 'Payment' && $scope.markerType.payment && user.sellername == $scope.mapsOrdersAll[i].sellername[0]){
                            mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                        else if($scope.mapsOrdersAll[i].type[0] == 'Meeting' && $scope.markerType.meeting && user.sellername == $scope.mapsOrdersAll[i].sellername[0]){
                            mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                        else if($scope.mapsOrdersAll[i].type[0] == 'Check_In' && $scope.markerType.checkin && user.sellername == $scope.mapsOrdersAll[i].sellername[0]){
                            mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                    }
                }
            }
            else{
                $scope.markerType.all = false;
                for(var i=0; i<$scope.mapsOrdersAll.length; i++){
                    if($scope.mapsOrdersAll[i].type[0] == 'Order' && $scope.markerType.order){
                        mapOrders.push($scope.mapsOrdersAll[i]);
                    }
                    else if($scope.mapsOrdersAll[i].type[0] == 'Payment' && $scope.markerType.payment){
                        mapOrders.push($scope.mapsOrdersAll[i]);
                    }
                    else if($scope.mapsOrdersAll[i].type[0] == 'Meeting' && $scope.markerType.meeting){
                        mapOrders.push($scope.mapsOrdersAll[i]);
                    }
                    else if($scope.mapsOrdersAll[i].type[0] == 'Check_In' && $scope.markerType.checkin){
                        mapOrders.push($scope.mapsOrdersAll[i]);
                    }
                }
            }
            //Filter by location available or not available
            for(var i=0; i< mapOrders.length; i++){
                if($scope.mapsFilter.loc_available){
                    if($scope.mapSellernameDisp){
                        if(mapOrders[i].latitude[0] != 1 && mapOrders[i].latitude[0] != 2 && mapOrders[i].latitude[0] != 3 &&
                            mapOrders[i].latitude[0] != undefined && mapOrders[i].latitude[0] != null && mapOrders[i].latitude[0] != '' &&
                            mapOrders[i].longitude[0] != 1 && mapOrders[i].longitude[0] != 2 && mapOrders[i].longitude[0] != 3 &&
                            mapOrders[i].longitude[0] != undefined && mapOrders[i].longitude[0] != null && mapOrders[i].longitude[0] != '' && mapOrders[i].sellername[0] == $scope.mapSellernameDisp)
                            $scope.mapOrders.push(mapOrders[i]);
                    }else{
                        if(mapOrders[i].latitude[0] != 1 && mapOrders[i].latitude[0] != 2 && mapOrders[i].latitude[0] != 3 &&
                            mapOrders[i].latitude[0] != undefined && mapOrders[i].latitude[0] != null && mapOrders[i].latitude[0] != '' &&
                            mapOrders[i].longitude[0] != 1 && mapOrders[i].longitude[0] != 2 && mapOrders[i].longitude[0] != 3 &&
                            mapOrders[i].longitude[0] != undefined && mapOrders[i].longitude[0] != null && mapOrders[i].longitude[0] != '')
                            $scope.mapOrders.push(mapOrders[i]);
                    }
                }
                if($scope.mapsFilter.loc_notAvailable){
                    if(user){
                        if(!(mapOrders[i].latitude[0] != 1 && mapOrders[i].latitude[0] != 2 && mapOrders[i].latitude[0] != 3 &&
                            mapOrders[i].latitude[0] != undefined && mapOrders[i].latitude[0] != null && mapOrders[i].latitude[0] != '' &&
                            mapOrders[i].longitude[0] != 1 && mapOrders[i].longitude[0] != 2 && mapOrders[i].longitude[0] != 3 &&
                            mapOrders[i].longitude[0] != undefined && mapOrders[i].longitude[0] != null && mapOrders[i].longitude[0] != '' && mapOrders[i].sellername[0] == $scope.mapSellernameDisp))
                            $scope.mapOrders.push(mapOrders[i]);
                    }else{
                        if(!(mapOrders[i].latitude[0] != 1 && mapOrders[i].latitude[0] != 2 && mapOrders[i].latitude[0] != 3 &&
                            mapOrders[i].latitude[0] != undefined && mapOrders[i].latitude[0] != null && mapOrders[i].latitude[0] != '' &&
                            mapOrders[i].longitude[0] != 1 && mapOrders[i].longitude[0] != 2 && mapOrders[i].longitude[0] != 3 &&
                            mapOrders[i].longitude[0] != undefined && mapOrders[i].longitude[0] != null && mapOrders[i].longitude[0] != ''))
                            $scope.mapOrders.push(mapOrders[i]);
                    }
                }
            }
        }
        //Change map transactions date
        $scope.changeMapDate = function(dir){
            $scope.mapSellernameDisp = '';
            $scope.mapsFilter.seller = '';
            //Next Day
            if(dir == 1){
                $scope.mapsFilter.from.setDate($scope.mapsFilter.from.getDate() + 1);
                $scope.mapsFilter.from.setHours(0,0,0,0);
                $scope.mapsFilter.to.setDate($scope.mapsFilter.to.getDate() + 1);
                $scope.mapsFilter.to.setHours(23,59,59,59);
            }
            //Previous day
            else if(dir == 2){
                $scope.mapsFilter.from.setDate($scope.mapsFilter.from.getDate() - 1);
                $scope.mapsFilter.from.setHours(0,0,0,0);
                $scope.mapsFilter.to.setDate($scope.mapsFilter.to.getDate() - 1);
                $scope.mapsFilter.to.setHours(23,59,59,59);
            }
            else{
                $scope.mapsFilter.from = new Date($scope.mapsFilter.from);
                $scope.mapsFilter.from.setHours(0,0,0,0);
                $scope.mapsFilter.to = new Date($scope.mapsFilter.from);
                $scope.mapsFilter.to.setHours(23,59,59,59);
            }
            $scope.renderMaps();
        }
        $scope.searchSalesperson= function (value,role){
            $scope.dropDownHide = false;
            var body = {};
            body.role = role;
            body.text = value;
            $scope.interAssetTransfer = {};
            $scope.interAssetTransfer.receiverId = '';
            $scope.interAssetTransfer.receiverName = '';
            if(!value){
                $scope.mapSellernameDisp = '';
                $scope.mapsFilter.seller = '';
                //$scope.filterMapTransaction();
                jQuery.noConflict();
                $(".salesrepDropdown").css('display', 'none')
            }
            if(value.length > 2 && role == ''){
                $http.post("/dash/getSellers/roleType",body)
                    .success(function(response){
                        if(value){
                            $scope.displaySalesperson = response;
                            jQuery.noConflict();
                            $(".salesrepDropdown").css('display', 'block')
                        }else{
                            $scope.displaySalesperson = response;
                            jQuery.noConflict();
                            $(".salesrepDropdown").css('display', 'none')
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
            }else if(role && value){
                $http.post("/dash/getSellers/roleType",body)
                    .success(function(response){
                        if(value){
                            $scope.displaySalesperson = response;
                            jQuery.noConflict();
                            $(".salesrepDropdown").css('display', 'block')
                        }else{
                            $scope.displaySalesperson = response;
                            jQuery.noConflict();
                            $(".salesrepDropdown").css('display', 'none')
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
        };
        $scope.checkCordinates = function (lat, long){
            return (lat && lat != 1 && lat != 2 && lat != 3 && long && long != 1 && long != 2 && long != 3);
        }
        $scope.formatdate = function(date){
            if(date!=undefined && date!='' && date!= null){
                // try{
                //    return new Date(date.replace(/-/g, "/"))
                // }
                // catch(e){
                //    return new Date(date);
                // }
                var a = date.toString();
                var b = a.replace(/-/g, "/");
                return new Date(b);
            }
            else{
                return false;
            }
        };
        $scope.plotMapMarker = function(order){
            //console.log(order);
            if(order.latitude[0] != 1 && order.latitude[0] != 2 && order.latitude[0] != 3 &&
                order.latitude[0] != undefined && order.latitude[0] != null && order.latitude[0] != '' &&
                order.longitude[0] != 1 && order.longitude[0] != 2 && order.longitude[0] != 3 &&
                order.longitude[0] != undefined && order.longitude[0] != null && order.longitude[0] != ''){
                initializeMap(order.latitude[0], order.longitude[0],  order);
            }
            else{
                initializeMap();
            }
        };
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
                        setTimeout(() => {
                            loadGoogleMapOrders();
                        }, 2000);
                    }
                }
            }else{
                loadGoogleMapOrders();
                console.log("Voila! Google is already loaded on your browser ---> ");
            }
        };
        loadScript(Settings.getInstanceDetails('gMapAPI'), 'text/javascript', 'utf-8');
        $scope.changeMapTransactionType = function(index){
            // Clear Present Markers
            for (var i = 0; i < $scope.gmarkers.length; i++) {
                $scope.gmarkers[i].setMap(null);
            }
            $scope.gmarkers = [];
            $scope.mapOrders = [];
            if(index){
                if($scope.markerType.all){
                    $scope.markerType.order = false;
                    $scope.markerType.payment = false;
                    $scope.markerType.checkin = false;
                    $scope.markerType.meeting = false;
                    if($scope.mapsFilter.seller){
                        if($scope.mapsFilter.seller.sellername){
                            var tempMapOrders = $scope.mapsOrdersAll;
                            for(var i=0; i< tempMapOrders.length; i++) {
                                if ($scope.mapsFilter.seller.sellername == tempMapOrders[i].sellername[0])
                                    $scope.mapOrders.push(tempMapOrders[i]);
                            }
                        }else{
                            $scope.mapOrders = $scope.mapsOrdersAll;
                        }
                    }else{
                        $scope.mapOrders = $scope.mapsOrdersAll;
                    }
                }
                else{
                    $scope.mapOrders = [];
                }
            }
            else{
                $scope.markerType.all = false;
                if($scope.mapsFilter.seller.sellername){
                    for(var i=0; i<$scope.mapsOrdersAll.length; i++){
                        if($scope.mapsOrdersAll[i].type[0] == 'Order' && $scope.markerType.order && $scope.mapsFilter.seller.sellername == $scope.mapsOrdersAll[i].sellername[0]){
                            $scope.mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                        else if($scope.mapsOrdersAll[i].type[0] == 'Payment' && $scope.markerType.payment && $scope.mapsFilter.seller.sellername == $scope.mapsOrdersAll[i].sellername[0]){
                            $scope.mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                        else if($scope.mapsOrdersAll[i].type[0] == 'Meeting' && $scope.markerType.meeting && $scope.mapsFilter.seller.sellername == $scope.mapsOrdersAll[i].sellername[0]){
                            $scope.mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                        else if($scope.mapsOrdersAll[i].type[0] == 'Check_In' && $scope.markerType.checkin && $scope.mapsFilter.seller.sellername == $scope.mapsOrdersAll[i].sellername[0]){
                            $scope.mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                    }
                }else{
                    for(var i=0; i<$scope.mapsOrdersAll.length; i++){
                        if($scope.mapsOrdersAll[i].type[0] == 'Order' && $scope.markerType.order ){
                            $scope.mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                        else if($scope.mapsOrdersAll[i].type[0] == 'Payment' && $scope.markerType.payment){
                            $scope.mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                        else if($scope.mapsOrdersAll[i].type[0] == 'Meeting' && $scope.markerType.meeting){
                            $scope.mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                        else if($scope.mapsOrdersAll[i].type[0] == 'Check_In' && $scope.markerType.checkin){
                            $scope.mapOrders.push($scope.mapsOrdersAll[i]);
                        }
                    }
                }
            }
            $scope.maps_users = [];
            $scope.gmarkers = [];
            var waypts = [];
            $scope.maps.order = 0;
            $scope.maps.orderLoc = 0;
            $scope.maps.payment = 0;
            $scope.maps.paymentLoc = 0;
            $scope.maps.checkin = 0;
            $scope.maps.checkinLoc = 0;
            $scope.maps.meeting = 0;
            $scope.maps.meetingLoc = 0;
            $scope.maps.attendance = 0;
            $scope.maps.attendancePunchinLoc = 0;
            $scope.maps.attendancePunchoutLoc = 0;
        };
    })