/**
 * Created by shreyasgombi on 05/07/22.
 */
 angular.module('ebs.controller')
 .controller("SettingsCtrl", function($scope, $routeParams, $http, $window, Settings){
     console.log("Hello From Settings Controller .... !!!!");
     $scope.view = {"integrations" : false};
     if($routeParams.tab && $routeParams.tab == 'integrations') $scope.view.integrations = true;
 });