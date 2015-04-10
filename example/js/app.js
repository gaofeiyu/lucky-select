var exampleApp = angular.module('exampleApp', [
    'lucky.ui'
]);
exampleApp.controller('example', ['$scope', function ($scope) {
    //数据初始化
    $scope.value = {};
    $scope.value.sex = 0;
    $scope.value.year = 1998;

    $scope.sex = [
        {
            id: 0,
            name: "男"
        },
        {
            id: 1,
            name: "女"
        }
    ];
    $scope.born = [1991,1];
}]);