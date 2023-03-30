/**
 * Created by shreyasgombi on 30/07/22.
 */
angular.module('ebs.controller')
    .controller("AdminLoginCtrl", function($scope, $location, $http, $window, Settings){
        console.log("Hello From Admin Settings Login Controller .... !!!!");
        $scope.login = {};
        $scope.login.password = '';
        const startLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "inline");
        };
        const stopLoader = () => {
            jQuery.noConflict();
            $('.refresh').css("display", "none");
        }
        if(Settings.getSuperAdminLogin()) $location.path('/setting/admin/home');
        $scope.authenticate = () => {
            if($scope.login.password){
                startLoader();
                $http.post("/super/admin", $scope.login)
                    .then((response) => {
                        stopLoader();
                        if(response.data && response.data.status == 'success'){
                            Settings.setSuperAdminLogin();
                            $location.path("/setting/admin/home");
                        }else{
                            Settings.fail_toast("Error", "Incorrect Password / Could not log you in!");
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
            } else Settings.fail_toast("Error", "Enter the super admin password");
        }
        startLoader();
        setTimeout(() => {
            stopLoader();
        }, 1000)
    });