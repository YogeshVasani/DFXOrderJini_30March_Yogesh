/**
 * Created by Akash on 10/03/20.
 */
angular.module('ebs.controller')
    .controller("AddBeatCtrl",function ($scope, $filter, $http, $modal,$routeParams, $window,Settings, toastr, $interval,$sce,$mdDialog,$location) {
        console.log("Hello From add beat Controller .... !!!!");
        var dealerSearchBy = ['Dealercode', 'DealerName', 'City', 'seller','SellerName', 'StockistName', 'Area', 'Phone', 'email'];
        var initialViewBy = 60;
        var localViewBy = $scope.newViewBy;
        $scope.checkinMapLocation = {};
        $scope.BeatId = Number($routeParams.id);
        $scope.buttonDisable = {};
        $scope.buttonDisable.flag = false;
        $scope.newBeat = {};
        $scope.sellerNames = []; //stores seller name
        $scope.roleSalesrep = [];
        $scope.fulfillerNames = {};
        $scope.pjpBeat = [];
        $scope.newViewBy = 10;
        var viewBy = {};
        viewBy.dealer = 12;
        $scope.dealerSearch = {};
        $scope.cityText = {};
        $scope.filter = {};
        $scope.dealer = {};
        $scope.dealerSelectAll = {};
        var dealerSearchObj= {};
        var newOrderSelectedStore = {};
        $scope.checkinIcons = [];
        $scope.checkinIcons['startVisit'] = 'https://maps.google.com/mapfiles/ms/micons/blue-dot.png';
        $scope.checkinIcons['endVisit'] = 'https://maps.google.com/mapfiles/ms/micons/red-dot.png';
        $scope.checkinIcons['Customer'] = 'https://maps.google.com/mapfiles/ms/micons/orange-dot.png';
        $scope.checkinIcons['pjp'] = 'https://maps.google.com/mapfiles/ms/micons/green-dot.png';
        dealerSearchObj.viewLength = 0;
        dealerSearchObj.viewBy = initialViewBy;
        dealerSearchObj.searchFor = '';
        dealerSearchObj.seller = '';
        dealerSearchObj.stockist = '';
        dealerSearchObj.searchBy = [];
        dealerSearchObj.searchByArea = [];
        dealerSearchObj.searchRegion = [];
        $http.get("/dash/role/sellers/Salesperson")
            .success(function (salesperson) {
                //console.log("Salesperson : ", salesperson);
                if(salesperson && salesperson.length){
                    $scope.roleSalesrep = [];
                    for(var i = 0; i < salesperson.length; i++){
                        $scope.roleSalesrep.push({sellername : salesperson[i].sellername, sellerphone : salesperson[i].sellerphone});
                    }
                }
            });
        function reverseGeocode(callback, latlng, type){
            var geocoder = new google.maps.Geocoder();
            if(type == 'ATD'){
                geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                    if (status !== google.maps.GeocoderStatus.OK) {
                        console.log(status);
                    }
                    if (status == google.maps.GeocoderStatus.OK) {
                        //console.log(results);
                        var address = (results[0].formatted_address);
                        callback.call(this, address, 'ATD');
                    }
                });
            }
            else if(type == 'customer'){
                geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                    if (status !== google.maps.GeocoderStatus.OK) {
                        console.log(status);
                    }
                    if (status == google.maps.GeocoderStatus.OK) {
                        //console.log(results);
                        var address = (results[0].formatted_address);
                        callback.call(this, address, 'customer');
                    }
                });
            }
            else if(type == 'startVisit'){
                geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                    if (status !== google.maps.GeocoderStatus.OK) {
                        console.log(status);
                    }
                    if (status == google.maps.GeocoderStatus.OK) {
                        //console.log(results);
                        var address = (results[0].formatted_address);
                        callback.call(this, address, 'startVisit');
                    }
                });
            }
            else if(type == 'endVisit'){
                geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                    if (status !== google.maps.GeocoderStatus.OK) {
                        console.log(status);
                    }
                    if (status == google.maps.GeocoderStatus.OK) {
                        //console.log(results);
                        var address = (results[0].formatted_address);
                        callback.call(this, address, 'endVisit');
                    }
                });
            }
        }
        $scope.sortableOptions = {
            stop: function(e, ui) {
                // this callback has the changed model
                $scope.renderPjpMap($scope.pjpBeat,'map_CreatePJP')
                console.log('log sortable');
            }
        };
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
        $scope.refreshSellerNames = function(){
            if(typeof $scope.roleSalesrep == 'object'){
                for(var j=0;j<$scope.roleSalesrep.length;j++){
                    if($scope.roleSalesrep[j].userStatus == 'Active' || $scope.roleSalesrep[j].role != '')
                        $scope.sellerNames[$scope.roleSalesrep[j].sellerphone] = $scope.roleSalesrep[j].sellername;
                }
            }
        }
        $scope.dealerFilterBy = function(){
            $scope.dealerfilterFlag = !$scope.dealerfilterFlag;
        };
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
        }
        $scope.fetchStoresByCities =function(dealerSearchObj){
            $http.post("/dash/stores", dealerSearchObj)
                .success(function (response) {
                    $scope.multipleUsers(response, 'City');
                    $http.post("/dash/stores/count", dealerSearchObj)
                        .success(function (res) {
                            $scope.transactionCount(res, 4);
                        });
                    $scope.getAllStoreAreas(false, 'area');
                });
        }
        $scope.fetchStoresByArea =function(dealerSearchObj){
            $http.post("/dash/stores", dealerSearchObj)
                .success(function (response) {
                    $scope.multipleUsers(response, 'Area');
                    $http.post("/dash/stores/count", dealerSearchObj)
                        .success(function (res) {
                            $scope.transactionCount(res, 4);
                        });
                });
        }
        $scope.storeSearchFilter = function(){
            $scope.showListDealerDetail = false;
            dealerSearchObj.viewLength = 0;
            dealerSearchObj.viewBy = initialViewBy;
            $scope.viewLength = 0;
            $scope.newViewBy = localViewBy;
            if($scope.dealerSearch.filter){
                dealerSearchObj.searchFor = $scope.dealerSearch.filter;
                dealerSearchObj.searchBy = dealerSearchBy;
            }
            // dealerSearchObj.stockist = {};
            // if($scope.filter.branch != 'All'){
            //     dealerSearchObj.stockist = $scope.filter.branch;
            // }
            // else {
            //     dealerSearchObj.stockist = '';
            // }
            dealerSearchObj.STOCKISTS = {};
            if($scope.filter.branch != 'All'){
                dealerSearchObj.STOCKISTS = $scope.filter.branch;
            }
            else {
                dealerSearchObj.STOCKISTS = '';
            }
            if($scope.filter.sales != 'All'){
                dealerSearchObj.seller = $scope.filter.sales;
            }
            else{
                dealerSearchObj.seller = '';
            }
            if($scope.filter.class != 'All'){
                dealerSearchObj.class = $scope.filter.class;
            }
            else{
                dealerSearchObj.class = '';
            }
            $scope.serviceClients = [];
            if($scope.dealerSelectAll.city){
                $http.post('/dash/stores', dealerSearchObj)
                    .success(function(res){
                        console.log("res",res)
                        $scope.multipleUsers(res);
                        // $scope.renderStoreMap(res);
                    });
                $http.post("/dash/stores/count", dealerSearchObj)
                    .success(function(res){
                        $scope.transactionCount(res,4);
                    });
            }
            $scope.showStoreFilter = true;
            if($scope.dealerSearch.filter == '' && $scope.filter.branch == 'All' && $scope.filter.sales == 'All' && $scope.filter.class == 'All')
                $scope.showStoreFilter = false;
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
        $scope.checkDealers =function () {
            for(var i=0; i< $scope.serviceClients.length; i++){
                $scope.serviceClients[i].addedFlag=false;
            }
            if($scope.pjpBeat.length)
            {
                for(var j=0; j< $scope.pjpBeat.length; j++){
                    for(var i=0; i< $scope.serviceClients.length; i++){
                        if($scope.pjpBeat[j].Dealercode == $scope.serviceClients[i].Dealercode){
                            $scope.serviceClients[i].addedFlag=true;
                            // console.log('$scope.newDealers[',i, $scope.newDealers[i])
                        }
                    }
                }
            }
        }
        $scope.multipleUsers = function(response,type){
            // console.log(response.length)
            var obj = [];
            // $scope.serviceClients = [];
            if($scope.filter.branch == 'All')
                $scope.allStockistFromDealer = [];
            var allStockist = [];
            // check for seller name by searching it in number
            for(var i=0;i<response.length;i++){
                response[i].multipleSeller = false;
                response[i].multipleStockist = false;
                if((typeof(response[i].Seller) == 'string' || typeof(response[i].Seller == 'number')) && !angular.isObject(response[i].Seller)){
                    //console.log(response[i].Dealercode)
                    response[i].SellerName = $scope.getSellerName(response[i].Seller) ?  $scope.getSellerName(response[i].Seller) : response[i].SellerName;
                }
                else if(angular.isObject(response[i].Seller)){
                    response[i].SellerName = '';
                    response[i].multipleSeller = true;
                    for(var j=0; j< response[i].Seller.length; j++){
                        if(j < response[i].Seller.length - 1)
                            response[i].SellerName += $scope.getSellerName(response[i].Seller[j])+", ";
                        else
                            response[i].SellerName += $scope.getSellerName(response[i].Seller[j]);
                    }
                }
                if(typeof(response[i].Stockist) == 'string' || typeof(response[i].Stockist) == 'number'){
                    // if(response[i].StockistName )
                    //     allStockist.push({Stockist : response[i].Stockist, StockistName : response[i].StockistName});
                    // else allStockist.push({Stockist : response[i].Stockist, StockistName : 'No Name'});
                    // response[i].StockistName = response ? $scope.getSellerName(response[i].Stockist) : 'No Name';
                }
                else if(response[i].Stockist){
                    response[i].multipleStockist = true;
                    /*for(var j=0; j< response[i].Stockist.length; j++){
                     if(response[i].StockistName[j])
                     allStockist.push({Stockist : response[i].Stockist[j], StockistName : response[i].StockistName[j]});
                     else allStockist.push({Stockist : response[i].Stockist[j], StockistName : 'No Name'});
                     // if(j < response[i].Stockist.length - 1)
                     //     response[i].StockistName += $scope.getSellerName(response[i].Stockist[j]) ? $scope.getSellerName(response[i].Stockist[j]) : 'No Name'+", ";
                     // else
                     //     response[i].StockistName += $scope.getSellerName(response[i].Stockist[j]) ? $scope.getSellerName(response[i].Stockist[j]) : 'No Name';
                     }*/
                }
                $scope.serviceClients.push(response[i]);
                if(response[i].Area){
                    obj.push(response[i]);
                }
            }
            $scope.checkDealers();
            if(type=='City'){
                $scope.dealer_area = [];
                $scope.dealer_area = obj.unique('Area');
                $scope.dealer_area.map(function (dealer) {
                    if($scope.dealerSelectAll.city){
                        dealer.selected_area = true;
                    }else{
                        dealer.selected_area = true
                    }
                    return dealer;
                })
            }
            $scope.serviceClients = $filter('orderBy')( $scope.serviceClients, 'DealerName');
            if($scope.filter.branch == 'All'){
             //   $http.get("/dash/stores/stockist").success(function(response){
                $http.get("/dash/stores/all/stockist").success(function (response) {
                    // console.log("stockist=====",response);
                    allStockist = response;
                    $scope.allStockistFromDealer = allStockist.unique('StockistName');
                    for(var i = 0; i < response.length; i++)
                        $scope.sellerNames[response[i].Stockist[0]] = response[i].StockistName;
                })
            }
        }
        $scope.getAllStoreCities = function(param,type){
            $http.post("/dash/stores/filter/"+type, {viewBy : 0})
                .success(function(city){
                    $scope.dealer_city = city;
                    $scope.dealer_city.map(function (dealer) {
                        if($scope.dealerSelectAll.city){
                            dealer.selected_city = param;
                        }else{
                            dealer.dealer_city = true;
                        }
                        return dealer;
                    })
                })
        };
        $scope.getAllStoreAreas = function(param,type){
            $http.post("/dash/stores/filter/"+type, {viewBy : 0})
                .success(function(area){
                    $scope.dealer_area = area;
                    $scope.dealer_area.map(function (dealer) {
                        if($scope.dealerSelectAll.city){
                            dealer.selected_area = true;
                        }else{
                            dealer.dealer_area = true
                            $scope.dealer_area= [];
                        }
                        return dealer;
                    })
                })
        };
        $scope.transactionCount = function(response, tab) {
            switch (tab) {
                //Dealers Total Count
                case 4:
                    if(response){
                        if(response > viewBy.dealer){
                            $scope.dealer_count = response;
                            $scope.viewLength = 0;
                            $scope.newViewBy = viewBy.dealer;
                        }
                        else if(response <= viewBy.dealer){
                            $scope.dealer_count = response;
                            $scope.newViewBy = response;
                        }
                        else{
                            $scope.serviceClients = [];
                            $scope.newViewBy = 1;
                            $scope.dealer_count = 0;
                            $scope.viewLength = -1;
                        }
                    }
                    else{
                        $scope.serviceClients = [];
                        $scope.newViewBy = 1;
                        $scope.dealer_count = 0;
                        $scope.viewLength = -1;
                    }
                    break;
            }
        }
        $scope.DistanceCalculate = [];
        $scope.renderPjpMap = function(order,mapvalue) {
            $scope.DistanceCalculate = [];
            console.log('pjp order', order)
            console.log('pjp mapvalue', mapvalue)
            // $scope.showMap = true;
            $scope.showPjpMap = false;
            var gmarkers = [];
            $scope.checkinIcons['Customer'] = 'https://maps.google.com/mapfiles/ms/micons/orange-dot.png';
            // $scope.checkinMapLocation = {};
            // $scope.checkinMapLocation.dealer = "Not Available";
            // $scope.checkinMapLocation.sVisit = "Not Available";
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
            map = new google.maps.Map(document.getElementById(mapvalue), myOptions);
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
            for(var i=0;i<$scope.DistanceCalculate.length;i++){
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
                    // console.log('addmarker');
                    var markertitle = i+1;
                    var contentString = $scope.DistanceCalculate[i].DealerName;
                    if (id == 0) {
                        var marker = new google.maps.Marker({
                            position: latlng,
                            map: map,
                            title: markertitle.toString() + '. ' + contentString,
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
                        content: markertitle.toString() + '. ' + contentString
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
            var markerCluster = new MarkerClusterer(map, gmarkers, mcOptions); //clusters the nearby points
            google.maps.event.trigger(map, 'resize');
            $('a[href="#profile"]').on('shown', function (e) {
                google.maps.event.trigger(map, 'resize');
            });
            var flightPath = new google.maps.Polyline({
                path: flightPlanCoordinates,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            flightPath.setMap(map);
        }
        $scope.beatDistance = 0;
        $scope.renderPjpMapDistance = function(){
            if($scope.DistanceCalculate.length <= 24){
                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;
                $scope.beatDistance = 0;
                var waypts = [];
                // var checkboxArray = document.getElementById('waypoints');
                // console.log('checkboxArray',checkboxArray)
                var startpoint = '';
                var endpoint =  '';
                var startindex = 0;
                var lastindex = 0;
                var tempArray = [];
                for (var j = 0 ; j < $scope.DistanceCalculate.length; j++) {
                    // console.log('index1',j);
                    lastindex += 24;
                    waypts = [];
                    if( $scope.DistanceCalculate.length <= lastindex ) {
                        startindex=$scope.DistanceCalculate.length;
                    }else{
                        startindex += 24;
                    }
                    for (i=j;i<startindex;i++){
                        if($scope.DistanceCalculate[i].latitude[0] && $scope.DistanceCalculate[j].longitude[0]){
                            console.log('index2',i);
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
                                console.log('end',i);
                                endpoint =new google.maps.LatLng($scope.DistanceCalculate[i].latitude,$scope.DistanceCalculate[i].longitude);
                            }else{
                                waypts.push({
                                    location: new google.maps.LatLng($scope.DistanceCalculate[i].latitude,$scope.DistanceCalculate[i].longitude),
                                    stopover: true
                                });
                            }
                        }
                    }
                    j= startindex;
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
                            // var summaryPanel = document.getElementById('directions-panel');
                            // summaryPanel.innerHTML = '';
                            // For each route, display summary information.
                            for (var i = 0; i < route.legs.length; i++) {
                                $scope.beatDistance  += route.legs[i].distance.value
                            }
                            $scope.beatDistance = $scope.beatDistance / 1000;
                            $scope.$apply();
                            waypts = [];
                        } else {
                        }
                    });
                }
            }else{
                bootbox.alert({
                    title : 'ERROR',
                    message : 'Distance can be calculated for only 25 '+$scope.nav[2].tab,
                    className : 'text-center'
                })
            }
        }
        $scope.backToPjpList = function(){
            $scope.beatDistance = null;
            $scope.addPjpButton = true;
            $scope.addPjpDateView = false;
            $scope.selectedDealer=[];
            $scope.beatSalesPerson=[];
            $scope.diaplayEditIcon = false;
            $scope.selectedBeatRow = null;
            $scope.DistanceCalculate = [];
            $http.get("/dash/pjp/get/beats").success(function(response){
                $scope.renderPjpBeat(response);
                $http.get("/dash/pjp/0").success(function(response){
                    $scope.renderPjp(response);
                    $scope.fetchBeatFromDashBoard($scope.selectedBeat);
                })
            })
        }
        $scope.showBeatDetails = function(id,flag) {
            console.log('$scope.beatDetails', $scope.beatDetails)
            console.log('id', id)
            if (id) {
                for (var i = 0; i < $scope.beats.length; i++) {
                    if (id == $scope.beats[i].beatId)
                        $scope.beatDetails = $scope.beats[i];
                }
                $scope.customerVisible = [];
                $scope.pjpBeat = $scope.beatDetails.beat;
                $scope.newBeat.beatName = $scope.beatDetails.beatName;
                $scope.showPjpMap = false;
                $scope.diaplayMapIcon = true;
                // if (flag) {
                //     $scope.addPjpButton = false;
                //     // $scope.choosebeat.switch = false;
                //     $scope.beatSearchText.searchtext = $scope.beatDetails.beatName;
                //     $scope.createBeat('edit');
                // }
                if ($scope.beatDetails) {
                    // for(var i=0; i< $scope.serviceClients.length; i++)
                    // {
                    //     for(var j=0; j< $scope.pjpBeat.length; j++)
                    //     {
                    //         if($scope.pjpBeat[j].Dealercode == $scope.serviceClients[i].Dealercode)
                    //         {
                    //             $scope.serviceClients[i].addedFlag=true;
                    //         }
                    //     }
                    // }
                    $scope.checkDealers()
                }
                $scope.renderPjpMap($scope.pjpBeat, 'map_CreatePJP')
            }
        }
        $scope.renderPjpBeat = function(response){
            //console.log("Render Beat ---->")
            //console.log(response)
            $scope.displayBeat = response;
            $scope.beats = response;
            if($scope.BeatId){
                $scope.showBeatDetails($scope.BeatId)
            }
        }
        $scope.removeFromPjpBeat = function(dealer){
            var temp = $scope.pjpBeat;
            $scope.pjpBeat = [];
            for(var i=0; i< temp.length; i++){
                if(dealer.Dealercode != temp[i].Dealercode)
                    $scope.pjpBeat.push(temp[i])
            }
               $scope.checkDealers();
            $scope.renderPjpMap($scope.pjpBeat,'map_CreatePJP')
        }
        $scope.addDealerToBeat = function(dealer, all){
            //console.log(dealer);
            if(!all){
                //Add dealers one by one to a beat
                // jQuery.noConflict();
                // $(".dealerDropdown").css('display', 'none')
                // $("#pjpDealerSearch").val('');
                var flag = true;
                if($scope.pjpBeat.length)
                {
                    for(var i=0; i< $scope.pjpBeat.length; i++){
                        if(dealer.Dealercode == $scope.pjpBeat[i].Dealercode)
                            flag = false;
                    }
                    if(flag){
                            for(var i=0; i< $scope.serviceClients.length; i++){
                                if(dealer.Dealercode == $scope.serviceClients[i].Dealercode){
                                    $scope.serviceClients[i].addedFlag=true;
                                }
                            }
                        $scope.pjpBeat.push(dealer);
                    }
                    else{
                        bootbox.alert({
                            title : 'Warning',
                            message : dealer.DealerName+' is already present. Please select another '+$scope.nav[2].tab,
                            className : 'text-center'
                        })
                    }
                }else{
                    for(var i=0; i< $scope.serviceClients.length; i++){
                        if(dealer.Dealercode == $scope.serviceClients[i].Dealercode){
                            $scope.serviceClients[i].addedFlag=true;
                            // console.log('$scope.newDealers[',i, $scope.newDealers[i])
                        }
                    }
                    $scope.pjpBeat.push(dealer);
                }
                $scope.renderPjpMap($scope.pjpBeat,'map_CreatePJP')
            }
            else{
                //Add all dealers to beat from #addDealerToBeatByFilter modal
                // $scope.pjpBeat = $scope.dealersListForNewBeat;
                for(var i=0;i<$scope.dealersListForNewBeat.length;i++)
                {
                    var res=$scope.pjpBeat.indexOf($scope.dealersListForNewBeat[i]);
                    console.log('res',res);
                    if(res == -1){
                        $scope.pjpBeat.push($scope.dealersListForNewBeat[i]);
                    }else
                    {
                        bootbox.alert({
                            title : 'Warning',
                            message : $scope.dealersListForNewBeat[i].DealerName+' is already present. Please select another '+$scope.nav[2].tab,
                            className : 'text-center'
                        })
                    }
                    $scope.dealersListForNewBeat[i].addedFlag=true;
                }
                $scope.renderPjpMap($scope.pjpBeat,'map_CreatePJP')
            }
        }
        $scope.saveBeat = function(flag){
            console.log('Beat ID to save : ',$scope.BeatId);
            $scope.buttonDisable.flag = true;
            //.... If the user has not entered any beat name, throw an alert...
            if(!$scope.newBeat.beatName){
                Settings.alertPopup("Alert", "Please enter a beat name");
                $scope.buttonDisable.flag = false;
            }
            else{
                //.... If Beat ID was not available, we save the beat...
                if(!$scope.BeatId){//save beat flag
                    console.log('Save the Beat ID --> ', $scope.BeatId);
                    var tempObj = {};
                    tempObj.beat = $scope.pjpBeat;
                    tempObj.beatName = $scope.newBeat.beatName;
                    var date = new Date();
                    tempObj.date_added = [date.getFullYear(), (date.getMonth() + 1).padLeft(), date.getDate().padLeft()].join('-') + ' '
                        + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join(':');
                    $http.post("/dash/pjp/beat/save", tempObj)
                        .success(function(response){
                            //console.log(response)
                            if(response){
                                $scope.buttonDisable.flag = false;
                                Settings.success_toast("Success","Beat "+$scope.newBeat.beatName +" created successfully");
                                if(flag){
                                    $location.path('/assign-sales/'+response.beatId);
                                }else{
                                    $location.path('/beat-plan');
                                }
                            }
                        })
                    askToSaveBeat = true;
                }
                else{
                    console.log('Update Existing Beat ---> ', $scope.BeatId);
                    var tempObj = {};
                    tempObj.beat = $scope.pjpBeat;
                    tempObj.id = $scope.beatDetails.beatId;
                    $http.post("/dash/pjp/beat/edit", tempObj)
                        .success(function(response){
                            if(response){
                                $scope.buttonDisable.flag = false;
                                Settings.success_toast("Success","Beat "+$scope.beatDetails.beatName +" Updated successfully");
                            }
                            $http.get("/dash/pjp/get/beats")
                                .success($scope.renderPjpBeat)
                            if(flag){
                                $location.path('/assign-sales/'+$scope.BeatId);
                            }else{
                                $location.path('/beat-plan');
                            }
                        })
                }
            }
        }
        $scope.navPage = function(tab, direction){
            var viewLength = $scope.viewLength;
            var viewBy = $scope.newViewBy;
            if(direction){
                //console.log("NEXT");
                if(viewLength + viewBy >= $scope.serviceClients.length){
                    if(viewLength + viewBy < $scope.dealer_count){
                        viewLength += viewBy;
                        //console.log("Fetch more")
                        dealerSearchObj.viewLength = viewLength;
                        dealerSearchObj.viewBy = initialViewBy;
                        dealerSearchObj.searchFor = $scope.dealerSearch.filter;
                        if($scope.filter.branch != 'All'){
                            dealerSearchObj.stockist = $scope.filter.branch;
                        }
                        else {
                            dealerSearchObj.stockist = '';
                        }
                        if($scope.filter.class != 'All'){
                            dealerSearchObj.class = $scope.filter.class;
                        }
                        else {
                            dealerSearchObj.class = '';
                        }
                        if($scope.filter.sales != 'All'){
                            dealerSearchObj.seller = $scope.filter.sales.seller;
                        }
                        else{
                            dealerSearchObj.seller = '';
                        }
                        dealerSearchObj.searchBy = dealerSearchBy;
                        $http.post("/dash/stores",dealerSearchObj)
                            .success(function(response){
                                // console.log(response);
                                $scope.multipleUsers(response);
                                if(viewLength + viewBy > $scope.dealer_count){
                                    a = viewLength + viewBy - $scope.dealer_count;
                                    viewBy -= a;
                                    $scope.newViewBy = viewBy;
                                }
                                $scope.viewLength = viewLength;
                            })
                    }
                    else{
                        //console.log("Out of data")
                        if(viewLength + viewBy > $scope.dealer_count){
                            a = viewLength + viewBy - $scope.dealer_count;
                            viewBy -= a;
                            $scope.newViewBy = viewBy;
                        }
                    }
                }
                else{
                    //console.log("Minus viewby")
                    viewLength += viewBy;
                    if(viewLength + viewBy > $scope.dealer_count){
                        a = viewLength + viewBy - $scope.dealer_count;
                        viewBy -= a;
                    }
                    $scope.newViewBy = viewBy;
                    $scope.viewLength = viewLength;
                }
            }
            else{
                //console.log("BACK");
                if(viewLength < viewBy){
                    //console.log("NO DATA")
                }
                else{
                    if(viewLength + viewBy >= $scope.dealer_count){
                        viewBy += a;
                        a = 0;
                    }
                    viewLength -= viewBy;
                    $scope.viewLength = viewLength;
                    $scope.newViewBy = viewBy;
                }
            }
        }
        //Function to filter stores based on city and area
        $scope.filterDealerByCriteria = function (type, all, filter) {
            $scope.serviceClients = [];
            $scope.showListDealerDetail = false;
            if (type == 'city') {
                $scope.dealer.selected_area = null;
                dealerSearchObj.searchRegion = [];
                if (all) {
                    if (!$scope.dealerSelectAll.city) {
                        $scope.getAllStoreCities(false, 'city');
                        $scope.getAllStoreAreas(false, 'area');
                        $scope.viewLength = 0;
                        $scope.newViewBy = viewBy.dealer;
                        $scope.cityText.filter = '';
                        // $scope.renderStoreMap(0);
                        $scope.transactionCount(0, 4);
                    } else {
                        dealerSearchObj.searchRegion = [];
                        $scope.clearFilter(4);
                        $scope.getAllStoreCities(true, 'city');
                        $scope.getAllStoreAreas(true, 'area');
                        $scope.viewLength = 0;
                        $scope.newViewBy = viewBy.dealer;
                        $http.post("/dash/stores", dealerSearchObj)
                            .success(function (response) {
                                // $scope.multipleUsers(response, 'City');
                                // $scope.renderStoreMap(response);
                            });
                        $http.post("/dash/stores/count", dealerSearchObj)
                            .success(function (res) {
                                $scope.transactionCount(res, 4);
                            });
                    }
                } else {
                    if ($scope.dealerSelectAll.city) {
                        dealerSearchObj.dealerSelectAll = true;
                        if (dealerSearchObj.searchRegion.length) {
                            //... If City A needs to be removed...
                            if (filter.selected_city) {
                                var new_array = [];  //.. Temp array..
                                for (var i = 0; i < dealerSearchObj.searchRegion.length; i++) {
                                    if (filter._id != dealerSearchObj.searchRegion[i]) {
                                        new_array.push(dealerSearchObj.searchRegion[i]);  //... Push all other cities...
                                    }
                                }
                                dealerSearchObj.searchRegion = new_array; //... Replace the array..
                                dealerSearchObj.searchByArea = [];
                                if (dealerSearchObj.searchRegion.length) {
                                    $scope.fetchStoresByCities(dealerSearchObj);
                                } else {
                                    $scope.fetchStoresByCities(dealerSearchObj);
                                }
                            } else {
                                for (var j = 0; j < dealerSearchObj.searchRegion.length; j++) {
                                    // console.log('j Loop')
                                    if (filter._id == dealerSearchObj.searchRegion[j]) {
                                        continue;
                                    } else {
                                        if (j == dealerSearchObj.searchRegion.length - 1) dealerSearchObj.searchRegion.push(filter._id);
                                    }
                                }
                                dealerSearchObj.searchByArea = [];
                                $scope.fetchStoresByCities(dealerSearchObj);
                            }
                        } else {
                            if (!filter.selected_city) {
                                $scope.serviceClients = [];
                                dealerSearchObj.searchRegion.push(filter._id)
                                $scope.fetchStoresByCities(dealerSearchObj);
                            } else {
                                // console.log('Selected only one City ')
                                // console.log($scope.dealer_city.length)
                                if ($scope.dealer_city.length) {
                                    for (var i = 0; i < $scope.dealer_city.length; i++) {
                                        if ($scope.dealer_city[i]._id == filter.selected_city) {
                                            dealerSearchObj.searchRegion.push($scope.dealer_city[i]._id)
                                        }
                                    }
                                    $scope.showStoreFilter = true;
                                    $scope.fetchStoresByCities(dealerSearchObj);
                                }
                            }
                        }
                    } else {
                        dealerSearchObj.dealerSelectAll = false;
                        //.... If some city is already there...
                        if (dealerSearchObj.searchRegion.length) {
                            // console.log(filter.selected_city)
                            //... If City A needs to be removed...
                            if (!filter.selected_city) {
                                //.. Temp array..
                                var new_array = [];
                                for (var i = 0; i < dealerSearchObj.searchRegion.length; i++) {
                                    console.log('i Loop')
                                    //... Push all other cities...
                                    if (filter._id != dealerSearchObj.searchRegion[i]) {
                                        new_array.push(dealerSearchObj.searchRegion[i]);
                                    }
                                }
                                //... Replace the array..
                                dealerSearchObj.searchRegion = new_array;
                                dealerSearchObj.searchByArea = [];
                                if (dealerSearchObj.searchRegion.length) {
                                    $http.post("/dash/stores", dealerSearchObj)
                                        .success(function (response) {
                                            $scope.multipleUsers(response, 'City');
                                            // $scope.renderStoreMap(response);
                                            // $scope.transactionCount($scope.serviceClients.length, 4);
                                        });
                                    $http.post("/dash/stores/count", dealerSearchObj)
                                        .success(function (res) {
                                            $scope.transactionCount(res, 4);
                                        });
                                } else {
                                    $scope.dealer_area = [];
                                }
                            } else {
                                for (var j = 0; j < dealerSearchObj.searchRegion.length; j++) {
                                    if (filter._id == dealerSearchObj.searchRegion[j]) {
                                        continue;
                                    } else {
                                        if (j == dealerSearchObj.searchRegion.length - 1) dealerSearchObj.searchRegion.push(filter._id);
                                    }
                                }
                                dealerSearchObj.searchByArea = [];
                                $http.post("/dash/stores", dealerSearchObj)
                                    .success(function (response) {
                                        // console.log(response)
                                        $scope.multipleUsers(response, 'City');
                                        // $scope.renderStoreMap(response);
                                        // $scope.transactionCount($scope.serviceClients.length, 4);
                                    });
                                $http.post("/dash/stores/count", dealerSearchObj)
                                    .success(function (res) {
                                        $scope.transactionCount(res, 4);
                                    });
                            }
                        } else {
                            if (filter.selected_city) {
                                $scope.serviceClients = [];
                                dealerSearchObj.searchRegion.push(filter._id)
                                $http.post("/dash/stores", dealerSearchObj)
                                    .success(function (response) {
                                        $scope.multipleUsers(response, 'City');
                                        // $scope.transactionCount(response.length, 4);
                                        // $scope.renderStoreMap(response);
                                    });
                                $http.post("/dash/stores/count", dealerSearchObj)
                                    .success(function (res) {
                                        $scope.transactionCount(res, 4);
                                    });
                            } else {
                                if ($scope.dealer_city.length) {
                                    for (var i = 0; i < $scope.dealer_city.length; i++) {
                                        if ($scope.dealer_city[i]._id != filter._id) {
                                            dealerSearchObj.searchRegion.push($scope.dealer_city[i]._id)
                                        }
                                    }
                                    $http.post("/dash/stores", dealerSearchObj)
                                        .success(function (response) {
                                            // console.log(response)
                                            $scope.multipleUsers(response, 'City');
                                            // $scope.transactionCount(response.length, 4);
                                            // $scope.renderStoreMap(response);
                                        });
                                    $http.post("/dash/stores/count", dealerSearchObj)
                                        .success(function (res) {
                                            $scope.transactionCount(res, 4);
                                        });
                                }
                            }
                        }
                        $scope.viewLength = 0;
                        $scope.newViewBy = viewBy.dealer;
                    }
                }
            } else if(type =='area'){
                if ($scope.dealerSelectAll.city) {
                    if (dealerSearchObj.searchByArea.length) {
                        if (filter.selected_area) {
                            //.. Temp array..
                            var new_array = [];
                            for (var i = 0; i < dealerSearchObj.searchByArea.length; i++) {
                                // console.log('i Loop')
                                //... Push all other cities...
                                if (filter._id != dealerSearchObj.searchByArea[i]) {
                                    new_array.push(dealerSearchObj.searchByArea[i]);
                                }
                            }
                            //... Replace the array..
                            dealerSearchObj.searchByArea = new_array;
                            if (dealerSearchObj.searchByArea.length) {
                                $scope.fetchStoresByArea(dealerSearchObj);
                            } else {
                                $scope.fetchStoresByArea(dealerSearchObj);
                            }
                        } else {
                            for (var j = 0; j < dealerSearchObj.searchByArea.length; j++) {
                                // console.log('j Loop')
                                if (filter._id == dealerSearchObj.searchByArea[j]) {
                                    continue;
                                } else {
                                    if (j == dealerSearchObj.searchByArea.length - 1) dealerSearchObj.searchByArea.push(filter._id);
                                }
                            }
                            $scope.fetchStoresByArea(dealerSearchObj);
                        }
                    } else {
                        if (!filter.selected_area) {
                            $scope.serviceClients = [];
                            dealerSearchObj.dealerSelectAll = true;
                            dealerSearchObj.searchByArea.push(filter._id)
                            $scope.fetchStoresByArea(dealerSearchObj);
                        } else {
                            if ($scope.dealer_area.length) {
                                for (var i = 0; i < $scope.dealer_area.length; i++) {
                                    if ($scope.dealer_area[i]._id == filter.selected_area) {
                                        dealerSearchObj.searchByArea.push($scope.dealer_area[i]._id)
                                    }
                                }
                                $scope.showStoreFilter = true;
                                $scope.fetchStoresByArea(dealerSearchObj);
                            }
                        }
                    }
                } else {
                    if (dealerSearchObj.searchByArea.length) {
                        if (!filter.selected_area) {
                            //.. Temp array..
                            var new_array = [];
                            for (var i = 0; i < dealerSearchObj.searchByArea.length; i++) {
                                // console.log('i Loop')
                                if (filter.Area != dealerSearchObj.searchByArea[i]) {
                                    new_array.push(dealerSearchObj.searchByArea[i]);
                                }
                            }
                            dealerSearchObj.searchByArea = new_array; //... Replace the array..
                            if (dealerSearchObj.searchByArea.length) {
                                $http.post("/dash/stores", dealerSearchObj)
                                    .success(function (response) {
                                        $scope.multipleUsers(response, 'Area');
                                        // $scope.transactionCount($scope.serviceClients.length, 4);
                                        // $scope.renderStoreMap(response);
                                    });
                                $http.post("/dash/stores/count", dealerSearchObj)
                                    .success(function (res) {
                                        $scope.transactionCount(res, 4);
                                    });
                            }
                        } else {
                            for (var j = 0; j < dealerSearchObj.searchByArea.length; j++) {
                                // console.log('j Loop')
                                if (filter.Area == dealerSearchObj.searchByArea[j]) {
                                    continue;
                                } else {
                                    if (j == dealerSearchObj.searchByArea.length - 1) dealerSearchObj.searchByArea.push(filter.Area);
                                }
                            }
                            $http.post("/dash/stores", dealerSearchObj)
                                .success(function (response) {
                                    // console.log(response)
                                    $scope.multipleUsers(response, 'Area');
                                    // $scope.transactionCount($scope.serviceClients.length, 4);
                                    // $scope.renderStoreMap(response);
                                });
                            $http.post("/dash/stores/count", dealerSearchObj)
                                .success(function (res) {
                                    $scope.transactionCount(res, 4);
                                });
                        }
                    } else {
                        if (filter.selected_area) {
                            $scope.serviceClients = [];
                            dealerSearchObj.searchByArea.push(filter.selected_area);
                            console.log(dealerSearchObj)
                            $http.post("/dash/stores", dealerSearchObj)
                                .success(function (response) {
                                    $scope.multipleUsers(response, 'Area');
                                    // $scope.renderStoreMap(response);
                                    // $scope.transactionCount(response.length, 4);
                                });
                            $http.post("/dash/stores/count", dealerSearchObj)
                                .success(function (res) {
                                    $scope.transactionCount(res, 4);
                                });
                        } else {
                            if ($scope.dealer_area.length) {
                                for (var i = 0; i < $scope.dealer_area.length; i++) {
                                    if ($scope.dealer_area[i].Area != filter.Area) {
                                        dealerSearchObj.searchByArea.push($scope.dealer_area[i].Area)
                                    }
                                }
                                $http.post("/dash/stores", dealerSearchObj)
                                    .success(function (response) {
                                        // console.log(response)
                                        $scope.multipleUsers(response, 'Area');
                                        // $scope.transactionCount(response.length, 4);
                                        // $scope.renderStoreMap(response);
                                    });
                                $http.post("/dash/stores/count", dealerSearchObj)
                                    .success(function (res) {
                                        $scope.transactionCount(res, 4);
                                    });
                            }
                        }
                    }
                }
            }
        };
        $scope.clearFilter = function(tab) {
            switch (tab) {
                case 4:
                    dealerSearchObj.viewLength = 0;
                    dealerSearchObj.viewBy = initialViewBy;
                    dealerSearchObj.searchFor = '';
                    dealerSearchObj.seller = '';
                    dealerSearchObj.stockist = '';
                    dealerSearchObj.STOCKISTS = '';
                    dealerSearchObj.class = '';
                    dealerSearchObj.searchBy = [];
                    dealerSearchObj.searchByArea = [];
                    dealerSearchObj.searchRegion = [];
                    if($scope.customerType=='lead'){
                        dealerSearchObj.searchBycustomertype='Lead';
                    }
                    else{
                        dealerSearchObj.searchBycustomertype='';
                    }
                    $scope.viewLength = 0;
                    $scope.newViewBy = viewBy.dealer;
                    $scope.dealerSearch.filter = '';
                    $scope.serviceClients = [];
                    $scope.cityText.filter = '';
                    $scope.filter.sales = "All";
                    $scope.filter.branch = "All";
                    $scope.filter.class = "All";
                    $scope.dealer.selected_city = '';
                    $scope.dealer.selected_area = '';
                    $scope.showStoreFilter = false;
                    $scope.showListDealerDetail = false;
                    $scope.dealerSelectAll.city = true;
                    $scope.storeMarkershowMap = true;
                    $http.post("/dash/stores", dealerSearchObj)
                        .success(function(response){
                            $scope.multipleUsers(response);
                            // $scope.renderStoreMap(response);
                            $scope.displayDealerRefresh=  true
                        })
                    $http.post("/dash/stores/count", dealerSearchObj)
                        .success(function(res){
                            $scope.transactionCount(res,4);
                            $scope.displayDealerRefresh=  true
                        });
                    $scope.getAllStoreCities(true,'city');
                    $scope.getAllStoreAreas(true,'area');
                    break;
            }
        }
        $scope.clearFilter(4);
        if($scope.BeatId){
            $http.get("/dash/pjp/get/beats").success(function(response) {
                $scope.renderPjpBeat(response);
            })
        }
    })