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
  t.equal(context.x, 16)
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

test('inner functions', function(t){
  var code = '[1,2,3,4].map(function(item){ return item*100 })'
  t.deepEqual(run(code), [100, 200, 300, 400])
  t.end()
})

test('this', function(t){
  t.equal(run('this', {this: 'test'}), 'test')
  t.equal(run('this'), undefined)
  t.equal(run('o = {f: function(){return this}, v: "test"}; o.f()').v, 'test')
  t.equal(run('f = function(){return this.toString()}; f.apply("test")'), 'test')
  t.end()
})

test('+=, -=', function(t){
  t.equal(run('var a = 1; a += 1; a'), 2)
  t.equal(run('var a = 1; a -= 1'), 0)
  t.equal(run('var a = 1; a++'), 1)
  t.equal(run('var a = 1; a++; a'), 2)
  t.equal(run('var a = 1; a--; a'), 0)
  t.end()
})

test('for', function(t){
  var code = 'var items = [1,2,3,4]; var result = []; for (var i=0;i<items.length;i++){ result.push(items[i]*100) } result'
  t.deepEqual(run(code), [100, 200, 300, 400])
  t.end()
})

test('inner context parent', function(t){
  var code = 'var result = 0; [1,2,3,4].forEach(function(item){ result += item }); result'
  t.equal(run(code), 10)
  t.end()
})

test('inner context shadow', function(t){
  var code = 'var result = 0; [1,2,3,4].forEach(function(item){ var result = 100 }); result'
  t.equal(run(code), 0)
  t.end()
})
