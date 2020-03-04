var safeEval = require('../')
var test = require('tape')

test('attempt override prototype method', function(t){
  var original = Array.prototype.map
  safeEval('Array.prototype.map = function(){ return "HACK" }', {
    Array: Array
  })
  t.equal(Array.prototype.map, original, 'prototype method not changed')
  t.end()
})

test('attempt to set __proto__', function(t){
  var x = ['test']
  var original = Object.getPrototypeOf(x)
  safeEval('x.__proto__ = {newProto: true}', {
    x: original
  })
  t.equal(Object.getPrototypeOf(x), original, '__proto__ not changed')
  t.end()
})

test('try to access this via constructor', function(t){
  var result = safeEval("[].slice.constructor('return this')()")
  t.equal(result, null)
  t.end()
})

test('try to access this via constructor and bind', function(t){
  var result = safeEval("[].slice.constructor.bind()('return this')()")
  t.equal(result, null)
  t.end()
})

test('infinite recursion', function(t){
  t.throws(function(){
    safeEval('function test() { test() }; test()')
  })
  t.end()
})

test('infinite for loop', function(t){
  t.throws(function(){
    safeEval('for (;true;){}')
  })
  t.end()
})

test('infinite while loop', function(t){
  t.throws(function(){
    safeEval('while (true){}')
  })
  t.end()
})

test('set wrapped string prototype', function(t){
  var code = 'String.prototype.makeLouder = function() { return this + "!" }; "test".makeLouder()'
  t.equal(safeEval(code), 'test!')
  t.throws(function(){
    "test".makeLouder()
  }, 'original string prototype untouched')
  t.end()
})

test('set wrapped object prototype', function(t){
  var code = 'Object.prototype.wibblify = function() { return "~" + this.value + "~" }; ({value: "test"}).wibblify()'
  t.equal(safeEval(code), '~test~')
  t.throws(function(){
    ({value: "test"}).wibblify()
  }, 'original object prototype untouched')
  t.end()
})

test('set wrapped object prototype by object.__proto__', function(t){
  var code = '({}).__proto__.wibblify = function() { return "~" + this.value + "~" }; ({value: "test"}).wibblify()'
  t.equal(safeEval(code), '~test~')
  t.throws(function(){
    ({value: "test"}).wibblify()
  }, 'original object prototype untouched')
  t.end()
})

test('prevent access to Function via function call', function(t){
  var code = "" +
    "function fn() {};" +
    "var constructorProperty = Object.getOwnPropertyDescriptors(fn.__proto__).constructor;" +
    "var properties = Object.values(constructorProperty);" +
    "properties.pop();" +
    "properties.pop();" +
    "properties.pop();" +
    "var Function = properties.pop();" +
    "(Function('return this'))()"
  t.notEqual(safeEval(code), global)
  t.equal(safeEval(code), null)
  t.end()
})

test('prevent access to Function via function call (bound)', function(t){
  var code = "" +
    "function fn() {};" +
    "var constructorProperty = Object.getOwnPropertyDescriptors(fn.__proto__).constructor;" +
    "var properties = Object.values(constructorProperty);" +
    "properties.pop();" +
    "properties.pop();" +
    "properties.pop();" +
    "var Func = properties.map(function (x) {return x.bind(x, 'return this')}).pop();" +
    "(Func())()"
  t.notEqual(safeEval(code), global)
  t.equal(safeEval(code), null)
  t.end()
})

test('prevent access to Function prototype', function(t){
  safeEval("try{a[b];}catch(e){e.constructor.constructor('return __proto__.arguments.callee.__proto__.polluted=true')()};")
  t.equal(Function.polluted, undefined)
  t.end()
})
