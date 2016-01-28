# fis3-parser-translate-textcss

fis3 parser插件 将requirejs的text、css插件转换为符合fis3的依赖规范

### 安装
cnpm install -g fis3-parser-translate-textcss

### 使用

```js
// 对依赖requirejs的text, css插件的js模块 进行转换
fis.match('/path/to/*.js',{
    parser: fis.plugin('translate-textcss')
})

```


```js

define(["./comp/demo", 
	"text!./template/aaa.html", 
	"css!./css/aaa1.css", 
	"css!./css/aaa2.css"],
 function(demo, tpl){
	
	console.log(tpl);
})

```

↓↓↓

```js

//@require ./css/aaa1.css
//@require ./css/aaa2.css
define(["./comp/demo"],
 function(demo){

     var tpl = __inline("./template/aaa.html");
     console.log(tpl);
})

```

刚学习使用nodejs不久，代码写的烂! 只是简单实现了功能, 不保证逻辑的严谨性，会持续改进的.
