
export const setNonEnumProp=(object,propName,value)=>{

Object.defineProperty(object,propName,{
value,
writable:true,
enumerable:false,
configurable:true
})
};


export const setNonEnumReadonlyProp=(object,propName,value)=>{

Object.defineProperty(object,propName,{
value,
writable:false,
enumerable:false,
configurable:true
})
};


export const setFrozenProp=(object,propName,value)=>{

Object.defineProperty(object,propName,{
value,
writable:false,
enumerable:false,
configurable:false
})
};