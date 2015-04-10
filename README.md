lucky-select
===
移动端的select解决方案，可级联（现在只有两级联动）。
组件参考自新浪的微招聘，致敬！

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



