var run = require('../')
var test = require('tape')

test('boolean', function(t){
  var result = run('Boolean')
  t.notEqual(result, Boolean)
  t.equal(result.__proto__, Boolean)
  t.end()
})

test('new boolean', function(t){
  var result = run('Boolean()')
  t.equal(result, Boolean())
  t.end()
})

test('number', function(t){
  var result = run('Number')
  t.notEqual(result, Number)
  t.equal(result.__proto__, Number)
  t.end()
})

test('new number', function(t){
  var result = run('Number()')
  t.equal(result, Number())
  t.end()
})

test('string', function(t){
  var result = run('String')
  t.notEqual(result, String)
  t.equal(result.__proto__, String)
  t.end()
})

test('new string', function(t){
  var result = run('String()')
  t.equal(result, String())
  t.end()
})

test('object', function(t){
  var result = run('Object')
  t.notEqual(result, Object)
  t.equal(result.__proto__, Object)
  t.end()
})

test('new object', function(t){
  var result = run('Object()')
  t.deepEqual(result, Object())
  t.end()
})

test('array', function(t){
  var result = run('Array')
  t.notEqual(result, Array)
  t.equal(result.__proto__, Array)
  t.end()
})

test('new array', function(t){
  var result = run('Array()')
  t.deepEqual(result, Array())
  t.end()
})