angular.module('ebs.controller')
.controller("TicketDetailsCtrl", function ($scope, $http, Settings, $routeParams, $window, $timeout) {
    console.log("Hello From Ticket Details Controller .... !!!!");
    //.... Ticket information....
    $scope.ticket = {};
    $scope.ticket_update = {};
    let todayDate = new Date();
    $scope.checkDueDate = function(due_date){
        if(due_date)
            due_date.setHours(23, 59, 59, 59)
        if(due_date && todayDate > due_date){
            Settings.failurePopup(
                'WARNING',
                'Please select future date.'
            )
            $scope.ticket_update.due_date = todayDate;
        }
    }
    //... List of users...
    $scope.users = [];
    Settings.getUserInfo(user_details => {
        if(user_details)
            $scope.user_details = user_details;
    })
    //.... Ticket ID from the params...
    const ticket_id =  $routeParams.id;
    const startLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "inline");
    }
    const stopLoader = () => {
        jQuery.noConflict();
        $('.refresh').css("display", "none");
    }
    Settings.getNav((nav) => {
        $scope.nav = nav;
        $scope.userRole = $scope.nav[4].roles ? $scope.nav[4].roles: [];
    });
    console.log("Ticket Details for - ", ticket_id);
    $scope.tab = 'open';
    ///..... Function to fetch ticket details....
    const getTicketDetails = () => {
        startLoader();
        if(ticket_id){
            $http.get("/dash/services/ticket/details/" + ticket_id)
                .then((ticket_details) => {
                    stopLoader();
                    if(ticket_details.data && !ticket_details.data.status){
                        if(ticket_details.data[0].resolution && ticket_details.data[0].resolution.length){
                            $scope.tab = ((ticket_details.data[0].status == 'Registered') || (ticket_details.data[0].status == 'New')) ? 'pending' : (((ticket_details.data[0].status == 'Completed') || (ticket_details.data[0].status == 'On-Hold')) ? 'on-hold' : 'open')
                            // for(let i = 0; i < ticket_details.data[0].resolution.length; i++){
                            //     for(let j = 0; j < $scope.allUsers.length; j++){
                            //         if(ticket_details.data[0].resolution[i].added_by == $scope.allUsers[j]._id){
                            //             ticket_details.data[0].resolution[i].user_details = $scope.allUsers[j];
                            //         }
                            //     }
                            // }
                        }
                        $scope.ticket = ticket_details.data[0];
                        if(ticket_details.data[0].assigned_to && ticket_details.data[0].assigned_to._id) {
                            $timeout(function() {
                                $scope.ticket_update.assigned_to = ticket_details.data[0].assigned_to._id;
                            }, 1000);
                        }
                        if(ticket_details.data[0].priority) $scope.ticket_update.priority = ticket_details.data[0].priority;
                        if(ticket_details.data[0].due_date) $scope.ticket_update.due_date = new Date(ticket_details.data[0].due_date);
                        if(ticket_details.data[0].status) $scope.ticket_update.status = ticket_details.data[0].status
                        else $scope.ticket_update.status = "New";
                    }
                })
                .catch((error, status) => {
                    if (status >= 400 && status < 404)
                        $window.location.href = '/404';
                    else if (status >= 500)
                        $window.location.href = '/500';
                    else
                        $window.location.href = '/404';
                });
        }else stopLoader();
    };
    $scope.getResolutionUserNames = function(id){
        let name = '';
        if($scope.ticket && $scope.ticket.resolutionUsers && $scope.ticket.resolutionUsers.length){
            $scope.ticket.resolutionUsers.map(a=> {
                if(a._id === id ){
                    name = a.sellername;
                }
            })
        }
        if(name)
            return name;
        else
            return '';
    }
    //.... Function to get all users...
    const getUsers = () => {
        $http.post("/dash/users/list", {"appType": 'serviceComplaints'})
            .then((users) => {
                if(users.data && users.data.length){
                    $scope.users = users.data.filter(user=> (user.role != 'Dealer'));
                }
            })
            .catch((error, status) => {
                if (status >= 400 && status < 404)
                    $window.location.href = '/404';
                else if (status >= 500)
                    $window.location.href = '/500';
                else
                    $window.location.href = '/404';
            });
    }
    $scope.goBack = () => $window.history.back();
    $scope.updateTicketResolution = function() {
        startLoader();
        $http.put("/dash/services/update/ticket/resolution/" + ticket_id, $scope.ticket_update)
            .then((updated_ticket) => {
                stopLoader();
                // console.log('updated ticket',updated_ticket)
                if(updated_ticket.data && updated_ticket.data.status != "error"){
                    Settings.success_toast("Success", "Ticket Resolution Updated");
                    $scope.ticket_update.resolution = "";
                    getTicketDetails();
                }
            })
    }
    //... Update the ticket details...
    $scope.updateTicket = () => {
        // console.log($scope.ticket_update.status,  $scope.ticket.status, $scope.ticket_update);
        startLoader()
        $scope.ticket_update.regalStatus = false;
        if($scope.nav.length && $scope.nav[25] && $scope.nav[25].activated == true)
            $scope.ticket_update.regalStatus = $scope.nav[25].activated;
        if($scope.ticket_update.assigned_to){
            let user = $scope.users.find(u=> u._id === $scope.ticket_update.assigned_to)
            if(user._id)
            $scope.ticket_update.assigned_toObj = user
        }
        $http.put("/dash/services/update/ticket/details/" + ticket_id, $scope.ticket_update)
            .then((updated_ticket) => {
                stopLoader();
                if(updated_ticket.data && updated_ticket.data.status != "error"){
                    Settings.success_toast("Success", "Ticket Resoltion Updated");
                    $scope.ticket_update.resolution = "";
                    getTicketDetails();
                    $scope.goBack();
                }
            })
    }
    $scope.regalStatus =[];
    const getSettingTypes = (typeName) => {
        startLoader();
        $http.get("/dash/settings/service/regal/types/"+typeName)
            .then(types => {
                console.log(types)
                if(types.data && types.data.type == "regalStatus"){
                    $scope.regalStatus = types.data.status;
                }
                stopLoader();
            })
            .catch((error, status) => {
                if (status >= 400 && status < 404)
                    $window.location.href = '/404';
                else if (status >= 500)
                    $window.location.href = '/500';
                else
                    $window.location.href = '/404';
            });
    }
    if($scope.nav[25] && $scope.nav[25].activated){
        getSettingTypes("regalStatus")
    }
    getUsers();
    getTicketDetails();
});