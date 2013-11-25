var parse = require('esprima').parse

module.exports = safeEval
module.exports.eval = safeEval
module.exports.FunctionFactory = FunctionFactory
module.exports.Function = FunctionFactory()

// 'eval' with a controlled environment
function safeEval(src, parentContext){
  var tree = prepareAst(src)
  var context = Object.create(parentContext || {})
  return evaluateAst(tree, context)
}

// create a 'Function' constructor for a controlled environment
function FunctionFactory(parentContext){
  var context = Object.create(parentContext || {})
  return function Function() {
    // normalize arguments array
    arguments = Array.prototype.slice.call(arguments)
    var src = arguments.slice(-1)[0]
    var args = arguments.slice(0,-1)
    if (typeof src === 'string'){
      //HACK: esprima doesn't like returns outside functions
      src = parse('function a(){' + src + '}').body[0].body
    }
    var tree = prepareAst(src)
    return getFunction(tree, args, context)
  }
}

// takes an AST or js source and returns an AST
function prepareAst(src){
  var tree = (typeof src === 'string') ? parse(src) : src
  return tree
}

// evaluate an AST in the given context
function evaluateAst(tree, context){

  var safeFunction = FunctionFactory(context)

  return walk(tree)

  // walk through each node of a program of block statement
  function walkBlock(node){
    var result = null
    node.body.forEach(function(childNode){
      if (childNode.type === 'EmptyStatement') return
      result = walk(childNode)
    })
    return result
  }

  // recursively evalutate the node of an AST
  function walk(node){
    switch (node.type) {
      
      case 'Program':
        return walkBlock(node)
      
      case 'BlockStatement':
        return walkBlock(node)

      case 'FunctionDeclaration':
        var params = node.params.map(getName)
        var value = getFunction(node.body, params, context)
        setValue(context, node.id, {type: 'Literal', value: value})
        return value

      case 'FunctionExpression':
        var params = node.params.map(getName)
        return getFunction(node.body, params, context)
      
      case 'ReturnStatement':
        var value = walk(node.argument)
        return new ReturnValue(value)
      
      case 'ExpressionStatement':
        return walk(node.expression)
      
      case 'AssignmentExpression':
        return setValue(context, node.left, node.right, node.operator)
      
      case 'UpdateExpression':
        return setValue(context, node.argument, null, node.operator)
      
      case 'VariableDeclaration':
        node.declarations.forEach(function(declaration){
           if (declaration.init){
            context[declaration.id.name] = walk(declaration.init)
          } else {
            context[declaration.id.name] = undefined
          }
        })
        break
      
      case 'IfStatement':
        if (walk(node.test)){
          return walk(node.consequent)
        } else {
          return walk(node.alternate)
        }
      
      case 'ForStatement':
        for (walk(node.init); walk(node.test); walk(node.update)){
          walk(node.body)
        }
        break

      case 'ForInStatement':
        var value = walk(node.right)
        var property = node.left

        if (property.type == 'VariableDeclaration'){
          walk(property)
          property = property.declarations[0].id
        }

        for (var key in value){
          setValue(context, property, {type: 'Literal', value: key})
          walk(node.body)
        }
        break

      case 'WhileStatement':
        while (walk(node.test)){
          walk(node.body)
        }
        break
      
      case 'Literal':
        return node.value
      
      case 'UnaryExpression':
        var val = walk(node.argument)
        switch(node.operator) {
          case '+': return +val
          case '-': return -val
          case '~': return ~val
          case '!': return !val
          default: return unsupportedExpression(node)
        }
      
      case 'ArrayExpression':
        return node.elements.map(function(element){
          return walk(element)
        })
      
      case 'ObjectExpression':
        var obj = {}
        for (var i = 0; i < node.properties.length; i++) {
          var prop = node.properties[i]
          var value = (prop.value === null) ? prop.value : walk(prop.value)
          obj[prop.key.value || prop.key.name] = value
        }
        return obj
      
      case 'BinaryExpression':
        var l = walk(node.left)
        var r = walk(node.right)
        switch(node.operator) {
          case '==':  return l === r
          case '===': return l === r
          case '!=':  return l != r
          case '!==': return l !== r
          case '+':   return l + r
          case '-':   return l - r
          case '*':   return l * r
          case '/':   return l / r
          case '%':   return l % r
          case '<':   return l < r
          case '<=':  return l <= r
          case '>':   return l > r
          case '>=':  return l >= r
          case '|':   return l | r
          case '&':   return l & r
          case '^':   return l ^ r
          case '&&':  return l && r
          case '||':  return l || r
          default: return unsupportedExpression(node)
        }
      
      case 'ThisExpression':
        return context['this']
      
      case 'Identifier':
        return context[node.name]
      
      case 'CallExpression':
        var args = node.arguments.map(function(arg){
          return walk(arg)
        })
        var object = null
        var target = walk(node.callee)
        if (node.callee.type === 'MemberExpression'){
          object = walk(node.callee.object)
        }
        return target.apply(object, args)
      
      case 'MemberExpression':
        var obj = walk(node.object)
        if (node.computed){
          var prop = walk(node.property)
          return checkValue(obj[prop])
        } else {
          return checkValue(obj[node.property.name]);
        }
      
      case 'ConditionalExpression':
        var val = walk(node.test)
        return val ? walk(node.consequent) : walk(node.alternate)
      
      default:
        return unsupportedExpression(node)
    }
  }

  // safely retrieve a value
  function checkValue(value){
    if (value === Function){
      value = safeFunction
    }
    return value
  }

  // set a value in the specified context if allowed
  function setValue(object, left, right, operator){
    var name = null

    if (left.type === 'Identifier'){
      name = left.name
      // handle parent context shadowing
      object = objectForKey(object, name)
    } else if (left.type === 'MemberExpression'){
      if (left.computed){
        name = walk(left.property)
      } else {
        name = left.property.name
      }
      object = walk(left.object)
    }

    // stop built in properties from being able to be changed
    if (canSetProperty(object, name)){
      switch(operator) {
        case undefined: return object[name] = walk(right)
        case '=':  return object[name] = walk(right)
        case '+=': return object[name] += walk(right)
        case '-=': return object[name] -= walk(right)
        case '++': return object[name]++
        case '--': return object[name]--
      }
    }

  }

}

// when an unsupported expression is encountered, throw an error
function unsupportedExpression(node){
  console.error(node)
  throw new Error('Unsupported expression')
}

// walk a provided object's prototypal hierarchy to retrieve an inherited object
function objectForKey(object, key){
  var proto = Object.getPrototypeOf(object)
  if (!proto || proto == Object.prototype || object.hasOwnProperty(key)){
    return object
  } else {
    return objectForKey(proto, key)
  }
}

// determine if we have write access to a property
function canSetProperty(object, property){
  if (property === '__proto__'){
    return false
  } else if (object != null){

    if (object.hasOwnProperty(property)){
      if (object.propertyIsEnumerable(property)){
        return true
      } else {
        return false
      }
    } else {
      return canSetProperty(Object.getPrototypeOf(object), property)
    }

  } else {
    return true
  }
}

// generate a function with specified context
function getFunction(body, params, parentContext){
  return function(){
    var context = Object.create(parentContext)
    if (this == global){
      context['this'] = null
    } else {
      context['this'] = this
    }
    // normalize arguments array
    arguments = Array.prototype.slice.call(arguments)
    context['arguments'] = arguments
    arguments.forEach(function(arg,idx){
      param = params[idx]
      if (param){
        context[param] = arg
      }
    })
    var result = evaluateAst(body, context)
    if (result instanceof ReturnValue){
      return result.value
    }
  }
}

// get the name of an identifier
function getName(identifier){
  return identifier.name
}

// a ReturnValue struct for differentiating between expression result and return statement
function ReturnValue(value){
  this.value = value
}