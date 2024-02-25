

export const ERROR_CLASSES=[
{name:"Error",shouldProxy:true,argsLength:1},
{name:"ReferenceError",shouldProxy:false,argsLength:1},
{name:"TypeError",shouldProxy:false,argsLength:1},
{name:"SyntaxError",shouldProxy:false,argsLength:1},
{name:"RangeError",shouldProxy:false,argsLength:1},
{name:"URIError",shouldProxy:false,argsLength:1},
{name:"EvalError",shouldProxy:false,argsLength:1},
...("AggregateError"in globalThis?
[{name:"AggregateError",shouldProxy:false,argsLength:2}]:
[])];