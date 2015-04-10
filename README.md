lucky-select
===
移动端的select解决方案，可级联（现在只有两级联动）。
组件参考自新浪的微招聘，致敬！

## 基本指令说明
###参数
```js
//初始化的值
title 标题
initData 初始化的值
data 下拉数据
getRightListData 两级联动通过该属性的方法过滤生成二级菜单，单级联动不存在该属性
```
###方法
<ul>
	<li>show(val) val为初始化的对象</li>
	<li>hide() 隐藏</li>
	<li>onConfirm() 确认</li>
	<li>onCancel() 取消</li>
</ul>

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



