
export const hasSupport=()=>{
const cause=Symbol("");
return new Error("test",{cause}).cause===cause
};