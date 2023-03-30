angular.module('ebs.controller')
.controller("ServiceComplaintsCtrl", function ($scope, $http, Settings, $routeParams, $window, $location) {
    console.log("Hello From Service Complaints Controller .... !!!!");
    //.... Tickets....
    $scope.tickets = [];
    $scope.showSearchFilter = false;
    $scope.tickets_count = 0;
    //..... Pagination.....
    $scope.viewLength = 0;
    $scope.newViewBy = 10;
    let initialViewBy = 60;
    let instanceDetails =  Settings.getInstance();
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(23, 59, 59, 59);
    $scope.todayDate = currentDate.toISOString().split('T')[0];
    let ticket_filters = {};
    $scope.ticket_filters = {};
    $scope.ticket_filters.startDate = new Date();
    $scope.ticket_filters.startDate.setDate($scope.ticket_filters.startDate.getDate() - 15);
    $scope.ticket_filters.startDate.setHours(0, 0, 0, 0);
    $scope.ticket_filters.endDate = new Date();
    $scope.ticket_filters.endDate.setHours(23, 59, 59, 59);
    $scope.ticket_filters.searchBy = "";
    $scope.checkDateFilter = function(start, end){
        if(start){
            if($scope.ticket_filters.endDate < start){
                Settings.failurePopup(
                    'WARNING',
                    'Please select valid date range.'
                )
                $scope.ticket_filters.startDate = new Date();
                $scope.ticket_filters.startDate.setHours(0, 0, 0, 0)
            }
        }else if(end){
            if($scope.ticket_filters.startDate > end){
                Settings.failurePopup(
                    'WARNING',
                    'Please select valid date range.'
                )
                $scope.ticket_filters.endDate = new Date();
                $scope.ticket_filters.endDate.setHours(23, 59, 59, 59)
            }
        }
    }
    $scope.tab = ($routeParams.tab && $routeParams.tab != "open") ? (($routeParams.tab == "pending" ? "pending" : ($routeParams.tab == "on-hold" ? "on-hold" : "open"))) : "open";
    $scope.user_details = {};
    Settings.getUserInfo(user_details => {
        if(user_details)
            $scope.user_details = user_details;
    })
    Settings.getNav((nav) => {
        $scope.nav = nav;
        $scope.userRole = $scope.nav[4].roles ? $scope.nav[4].roles: [];
    });
    let api_timeout = 60000;
    const startLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "inline");
    }
    const stopLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "none");
    }
    $scope.parseData = (viewLength, newViewBy) => parseInt(viewLength) + parseInt(newViewBy);
    const renderTickets = tickets => {
        stopLoader();
        if(tickets && tickets.length)
            for(let i = 0; i < tickets.length; i++) $scope.tickets.push(tickets[i]);
    }
    const loadSummary = callback => {
        $scope.ticket_summary = {total : 0, pending : 0, open : 0, on_hold : 0, completed: 0};
        let query = new URLSearchParams();
        if($scope.ticket_filters.searchBy) query.append("search",  $scope.ticket_filters.searchBy);
        if($scope.ticket_filters.startDate) query.append("from",  $scope.ticket_filters.startDate.toISOString());
        if($scope.ticket_filters.endDate) query.append("to",  $scope.ticket_filters.endDate.toISOString());
        let request_object = {
            url : "/dash/services/tickets/summary?" + query.toString(),
            method : "GET",
            timeout : api_timeout,
            //data : filter
        };
        $http(request_object)
            .then(res => {
                console.log(res.data);
                for(let i = 0; i < res.data.length; i++){
                    $scope.ticket_summary.total += res.data[i].count;
                    if(res.data[i]._id == 'On-Hold'){
                        $scope.ticket_summary.on_hold += res.data[i].count;
                    }else if((res.data[i]._id == 'New') || (res.data[i]._id == 'Registered')){
                        $scope.ticket_summary.pending += res.data[i].count;
                    }else if(res.data[i]._id == 'Completed'){
                        $scope.ticket_summary.completed += res.data[i].count;
                    }else
                        $scope.ticket_summary.open += res.data[i].count;
                }
                if(callback)
                    callback(res.data);
            }, (error, status) => {
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
        })
    };
    const loadTickets = callback => {
        startLoader();
        let query = new URLSearchParams();
        query.append("tab",  $scope.tab);
        query.append("skip", ticket_filters.viewLength || 0);
        query.append("limit", ticket_filters.viewBy || 10);
        if($scope.ticket_filters.searchBy) query.append("search",  $scope.ticket_filters.searchBy);
        if($scope.ticket_filters.startDate) query.append("from",  $scope.ticket_filters.startDate.toISOString());
        if($scope.ticket_filters.endDate) query.append("to",  $scope.ticket_filters.endDate.toISOString());
        let request_object = {
            url : "/dash/services/tickets?" + query.toString(),
            method : "GET",
            timeout : api_timeout,
            //data : filter
        };
        $http(request_object)
            .then(res => {
                renderTickets(res.data);
                if(callback)
                    callback(res.data);
                }, (error, status) => {
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
            })
    }
    const loadTicketCount = () => {
        let query = new URLSearchParams();
        query.append("tab",  $scope.tab);
        query.append("count", 1);
        if($scope.ticket_filters.searchBy) query.append("search",  $scope.ticket_filters.searchBy);
        if($scope.ticket_filters.startDate) query.append("from",  $scope.ticket_filters.startDate.toISOString());
        if($scope.ticket_filters.endDate) query.append("to",  $scope.ticket_filters.endDate.toISOString());
        let request_object = {
            url : "/dash/services/tickets?" + query.toString(),
            method : "GET",
            timeout : api_timeout,
            //data : filter
        };
        $http(request_object)
            .then(res => {
                $scope.ticketCount(res.data);
                }, (error, status) => {
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
            })
    }
    $scope.ticketCount = (response) => {
        if(response){
            if(response > $scope.newViewBy){
                $scope.tickets_count = response;
            }
            else if(response <= $scope.newViewBy){
                $scope.tickets_count = response;
                $scope.newViewBy = response;
            }
            else{
                $scope.tickets = [];
                $scope.newViewBy = 1;
                $scope.tickets_count = 0;
                $scope.viewLength = -1;
            }
        }
        else{
            $scope.tickets = [];
            $scope.newViewBy = 1;
            $scope.tickets_count = 0;
            $scope.viewLength = -1;
        }
    }
    $scope.navPage = (direction, newViewBy) => {
        var viewLength = $scope.viewLength;
        var viewBy = $scope.newViewBy;
        if(direction){
            //console.log(" overallreports NEXT");
            if(viewLength + viewBy >= $scope.tickets.length){
                if(viewLength + viewBy < $scope.tickets_count){
                    viewLength += viewBy;
                    // console.log("Fetch more")
                    ticket_filters.viewLength = viewLength;
                    if($scope.newViewBy > initialViewBy ){
                        ticket_filters.viewBy = $scope.newViewBy;
                    }else{
                        ticket_filters.viewBy = initialViewBy;
                    }
                    startLoader();
                    loadTickets();
                    if(viewLength + viewBy > $scope.tickets_count){
                        a = viewLength + viewBy - $scope.tickets_count;
                        viewBy -= a;
                        $scope.newViewBy = viewBy;
                    }
                    $scope.viewLength = viewLength;
                }
                else{
                    // console.log("Out of data")
                    if(viewLength + viewBy > $scope.tickets_count){
                        a = viewLength + viewBy - $scope.tickets_count;
                        viewBy -= a;
                        $scope.newViewBy = viewBy;
                    }
                }
            }
            else{
                // console.log("Minus viewby")
                viewLength += viewBy;
                if(viewLength + viewBy > $scope.tickets_count){
                    a = viewLength + viewBy - $scope.tickets_count;
                    viewBy -= a;
                    if(viewLength + viewBy > $scope.tickets.length){
                        ticket_filters.viewLength = $scope.tickets.length;
                        ticket_filters.viewBy = viewLength + viewBy - $scope.tickets.length;
                        startLoader();
                        loadTickets();
                    }
                }else{
                    if(viewLength + viewBy > $scope.tickets.length){
                        ticket_filters.viewLength = $scope.tickets.length;
                        ticket_filters.viewBy = viewLength + viewBy - $scope.tickets.length;
                        startLoader();
                        // loadReport();
                        // loadTickets();
                    }
                }
                $scope.newViewBy = viewBy;
                $scope.viewLength = viewLength;
            }
        }
        else{
            // console.log("BACK");
            if(viewLength < viewBy){
                // console.log("NO DATA")
            }
            else{
                if(viewLength + viewBy >= $scope.tickets_count){
                    viewBy += a;
                    a = 0;
                }
                viewLength -= viewBy;
                $scope.viewLength = viewLength;
                $scope.newViewBy = viewBy;
            }
        }
    };
    $scope.regalDownloadCSV = function(){
        startLoader();
        var api_timeout = 600000;
        let query = new URLSearchParams();
        // query.append("tab",  $scope.tab);
        // query.append("skip", 0);
        // query.append("limit", ticket_filters.viewBy || 10);
        if($scope.ticket_filters.searchBy) query.append("search",  $scope.ticket_filters.searchBy);
        if($scope.ticket_filters.startDate) query.append("from",  $scope.ticket_filters.startDate.toISOString());
        if($scope.ticket_filters.endDate) query.append("to",  $scope.ticket_filters.endDate.toISOString());
        let request_object = {
            url : "/dash/services/tickets/summary?" + query.toString(),
            method : "GET",
            timeout : api_timeout,
            //data : filter
        };
        $http(request_object)
            .then((count) => {
            console.log(count);
            if(!count.data){
                Settings.failurePopup(
                    'WARNING',
                    'No records to download. Choose different filter'
                )
                stopLoader();
            }
            else if(count.data > 3000){
                Settings.failurePopup(
                    'WARNING',
                    'Please select a smaller date range.\nCurrent records : ' + count.data + ' - Max. records : 3000'
                )
                stopLoader();
            }
            else {
                // console.log(expenseSearchObj);
                let query = new URLSearchParams();
                if($scope.ticket_filters.searchBy) query.append("search",  $scope.ticket_filters.searchBy);
                if($scope.ticket_filters.startDate) query.append("from",  $scope.ticket_filters.startDate.toISOString());
                if($scope.ticket_filters.endDate) query.append("to",  $scope.ticket_filters.endDate.toISOString());
                query.append("downloadCSV", true);
                let request_object = {
                    url : "/dash/services/tickets?" + query.toString(),
                    method : "GET",
                    timeout : api_timeout,
                    //data : filter
                };
                $http(request_object)
                    .then((result) => {
                    let _data = result.data;
                    console.log('result data-=>> ',result.data);
                    var output = 'SL NO,TICKET ID,CREATED DATE,ISSUE,DESCRIPTION,STATUS,CUSTOMER NAME,CUSTOMER PHONE,CUSTOMER EMAIL,END USER NAME,END USER PHONE,END USER EMAIL,END USER ADDRESS,END USER ALTERNATE ADDRESS,END USER CITY,ISSUE TYPE1, ISSUE TYPE2,ISSUE TYPE3,REFERENCE NO.,INVOICE NO.,PRODUCT NAME, PRODUCT CODE,SERIAL NO, CATEGORY, KW, POLE,LINE ATTACHMENTS, ATTACHMENTS';
                    output += '\n'
                    let slNo = 0;
                    for (let i = 0; i < _data.length; i++) {
                        if(_data[i].products && _data[i].products.length){
                            for(let j=0; j< _data[i].products.length; j++){
                                if(_data[i].ticket_id){
                                    slNo++;
                                    output += slNo;
                                    output += ',';
                                    output += _data[i].ticket_id +'-'+ _data[i].products[j].lineId;
                                    output += ',';
                                    if (_data[i].created_date){
                                        function formatdate(date) {
                                            if (date == undefined || date == '')
                                                return ('')
                                            /* replace is used to ensure cross browser support*/
                                            var d = new Date(date.toString());
                                            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                                            var dt = d.getDate()
                                            if (dt < 10)
                                                dt = "0" + dt
                                            var dateOut = dt + "-" + monthNames[d.getMonth()] + "-" + (d.getFullYear())
                                            return dateOut;
                                        }
                                        var dateformat = formatdate(_data[i].created_date);
                                        output += dateformat;
                                        output += ',';
                                    }
                                    if (_data[i].issue)
                                        output += _data[i].issue;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].description)
                                        output += _data[i].description;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].status)
                                        output += _data[i].status;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].customer_name)
                                        output += _data[i].customer_name;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].customer_phone)
                                        output += _data[i].customer_phone;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].customer_email)
                                        output += _data[i].customer_email;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].endUserName)
                                        output += _data[i].endUserName;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].endUserPhone)
                                        output += _data[i].endUserPhone;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].endUserEmail)
                                        output += _data[i].endUserEmail;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    try {
                                        if (_data[i].endUserAddress) {
                                            if ((_data[i].endUserAddress).toString().indexOf(',') != -1) {
                                                let quotesWrapped = '"' + _data[i].endUserAddress + '"'
                                                output += quotesWrapped
                                            }else
                                            output += _data[i].endUserAddress;
                                        }
                                        else
                                            output += 'N/A'
                                    } catch (e) {
                                        console.log(e)
                                    }
                                    output += ',';
                                    try {
                                        if (_data[i].endUserAlternateAddress) {
                                            if ((_data[i].endUserAlternateAddress).toString().indexOf(',') != -1) {
                                                let quotesWrapped = '"' + _data[i].endUserAlternateAddress + '"'
                                                output += quotesWrapped
                                            }else
                                            output += _data[i].endUserAlternateAddress;
                                        }
                                        else
                                            output += 'N/A'
                                    } catch (e) {
                                        console.log(e)
                                    }
                                    output += ',';
                                    if (_data[i].endUserCity)
                                        output += _data[i].endUserCity;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].products.length)
                                        output += _data[i].products[j].issueType1;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].products[j].issueType2)
                                        output += _data[i].products[j].issueType2;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].products[j].issueType3)
                                        output += _data[i].products[j].issueType3;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].reference_number)
                                        output += _data[i].reference_number;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].products[j].invoice_number)
                                        output += _data[i].products[j].invoice_number;
                                    else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].products[j].name){
                                        output += _data[i].products[j].name;
                                    }else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].products[j].product_code){
                                        output += _data[i].products[j].product_code;
                                    }else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].products[j].serial_number){
                                        output += _data[i].products[j].serial_number;
                                    }else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].products[j].category){
                                        output += _data[i].products[j].category;
                                    }else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].products[j].kW){
                                        output += _data[i].products[j].kW;
                                    }else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].products[j].pole){
                                        output += _data[i].products[j].pole;
                                    }else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].products[j].attachments && _data[i].products[j].attachments.length){
                                        for(let k=0;k< _data[i].products[j].attachments.length; k++){
                                            if(_data[i].products[j].attachments[k] !='undefined'){
                                                var quotesWrapped = '"\n' + _data[i].products[j].attachments[k].url + '"';
                                                output += quotesWrapped;
                                            }
                                        }
                                    }else
                                        output += 'N/A'
                                    output += ',';
                                    if (_data[i].attachments && _data[i].attachments.length){
                                        for(var k=0;k< _data[i].attachments.length; k++){
                                            if(_data[i].attachments[k] !='undefined'){
                                                var quotesWrapped = '"\n' + _data[i].attachments[k].url + '"';
                                                output += quotesWrapped;
                                            }
                                        }
                                    }else
                                        output += 'N/A'
                                    output += '\n';
                                }
                            }
                        }else{
                            if(_data[i].ticket_id){
                                slNo++;
                                output += slNo;
                                output += ',';
                                output += _data[i].ticket_id +'-0';
                                output += ',';
                                if (_data[i].created_date){
                                    function formatdate(date) {
                                        if (date == undefined || date == '')
                                            return ('')
                                        /* replace is used to ensure cross browser support*/
                                        var d = new Date(date.toString());
                                        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                                        var dt = d.getDate()
                                        if (dt < 10)
                                            dt = "0" + dt
                                        var dateOut = dt + "-" + monthNames[d.getMonth()] + "-" + (d.getFullYear())
                                        return dateOut;
                                    }
                                    var dateformat = formatdate(_data[i].created_date);
                                    output += dateformat;
                                    output += ',';
                                }
                                if (_data[i].issue)
                                    output += _data[i].issue;
                                else
                                    output += 'N/A'
                                output += ',';
                                if (_data[i].description)
                                    output += _data[i].description;
                                else
                                    output += 'N/A'
                                output += ',';
                                if (_data[i].status)
                                    output += _data[i].status;
                                else
                                    output += 'N/A'
                                output += ',';
                                if (_data[i].customer_name)
                                    output += _data[i].customer_name;
                                else
                                    output += 'N/A'
                                output += ',';
                                if (_data[i].customer_phone)
                                    output += _data[i].customer_phone;
                                else
                                    output += 'N/A'
                                output += ',';
                                if (_data[i].customer_email)
                                    output += _data[i].customer_email;
                                else
                                    output += 'N/A'
                                output += ',';
                                if (_data[i].endUserName)
                                    output += _data[i].endUserName;
                                else
                                    output += 'N/A'
                                output += ',';
                                if (_data[i].endUserPhone)
                                    output += _data[i].endUserPhone;
                                else
                                    output += 'N/A'
                                output += ',';
                                if (_data[i].endUserEmail)
                                    output += _data[i].endUserEmail;
                                else
                                    output += 'N/A'
                                output += ',';
                                try {
                                    if (_data[i].endUserAddress) {
                                        if ((_data[i].endUserAddress).toString().indexOf(',') != -1) {
                                            let quotesWrapped = '"' + _data[i].endUserAddress + '"'
                                            output += quotesWrapped
                                        }else
                                        output += _data[i].endUserAddress;
                                    }
                                    else
                                        output += 'N/A'
                                } catch (e) {
                                    console.log(e)
                                }
                                output += ',';
                                try {
                                    if (_data[i].endUserAlternateAddress) {
                                        if ((_data[i].endUserAlternateAddress).toString().indexOf(',') != -1) {
                                            let quotesWrapped = '"' + _data[i].endUserAlternateAddress + '"'
                                            output += quotesWrapped
                                        }else
                                        output += _data[i].endUserAlternateAddress;
                                    }
                                    else
                                        output += 'N/A'
                                } catch (e) {
                                    console.log(e)
                                }
                                output += ',';
                                if (_data[i].endUserCity)
                                    output += _data[i].endUserCity;
                                else
                                    output += 'N/A'
                                output += ',';
                                if (_data[i].products && !_data[i].products.length)
                                        output += 'N/A'
                                output += ',';
                                if (_data[i].products && !_data[i].products.length)
                                        output += 'N/A'
                                output += ',';
                                if (_data[i].products && !_data[i].products.length)
                                        output += 'N/A'
                                output += ',';
                                if (_data[i].reference_number)
                                    output += _data[i].reference_number;
                                else
                                    output += 'N/A'
                                output += ',';
                                if (_data[i].products && !_data[i].products.length)
                                        output += 'N/A'
                                output += ',';
                                if (_data[i].products && !_data[i].products.length)
                                        output += 'N/A'
                                output += ',';
                                if (_data[i].products && !_data[i].products.length)
                                        output += 'N/A'
                                output += ',';
                                if (_data[i].products && !_data[i].products.length)
                                        output += 'N/A'
                                output += ',';
                                if (_data[i].products && !_data[i].products.length)
                                        output += 'N/A'
                                output += ',';
                                if (_data[i].products && !_data[i].products.length)
                                        output += 'N/A'
                                output += ',';
                                if (_data[i].products && !_data[i].products.length)
                                        output += 'N/A'
                                output += ',';
                                if (_data[i].products && !_data[i].products.length)
                                        output += 'N/A'
                                output += ',';
                                if (_data[i].attachments && _data[i].attachments.length){
                                    for(var k=0;k< _data[i].attachments.length; k++){
                                        if(_data[i].attachments[k] !='undefined'){
                                            var quotesWrapped = '"\n' + _data[i].attachments[k].url + '"';
                                            output += quotesWrapped;
                                        }
                                    }
                                }else
                                    output += 'N/A'
                                output += '\n';
                            }
                        }
                    }
                    var blob = new Blob([output], {type : "text/csv;charset=UTF-8"});
                    console.log(blob);
                    window.URL = window.webkitURL || window.URL;
                    var url = window.URL.createObjectURL(blob);
                    var d = new Date();
                    var anchor = angular.element('<a/>');
                    anchor.attr({
                        href: url,
                        target: '_blank',
                        download: 'Mbj_' + instanceDetails.api_key + '_service_complaints_' +d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+'.csv'
                        //download: 'Mbj_' + '_Expense_' +d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+'.csv'
                    })[0].click();
                    stopLoader();
                })
                // .catch((error, status) => {
                //         console.log(error, status);
                //     if(status >= 400 && status < 404)
                //         $window.location.href = '/404';
                //     else if(status >= 500)
                //         $window.location.href = '/500';
                //     else
                //         $window.location.href = '/404';
                // });
            }
    })
    // .catch((error, status) => {
    //         console.log(error, status);
    //     if(status >= 400 && status < 404)
    //         $window.location.href = '/404';
    //     else if(status >= 500)
    //         $window.location.href = '/500';
    //     else
    //         $window.location.href = '/404';
    // });
};
    $scope.reloadTickets = (tab, refresh) => {
        // console.log('tab', tab, $scope.ticket_filters)
        if(tab == 'open')
            $location.path("/service/complaints/open")
        else if(tab == 'pending')
            $location.path("/service/complaints/pending")
        else if( tab == 'on-hold')
            $location.path("/service/complaints/on-hold")
        if(refresh){
            $scope.ticket_filters = {};
            $scope.ticket_filters.startDate = new Date();
            $scope.ticket_filters.startDate.setDate($scope.ticket_filters.startDate.getDate() - 15);
            $scope.ticket_filters.startDate.setHours(0, 0, 0, 0);
            $scope.ticket_filters.endDate = new Date();
            $scope.ticket_filters.endDate.setHours(23, 59, 59, 59);
        }
        if(tab)
            $scope.tab = tab;
        if($scope.ticket_filters.searchBy) $scope.showSearchFilter = true;
        $scope.viewLength = 0;
        $scope.newViewBy = 10;
        ticket_filters.viewBy = 0;
        $scope.tickets = [];
        loadTickets();
        loadTicketCount();
        loadSummary();
    }
    $scope.reloadTickets();
    $scope.clearSearchFilter = () => {
        $scope.ticket_filters.searchBy = '';
        $scope.showSearchFilter = false;
        $scope.reloadTickets();
    }
});