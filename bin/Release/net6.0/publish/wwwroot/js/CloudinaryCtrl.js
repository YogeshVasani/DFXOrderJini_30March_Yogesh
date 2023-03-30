/**
 * Created by shreyasgombi on 29/07/22.
 */
 angular.module('ebs.controller')
    .controller("CloudinaryCtrl", function($scope, $routeParams, $http, $window, Settings){
        console.log("Hello From Cloudinary Settings Controller .... !!!!");
        /*............................................
                    Cloudianry Integration Setup
         ........................................... */
        $scope.cloudinary = {};
        $scope.cloudinary_stats = {};
        const initialiseCredentials = () => {
            $scope.cloudinary = {};
            $http.get("/dash/settings/details/cloudinary")
                .then(cloudinary => {
                    if(cloudinary.data){
                        console.log(cloudinary.data);
                        $scope.cloudinary = cloudinary.data;
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
            $http.get("/dash/settings/cloudinary/stats")
                .then(cloudinary => {
                    if(cloudinary.data){
                        console.log(cloudinary.data);
                        $scope.cloudinary_stats = cloudinary.data;
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
        }
         $scope.updateCloudinary = function(){
            //console.log($scope.cloudinary)
            if($scope.cloudinary.cloudinary_api && $scope.cloudinary.cloudinary_cloud &&$scope.cloudinary.cloudinary_secretapi){
                $http.post("/dash/settings/cloudinary/creds/update", $scope.cloudinary)
                    .then((response) => {
                        if(response.data && response.data.status == 'success')
                            Settings.successPopup("SUCCESS", "Cloudinary has been setup!");
                        else
                            Settings.failurePopup("ERROR", "Could not update cloudianry");
                        initialiseCredentials();  
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
            }else{
                Settings.fail_toast("Error", "Enter all mandatory details");
            }
        };
        $scope.deleteCloudinaryCreds = function(){
            Settings.confirmPopup("Confirm", "Are you sure you want to drop credentials?\nPlease Note : Image Uploads might stop working.", (result) => {
                if (result) {
                    $http.delete("/dash/settings/cloudinary/creds/delete", $scope.shopify)
                        .then((response) => {
                            if(response.data && response.data.status == 'success'){
                                Settings.successPopup("SUCCESS", "Cloudinary setup has been disabled!");
                                initialiseCredentials();
                            }
                            else
                                Settings.failurePopup("ERROR", "Could not drop cloudianry creds");
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
                }
            })
        };
        initialiseCredentials();
    })