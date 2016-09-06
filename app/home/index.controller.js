(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller($window, UserService) {
        var vm = this;

        vm.user = null;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;

                if(user.hasSfdcAccessToken===false){ //set if empty user sfdcOauthInfo in users.controllers
                  $window.location = user.sfdcAuthCodeUrl;
                }
            });
        }
    }

})();
