var run = require('../')
var test = require('tape')

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
  t.equal(result.toString(), [].toString())
  t.end()
})

test('simple array', function(t){
  var result = run('[0]')
  t.equal(result.toString(), [0].toString())
  t.end()
})

test('empty object', function(t){
  var result = run('({})')
  t.equal(result.toString(), ({}).toString())
  t.end()
})

test('simple object', function(t){
  var result = run('({a:0})')
  t.equal(result.toString(), ({a:0}).toString())
  t.end()
})