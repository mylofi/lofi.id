import{ERROR_CLASSES}from"./classes.js";
import{setNonEnumProp,setNonEnumReadonlyProp,setFrozenProp}from"./set.js";
import{proxyStaticProperties}from"./static.js";
import{hasSupport}from"./support.js";














































export const getErrors=()=>
Object.fromEntries(ERROR_CLASSES.map(getPonyfillAnyError));

const getPonyfillAnyError=({name,shouldProxy,argsLength})=>{
const OriginalAnyError=globalThis[name];
const OriginalBaseError=globalThis.Error;

if(hasSupport()){
return[name,OriginalAnyError]
}

const PonyfillAnyError=function(...args){
const error=new OriginalAnyError(...args);
const newTarget=new.target;
fixConstructor(error,PonyfillAnyError,newTarget);
fixStack(error,OriginalBaseError);
fixInstancePrototype(error,newTarget);
fixCause(error,args[argsLength]);
return error
};

fixClass({PonyfillAnyError,OriginalAnyError,shouldProxy,argsLength});
return[name,PonyfillAnyError]
};










const fixConstructor=(error,PonyfillAnyError,value=PonyfillAnyError)=>{
setNonEnumProp(error,"constructor",value)
};








const fixStack=(error,OriginalBaseError)=>{
if(OriginalBaseError.captureStackTrace!==undefined){
OriginalBaseError.captureStackTrace(error,error.constructor)
}
};







const fixInstancePrototype=(error,newTarget)=>{
if(
newTarget!==undefined&&
Object.getPrototypeOf(error)!==newTarget.prototype)
{

Object.setPrototypeOf(error,newTarget.prototype)
}
};


const fixCause=(error,options)=>{
if(isMissingCause(error,options)){
setNonEnumProp(error,"cause",options.cause)
}
};

const isMissingCause=(error,options)=>
isOptionsObject(options)&&
"cause"in options&&
options.cause!==error.cause;

const isOptionsObject=(options)=>
(typeof options==="object"||typeof options==="function")&&
options!==null;


















const fixClass=({
PonyfillAnyError,
OriginalAnyError,
shouldProxy,
argsLength
})=>{
setNonEnumReadonlyProp(PonyfillAnyError,"name",OriginalAnyError.name);
setNonEnumReadonlyProp(PonyfillAnyError,"length",argsLength);
setFrozenProp(PonyfillAnyError,"prototype",OriginalAnyError.prototype);

Object.setPrototypeOf(PonyfillAnyError,OriginalAnyError);
proxyStaticProperties(PonyfillAnyError,OriginalAnyError,shouldProxy)
};