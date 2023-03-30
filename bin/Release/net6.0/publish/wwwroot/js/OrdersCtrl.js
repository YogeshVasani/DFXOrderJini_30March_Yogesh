var app = angular.module('MyApp3', [])
    .controller('MyController3', function ($scope, $http, $window) {

        $scope.AddCart_SaveUpdate = function () {
            var student = {
                FirstName: $scope.selitem,
                LastName: $scope.Grade,
                Email: $scope.Density,
                Address: $scope.lblBundle,
                StudentID: $scope.Length
            }
            if ($scope.btnText == "Save") {
                var apiRoute = baseUrl + 'SaveStudent/';
                var saveStudent = CrudService.post(apiRoute, student);
                saveStudent.then(function (response) {
                    if (response.data != "") {
                        alert("Data Save Successfully");
                        $scope.Clear();
                    } else {
                        alert("Some error");
                    }
                }, function (error) {
                    console.log("Error: " + error);
                });
            }
        }  

    });