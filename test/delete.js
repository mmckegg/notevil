var safeEval = require('../')
var test = require('tape')

test('delete literal', function(t){
  var func = safeEval.Function('arg', 'var x = {value: 1, another: 2}; delete x.value; return x')
  t.deepEqual(Object.keys(func()), ['another'])
  t.end()
})

test('delete computed', function(t){
  var func = safeEval.Function('arg', 'var x = {value: 1, another: 2}; var y = "value"; delete x[y]; return x')
  t.deepEqual(Object.keys(func()), ['another'])
  t.end()
})
