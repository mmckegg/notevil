var run = require('../')
var test = require('tape')

test('null', function(t){
  t.equal(JSON.stringify(run('null')), 'null')
  t.end()
})

test('undefined', function(t){
  t.equal(typeof run('undefined'), 'undefined')
  t.end()
})

test('number zero (falsy)', function(t){
  t.equal(run('0'), 0)
  t.end()
})

test('number one', function(t){
  t.equal(run('1'), 1)
  t.end()
})

test('empty string (falsy)', function(t){
  t.equal(run('""'), "")
  t.end()
})

test('simple string', function(t){
  t.equal(run('"a"'), "a")
  t.end()
})

test('empty array', function(t){
  var result = run('[]')
  t.deepEqual(result, [])
  t.end()
})

test('simple array', function(t){
  var result = run('[0]')
  t.deepEqual(result, [0])
  t.end()
})

test('empty object', function(t){
  var result = run('({})')
  t.deepEqual(result, {})
  t.end()
})

test('simple object', function(t){
  var result = run('({a:0})')
  t.deepEqual(result, {a:0})
  t.end()
})

test('empty string', function (t){
  var result = run('')
  t.deepEqual(result, undefined) //same as eval('')
  t.end()
})

test('semicolon', function (t){
  var result = run(';')
  t.deepEqual(result, undefined) //same as eval(';')
  t.end()
})

