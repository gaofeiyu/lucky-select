//出生年份扩展示例
LuckyUI.directive("yearSelect", ["$timeout", function () {
    return {
        replace: true,
        scope: {value: "=", error: "=", name: "@"},
        template: '<span><selector name="出生年份" value="year" error="error" require="1" default="1988" options="year_options" ></selector></span>',
        restrict: "EA",
        link: function (scope, element, attr) {
            function getDate(val) {
                for (var minYear = val || 1949, yearArr = [], maxYear = (new Date).getFullYear(), i = maxYear; i >= minYear; i--){
                    yearArr.push({
                        name: i,
                        id: i
                    });
                }
                return yearArr
            }
            function getYear(val) {
                if (val > 0) {
                    var sDate = new Date(val, 1, 1);
                    return Math.round(sDate.getTime())
                }
                return Number.MAX_VALUE
            }

            scope.require = attr.require || "";
            scope.year = null;
            if("number" == typeof scope.value){
                scope.year = new Date(scope.value,1,1).getFullYear();
            };
            scope.year_options = getDate();
            scope.$watch(function () {
                return scope.year
            }, function () {
                scope.value = getYear(scope.year)
            })
        }
    }
}])
//年月选择扩展示例
LuckyUI.directive("datePicker", ["doubleSelectorPopup", function (doubleSP) {
    return {
        replace: true,
        scope: {value: "=", error: "=", hide: "=", name: "@", require: "@"},
        template: '<span class="selector" ng-click="selectTime();">{{time1}}</span>',
        restrict: "E",
        controller: ["$scope", "$element", function ($scope) {
            function c(a, b) {
                for (var c = b || 1949, d = [], e = (new Date).getFullYear(), f = e; f >= c; f--)d.push({
                    name: f,
                    id: f
                });
                return a && d.unshift({ name: "至今", id: -1 }), d
            }

            function d(a, c) {
                var d = (new Date).getFullYear(), e = d == a, f = 1;
                c && a == $scope.value.start[0] && (f = $scope.value.start[1]);
                for (var g = [], h = e ? (new Date).getMonth() + 1 : 12, i = f; h >= i; i++)g.push({
                    name: i,
                    id: i
                });
                return g
            }

            function e(a, b) {
                return a && -1 == a[0] ? "至今" : a && a[0] > 0 ? a[0] + "年" + a[1] + "月" : b
            }

            function f() {
                $scope.$watch(function () {
                    return JSON.stringify([$scope.value, $scope.hide])
                }, function () {
                    $scope.time1 = e($scope.value ? $scope.value : [0, 0], "请填写"), g()
                })
            }

            function g() {
                var a = $scope.name, c = {status: !1, desc: ""}, d = parseInt($scope.require, 10);
                if ($scope.hide); else if ($scope.value && $scope.value.start) {
                    var e = [!$scope.value.start || 0 == $scope.value.start[0], !$scope.value.end || 0 == $scope.value.end[0]];
                    d && e[0] && e[1] ? c = {status: true, desc: "请填写" + a} : (e[0] || e[1]) && (c = {
                        status: true,
                        desc: "请填写完整的" + a
                    })
                } else d && (c = {status: true, desc: "请填写" + a});
                $scope.error && ($scope.error[a] = c)
            }

            $scope.value = $scope.value || {}, $scope.selectTime = function () {
                doubleSP.show({
                    title: "出生年月", initData: function () {
                        return $scope.value ? 0 == $scope.value[0] ? [1988, 0] : $scope.value : [1988, 0]
                    }(), getRightListData: function (a) {
                        return d(a)
                    }, data: c()
                }).then(function (a) {
                    $scope.value = a;
                })
            };
            f()
        }]
    }
}]);

//地点联动扩展示例
LuckyUI.directive("locationSelector", ["doubleSelectorPopup", function (doubleSP) {
    return {
        replace: true,
        scope: {name: "@", pid: "=", cid: "=", error: "=", require: "@",readonly:"@"},
        template: '<span class="selector" ng-click="click();">{{str}}</span>',
        restrict: "E",
        controller: ["$scope", "$element", function ($scope) {
            var that = this;
            var defaultOption = "请选择";
            if ($scope.readonly) {
                defaultOption = "";
            }
            this.getLocationName = function (pid, cid, cityObj) {
                function e(a) {
                    return $.inArray(parseInt(a, 10), [1001, 1002, 1003, 1004, 2028, 2029, 2030,2099]) >= 0
                }
                function f(a, b, c, d) {
                    return d
                }
                var g = cityObj || defaultOption;
                return 0 == pid ? g : ($.each(city, function (b, d) {
                    if (d.id == pid) {
                        if (e(pid)) return void (g = d.name);
                        $.each(d.data, function (b, e) {
                            e.id == cid && (g = f(pid, d.name, cid, e.name))
                        })
                    }
                }), g)
            }

            function e(a, b) {
                return that.getLocationName(a, b)
            }

            function f() {
                var a = $scope.name, b = {status: !1, desc: ""};
                return parseInt($scope.require, 10) && 0 == $scope.pid && (b.status = true, b.desc = "请选择" + a), b
            }

            var g = city;
            $scope.pid = $scope.pid || 0;
            $scope.cid = $scope.cid || 0;
            $scope.str = e($scope.pid, $scope.cid);
            if (!$scope.readonly) {
                $scope.click = function () {
                    doubleSP.show({ title: $scope.name, initData: [$scope.pid, $scope.cid], data: g }).then(function (a) {
                        $scope.pid = a[0], $scope.cid = a[1]
                    })
                };
            }
            $scope.$watch(function () {
                return $scope.pid + "-" + $scope.cid
            }, function () {
                $scope.str = e($scope.pid, $scope.cid), $scope.error && ($scope.error[$scope.name] = f())
            })
        }]
    }
}])