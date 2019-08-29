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

test('include some globals', function(t){
  t.equal(run('JSON.stringify({test: 123})', {JSON: JSON}), JSON.stringify({test: 123}))
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

test('function declaration', function(t){
  var code = 'function test(arg){ return arg }; test(123)'
  t.deepEqual(run(code), 123)
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

test('logical expression', function(t){
  t.equal(run('123 && 456'), 456)
  t.equal(run('0 || 456'), 456)
  t.end()
})

test('typeof', function(t){
  t.equal(run('typeof "text"'), 'string')
  t.end()
})

test('instanceof', function(t){
  t.equal(run('var obj = {}; obj instanceof Object', {Object: Object}), true)
  t.end()
})

test('for', function(t){
  var code = 'var items = [1,2,3,4]; var result = []; for (var i=0;i<items.length;i++){ result.push(items[i]*100) } result'
  t.deepEqual(run(code), [100, 200, 300, 400])
  t.end()
})

test('for in', function(t){
  var code = 'var items = [1,2,3,4]; var result = []; for (var i in items){ result.push(items[i]*100) } result'
  t.deepEqual(run(code), [100, 200, 300, 400])
  t.end()
})

test('for var in', function(t){
  var code = 'var items = [1,2,3,4]; var result = []; var i; for (i in items){ result.push(items[i]*100) } result'
  t.deepEqual(run(code), [100, 200, 300, 400])
  t.end()
})

test('while', function(t){
  var code = 'var items = [1,2,3,4]; var result = []; var i=0; while (i<items.length){ result.push(items[i]*100) ;i++ } result'
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

test('hoist functions', function(t){
  var code = 'func("test"); function func(arg){ return arg }'
  t.doesNotThrow(function(){
    run(code)
  }, 'should not throw')
  t.end()
})

test('hoist var', function(t){
  t.equal(run('var i = 123; (function(){ var result = i; var i; return result })()'), undefined)
  t.equal(run('var i = 123; (function(){ i = 456; var i; })(); i'), 123)
  t.end()
})

test('early return', function(t){
  t.equal(run('(function(x){ return "test"; return "dogs" })()'), "test")
  t.end()
})

test('continue', function(t){
  var code = 'var result = []; for (var i=0;i<5;i++){ if (i === 2){ continue } result.push(i) }; result'
  t.deepEqual(run(code), [0,1,3,4])
  t.end()
})

test('break', function(t){
  var code = 'var result = []; for (var i=0;i<5;i++){ if (i === 3){ break } result.push(i) }; result'
  t.deepEqual(run(code), [0,1,2])
  t.end()
})

test('logic operator early return', function(t){
  t.equal(run('var result = false; function fail(){ result = true } result && fail(); result'), false)
  t.equal(run('var result = true; function fail(){ result = false } result || fail(); result'), true)
  t.end()
})

test('new', function(t){
  var result = run('var s = new String("test1"); s.prop = "test2"; s')
  t.equal(result.toString(), 'test1')
  t.equal(result.prop, 'test2')
  t.assert(result instanceof String)

  var result2 = run('String.prototype.toLoud = function() { return this.toString() + "!" }; new String("test")')
  t.equal(result2.toLoud(), 'test!')

  t.end()
})

test('let declaration', function(t){
  t.equal(run('var x = 1; if (true) { let x = 3 }; x'), 1)
  t.equal(run('var x = 0; for (let x=1;x<2;x++){ let x=100 }; x'), 0)
  t.equal(run('var x = 0; for (var x=1;x<2;x++){ let x=100 }; x'), 2)
  t.equal(run('var x = 0, k; for (let x=1;x<2;x++){ k=100+x }; k'), 101)
  t.end()
})

test('try statement', function(t){
  t.ok(run('var error; try{ __fail__.fail__() } catch(e) { error = e }; error') instanceof ReferenceError)
  t.throws(function(){
    run('var error; try{ __fail__.fail__() } catch(e) { error = e }; e')
  })
  t.end()
})

test('switch statement', function(t){
  var code = 'var r = []; switch (x) { case 1: r.push(1); break; case 2: r.push(2); case 3: r.push(3); break; default: r.push("default") } r'
  t.deepEqual(run(code, {x: 1}), [1])
  t.deepEqual(run(code, {x: 2}), [2, 3])
  t.deepEqual(run(code, {x: 3}), [3])
  t.deepEqual(run(code, {x: 4}), ['default'])

  t.equal(run('function x(y) { switch(y) { case 1: return 1; case 2: return 2} } x(1)'), 1)
  t.end()
})