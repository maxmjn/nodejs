(function() {

  // setup app and pass ui.bootstrap as dep
  var myApp = angular.module("app");

  // define factory for data source
  myApp.factory("States", function(){
    var states = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Dakota", "North Carolina", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
    var s2 = [{"name":"Virginia", "sym":"VA"},
             {"name":"Washington", "sym":"WA"}
             ]
    return s2;

  });

  // setup controller and pass data source
  myApp.controller("TypeaheadCtrl", function($scope, States, UserSfdcService) {

    var vm = this;

  	$scope.selected = undefined;

  	$scope.states = States;

    $scope.submit = function () {
        $scope.myTxt = "You selected!" + $scope.selected;
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
