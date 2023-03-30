angular.module('ebs.controller')
    .controller("MeetingsReportCtrl", function ($scope, $http, Settings, $window) {
        console.log("Hello From Meetings Report Controller .... !!!!");
        //.... User details....
        $scope.user = {};
        //..... Pagination.....
        $scope.viewLength = 0;
        $scope.newViewBy = 10;
        //.... Other View Values....
        $scope.newViewBy1 = {};
        $scope.newViewBy1.view = 10;
        $scope.reportTabName = "Meetings";
        $scope.reportTabId = 8;
        $scope.tab = 8;
        $scope.showReports = true;
        $scope.meeting_count = 0;
        let localViewBy = $scope.newViewBy;
        let initialViewBy = 60;
        let instanceDetails =  Settings.getInstance();
        const api_timeout = 600000;
        //.... Reports Filter.....
        $scope.mtgreport = {};
        //.... Set Filter Dates to last 7 days....
        $scope.mtgreport.startDate = new Date();
        $scope.mtgreport.startDate.setDate($scope.mtgreport.startDate.getDate() - 7);
        $scope.mtgreport.startDate.setHours(0, 0, 0, 0);
        $scope.mtgreport.endDate = new Date();
        $scope.mtgreport.endDate.setHours(23, 59, 59, 59);
        $scope.meetingsReportSearch = {};
        $scope.meetingsReportSearch.filter = '';
        let meetingSearchObj = {};
        let topDealerSearchBy = ['dealername','sellername'];
        $scope.meetingreport = [];
        $scope.meetingDuration = Settings.daysDifference($scope.mtgreport.startDate , $scope.mtgreport.endDate);
        $scope.parseData = (viewLength, newViewBy) => parseInt(viewLength) + parseInt(newViewBy);
        $scope.DateTimeFormat = (date, when) => Settings.dateFilterFormat(date, when);
        $scope.openFilterClear = () => {
            $scope.mtgreport.startDate = '';
            $scope.mtgreport.endDate = '';
            $scope.mtgreport.startDate = new Date();
            $scope.mtgreport.startDate.setDate($scope.mtgreport.startDate.getDate() - 7);
            $scope.mtgreport.startDate.setHours(0, 0, 0, 0);
            $scope.mtgreport.endDate = new Date();
            $scope.mtgreport.endDate.setHours(23, 59, 59, 59);
        };
        $scope.clearFilter = () => {
            //.... Meetings Report...
            meetingSearchObj.viewLength = 0;
            meetingSearchObj.viewBy = initialViewBy;
            $scope.viewLength = 0;
            $scope.newViewBy = localViewBy;
            if($scope.meetingsReportSearch.filter){
                meetingSearchObj.searchFor = $scope.meetingsReportSearch.filter;
                meetingSearchObj.searchBy = topDealerSearchBy;
            }
            $scope.meetingreport = [];
            $scope.showMeetingFilter = true;
            if($scope.meetingsReportSearch.filter == '')
                $scope.showMeetingFilter = false;
            $scope.changeReportView();
        }
        const startLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "inline");
        }
        const stopLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "none");
        }
        const loadReport = (meetingSearchObj) => {
            $http.post("/dash/reports/meeting", meetingSearchObj)
                .success(function(response){
                    for(let i = 0; i < response.length; i++){
                        $scope.meetingreport.push(response[i]);
                    }
                    stopLoader();
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
        const loadReportCount = (meetingSearchObj) => {
            $http.post("/dash/reports/meeting/count", meetingSearchObj)
                .success($scope.reportsTransactionCount)
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
        $scope.navPage = (direction, newViewBy) => {
            $scope.newViewBy = parseInt(newViewBy);
            var viewLength = $scope.viewLength;
            var viewBy = $scope.newViewBy;
            if(direction){
                // console.log("NEXT");
                if(viewLength + viewBy >= $scope.meetingreport.length){
                    if(viewLength + viewBy < $scope.meeting_count){
                        viewLength += viewBy;
                        //console.log("Fetch more")
                        meetingSearchObj.viewLength = viewLength;
                        if($scope.newViewBy > initialViewBy ){
                            meetingSearchObj.viewBy = $scope.newViewBy;
                        }else{
                            meetingSearchObj.viewBy = initialViewBy;
                        }
                        meetingSearchObj.sDate = $scope.DateTimeFormat($scope.mtgreport.startDate, 'start');
                        meetingSearchObj.eDate = $scope.DateTimeFormat($scope.mtgreport.endDate, 'end');
                        meetingSearchObj.searchFor = $scope.meetingsReportSearch.filter;
                        meetingSearchObj.searchBy = topDealerSearchBy;
                        startLoader();
                        loadReport(meetingSearchObj);
                        if(viewLength + viewBy > $scope.meeting_count){
                            a = viewLength + viewBy - $scope.meeting_count;
                            viewBy -= a;
                            $scope.newViewBy = viewBy;
                        }
                        $scope.viewLength = viewLength;
                    }
                    else{
                        // console.log("Out of data")
                        if(viewLength + viewBy > $scope.meeting_count){
                            a = viewLength + viewBy - $scope.meeting_count;
                            viewBy -= a;
                            $scope.newViewBy = viewBy;
                        }
                    }
                }
                else{
                    // console.log("Minus viewby")
                    viewLength += viewBy;
                    if(viewLength + viewBy > $scope.meeting_count){
                        a = viewLength + viewBy - $scope.meeting_count;
                        viewBy -= a;
                        if(viewLength + viewBy > $scope.meetingreport.length){
                            meetingSearchObj.viewLength =  $scope.meetingreport.length;
                            meetingSearchObj.viewBy = viewLength + viewBy - $scope.meetingreport.length;
                            meetingSearchObj.sDate = $scope.DateTimeFormat($scope.mtgreport.startDate, 'start');
                            meetingSearchObj.eDate = $scope.DateTimeFormat($scope.mtgreport.endDate, 'end');
                            meetingSearchObj.searchFor = $scope.meetingsReportSearch.filter;
                            meetingSearchObj.searchBy = topDealerSearchBy;
                            startLoader();
                            loadReport(meetingSearchObj);
                        }
                    }else{
                        if(viewLength + viewBy > $scope.meetingreport.length){
                            meetingSearchObj.viewLength =  $scope.meetingreport.length;
                            meetingSearchObj.viewBy = viewLength + viewBy - $scope.meetingreport.length;
                            meetingSearchObj.sDate = $scope.DateTimeFormat($scope.mtgreport.startDate, 'start');
                            meetingSearchObj.eDate = $scope.DateTimeFormat($scope.mtgreport.endDate, 'end');
                            meetingSearchObj.searchFor = $scope.meetingsReportSearch.filter;
                            meetingSearchObj.searchBy = topDealerSearchBy;
                            startLoader();
                            loadReport(meetingSearchObj);
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
                    if(viewLength + viewBy >= $scope.meeting_count){
                        viewBy += a;
                        a = 0;
                    }
                    viewLength -= viewBy;
                    $scope.viewLength = viewLength;
                    $scope.newViewBy = viewBy;
                }
            }
        }
        $scope.changeReportView = (newViewBy) => {
            startLoader();
            $scope.newViewBy1.view = newViewBy;
            $scope.newViewBy = parseInt(newViewBy);
            //$scope.reportTabName = $scope.nav[18].tab;
            if($scope.mtgreport.startDate && $scope.mtgreport.endDate){
                if (($scope.mtgreport.startDate - $scope.mtgreport.endDate) > 0){
                    Settings.alertPopup("WARNING", "Start date cannot be greater than End date.");
                    $scope.mtgreport.startDate = new Date();
                    $scope.mtgreport.startDate.setDate($scope.mtgreport.startDate.getDate() - 30);
                    $scope.mtgreport.startDate.setHours(0, 0, 0, 0);
                    $scope.mtgreport.endDate = new Date();
                    $scope.mtgreport.endDate.setHours(23, 59, 59, 59);
                }
            }
            meetingSearchObj.viewLength = 0;
            if($scope.newViewBy > initialViewBy ){
                meetingSearchObj.viewBy = $scope.newViewBy;
            }else{
                meetingSearchObj.viewBy = initialViewBy;
            }
            meetingSearchObj.sDate = $scope.DateTimeFormat($scope.mtgreport.startDate, 'start');
            meetingSearchObj.eDate = $scope.DateTimeFormat($scope.mtgreport.endDate, 'end');
            meetingSearchObj.searchFor = $scope.meetingsReportSearch.filter;
            meetingSearchObj.searchBy = topDealerSearchBy;
            $scope.viewLength = 0;
            $scope.meetingreport = [];
            if(!newViewBy){
                $scope.newViewBy = parseInt(localViewBy);
            }
            startLoader();
            loadReport(meetingSearchObj);
            loadReportCount(meetingSearchObj);
        }
        $scope.changeReportDuration = (startDate, endDate, reset) =>{
            if (endDate)
                endDate.setHours(23, 59, 59, 59);
            if (!reset) {
                if (startDate || endDate) {
                    if (startDate && endDate) {
                        var d1 = moment(startDate);
                        var d2 = moment(endDate);
                        var numberOfDays = moment.duration(d2.diff(d1)).asDays();
                    }
                    else if (!endDate) {
                        var d1 = moment(startDate);
                        var d2 = moment(new Date());
                        var meetingDuration = moment.duration(d2.diff(d1)).asDays();
                    }
                    else
                        var meetingDuration = 0;
                }
            }
        }
        $scope.reportsTransactionCount = (response) => {
            if(response){
                if(response > $scope.newViewBy){
                    $scope.meeting_count = response;
                }
                else if(response <= $scope.newViewBy){
                    $scope.meeting_count = response;
                    $scope.newViewBy = response;
                }
                else{
                    $scope.meetingreport = [];
                    $scope.newViewBy = 1;
                    $scope.meeting_count = 0;
                    $scope.viewLength = -1;
                }
            }
            else{
                $scope.meetingreport = [];
                $scope.newViewBy = 1;
                $scope.meeting_count = 0;
                $scope.viewLength = -1;
            }
        }
        $scope.downloadCSV = function(){
            startLoader();
            var request_object = {
                url : "/dash/reports/meeting/count",
                method : "POST",
                timeout : api_timeout,
                data : meetingSearchObj
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
                console.log(meetingSearchObj);
                meetingSearchObj.viewLength = 0;
                meetingSearchObj.viewBy = count.data;
                var request_object = {
                    url : "/dash/reports/meeting",
                    method : "POST",
                    timeout : api_timeout,
                    data : meetingSearchObj
                };
                $http(request_object)
                    .then((result) => {
                    let _data = result.data;
                console.log(result.data);
                var output = 'id,Meeting ID,Date Added,Time,Dealercode,Dealername,Dealerphone,Salesperson No.,Salesperson,Stockist_Name,Stockist_Area,Item,Comment,Rating,Type,Date,Address,Latitude,Longitude';
                output += '\n'
                for (var i = 0; i < _data.length; i++) {
                    for(var j = 0; j < _data[i].medicine.length; j++){
                    output += i + 1;
                    output += ',';
                    output += _data[i].orderId;
                    output += ',';
                    function formatdate(date) {
                        if (!date)
                            return ('');
                        /* replace is used to ensure cross browser support*/
                        var d = new Date(date.toString().replace("-", "/").replace("-", "/"));
                        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        var dt = d.getDate();
                        if (dt < 10)
                            dt = "0" + dt;
                        return (dt + "-" + monthNames[d.getMonth()] + "-" + (d.getFullYear()));
                    }
                    var dateformat = formatdate(_data[i].date_added[j]);
                    output += dateformat;
                    output += ',';
                    if (_data[i].date_added)
                        function formattime(date) {
                            if (date == undefined || date == '')
                                return ('');
                            var d = new Date(date.toString().replace("-", "/").replace("-", "/"));
                            var dt = d.getDate();
                            if (dt < 10)
                                dt = "0" + dt;
                            return (d.getHours()) + ":" + (d.getMinutes());
                        }
                    var dateformat = formattime(_data[i].date_added[i]);
                    output += dateformat;
                    output += ',';
                    output += _data[i].dealercode;
                    output += ',';
                    try {
                        if (_data[i].dealername) {
                            if (_data[i].dealername) {
                                if ((_data[i].dealername).toString().indexOf(',') != -1) {
                                    var quotesWrapped = '"' + _data[i].dealername + '"'
                                    _data[i].dealername = quotesWrapped
                                }
                                output += _data[i].dealername;
                            }
                        }
                    } catch (e) {
                    }
                    output += ',';
                    if (_data[i].dealerphone)
                        output += _data[i].dealerphone;
                    output += ',';
                    if (_data[i].seller)
                        output += _data[i].seller;
                    output += ',';
                    try {
                        if (_data[i].sellername) {
                            if ((_data[i].sellername).toString().indexOf(',') != -1) {
                                var quotesWrapped = '"' + _data[i].sellername + '"';
                                _data[i].sellername = quotesWrapped
                            }
                        }
                        output += _data[i].sellername;
                    } catch (e) {
                    }
                    output += ',';
                    if (_data[i].stockistname)
                        output += _data[i].stockistname;
                    output += ',';
                    if (_data[i].stockistarea)
                        output += _data[i].stockistarea;
                    output += ',';
                    //output += _data[i].medicine;
                      output += _data[i].medicine[j];
                    output += ',';
                    var comment = '';
                    try {
                        comment = _data[i].comment[(_data[i].comment.length) - 1].comment;
                        if (comment) {
                            if ((comment).toString().indexOf(',') != -1) {
                                var quotesWrapped = '"' + comment + '"';
                                comment = quotesWrapped
                            }
                        }
                        if (comment == undefined) {
                            comment = ''
                        }
                        output += comment;
                    } catch (e) {
                    }
                    output += ',';
                    if (_data[i].rating)
                        output += _data[i].rating;
                    output += ',';
                    if (_data[i].type)
                        output += _data[i].type;
                    output += ',';
                    function formatdate(date) {
                        if (!date)
                            return ('');
                        /* replace is used to ensure cross browser support*/
                        var d = new Date(date.toString().replace("-", "/").replace("-", "/"));
                        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                        var dt = d.getDate()
                        if (dt < 10)
                            dt = "0" + dt;
                        return (dt + "-" + monthNames[d.getMonth()] + "-" + (d.getFullYear()));
                    }
                    var dateformat = formatdate(_data[i].date);
                    output += dateformat;
                    output += ',';
                    try {
                        if (_data[i].Address) {
                            if ((_data[i].Address).toString().indexOf(',') != -1) {
                                quotesWrapped = '"' + _data[i].Address + '"'
                                _data[i].Address = quotesWrapped
                            }
                            output += _data[i].Address;
                        }
                    } catch (e) {
                        console.log(e)
                    }
                    output += ',';
                    if (_data[i].latitude != 'undefined')
                        output += _data[i].latitude;
                    output += ',';
                    if (_data[i].longitude != 'undefined')
                        output += _data[i].longitude;
                    output += '\n';
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
                    download: 'Mbj_' + instanceDetails.api_key + '_Meetings_' +d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+'.csv'
                    //download: 'Mbj_' + '_Meetings_' +d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+'.csv'
                })[0].click();
                stopLoader();
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
        $scope.changeReportView(localViewBy);
    })