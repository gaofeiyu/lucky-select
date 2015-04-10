lucky-select
===
移动端的select解决方案，可级联（现在只有二级联动）。
组件参考自新浪的微招聘，致敬！

## 基本指令说明
单级指令 singleSelectorPopup
二级联动指令 doubleSelectorPopup
上面两个指令主要是生成下拉部分
###参数
```js
//初始化的值
title 标题
initData 初始化的值
data 下拉数据
getRightListData 二级联动通过该属性的方法过滤生成二级菜单，单级联动不存在该属性
```
这里的data为数组，包含两个必要键值
```js
{id:1,name:"id对应的展示名称"}
```
###方法
<ul>
	<li>show(val) val为初始化的对象</li>
	<li>hide() 隐藏</li>
	<li>onConfirm() 确认</li>
	<li>onCancel() 取消</li>
</ul>
## selector单级指令
该指令是在singleSelectorPopup基础上封装的选择的部分，供使用者参考。
```js
        scope: {value: "=", options: "=", name: "@", readonly:"@", index:"="},
        template: "<span class='selector' ng-click='showPopup();'>{{str}}</span>",
        restrict: "EA",
```
### 参数说明
<ul>
	<li>value 显示在前台的值</li>
	<li>options 下拉的数据</li>
	<li>name 下拉标题</li>
	<li>readonly 是否只读（不弹出下拉，只展示值）</li>
	<li>index 当前选择值的索引</li>
</ul>
### 效果
![例图1](https://github.com/gaofeiyu/lucky-select/blob/master/example/img/1.png?raw=true)
![例图2](https://github.com/gaofeiyu/lucky-select/blob/master/example/img/2.png?raw=true)
## overlay遮罩指令
通用的遮罩指令，也可以用在其他组件上。
###指令说明
``` js
replace: true,
template: '<div id="overlay"  ng-click="bindClick();"></div>',
restrict:"EA"
```
###方法
<ul>
	<li>show(hideCallback) hideCallback会在hide里面回调</li>
	<li>hide()</li>
	<li>clear()</li>
</ul>



