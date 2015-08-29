# fis3-parser-translate-textcss

fis parser插件 将requirejs的text、css插件转换为符合fis3的依赖规范

```js

define(["./comp/demo", "text!./template/aaa.html", "css!./css/aaa1.css", "css!./css/aaa2.css"],
 function(demo, tpl){
	
	console.log(tpl);
})

```

↓↓↓

```js

//@require ./css/aaa1.css
//@require ./css/aaa2.css
define(["./comp/demo", "text!./template/aaa.html", "css!./css/aaa.css", "css!./css/aaa2.css"],
 function(demo){

     var tpl = __inline(./template/aaa.html);
     console.log(tpl);
})

```

刚学习使用nodejs不久，代码写的烂! 只是简单实现了功能。