
















export const proxyStaticProperties=(
PonyfillAnyError,
OriginalAnyError,
shouldProxy)=>
{
if(!shouldProxy){
return
}

STATIC_PROPERTIES.forEach((staticProperty)=>{
proxyStaticProperty(staticProperty,PonyfillAnyError,OriginalAnyError)
})
};

const STATIC_PROPERTIES=[
{
propName:"stackTraceLimit",
testPropName:"stackTraceLimit",
enumerable:true
},
{
propName:"captureStackTrace",
testPropName:"captureStackTrace",
enumerable:false
},
{
propName:"prepareStackTrace",
testPropName:"captureStackTrace",
enumerable:false
}];


const proxyStaticProperty=(
{propName,testPropName,enumerable},
PonyfillAnyError,
OriginalAnyError)=>
{
if(!(testPropName in OriginalAnyError)){
return
}


Object.defineProperty(PonyfillAnyError,propName,{
get:()=>OriginalAnyError[propName],
set:(value)=>{

OriginalAnyError[propName]=value
},
enumerable,
configurable:true
})
};