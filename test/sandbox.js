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