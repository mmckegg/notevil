var parse = require('esprima').parse

module.exports = function(js, parentContext){
  var tree = parse(js)
  var context = Object.create(parentContext || {})
  return evaluateAst(tree, context)
}

function evaluateAst(tree, context){
  function wtf(node){
    console.error(node)
    throw new Error('Unsupported expression.')
  }

  function walk(node){
    if (node.type == 'Program' || node.type == 'BlockStatement'){
      var result = null
      for (var i=0;i<node.body.length;i++){
        result = walk(node.body[i])
      }
      return result
    } else if (node.type == 'FunctionExpression'){
      var params = node.params.map(getName)
      return getFunction(node.body, params, context)
    } else if (node.type == 'ReturnStatement'){
      var value = walk(node.argument)
      return new ReturnValue(value)
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
    } else if (node.type === 'Literal') {
      return node.value
    } else if (node.type === 'UnaryExpression'){
      var val = walk(node.argument)
      if (node.operator === '+') return +val
      if (node.operator === '-') return -val
      if (node.operator === '~') return ~val
      if (node.operator === '!') return !val
      return wtf(node)
    } else if (node.type === 'ArrayExpression') {
      var xs = [];
      for (var i = 0, l = node.elements.length; i < l; i++) {
        var x = walk(node.elements[i]);
        xs.push(x);
      }
      return xs;
    } else if (node.type === 'ObjectExpression') {
      var obj = {};
      for (var i = 0; i < node.properties.length; i++) {
        var prop = node.properties[i];
        var value = prop.value === null
          ? prop.value
          : walk(prop.value)
        ;
        obj[prop.key.value || prop.key.name] = value;
      }
      return obj;
    } else if (node.type === 'BinaryExpression') {
      var l = walk(node.left);
      var r = walk(node.right);
      
      var op = node.operator;
      if (op === '==') return l == r;
      if (op === '===') return l === r;
      if (op === '!=') return l != r;
      if (op === '!==') return l !== r;
      if (op === '+') return l + r;
      if (op === '-') return l - r;
      if (op === '*') return l * r;
      if (op === '/') return l / r;
      if (op === '%') return l % r;
      if (op === '<') return l < r;
      if (op === '<=') return l <= r;
      if (op === '>') return l > r;
      if (op === '>=') return l >= r;
      if (op === '|') return l | r;
      if (op === '&') return l & r;
      if (op === '^') return l ^ r;
      if (op === '&&') return l && r;
      if (op === '||') return l || r;

      return wtf(node)
    } else if (node.type === 'Identifier') {
      return context[node.name]
    } else if (node.type === 'CallExpression') {
      var args = [];
      for (var i = 0, l = node.arguments.length; i < l; i++) {
        var x = walk(node.arguments[i]);
        args.push(x);
      }
      var object = null
      var target = walk(node.callee)
      if (node.callee.type === 'MemberExpression'){
        object = walk(node.callee.object)
      }
      return target.apply(object, args)
    } else if (node.type === 'MemberExpression') {
      var obj = walk(node.object);
      if (node.property.type === 'Identifier') {
        return obj[node.property.name];
      }
      var prop = walk(node.property);
      return obj[prop];
    } else if (node.type === 'ConditionalExpression') {
      var val = walk(node.test)
      return val ? walk(node.consequent) : walk(node.alternate)
    }
    else return wtf(node);
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

function getFunction(body, params, parentContext){
  return function(){
    var context = Object.create(parentContext)
    for (var i=0;i<arguments.length;i++){
      if (params[i]){
        context[params[i]] = arguments[i]
      }
    }
    var result = evaluateAst(body, context)
    if (result instanceof ReturnValue){
      return result.value
    }
  }
}

function getName(identifier){
  return identifier.name
}

function ReturnValue(value){
  this.value = value
}