
var fs = require('fs');
var plugin = require('../fis3-parser-translate-textcss');


var file = fs.readFileSync("test/demo.js","utf8");

var content = plugin(file);

console.log(content)
