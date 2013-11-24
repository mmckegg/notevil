var safeEval = require('../')
var test = require('tape')

test('create function', function(t){
  var func = safeEval.Function('arg', 'return arg * 100')
  t.equal(func(5), 500)
  t.end()
})