angular.module('ebs.controller')
.controller("ProfileDetailsCtrl", function ($scope, $filter, $http, Settings, $modal, $window) {
    console.log("Hello From Profile Details Controller .... !!!!");
    $scope.user = {};
    Settings.getUserInfo((user_details) => {
        console.log(user_details);
        if(user_details.sellerObject)
            $scope.user = user_details.sellerObject;
        else
            $scope.user = user_details;
    });
    $scope.formatDate = date => {
        if(date){
            let a = date.toString();
            let b = a.replace(/-/g, "/");
            return new Date(b);
        }else return date;
    }
});