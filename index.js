var parse = require('esprima').parse
var evaluate = require('static-eval')

module.exports = function(js, context){
  var tree = parse(js)
  var context = context || {}

  function walk(node){
    if (node.type == 'Program' || node.type == 'BlockStatement'){
      var result = null
      for (var i=0;i<node.body.length;i++){
        result = walk(node.body[i])
      }
      return result
    } else if (node.type == 'ExpressionStatement'){
      return walk(node.expression)
    } else if (node.type == 'AssignmentExpression'){
      return setValue(context, node.left, node.right)
    } else if (node.type == 'VariableDeclaration'){
      node.declarations.forEach(function(declaration){
        setValue(context, declaration.id, declaration.init)
      })
    } else if (node.type == 'IfStatement'){
      if (walk(node.test, context)){
        return walk(node.consequent)
      } else {
        return walk(node.alternate)
      }
    } else {
      return evaluate(node, context)
    }
  }

  function setValue(object, left, right){
    var name = null
    var value = walk(right)

    if (left.type == 'Identifier'){
      name = left.name
    } else if (left.type == 'MemberExpression'){
      name = walk(left.property)
      object = walk(left.object)
    }

    return object[name] = value
  }

  return walk(tree)
}