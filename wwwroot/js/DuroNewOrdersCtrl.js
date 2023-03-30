class NewOrder {
    constructor(order, customer, user) {
        this.itemcode = order.itemcode;
        this.quantity = order.quantity;
        this.dealercode = customer.Dealercode[0] ? customer.Dealercode[0] : customer.Dealercode;
        this.dealername = customer.DealerName[0] ? customer.DealerName[0] : customer.DealerName;
        this.dealerphone = customer.Phone[0] ? customer.Phone[0] : customer.Phone;
        this.date_added = formatDate();
        this.orderId = '';
        this.orderPlacedByNumber = user.sellerphone || '';
        this.orderPlacedByName = user.username || 'PORTAL';
        this.orderPlacedByRole = user.role || 'ADMIN';
        this.seller = (( user.role == "dealer" || user.role == "Dealer")? customer.Seller[0]  : user.sellerphone );
        this.sellername = ((user.role == "dealer" || user.role == "Dealer") ? customer.SellerName[0]  : (user.username || 'PORTAL'));
        this.source = 'Custom';
        this.type = 'Order';
        this.status = 'new';
        this.total = 0;
        this.orderTotal = 0;
        this.total_amount = 0;
        this.api_key = order.api_key || '';
        this.billing_address = customer.Address[0] ? customer.Address[0] : customer.Address;
        this.shipping_address = (customer.shipping_address ? customer.shipping_address : (customer.Address[0] ? customer.Address[0] : customer.Address));
        this.shipping_address_city =  customer.City[0] ? customer.City[0] : customer.City;
        this.billing_address_city = customer.City[0] ? customer.City[0] : customer.City;
        this.GST = {
            cgst : 0,
            sgst : 0,
            igst : 0
        };
        this.GST_Total = {
            cgst : 0,
            sgst : 0,
            igst : 0
        };
        this.MRP = 0;
        this.orderMRP = 0;
        this.medicine = order.itemName;
        this.size = {
            leng : order.leng,
            width : order.width,
            thickness : order.thickness
        }
        this.LDPE = order.ldpe || '';
        this.density = order.density;
        this.grade = order.grade;
        this.pieces = order.pieces;
        this.volume = order.volume || '';
        this.plant = customer.Plant || '';
        this.cust_order_ref_number  = customer.cust_order_reference_number ||'';
        this.UOM = order.primary_UOM;
        this.lineId = order.lineId;
        this.ship_to_code = customer.ship_to_code || customer.ShipToCode[0];
        this.customer_req_date = order.customer_req_date || '';
        this.delivery_location = customer.delivery_location;
        this.standard_order = order.standard_order;
        this.comments = [
            {
                comment : order.comment || '',
                date_added : formatDate()
            }
        ];
    }
}
const formatDate = date => {
    let d;
    if(!date)
        d = new Date();
    else
        d = new Date(date.toString().replace("-","/").replace("-","/"));
    /* replace is used to ensure cross browser support*/
    let dt = d.getDate();
    let mon = d.getMonth() + 1;
    let h = d.getHours();
    let m = d.getMinutes();
    let s = d.getSeconds();
    if(dt < 10) dt = "0" + dt;
    if(mon < 10) mon = "0" + mon;
    if(h < 10) h = "0" + h;
    if(m < 10) m = "0" + m;
    if(s < 10) s = "0" + s;
    return ((d.getFullYear()) + "-" + mon + "-" + dt + " " + h + ":" + m +":" + s);
};
angular.module('ebs.controller')
    .controller('DuroNewOrdersCtrl',function ($scope, $filter, $http, $modal,$routeParams, $window,Settings, toastr, $interval,$sce,$mdDialog,$location){
        console.log("Hello from Duroflex Custom Ordering Screen ---->>> " + $routeParams.id);
        //.... Check Flag....
        let params = $routeParams.id;
        //.... If flag is not new, we assume there's an orderId passed....
        if(params != 'new')
            $scope.edit_order_id = $routeParams.id;
        //.... View Tab Switching ---->
        $scope.orderViewTab  = {};
        //..... New order pushing to an array....
        $scope.newOrder = [];
        //..... Customer ordering.....
        $scope.custOrder = {};
        $scope.custOrder.leng = '';
        $scope.custLen = false;
        $scope.custOrder.width = '';
        //.... Length.....
        $scope.duroLength = [10, 50, 80, 100, 130, 150, 190];
        //..... Width .....
        $scope.duroWidth = [10, 50, 80, 100, 130, 150, 190];
        //.... Thickness .....
        $scope.duroThickness = [5, 8, 10, 20, 25, 40, 50, 80, 100];
        $scope.getPlantCode = function () {
            $http.post("/dash/suppliers/plantcodes")
                .then(res => {
                if(res && res.data){
                $scope.plant_codes = res.data
            }
        })
        };
        $scope.getPlantCode();
        //.... Plant Codes....
        // $scope.plant_codes = [
        //     {
        //         "code" : "P001",
        //         "name" : "PDN Factory",
        //         "days" : 4
        //     },
        //     {
        //         "code" : "P055",
        //         "name" : "Shivarna Plant",
        //         "days" : 3
        //     },
        //     {
        //         "code" : "D010",
        //         "name" : "Kerala Depot",
        //         "days" : 1
        //     },
        //     {
        //         "code" : "P056",
        //         "name" : "JRG Foam Plant",
        //         "days" : 3
        //     }
        // ]
        //... ShortCodes ....
        let short_codes = [
            {
                type : 'AYUSH CUSHIONS',
                code : 'AYC'
            },
            {
                type : 'BHF ROLLS',
                code : 'BFR'
            },
            {
                type : 'CHIP FOAM CUSHIONS',
                code : 'CFC'
            },
            {
                type : 'CHIP FOAM SHEETS',
                code : 'CFS'
            },
            {
                type : 'LATEX LIKE FOAM SHEETS',
                code : 'LFS'
            },
            {
                type : 'MF CUSHIONS',
                code : 'MFC'
            },
            {
                type : 'MF ROLLS',
                code : 'MFR'
            },
            {
                type : 'MF SHEETS',
                code : 'MFS'
            },
            {
                type : 'PUF CUSHIONS',
                code : 'PFC'
            },
            {
                type : 'PUF DUSTERS',
                code : 'PFD'
            },
            {
                type : 'PUF ROLLS',
                code : 'PFR'
            },
            {
                type : 'PUF SHEETS',
                code : 'PFS'
            }
        ];
        $http.get('/dash/mattress/duro/holiday')
        .success(function (response) {
            if (response.length) {
              $scope.holidayCRD = response;
            }
        })
        let activeName = '';
        //.... Hide the custom width input box....
        $scope.custWidth = false;
        $scope.custOrder.thickness = '';
        $scope.custOrder.ldpe = 'YES';
        //.... Hide the custom thickness input box....
        $scope.custThickness = false;
        //.... Selected customer information....
        $scope.customer = {};
        //.... All customers for selections.....
        $scope.customers = [];
        //.... Store the Short code and UOM in a variable...
        $scope.short_code_selected = {};
        //..... Get the user information, if role is Admin / Customer...
        $scope.user = '';
        //..... Configuration....
        $scope.config = {};
        $scope.config.groupId = 'all';
        $scope.config.filter = '';
        $scope.config.add_new_address = false;
        $scope.config.new_address = {};
        //.... Shipping addresses ....
        $scope.shipping_addresses = [];
        //$scope.config.minDate = new Date(new Date().setDate(new Date().getDate() + 1)).getTime();
        //.... Disable weekends ....
        $scope.disabled = (date, mode) => {
            return (mode === 'day' && (date.getDay() === 0));
        }
        //..... Enable the input quantity only on a condition ....
        $scope.checkInputsQuantity = () => {
            //((custOrder.leng && custOrder.leng > 0) || (custOrder.width && custOrder.width > 0)) && custOrder.thickness
            if($scope.custOrder.primary_UOM == 'KG'){
                if(($scope.custOrder.width && $scope.custOrder.width > 0) && $scope.custOrder.thickness)
                    return true;
                else return false;
            }else if($scope.custOrder.primary_UOM == 'BLOCKS'){
                if(($scope.custOrder.leng && $scope.custOrder.leng > 0) && ($scope.custOrder.width && $scope.custOrder.width > 0))
                    return true;
                else return false;
            }else{
                if((($scope.custOrder.leng && $scope.custOrder.leng > 0) && ($scope.custOrder.width && $scope.custOrder.width > 0)) && $scope.custOrder.thickness)
                    return true;
                else return false;
            }
        }
        //.... Change of Plant Code will change / clear the customer req. date.....
        $scope.plantChange = () => {
            console.log($scope.customer.Plant[0]);
            if($scope.customer.Plant[0]) {
              if ($scope.user.role != 'dealer' ) {
                    for (let i = 0; i < $scope.plant_codes.length; i++) {
                        if ($scope.customer.Plant[0] == $scope.plant_codes[i].supplier) {
                            //$scope.$apply(() => {
                            console.log("Changing the minDate --> ", $scope.plant_codes[i].Days);
                            $scope.custOrder.customer_req_date = null;
                            $scope.config.minDate = new Date(new Date().setDate(new Date().getDate() + $scope.plant_codes[i].Days + 1)).getTime();
                            $scope.plantCodeDays = new Date();
                            $scope.plantCodeDays.setDate($scope.plantCodeDays.getDate() + $scope.plant_codes[i].Days);
                            $scope.config.daysOfWeekDisabled = [0, 6];
                            //})
                            break;
                        } else {
                            if (i == $scope.plant_codes.length - 1) {
                                $scope.config.minDate = new Date(new Date().setDate(new Date().getDate() + 2)).getTime();
                                $scope.config.daysOfWeekDisabled = [0, 6];
                            }
                        }
                    }
                } else {
                  console.log("$scope.plant_codes",$scope.plant_codes.Days)
                    $scope.config.minDate = new Date(new Date().setDate(new Date().getDate() + $scope.plant_codes.Days + 1)).getTime();
                    $scope.plantCodeDays = new Date();
                    $scope.plantCodeDays.setDate($scope.plantCodeDays.getDate() + $scope.plant_codes.Days);
                    $scope.config.daysOfWeekDisabled = [0, 6];
                }
            }else
                $scope.config.minDate = new Date(new Date().setDate(new Date().getDate() + 2)).getTime();
                $scope.config.daysOfWeekDisabled = [0,6];
        }
        const refreshMattress = (groupId) => {
            if(groupId){
                $scope.config.groupId = groupId;
                $http.get('/dash/mattress/' + groupId)
                    .success(function (response) {
                        if (response.length) {
                            response.sort((a, b) => a.l5 < b.l5 ? -1 : 1);
                            $scope.matressName = response
                        }
                    })
            }else{
                $http.get('/dash/mattress')
                    .success(function (response) {
                        if (response.length) {
                            response.sort((a, b) => a.l5 < b.l5 ? -1 : 1);
                            $scope.matressName = response
                        }
                    })
            }
        };
        const getOrderDetails = (id) => {
            $http.get('/dash/orders/' + id)
                .then((order_details) => {
                    if(order_details && order_details.data && order_details.data.length){
                        console.log("Order Details --> ", order_details.data);
                        fetchCustomerList($scope.user.role, order_details.data[0].dealercode);
                        $scope.config.shipping_address = order_details.data[0].shipping_address;
                        for(let i = 0; i < order_details.data.length; i++){
                            $scope.newOrder.push({
                                density: order_details.data[i].density,
                                grade: order_details.data[i].grade,
                                itemName: order_details.data[i].medicine,
                                itemcode: order_details.data[i].itemcode,
                                ldpe: order_details.data[i].LDPE,
                                leng: order_details.data[i].size.leng,
                                pieces: order_details.data[i].pieces,
                                primary_UOM: order_details.data[i].UOM,
                                quantity: order_details.data[i].quantity,
                                standard_order: order_details.data[i].standard_order,
                                thickness: order_details.data[i].size.thickness,
                                width: order_details.data[i].size.width
                            })
                        }
                    }else{
                        $location.path('/');
                    }
                })
        }
        const fetchCustomerList = (role, id) => {
            //... If role dealer, then we only fetch a single record, and assign for display...
            if(role == 'dealer' || role == 'Dealer'){
                if(params != 'new'){
                    $location.path('/');
                }else{
                    $http.get("/dash/stores").then(customers => {
                        console.log(customers.data);
                        if(customers && customers.data && customers.data.length){
                            $scope.customer = customers.data[0];
                            refreshMattress(customers.data[0].group_id);
                        }
                    $http.get('/dash/mattress/duro/get/draft/' + $scope.customer.Dealercode[0]+ "/" +$scope.user.seller )
                        .success(function (response) {
                            if (response.length) {
                                $scope.newOrder = response;
                            }
                        });
                    $scope.plantChange();
                    });
                }
            }else {
                if(params != 'new'){
                    $http.get("/dash/store/" + id).then(customer => {
                        console.log(customer.data);
                        if(customer && customer.data && customer.data.length){
                            $scope.customer = customer.data[0];
                            refreshMattress();
                        }
                    })
                }else{
                    $http.get("/dash/stores").then(customers => {
                        console.log(customers.data);
                        if(customers && customers.data && customers.data.length){
                            $scope.customers = customers.data;
                            refreshMattress();
                        }
                    })
                }
            }
        }
        $scope.getImageUrl = function(obj){
            if(obj){
                if(obj.cloudinaryURL){
                    if(angular.isObject(obj.cloudinaryURL) && obj.cloudinaryURL.length > 0){
                        return obj.cloudinaryURL[0].image || '../appimages/image_not_available.jpg';
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
        $scope.selectCustomer = (dealer) => {
            $scope.customer = dealer || {};
            $scope.config.shipping_address = dealer.Address[0];
            $scope.plantChange();
            if($scope.user.role == 'admin' || $scope.user.role == 'Admin')
                refreshMattress();
            else
                refreshMattress(dealer.group_id[0]);
                // get add to cart data from db
          $http.get('/dash/mattress/duro/get/draft/' + $scope.customer.Dealercode[0]+ "/" +$scope.user.seller )
          .success(function (response) {
              if (response.length) {
                  $scope.newOrder = response;
              }
          })
        }
        //.... User information....
        Settings.getUserInfo(function(user_details){
            console.log(user_details);
            $scope.user = user_details;
            if($scope.user.role){
                $scope.user.role = $scope.user.role.toLowerCase();
            }
            //... Default screen view....
            //... If customer logged in, then the view is set directly to ordering screen...
            if($scope.user.role == 'dealer' || $scope.user.role == 'Dealer')
                $scope.orderViewTab.tab = 1;
            else {
                if(params != 'new')
                    $scope.orderViewTab.tab = 1;
                else
                    $scope.orderViewTab.tab = 0;
            }
            if($scope.user.role == 'dealer' || $scope.user.role == 'Dealer'){
                console.log("User logged in as a customer ---> ");
            }
            if(params != 'new'){
                getOrderDetails(params);
            }else
                fetchCustomerList($scope.user.role, null);
        });
        //... Custom Length if chosen.....
        $scope.customLen = function (){
            if($scope.custOrder.leng ==  'custLen'){
                $scope.custLen = true;
                $scope.custOrder.leng = '';
            }
            else{
                $scope.custLen = false;
            }
        };
        //... Custom Width if chosen.....
        $scope.customWidth = function (){
            if($scope.custOrder.width ==  'custWidth'){
                $scope.custWidth = true;
                $scope.custOrder.width = '';
            }
            else{
                $scope.custWidth = false;
            }
        };
        //... Custom Thickness if chosen.....
        $scope.customThickness = function (){
            if($scope.custOrder.thickness ==  'custThickness'){
                $scope.custThickness = true;
                $scope.custOrder.thickness = '';
            }
            else{
                $scope.custThickness = false;
            }
        };
        //... Change Ordering View ........
        //.... This will change based on the 3 views
        /*
             1. First view will be customer selection (if Admin)
             2. Second view will be custom ordering....
             3. Preview of the order screen....
         */
        $scope.changeOrderView = function(tab){
            $scope.orderViewTab.tab = tab;
            if(!tab) clearOrder();
        }
        $http.get('/dash/mattress/short/codes')
            .success(function (response) {
                if (response.length) {
                    short_codes = response
                }
            })
        //.... Reset Custom Options....
        const resetCustomOptions = () => {
            $scope.custOrder.quantity = '';
            $scope.custOrder.pieces = '';
            $scope.custLen = false;
            $scope.custWidth = false;
            $scope.custThickness = false;
            $scope.custOrder.leng = '';
            $scope.custOrder.width = '';
            $scope.custOrder.thickness = '';
        }
        //.... Select the item....
        $scope.selectedItem = function (index, item){
            $scope.activeName = item.l5;
            $scope.activeItem = index;
            $scope.activeGrade = '';
            $scope.activeDensity = '';
            $scope.matressDensity = [];
            $scope.custOrder.itemName = item.l3;
            $scope.custOrder.grade = '';
            $scope.custOrder.density = '';
            $scope.custOrder.category = item.l5;
            $scope.custOrder.thickness = '';
            $scope.custOrder.primary_UOM = '';
            resetCustomOptions();
            for(let i = 0; i < short_codes.length; i++){
                if(short_codes[i]){
                    if(short_codes[i].type == $scope.custOrder.category){
                        console.log(short_codes[i]);
                        $scope.short_code_selected = short_codes[i];
                        $scope.custOrder.primary_UOM = short_codes[i].Primary;
                        $scope.custOrder.type = short_codes[i].type;
                        $scope.config.custom_options = short_codes[i].Custom || false;
                        if(short_codes[i].LOptions && short_codes[i].LOptions.length)
                            $scope.duroLength = short_codes[i].LOptions;
                        if(short_codes[i].WOptions && short_codes[i].WOptions.length)
                            $scope.duroWidth = short_codes[i].WOptions;
                        if(short_codes[i].TOptions && short_codes[i].TOptions.length)
                            $scope.duroThickness = short_codes[i].TOptions;
                        else if(short_codes[i].TMin && short_codes[i].TMax)
                            $scope.duroThickness = {TMin : short_codes[i].TMin, TMax : short_codes[i].TMax};
                        break;
                    }
                }
            }
            $http.get('/dash/mattress/items/' + $scope.config.groupId + '/' + item.l5)
                .success(function (response) {
                    if (response.length) {
                       //  console.log(response);
                        response.sort((a, b) => a.grade < b.grade ? -1 : 1);
                        $scope.matressGrades = response
                    }
                })
        }
        //.... Selection of Grade....
        $scope.selectedGrade = function (name){
            $scope.activeGrade = name;
            $scope.custOrder.grade = name;
            resetCustomOptions();
            $http.get('/dash/mattress/items/grade/' + $scope.config.groupId + '/' + name + '/' + $scope.activeName)
                .success(function (response) {
                    if (response.length) {
                     //   console.log(response);
                        response.sort((a, b) => a.density < b.density ? -1 : 1);
                        $scope.matressDensity = response
                    }
                })
        };
        //.... Selection of Density....
        $scope.selectedDensity = function (item){
            //console.log(index);
            $scope.custOrder.density = item.density;
            $scope.activeDensity = item.density;
            $scope.custOrder.itemName = item.l3;
            $scope.custOrder.category = item.l5;
            resetCustomOptions();
        };
        //.... Clear the selections....
        const clearSelections = () => {
            $scope.custOrder = {};
            $scope.custOrder.ldpe = 'YES';
            $scope.activeGrade = '';
            $scope.activeDensity = '';
            $scope.activeName = '';
            $scope.activeItem = null;
            $scope.matressDensity = [];
            $scope.matressGrades = [];
            jQuery.noConflict();
            $('.refresh').css("display", "none");
        };
        //.... Clear the order cached....
        const clearOrder = () => {
            $scope.newOrder = [];
            clearSelections();
        };
        $scope.calculatePieces = () => {
            if($scope.custOrder.quantity && $scope.custOrder.quantity > 0){
                 if($scope.custOrder.quantity % 1 === 0) {
                     if ($scope.custOrder.primary_UOM == 'KG' || $scope.custOrder.quantity <= 999) {
                         console.log($scope.custOrder.primary_UOM);
                         let custOrder = {...$scope.custOrder};
                         jQuery.noConflict();
                         $('.refresh').css("display", "inline");
                         if ($scope.short_code_selected.TOptions && !$scope.short_code_selected.TOptions.length && !$scope.short_code_selected.TMin && !$scope.short_code_selected.TMax)
                             $scope.custOrder.thickness = $scope.short_code_selected.TOptions;
                         if ($scope.custOrder.primary_UOM != 'KG') {
                             if ($scope.custOrder.leng) {
                                 if ($scope.custOrder.leng > 0)
                                     custOrder.leng = parseFloat($scope.custOrder.leng);
                                 else {
                                     Settings.fail_toast("Error", "Negative values not allowed");
                                     jQuery.noConflict();
                                     $('.refresh').css("display", "none");
                                     return;
                                 }
                             } else {
                                 Settings.fail_toast("Error", "Enter valid Length (In steps - .5)");
                                 jQuery.noConflict();
                                 $('.refresh').css("display", "none");
                                 return;
                             }
                         }
                         if ($scope.custOrder.width) {
                             if ($scope.custOrder.width > 0)
                                 custOrder.width = parseFloat($scope.custOrder.width);
                             else {
                                 Settings.fail_toast("Error", "Negative values not allowed");
                                 jQuery.noConflict();
                                 $('.refresh').css("display", "none");
                                 return;
                             }
                         } else {
                             Settings.fail_toast("Error", "Enter valid Width (In steps - .5)");
                             jQuery.noConflict();
                             $('.refresh').css("display", "none");
                             return;
                         }
                         if ($scope.custOrder.thickness) {
                             if ($scope.custOrder.thickness > 0)
                                 custOrder.thickness = parseFloat($scope.custOrder.thickness);
                             else {
                                 Settings.fail_toast("Error", "Negative values not allowed");
                                 jQuery.noConflict();
                                 $('.refresh').css("display", "none");
                                 return;
                             }
                         } else {
                             Settings.fail_toast("Error", "Enter a valid thickness");
                             jQuery.noConflict();
                             $('.refresh').css("display", "none");
                             return;
                         }
                         if ($scope.custOrder.primary_UOM != 'KG')
                             custOrder.quantity = parseInt($scope.custOrder.quantity);
                         else
                             custOrder.quantity = parseFloat($scope.custOrder.quantity.toFixed(3));
                         $http.post("/dash/mattress/bundle/pieces/convert", custOrder)
                             .then((response) => {
                             console.log(response.data);
                         if (response.data && response.data.length) {
                             if ($scope.custOrder.primary_UOM == 'KG') {
                                 let pieces = response.data[0].Total_Pieces;
                                 let length = response.data[0].Length;
                                 let density = parseInt($scope.custOrder.density.slice(0, $scope.custOrder.density.length - 1));
                                 let weight = parseFloat(((($scope.custOrder.width * 0.0254) * ($scope.custOrder.thickness / 1000) * (density)) * length).toFixed(2));
                                 pieces = pieces * weight;
                                 $scope.custOrder.pieces = parseFloat(($scope.custOrder.quantity * weight).toFixed(2));
                                    // let weight = parseFloat(($scope.custOrder.width * 0.0254 * ($scope.custOrder.thickness / 1000) * density).toFixed(3));
                                    // pieces = pieces * weight;
                                    // $scope.custOrder.pieces = parseFloat(($scope.custOrder.quantity * pieces).toFixed(3));
                             }
                             else if ($scope.custOrder.primary_UOM == 'BLOCKS') {
                                 let density = parseInt($scope.custOrder.density.slice(0, $scope.custOrder.density.length - 1));
                                 // let weight = parseFloat(($scope.custOrder.width * 0.0254 * ($scope.custOrder.leng * 0.0254) * ($scope.custOrder.thickness / 1000) * density * 1.05).toFixed(4));
                                 let weight = parseFloat(($scope.custOrder.width * 0.0254 * ($scope.custOrder.leng * 0.0254) * ($scope.custOrder.thickness / 1000) * density ).toFixed(2));
                                 // console.log(weight);
                                 $scope.custOrder.pieces = parseFloat(($scope.custOrder.quantity * weight).toFixed(2));
                             }
                             else if ($scope.custOrder.primary_UOM == 'BUNDLE') {
                                 let density = parseInt($scope.custOrder.density.slice(0, $scope.custOrder.density.length - 1));
                                 let weight = parseFloat(($scope.custOrder.width * 0.0254 * ($scope.custOrder.leng * 0.0254) * ($scope.custOrder.thickness / 1000) * density ).toFixed(2));
                                 let pieces = response.data[0].Total_Pieces;
                                 $scope.custOrder.pieces = $scope.custOrder.quantity * pieces;
                                 // $scope.custOrder.pieces = parseFloat(((response.data[0].MM_Per_Bundle / $scope.custOrder.thickness ) * $scope.custOrder.quantity ).toFixed(2));
                                 $scope.custOrder.volume = parseFloat(((($scope.custOrder.leng * 0.0254) * ($scope.custOrder.width * 0.0254) * ((response.data[0].MM_Per_Bundle )/1000) ) * $scope.custOrder.quantity).toFixed(2));
                             }
                             else {
                                 let pieces = response.data[0].Total_Pieces;
                                 $scope.custOrder.pieces = $scope.custOrder.quantity * pieces;
                             }
                             jQuery.noConflict();
                             $('.refresh').css("display", "none");
                         } else {
                             Settings.fail_toast("Error", "Failed to convert bundle to pieces");
                             jQuery.noConflict();
                             $('.refresh').css("display", "none");
                         }
                     })
                     } else {
                         Settings.fail_toast("Error", "Bundle quantity cannot exceed 3 Digits");
                     }
                 }else{
                     Settings.fail_toast("Error", "Bundle qty must be whole number");
                     $scope.custOrder.quantity = '';
                     $scope.custOrder.pieces = '';
                     // uncomment volume calculation
                     $scope.custOrder.volume = '';
                 }
            }else{
                if($scope.custOrder.quantity < 0)
                    Settings.fail_toast("Error", "Negative values not allowed");
            }
        }
        $scope.generateFoamOrderId = callback => {
            let date = new Date();
            let year = date.getFullYear();
            $http.get("/dash/order/foam/running/id/" + year)
                .then((foam_id) => {
                    console.log(foam_id.data);
                    if(foam_id.data.foam_id){
                        callback(year + foam_id.data.foam_id.padLeft(100000));
                    }
                })
        }
        //... Change Shipping Address....
        $scope.changeShippingAddress = () => {
            if($scope.customer.Dealercode){
                $http.get("/dash/address-list/" + $scope.customer.Dealercode)
                    .then(address_list => {
                        if(address_list.data){
                            //console.log(address_list.data);
                            $scope.shipping_addresses = address_list.data;
                        }
                    })
            }
        }
        $scope.addAddress = () => {
            if($scope.config.new_address.AddressName && $scope.config.new_address.Address){
                $scope.shipping_addresses.push($scope.config.new_address);
                $scope.config.new_address = {};
                $scope.config.add_new_address = false;
            }
        }
        $scope.selectAddress = (index) => {
            for(let i = 0; i < $scope.shipping_addresses.length; i++)
                if(i != index) $scope.shipping_addresses[i].selected = false;
                else {
                    $scope.shipping_addresses[i].selected = true;
                    $scope.config.shipping_address = $scope.shipping_addresses[i].Address;
                    $scope.config.ship_to_code = $scope.shipping_addresses[i].ShipToCode;
                    $scope.config.delivery_location = $scope.shipping_addresses[i].DeliveryLocation || '';
                }
        }
        //.... Add items to cart....
        $scope.addToCart = () => {
            $scope.custOrder.userSeller = $scope.user.seller;
            if($scope.custOrder.quantity && $scope.custOrder.quantity > 0){
                if($scope.custOrder.primary_UOM == 'KG' || $scope.custOrder.quantity <= 999){
                    console.log($scope.custOrder.primary_UOM);
                    jQuery.noConflict();
                    $('.refresh').css("display", "inline");
                    //.... If any of the sizes were used as a custom length / width / thickness, we mark the order as Non-Standard
                    if($scope.custLen || $scope.custWidth || $scope.custThickness)
                        $scope.custOrder.standard_order = false;
                    else $scope.custOrder.standard_order = true;
                    if($scope.short_code_selected.TOptions && !$scope.short_code_selected.TOptions.length && !$scope.short_code_selected.TMin && !$scope.short_code_selected.TMax)
                        $scope.custOrder.thickness = $scope.short_code_selected.TOptions;
                    if($scope.custOrder.primary_UOM != 'KG'){
                        if($scope.custOrder.leng){
                            if($scope.custOrder.leng > 0)
                                $scope.custOrder.leng = parseFloat($scope.custOrder.leng);
                            else{
                                Settings.fail_toast("Error", "Negative values not allowed");
                                jQuery.noConflict();
                                $('.refresh').css("display", "none");
                                return;
                            }
                        } else {
                            Settings.fail_toast("Error", "Enter valid Length (In steps - .5)");
                            jQuery.noConflict();
                            $('.refresh').css("display", "none");
                            return;
                        }
                    }
                    if($scope.custOrder.width){
                        if($scope.custOrder.width > 0)
                            $scope.custOrder.width = parseFloat($scope.custOrder.width);
                        else{
                            Settings.fail_toast("Error", "Negative values not allowed");
                            jQuery.noConflict();
                            $('.refresh').css("display", "none");
                            return;
                        }
                    } else{
                        Settings.fail_toast("Error", "Enter valid Width (In steps - .5)");
                        jQuery.noConflict();
                        $('.refresh').css("display", "none");
                        return;
                    }
                    if($scope.custOrder.thickness){
                        if($scope.custOrder.thickness > 0)
                            $scope.custOrder.thickness = parseFloat($scope.custOrder.thickness);
                        else {
                            Settings.fail_toast("Error", "Negative values not allowed");
                            jQuery.noConflict();
                            $('.refresh').css("display", "none");
                            return;
                        }
                    } else {
                        Settings.fail_toast("Error", "Enter a valid thickness");
                        jQuery.noConflict();
                        $('.refresh').css("display", "none");
                        return;
                    }
                    if($scope.custOrder.primary_UOM != 'KG')
                        $scope.custOrder.quantity = parseInt($scope.custOrder.quantity);
                    else
                        $scope.custOrder.quantity = parseFloat($scope.custOrder.quantity.toFixed(3));
                    $http.post("/dash/mattress/bundle/pieces/convert", $scope.custOrder)
                        .then((response) => {
                            console.log(response.data);
                            if(response.data && response.data.length){
                                if($scope.custOrder.primary_UOM == 'KG'){
                                    let pieces = response.data[0].Total_Pieces;
                                    let length = response.data[0].Length;
                                    let density = parseInt($scope.custOrder.density.slice(0, $scope.custOrder.density.length - 1));
                                    let weight = parseFloat(((($scope.custOrder.width * 0.0254) * ($scope.custOrder.thickness / 1000) * (density)) * length).toFixed(2));
                                    pieces = pieces * weight ;
                                    $scope.custOrder.pieces = parseFloat(($scope.custOrder.quantity * weight).toFixed(2));
                                    // let weight = parseFloat(($scope.custOrder.width * 0.0254 * ($scope.custOrder.thickness / 1000) * density).toFixed(4));
                                    // pieces = pieces * weight;
                                    // $scope.custOrder.pieces = parseFloat(($scope.custOrder.quantity * pieces).toFixed(4));
                                }
                                else if($scope.custOrder.primary_UOM == 'BLOCKS'){
                                    let density = parseInt($scope.custOrder.density.slice(0, $scope.custOrder.density.length - 1));
                                    // let weight = parseFloat(($scope.custOrder.width * 0.0254 * ($scope.custOrder.leng * 0.0254) * ($scope.custOrder.thickness / 1000) * density * 1.05).toFixed(3));
                                    let weight = parseFloat(($scope.custOrder.width * 0.0254 * ($scope.custOrder.leng * 0.0254) * ($scope.custOrder.thickness / 1000) * density ).toFixed(2));
                                    $scope.custOrder.pieces = parseFloat(($scope.custOrder.quantity * weight).toFixed(2));
                                }
                               //  uncomment volume calculation
                                else if ($scope.custOrder.primary_UOM == 'BUNDLE') {
                                    // Pieces = (Bundle Height / Thickness) * No of Quantity
                                    let density = parseInt($scope.custOrder.density.slice(0, $scope.custOrder.density.length - 1));
                                   let weight = parseFloat(($scope.custOrder.width * 0.0254 * ($scope.custOrder.leng * 0.0254) * ($scope.custOrder.thickness / 1000) * density ).toFixed(2));
                                    // $scope.custOrder.pieces = parseFloat(((response.data[0].MM_Per_Bundle / $scope.custOrder.thickness ) * $scope.custOrder.quantity ).toFixed(2));
                                    let pieces = response.data[0].Total_Pieces;
                                    $scope.custOrder.pieces = $scope.custOrder.quantity * pieces;
                                    $scope.custOrder.volume = parseFloat(((($scope.custOrder.leng * 0.0254) * ($scope.custOrder.width * 0.0254) * ((response.data[0].MM_Per_Bundle )/1000) ) * $scope.custOrder.quantity).toFixed(2));
                                }
                                else{
                                    let pieces = response.data[0].Total_Pieces;
                                    $scope.custOrder.pieces = $scope.custOrder.quantity * pieces;
                                }
                                $scope.custOrder.itemcode = generateMaterialID($scope.custOrder);
                                if ($scope.custOrder.primary_UOM == 'BLOCKS') {
                                    // $scope.newOrder.push($scope.custOrder);
                                    // clearSelections();
                                    if (JSON.stringify($scope.newOrder).indexOf($scope.custOrder.itemcode) == -1) {
                                         $scope.custOrder.tempItemCode = $scope.custOrder.itemcode;
                                         $scope.custOrder.Dealercode = $scope.customer.Dealercode[0];
                                        $scope.custOrder.itemcode =  generateBlockMaterialID($scope.custOrder);
                                        if((JSON.stringify($scope.newOrder).indexOf($scope.custOrder.tempItemCode) == -1)){
                                            $scope.newOrder.push($scope.custOrder);
                                            $http.post("/dash/mattress/duro/order/draft/" + $scope.customer.Dealercode[0] , $scope.custOrder)
                                            .then((response) => {
                                                 console.log("blocks")
                                            })
                                            clearSelections();
                                        }else{
                                            Settings.fail_toast("Error", "Item with same material code already exists in cart");
                                            jQuery.noConflict();
                                            $('.refresh').css("display", "none");
                                        }
                                    }else{
                                        Settings.fail_toast("Error", "Item with same material code already exists in cart");
                                        jQuery.noConflict();
                                        $('.refresh').css("display", "none");
                                    }
                                    // if (JSON.stringify($scope.newOrder).indexOf($scope.custOrder.itemcode) == -1) {
                                    //     // if($scope.custOrder.itemcode == $scope.custOrder.itemcode){
                                    //         console.log("$scope.custOrder.itemcode",$scope.custOrder.itemcode)
                                    //         console.log("tempid",tempid)
                                    //     // }
                                    //     $scope.newOrder.push($scope.custOrder);
                                    //     clearSelections();
                                    // }
                                    // else{
                                    //     Settings.fail_toast("Error", "Item with same material code already exists in cart");
                                    //     jQuery.noConflict();
                                    //     $('.refresh').css("display", "none");
                                    // }
                                }
                                else if ($scope.custOrder.primary_UOM == 'BUNDLE') {
                                   // $scope.newOrder.push($scope.custOrder);
                                   // clearSelections();
                                    if (JSON.stringify($scope.newOrder).indexOf($scope.custOrder.itemcode) == -1) {
                                        $scope.custOrder.Dealercode = $scope.customer.Dealercode[0];
                                        $scope.newOrder.push($scope.custOrder);
                                        $http.post("/dash/mattress/duro/order/draft/"+ $scope.customer.Dealercode[0] , $scope.custOrder)
                                        .then((response) => {
                                            console.log("bundle")
                                        })
                                        clearSelections();
                                    }
                                    else{
                                        Settings.fail_toast("Error", "Item with same material code already exists in cart");
                                        jQuery.noConflict();
                                        $('.refresh').css("display", "none");
                                    }
                                }else{
                                    if (JSON.stringify($scope.newOrder).indexOf($scope.custOrder.itemcode) == -1) {
                                        $scope.custOrder.Dealercode = $scope.customer.Dealercode[0];
                                        $scope.newOrder.push($scope.custOrder);
                                        $http.post("/dash/mattress/duro/order/draft/"+$scope.customer.Dealercode[0], $scope.custOrder)
                                        .then((response) => {
                                            console.log("else others")
                                        })
                                        clearSelections();
                                    }
                                    else{
                                        Settings.fail_toast("Error", "Item with same material code already exists in cart");
                                        jQuery.noConflict();
                                        $('.refresh').css("display", "none");
                                    }
                                }
                            }else{
                                Settings.fail_toast("Error", "Failed to convert bundle to pieces");
                                jQuery.noConflict();
                                $('.refresh').css("display", "none");
                            }
                        })
                    // $http.post("/dash/mattress/addtocart", $scope.newOrder)
                    //     .then((response) => {
                    //     console.log("$scope.newOrder",$scope.newOrder)
                    //
                    // });
                }else{
                    Settings.fail_toast("Error", "Bundle quantity cannot exceed 3 Digits");
                }
            }else{
                Settings.fail_toast("Error", "Negative values not allowed");
            }
        };
        //.... Get Totals for display....
        $scope.getTotals = (type) => {
            switch (type){
                case 'pieces' : {
                    let total = 0;
                    for (let i = 0; i < $scope.newOrder.length; i++){
                        total += $scope.newOrder[i].pieces || 0;
                    }
                    return total;
                }
                case 'qty' : {
                    let total = 0;
                    for (let i = 0; i < $scope.newOrder.length; i++){
                        total += $scope.newOrder[i].quantity || 0;
                    }
                    return total;
                }
                case 'volume' : {
                    let total = 0;
                    for (let i = 0; i < $scope.newOrder.length; i++){
                        total += $scope.newOrder[i].volume || 0;
                    }
                    return total;
                }
            }
        };
        //..... Generate the material ID....
        const generateMaterialID = data => {
            if(data.primary_UOM != 'BLOCKS'){
                let id = '';
                id += data.grade;
                id += $scope.short_code_selected.code;
                if(data.leng)
                    id += (parseFloat((parseFloat(parseFloat(data.leng).toFixed(2)) * 100).toFixed(2))).padLeft(1000);
                if(data.width)
                    id += (parseFloat((parseFloat(parseFloat(data.width).toFixed(2)) * 100).toFixed(2))).padLeft(1000);
                if(data.thickness)
                    id += parseFloat(data.thickness).padLeft(100);
                id += data.density;
                return id;
            }else  if(data.primary_UOM == 'BLOCKS'){
                let id = '';
                id += data.grade;
                id += data.density;
                id += (parseFloat(data.leng).toFixed(0));
                id += (parseFloat(data.width).toFixed(0));
                id += $scope.short_code_selected.code;
                return id;
            }
        };
        const generateBlockMaterialID = data => {
            if(data.primary_UOM == 'BLOCKS'){
                let id = '';
                id += data.grade;
                id += data.density;
                id += (parseFloat(data.width).toFixed(0));
                id += $scope.short_code_selected.code;
                return id;
            }
        };
        function getFormattedString(d){
            return (d.getMonth()+1)  + "/"+d.getDate()+"/"+d.getFullYear() ;
          }
        //..... Submit the order....
            $scope.submitOrder = () => {
                if($scope.newOrder.length){
                    if($scope.config.shipping_address && $scope.custOrder.customer_req_date) {
                        if (Date.parse($scope.custOrder.customer_req_date) >= Date.parse($scope.plantCodeDays)){
                            var CRDHoliday = false;
                        if ($scope.holidayCRD.length) {
                            for (var k = 0; k < $scope.holidayCRD.length; k++) {
                                if (getFormattedString($scope.custOrder.customer_req_date) == $scope.holidayCRD[k].DATE) {
                                    CRDHoliday = true;
                                    break;
                                } else {
                                    CRDHoliday = false;
                                }
                            }
                        }
                        var today = new Date();
                        var custOrderCRD = Date.parse($scope.custOrder.customer_req_date);
                        var orderDate = Date.parse(today);
                        if(custOrderCRD < orderDate){
                            Settings.alertPopup("Alert", "The Selected Date Cannot Be Older Than Order Date, Please Select a Different Customer Requested Date!!!");
                        } else {
                            Settings.confirmPopup('CONFIRM', "Confirm the order?", result => {
                                console.log('Confirm Order ?', result);
                            console.log('Confirm Order ?', $scope.newOrder);
                            if (result) {
                                if (!CRDHoliday) {
                                        let orders = [];
                                        $scope.generateFoamOrderId(id => {
                                            console.log("New Order --->", id);
                                        let orderId = id;
                                        let standard_order = true;
                            for(let i = 0; i < $scope.newOrder.length; i++)
                                if(!$scope.newOrder[i].standard_order) standard_order = false;
                            for(let i = 0; i < $scope.newOrder.length; i++){
                                $scope.newOrder[i].comment = $scope.custOrder.comment;
                                $scope.newOrder[i].lineId = i + 1;
                                $scope.newOrder[i].customer_req_date = formatDate($scope.custOrder.customer_req_date);
                                $scope.newOrder[i].standard_order = standard_order;
                                if($scope.config.shipping_address) $scope.customer.shipping_address = $scope.config.shipping_address;
                                if($scope.config.ship_to_code) $scope.customer.ship_to_code = $scope.config.ship_to_code;
                                $scope.customer.delivery_location = $scope.config.delivery_location;
                                orders.push(new NewOrder($scope.newOrder[i], $scope.customer, $scope.user));
                                orders[i].orderId = orderId;
                            }
                                        $http.post("/dash/orders/" + orderId, orders).then(response => {
                                            if(response && response.data)  {
                                            // Settings.success_toast("Success", "Order Created Successfully");
                                            if (!standard_order)
                                                Settings.popupAlert("Dear Customer,\nThe Factory Team will give further confirmation on the Quantity, Price & Time of Supply for the Custom Orders in Order No : " + orderId + ", Dated : " + orders[0].date_added.split(" ")[0]);
                                            $http.delete("/dash/mattress/duro/removeorder/draft/" + $scope.customer.Dealercode[0])
                                                .then((response) => {
                                                if(response) {
                                                    console.log("removed order successfully")
                                                }
                                            })
                                            $location.path('/ui-orders');
                                        }
                                    })
                                    })
                                } else {
                                    Settings.alertPopup("Alert", "The Selected Date is a Holiday, Please select a different Customer Requested Date!!");
                                }
                            }
                        });
                        }
                    }else {
                        Settings.alertPopup("Alert", "Please select another Customer Requested Date! ");
                    }
                    }else if(!$scope.custOrder.customer_req_date ) {
                        Settings.alertPopup("Alert", "Please add Customer Requested Date!");
                    }else if(!$scope.config.shipping_address) {
                        Settings.alertPopup("Alert", "Please add Shipping Address!");
                    }
                    // var CRDHoliday = false;
                    // if($scope.holidayCRD.length) {
                    //     // if ($scope.custOrder.customer_req_date) {
                    //         for (var k = 0; k < $scope.holidayCRD.length; k++) {
                    //             if (getFormattedString($scope.custOrder.customer_req_date) == $scope.holidayCRD[k].DATE) {
                    //                 CRDHoliday = true;
                    //                 break;
                    //             } else {
                    //                 CRDHoliday = false;
                    //             }
                    //         }
                    //     // }
                    //     // else {
                    //     //     Settings.alertPopup("Alert", "Please add Customer Requested Date!");
                    //     // }
                    // }
                // Settings.confirmPopup('CONFIRM',"Confirm the order?", result => {
                //     console.log('Confirm Order ?', result);
                //     console.log('Confirm Order ?', $scope.newOrder);
                //     if (result) {
                //         // if(!$scope.custOrder.customer_req_date )
                //         //     Settings.alertPopup("Alert", "Please add Customer Requested Date!");
                //         //
                //         // if(!$scope.config.shipping_address)
                //         //     Settings.alertPopup("Alert", "Please add Shipping Address!");
                //
                //             if(!CRDHoliday){
                //         if($scope.config.shipping_address && $scope.custOrder.customer_req_date){
                //         let orders = [];
                //         $scope.generateFoamOrderId(id => {
                //             console.log("New Order --->", id);
                //             let orderId = id;
                //             let standard_order = true;
                //
                //             for(let i = 0; i < $scope.newOrder.length; i++)
                //                 if(!$scope.newOrder[i].standard_order) standard_order = false;
                //
                //             for(let i = 0; i < $scope.newOrder.length; i++){
                //                 $scope.newOrder[i].comment = $scope.custOrder.comment;
                //                 $scope.newOrder[i].lineId = i + 1;
                //                 $scope.newOrder[i].customer_req_date = $scope.custOrder.customer_req_date || '';
                //                 $scope.newOrder[i].standard_order = standard_order;
                //
                //                 if($scope.config.shipping_address) $scope.customer.shipping_address = $scope.config.shipping_address;
                //                 if($scope.config.ship_to_code) $scope.customer.ship_to_code = $scope.config.ship_to_code;
                //                 $scope.customer.delivery_location = $scope.config.delivery_location;
                //
                //                 orders.push(new NewOrder($scope.newOrder[i], $scope.customer, $scope.user));
                //                 orders[i].orderId = orderId;
                //             }
                //
                //             $http.post("/dash/orders/" + orderId, orders).then(response => {
                //                 if(response && response.data){
                //                     Settings.success_toast("Success","Order Created Successfully");
                //                     if(!standard_order)
                //                         Settings.popupAlert("Dear Customer,\nThe Factory Team will give further confirmation on the Quantity, Price & Time of Supply for the Custom Orders in Order No : "+orderId+", Dated : " + orders[0].date_added.split(" ")[0]);
                //                         $http.delete("/dash/mattress/duro/removeorder/draft/"+ $scope.customer.Dealercode[0])
                //                             .then((response) => {
                //                                 if(response){
                //                                     console.log("removed order successfully")
                //                                 }
                //                             })
                //                     $location.path('/ui-orders');
                //                 }
                //             })
                //         })
                //     }
                // }else{
                //     Settings.alertPopup("Alert", "The Selected Date is a Holiday, Please select a different Customer Requested Date!!");
                // }
                //
                //     }
                // });
            }
        }
        $scope.removeItem = index => {
            Settings.confirmPopup('CONFIRM',"Are you sure to remove this order?", result => {
                if (result) {
                    $http.delete("/dash/mattress/duro/removeitem/draft/"+ $scope.newOrder[index].itemcode)
                    .then((response) => {
                        if(response){
                            console.log("removed item successfully")
                        }
                    })
                     $scope.$apply(() => $scope.newOrder.splice(index, 1));
                }
            });
        };
        $scope.alertChangeShippingAddress =() => {
            Settings.confirmPopup('CONFIRM',"Do you want to change the shipping address?", result => {
                if(result){
                    jQuery.noConflict();
                    jQuery("#shipping_address").modal('show');
                    $scope.changeShippingAddress();
                }
            })
        }
    })