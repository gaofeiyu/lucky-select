/*
 overlay
 singleSelectorPopup        单级指令      rely overlay
 doubleSelectorPopup        两级联动指令  rely overlay
 selector                   单级指令扩展  rely singleSelectorPopup string
 */

var LuckyUI = angular.module("lucky.ui",[]);
//遮罩指令
LuckyUI.service("overlay", ["$rootScope", function ($rootScope) {
    var that = this;
    this.layer = 0;
    var objArr = [];
    this.show = function (obj) {
        this.layer++;
        objArr.push(obj);
        $rootScope.$broadcast("overlay-add");
    };
    this.hide = function () {
        that.layer--;
        objArr.pop();
        $rootScope.$broadcast("overlay-remove");
    };
    this.clear = function () {
        this.layer = 0;
        objArr = [];
        $rootScope.$broadcast("overlay-remove");
    };
    this._doClick = function () {
        var obj = objArr.pop();
        "function" == typeof obj && (objArr.push(obj), obj())
    }
}]).directive("overlay", ["overlay", "$timeout", function (overlay) {
    return {
        replace: true,
        scope: true,
        template: '<div id="overlay"  ng-click="bindClick();"></div>',
        restrict: "EA",
        link: function (scope, element) {
            scope.$on("overlay-add", function () {
                overlay.layer > 0 && (element.css("display", "block"), setTimeout(function () {
                    element.addClass("show")
                }, 10)), scope.bindClick = function () {
                    overlay._doClick()
                }
            });
            scope.$on("overlay-remove", function () {
                scope.click = overlay._doClick;
                if (overlay.layer == 0) {
                    element.removeClass("show");
                    setTimeout(function () {
                        element.css("display", "none");
                    }, 100)
                }
            });
            element.on("touchmove", function (e) {
                e.preventDefault()
            })
        }
    }
}]);
//单级选择基础指令
LuckyUI.service("singleSelectorPopup", ["$rootScope", "$q", "overlay", "$timeout", function ($rootScope, $q, overlay, $timeout) {
    function hideObj() {
        overlay.hide(), that.shown = 0, $rootScope.$broadcast("single-hide")
    }

    var deferred, that = this;
    this.shown = 0;
    this.opts = null;
    this.show = function (val) {
        deferred = $q.defer();
        overlay.show(that.hide);
        that.shown = 1;
        that.opts = $.extend({
            title: "单栏选择器",
            initData: null,
            data: []
        }, val);
        $rootScope.$broadcast("single-show");
        return deferred.promise;
    };
    this.hide = function () {
        that.onCancel()
    };
    this.onConfirm = function (data) {
        deferred && that.shown && (hideObj(), $timeout(function () {
            deferred.resolve(data)
        }))
    };
    this.onCancel = function (reason) {
        deferred && that.shown && (hideObj(), $timeout(function () {
            deferred.reject(reason)
        }))
    }
}]).directive("singleSelectorPopup", ["singleSelectorPopup", "$timeout", function (singleSP, $timeout) {
    return {
        replace: true,
        scope: true,
        template:''+
            '<div id="single-selector" class="popup" ng-show="show">' +
                '<header class="popup-header">' +
                    '<button class="blue fr" ng-click="_onConfirm();">完成</button>' +
                    '<button class="fl" ng-click="_onCancel();">取消</button>' +
                    '<div class="con">{{opts.title}}</div>' +
                '</header>' +
                '<div class="single selector-body single_selector_body">' +
                '<div class="reticle"></div>' +
                    '<ul class="level-1">' +
                    '<li ng-repeat="item in opts.data" ng-class="{\'active\':$index==0}" data-id="{{item.id}}" data-index="$index">{{item.name}}</li>' +
                    '</ul>' +
                '</div>' +
            '</div>',
        restrict: "EA",
        controller: ["$scope", "$element", function ($scope, $element) {
            function jumpTo(objList, h, state) {
                var maxHeight = -(objList.height() - 40);
                if(!state && maxHeight > h){
                    h = (h + maxHeight) / 2;
                }
                if(!state && h > 0){
                    h /= 2;
                }
                objList.data("offset", h).css({"-webkit-transform": "translateY(" + h + "px)","transform": "translateY(" + h + "px)"});
                return;
            }

            function getOffset(element) {
                return element.data("offset")
            }

            function setTransition(element) {
                element.css({"-webkit-transition": "all ease 0.2s", "transition": "all ease 0.2s"})
            }

            function removeTransition(element) {
                element.css({"-webkit-transition": "none", "transition": "none"})
            }

            function moveTo(status) {
                var range = status.now - status.start;
                objList.find("li").removeClass("active");
                jumpTo(objList, objList.data("startOffset") + range)
            }

            function unLockMove() {
                objList.stop();
                objList.data("start", !0);
                objList.data("startOffset", getOffset(objList))
            }

            function changeAct(objList, i, state) {
                i = Math.round(i / 40);
                if(!state){
                    setTransition(objList);
                }
                jumpTo(objList, 40 * i);
                if(!state){
                    $timeout(function () {
                        removeTransition(objList);
                        objList.find("li").removeClass("active").eq(-i).addClass("active");
                    }, 200);
                }
                if(state){
                    objList.find("li").removeClass("active").eq(-i).addClass("active");
                }
            }

            function lockMove(status) {
                objList.data("start", !1);
                var maxHeight = -(objList.height() - 40);
                var range = status.now - status.start;
                var rangeTime = +new Date - status.startTime;
                var time = (rangeTime + 100) / rangeTime;
                var offset = objList.data("startOffset") + range * time;
                if(offset>0){
                    changeAct(objList, 0);
                }else{
                    if(maxHeight > offset){
                        changeAct(objList, maxHeight);
                    }else{
                        changeAct(objList, offset);
                    }
                }
            }

            function init() {
                var val = $scope.opts.data[0] ? $scope.opts.data[0].id : null;
                var initVal = $scope.opts.initData || val;
                var objLi = objList.find("li[data-id=" + initVal + "]");
                if(!$element.length){
                    objLi = objList.find("li").eq(0);
                    initVal = val;
                }
                var targetNum = objLi.index();
                if("number" == typeof targetNum){
                    objList.find(".active").removeClass("active");
                    objLi.addClass("active");
                    jumpTo(objList, 40 * -targetNum, true);
                }
            }

            var obj = $element;
            var objBody = obj.find(".single_selector_body");
            var objList = obj.find(".level-1").data("offset", 0);
            var status = null;
            $scope.show = 0;
            $scope.opts = {};
            $scope.$on("single-show", function () {
                $scope.show = singleSP.shown;
                $scope.onConfirm = singleSP.onConfirm;
                $scope.onCancel = singleSP.onCancel;
                $scope.opts = singleSP.opts;
                obj.removeClass("show");
                obj.removeAttr("style");
                $timeout(function () {
                    init();
                }, 50);
                $timeout(function () {
                    obj.addClass("show")
                }, 100)
            });
            $scope.$on("single-hide", function () {
                obj.removeClass("show"), $timeout(function () {
                    $scope.show = 0
                }, 100)
            });
            $scope._onConfirm = function () {
                var val = objList.find(".active").data("id");
                singleSP.onConfirm(val)
            };
            $scope._onCancel = function () {
                singleSP.onCancel()
            };
            obj.on("touchmove", function (e) {
                e.preventDefault()
            });
            objBody.on("touchstart mousedown", function (e) {
                var eObj = e.originalEvent.touches ? e.originalEvent.touches[0] : e.originalEvent;
                status = {start: eObj.clientY, startTime: +new Date, now: eObj.clientY};
                unLockMove(status);
            }).on("touchend mouseup", function () {
                lockMove(status);
                status = null
            }).on("touchmove mousemove", function (e) {
                var eObj = e.originalEvent.touches ? e.originalEvent.touches[0] : e.originalEvent;
                if(status){
                    status.now = eObj.clientY;
                    moveTo(status);
                }
            })
        }]
    }
}])

//两级选择基础指令
LuckyUI.service("doubleSelectorPopup", ["$rootScope", "$q", "overlay", "$timeout", function ($rootScope, $q, overlay, $timeout) {
    //声明隐藏事件
    function hide() {
        overlay.hide();
        that.shown = 0;
        $rootScope.$broadcast("double-hide");
    }

    var deferred, that = this;
    this.shown = 0;
    this.opts = null;
    //显示
    this.show = function (val) {
        //创建promise对象
        deferred = $q.defer();
        overlay.show(that.hide);
        that.shown = 1;
        that.shown = 1;
        that.opts = $.extend({
            title: "双栏选择器",
            initData: null,
            getRightListData: function () {
            },
            data: []
        }, val);
        //创建显示事件
        $rootScope.$broadcast("double-show");
        return deferred.promise
    };
    //隐藏
    this.hide = function () {
        that.onCancel();
    };
    //确认
    this.onConfirm = function (val) {
        deferred && that.shown && (hide(), $timeout(function () {
            deferred.resolve(val);
        }))
    };
    //取消
    this.onCancel = function (val) {
        deferred && that.shown && (hide(), $timeout(function () {
            deferred.reject(val);
        }))
    }
}]).directive("doubleSelectorPopup", ["doubleSelectorPopup", "$timeout", function (doubleSP, $timeout) {
    return {
        replace: true,
        scope: true,
        template:''+
            '<div id="double-selector" class="popup" ng-show="show">' +
                '<header class="popup-header">' +
                    '<button class="blue fr" ng-click="_onConfirm();">完成</button>' +
                    '<button class="fl" ng-click="_onCancel();">取消</button>' +
                    '<div class="con">{{opts.title}}</div>' +
                '</header>' +
                '<div class="double selector-body double_selector_body">' +
                    '<div class="reticle"></div>' +
                    '<ul class="level-1">' +
                        '<li ng-repeat="item in opts.data" ng-class="{\'active\':$index==0}" data-id="{{item.id}}">{{item.name}}</li>' +
                    '</ul>' +
                    '<ul class="level-2">' +
                        '<li ng-repeat="item in currentLevel" ng-class="{\'active\':$index==0}" data-id="{{item.id}}">{{item.name}}</li>' +
                    '</ul>' +
                '</div>' +
            '</div>',
        restrict: "EA",
        controller: ["$scope", "$element", function ($scope, $element) {
            //滚动方法
            function jumpTo(objList, h, state) {
                var maxHeight = -(objList.height() - 40);
                if(!state && maxHeight > h){
                    h = (h + maxHeight) / 2;
                }
                if(!state && h > 0){
                    h /= 2
                }
                objList.data("offset", h).css({"-webkit-transform": "translateY(" + h + "px)","-transform": "translateY(" + h + "px)"})
                return true;
            }
            //基本的样式操作
            function getOffset(element) {
                return element.data("offset")
            }

            function setTransition(element) {
                element.css({"-webkit-transition": "all ease 0.2s", "transition": "all ease 0.2s"})
            }

            function removeTransition(element) {
                element.css({"-webkit-transition": "none", "transition": "none"})
            }
            //跳转到指定项
            function moveTo(status) {
                var range = status.now - status.start;
                var objList = 1 == status.side ? l1 : l2;
                objList.find("li").removeClass("active");
                jumpTo(objList, objList.data("startOffset") + range)
            }
            //解除锁定并纠正到目标位置
            function unlockMove(status) {
                var objList = 1 == status.side ? l1 : l2;
                objList.stop();
                objList.data("start", true);
                objList.data("startOffset", getOffset(objList))
            }

            //更换活动项
            function changeAct(objList, i, state) {
                i = Math.round(i / 40);
                if(!state){
                    setTransition(objList);
                }
                jumpTo(objList, 40 * i);
                if(!state){
                    $timeout(function () {
                        removeTransition(objList);
                        var b = objList.find("li").removeClass("active").eq(-i).addClass("active").data("id");
                        objList.hasClass("level-1") && resetL2(-i, b);
                    }, 200);
                }
                if(state){
                    objList.find("li").removeClass("active").eq(-i).addClass("active")
                }
            }

            function resetL2(a, b) {
                //重置二级项
                $scope.currentLevel = initDate(a, b);
                changeAct(l2, 0, true);
            }

            function initDate(a, b) {
                //初始化数据
                var d = $scope.opts.getRightListData(b);
                return d ? d : $scope.opts.data && $scope.opts.data[a] ? $scope.opts.data[a].data : null
            }
            //锁定当前滚动操作，开始对滚动进行操作
            function lockMove(status) {
                var objList = 1 == status.side ? l1 : l2;
                objList.data("start", false);
                var maxHeight = -(objList.height() - 40);
                var range = status.now - status.start;
                var rangeTime = +new Date - status.startTime;
                var time = (rangeTime + 100) / rangeTime
                var offset = objList.data("startOffset") + range * time;
                if(offset>0){
                    changeAct(objList, 0);
                }else{
                    if(maxHeight > offset){
                        changeAct(objList, maxHeight);
                    }else{
                        changeAct(objList, offset);
                    }
                }
            }

            //初始化组件
            function init() {
                var val = [$scope.opts.data[0].id, initDate(0, $scope.opts.data[0].id).id];
                var initVal = $scope.opts.initData || val;
                var actObj = l1.find("li[data-id=" + initVal[0] + "]");
                actObj.length || (actObj = l1.find("li").eq(0), initVal = val);
                var index = actObj.index();
                if ("number" == typeof index && index >= 0) {
                    l1.find(".active").removeClass("active");
                    var h = actObj.addClass("active").data("id");
                    jumpTo(l1, 40 * -index, !0), resetL2(index, h);
                    jumpTo(l2, 0, !0);
                    $timeout(function () {
                        var val = l2.find("li[data-id=" + initVal[1] + "]"), i = val.index();
                        "number" == typeof b && b >= 0 && (l2.find(".active").removeClass("active"),
                            val.addClass("active"),
                            jumpTo(l2, 40 * -i, !0));
                    }, 100)
                }
            }


            var obj = $element;
            var objBody = obj.find(".double_selector_body");
            var l1 = objBody.find(".level-1").data("offset", 0);
            var l2 = objBody.find(".level-2").data("offset", 0);
            var status = null;
            $scope.show = 0;
            $scope.opts = {};
            //下面是各种事件的回调
            $scope.$on("double-show", function () {
                $scope.show = doubleSP.shown;
                $scope.onConfirm = doubleSP.onConfirm;
                $scope.onCancel = doubleSP.onCancel
                $scope.opts = doubleSP.opts
                $scope.currentLevel = $scope.opts.data ? $scope.opts.data[0].data : null;
                obj.removeClass("show");
                obj.removeAttr("style");
                $timeout(function () {
                    init()
                }, 50), $timeout(function () {
                    obj.addClass("show")
                }, 100)
            });
            $scope.$on("double-hide", function () {
                obj.removeClass("show"), $timeout(function () {
                    $scope.show = 0
                }, 100)
            });
            $scope._onConfirm = function () {
                var b = [l1.find(".active").data("id"), l2.find(".active").data("id")];
                doubleSP.onConfirm(b)
            }, $scope._onCancel = function () {
                doubleSP.onCancel()
            };
            //滚动事件描述
            obj.on("touchmove", function (e) {
                e.preventDefault()
            });
            objBody.on("touchstart mousedown", function (e) {
                var b;
                var eObj = e.originalEvent.touches ? e.originalEvent.touches[0] : e.originalEvent;
                b = eObj.clientX < obj.width() / 2 ? 1 : 2;
                status = {
                    start: eObj.clientY,
                    startTime: +new Date,
                    side: b,
                    now: eObj.clientY
                };
                unlockMove(status);
            }).on("touchend mouseup", function () {
                lockMove(status);
                status = null
            }).on("touchmove mousemove", function (e) {
                var eObj = e.originalEvent.touches ? e.originalEvent.touches[0] : e.originalEvent;
                if(status){
                    status.now = eObj.clientY, moveTo(status);
                }
            })
        }]
    }
}]);

//单选指令再封装
LuckyUI.directive("selector", ["$timeout", "singleSelectorPopup", function (a, singleSP) {
    return {
        replace: true,
        scope: {value: "=", options: "=", name: "@", readonly:"@", index:"="},
        template: "<span class='selector' ng-click='showPopup();'>{{str}}</span>",
        restrict: "EA",
        controller: ["$scope", "$element", function ($scope) {
            var defaultOption = "请选择";
            if ($scope.readonly) {
                defaultOption = "";
            }
            function init(val) {
                var VALUE = defaultOption;
                return $scope.options && $scope.options.length && $.each($scope.options, function (index, b) {
                    b.id == val && (VALUE = b.name , $scope.index = index)
                }), VALUE
            }

            $scope.value = $scope.value || 0;
            $scope.str = init($scope.value);
            $scope.$watch(function () {
                return JSON.stringify([$scope.value, $scope.hide])
            }, function () {
                $scope.str = init($scope.value);
            });
            if(!$scope.readonly){
                $scope.showPopup = function () {
                    singleSP.show({title: $scope.name, initData: $scope.value, data: $scope.options}).then(function (val) {
                        $scope.value = val;
                    })
                }
            }
        }]
    }
}]);