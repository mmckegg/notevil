notevil
===

Evalulate javascript like the built-in javascript `eval()` method but **safely**. 

This module uses [esprima](https://github.com/ariya/esprima) and [static-eval](https://github.com/substack/static-eval) to parse and evaluate the passed in javascript. 

Like built-in `eval`, the result of the last expression will be returned. Unlike built-in, there is no access to global objects, only the context that is passed in as the second object.

[![NPM](https://nodei.co/npm/notevil.png?compact=true)](https://nodei.co/npm/notevil/)

## Example

```js
var safeEval = require('notevil')

// basic math
var result = safeEval('1+2+3')
console.log(result) // 6

// context and functions
var result = safeEval('1+f(2,3)+x', {
  x: 100, 
  f: function(a,b){
    return a*b
  }
})
console.log(result) // 107

// multiple statements, variables and if statements
var result = safeEval('var x = 100, y = 200; if (x > y) { "cats" } else { "dogs" }')
console.log(result) // 107

// update context object
var context = { x: 1 }
safeEval('x = 300')
console.log(context.x) // 300
```
