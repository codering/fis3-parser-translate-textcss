
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
//var escope = require('escope');

var rTextPlugin = /^text!(.+)/, rCssPlugin = /^css!(.+)/;

module.exports = function (content, file, options) {
  
  var ast = esprima.parse(content,{attachComment: true});
  
  var depsIndex = [];
  var textPath = {};
  
  estraverse.traverse(ast, {
    enter: function(node, parent){
      if (node.type==="ArrayExpression") {
         var elements = node.elements;
         node.elements = elements.filter(function(el, i){
            var path = el.value;
           
            if(rTextPlugin.test(path)) {
                var textDep = path.replace(rTextPlugin, "$1");
                depsIndex.push(i)
                textPath["text_" + i] = textDep
                return false;
            } else if (rCssPlugin.test(path)) {
                var cssDep = path.replace(rCssPlugin, "$1");
                var tt = esprima.parse("// @require " + cssDep,{attachComment: true});
               var cmts = ast.body[0].leadingComments;
               cmts.push(tt.leadingComments[0])
               depsIndex.push(i)
               return false;
            }
            
            return true;
         })
         
      } else if(node.type==="FunctionExpression") {
          var fparams = node.params;
          var fbody = node.body.body;
          node.params = fparams.filter(function(v, i){
             if(textPath["text_" + i]) {
                 var expr = "var " + v.name + " = __inline('" + textPath["text_" + i] + "')";
                 var textAst = esprima.parse(expr);
                 fbody.unshift(textAst)
             }
             return depsIndex.indexOf(i) === -1
          })
          this.break();
      }
      
    }
  });
  
  // 处理后的文件内容
  var result = escodegen.generate(ast,{comment: true});
  
  return result; 
}
