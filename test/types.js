var run = require('../')
var test = require('tape')

test('boolean', function(t){
  var result = run('Boolean')
  t.equal(result, Boolean)
  t.end()
})

test('new boolean', function(t){
  var result = run('Boolean()')
  t.equal(result, Boolean())
  t.end()
})

test('number', function(t){
  var result = run('Number')
  t.equal(result, Number)
  t.end()
})

test('new number', function(t){
  var result = run('Number()')
  t.equal(result, Number())
  t.end()
})

test('string', function(t){
  var result = run('String')
  t.equal(result, String)
  t.end()
})

test('new string', function(t){
  var result = run('String()')
  t.equal(result, String())
  t.end()
})

test('object', function(t){
  var result = run('Object')
  t.equal(result.toString(), Object.toString())
  t.end()
})

test('new object', function(t){
  var result = run('Object()')
  t.equal(result.toString(), Object().toString())
  t.end()
})

test('array', function(t){
  var result = run('Array')
  t.equal(result.toString(), Array.toString())
  t.end()
})

test('new array', function(t){
  var result = run('Array()')
  t.equal(result.toString(), Array().toString())
  t.end()
})