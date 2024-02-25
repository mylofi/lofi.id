import{getErrors}from"./ponyfill.js";
import{setNonEnumProp}from"./set.js";
import{hasSupport}from"./support.js";






export const polyfill=()=>{
if(hasSupport()){
return noop
}

const PonyfillErrors=getErrors();
const OriginalErrors=Object.fromEntries(
Object.entries(PonyfillErrors).map(getOriginalAnyError)
);
Object.entries(PonyfillErrors).forEach(polyfillErrorClass);
return undoPolyfill.bind(undefined,OriginalErrors)
};


const noop=()=>{};

const getOriginalAnyError=([name])=>[name,globalThis[name]];

const polyfillErrorClass=([name,PonyfillAnyError])=>{
setNonEnumProp(globalThis,name,PonyfillAnyError)
};









const undoPolyfill=(OriginalErrors)=>{
if(globalThis.Error===OriginalErrors.Error){
return
}

Object.entries(OriginalErrors).forEach(undoPolyfillErrorClass)
};

const undoPolyfillErrorClass=([name,OriginalAnyError])=>{
setNonEnumProp(globalThis,name,OriginalAnyError)
};