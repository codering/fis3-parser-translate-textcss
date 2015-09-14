
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var escope = require('escope');

var rTextPlugin = /^text!(.+)/;
var rCssPlugin = /^css!(.+)/;

module.exports = function (content, file, options) {
  
  var ast = esprima.parse(content,{attachComment: true});
  var scopes = escope.analyze(ast).scopes;
  var gs = scopes.filter(function(scope) {
        return scope.type == 'global';
  })[0];
  
  estraverse.replace(ast, {
    leave: function(node, parent){
      if(isDefine(node)) {
        // define是否为全局定义
        var ref = findRef(gs, node.callee);
        if (ref.resolved) {
            return;
        }
        
        if (
            node.arguments.length == 2 &&
            node.arguments[0].type == 'ArrayExpression' &&
            node.arguments[1].type == 'FunctionExpression'
                ) {
            // 当前只处理 define(['m1'],function(){}) 代码结构
            var dependencies = node.arguments[0],
            factory = node.arguments[1];
            // 依赖
            var ids = dependencies.elements.map(function(el) {
                return el.value
            });
            // 回调函数参数
            var vars = factory.params.map(function(el) {
                return el.name
            });
            
            var leadingComments = [];
            var varStatements = [];
            var factoryParams = [];
            var depElements = [];
            
            for (var i = 0, len = ids.length; i < len; ++i) {
              var depId = ids[i], fparam = vars[i];
              
              if(rTextPlugin.test(depId)) {
                  if (fparam) {
                      varStatements.push({
                          type: 'VariableDeclaration',
                          declarations: [{
                              type: 'VariableDeclarator',
                              id: {
                                  type: 'Identifier',
                                  name: fparam
                              },
                              init: {
                                  type: 'CallExpression',
                                  callee: {
                                      type: 'Identifier',
                                      name: '__inline'
                                  },
                                  arguments: [{
                                      type: 'Literal',
                                      value: depId.replace(rTextPlugin, "$1")
                                  }]
                              }
                          }],
                          kind: 'var'
                      });
                  }
              } else if (rCssPlugin.test(depId)) {
                  leadingComments.push({
                      type: 'Line',
                      value: ' @require ' + depId.replace(rCssPlugin, "$1")
                  });
              } else {
                  depElements.push({
                    type: "Literal",
                    value: depId
                  });
                  factoryParams.push({
                      type: "Identifier",
                      name: fparam
                  })
              }
            }
            
            dependencies.elements = depElements;
            factory.params = factoryParams;
            factory.body.body = varStatements.concat(factory.body.body);
            parent.leadingComments = (parent.leadingComments || []).concat(leadingComments);        
        }
        
        return node;
      }
    }
  });
  
  // 处理后的文件内容
  var result = escodegen.generate(ast,{comment: true});
  // console.log(result);
  return result; 
}


function isDefine(node) {
    var callee = node.callee;
    return callee && node.type == 'CallExpression' && callee.type == 'Identifier' && callee.name == 'define';
}

function findRef(scope, ident) {
    var refs = scope.references;
    var i = 0;
    var ref, childScope;

    while ((ref = refs[i++])) {

        if (ref.identifier === ident) {
            return ref;
        }
    }

    i = 0;

    while ((childScope = scope.childScopes[i++])) {

        if ((ref = findRef(childScope, ident))) {
            return ref;
        }
    }
}
