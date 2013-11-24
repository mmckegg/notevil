var run = require('../')
var test = require('tape')

test('number math', function(t){
  t.equal(run('1+2+3+4/2*100'), 1+2+3+4/2*100)
  t.end()
})

test('return last', function(t){
  t.equal(run('1+2+3+4/2*100;123'), 123)
  t.end()
})

test('set and use variable', function(t){
  t.equal(run('var k = 3;k+10'), 3+10)
  t.end()
})

test('if statement', function(t){
  t.equal(run('if (x == 3) {"cats"} else {"dogs"} ', {x: 3}), "cats")
  t.end()
})

test('ternary operator', function(t){
  t.equal(run('x == 3 ? "cats" : "dogs"', {x: 3}), "cats")
  t.end()
})

test('update context', function(t){
  var context = { x: 1, o: {val: 10} }
  run('var key = "val"; x = 4 * 4; o[key] = 20', context)
  t.equal(context.x, 1)
  t.equal(context.o.val, 20)
  t.end()
})

test('object', function(t){
  t.deepEqual(run('x = {"test": 1}'), {test: 1})
  t.deepEqual(run('x = {test: -1}'), {test: -1})
  t.end()
})

test('undefined exceptions', function(t){
  t.throws(function(){
    run('y.u.no.error')
  })
  t.end()
})
