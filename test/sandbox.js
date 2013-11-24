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