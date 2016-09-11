(function () {

    // setup app and pass ui.bootstrap as dep
    var myApp = angular.module('app');

    // define factory for data source
    myApp.factory('States', function (UserSfdcService) {

        var values =[];
        var getValues = function () {
          return values;
        };
        UserSfdcService.test('Account', '')
            .then(function (results) {
                values = results;
            });
        return {
            getValues: getValues
        };

    });

    // setup controller and pass data source
    myApp.controller('TypeaheadCtrl', function ($scope, States, UserSfdcService) {

        $scope.selected = undefined;

        $scope.states = States.getValues;

        $scope.submit = function () {
            $scope.myTxt = "You selected!" + $scope.selected;
            $scope.myTxt2 = States.getValues();
            service();
        }

        function service() {
            // get search results
            UserSfdcService.GetByUsername($scope.selected).then(function (results) {
                $scope.sfdcSearchResult = results.searchRecords;
            });
        }

    });

})();
