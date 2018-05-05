import { sleep } from "../sleep";
import { 
    cond, compose, equals, prop, isEmpty, when, fromPairs, 
    isNil, forEachObjIndexed, toPairs, evolve, ifElse, last, 
    map, mapObjIndexed, values, flatten, path, pick, identity
} from 'ramda';


let CryptoJS = require("crypto-js");

export let pwdToKey = (salt:string) => (pwd:string) => 
    CryptoJS.PBKDF2(pwd, salt, { keySize: 512/32, iterations: 10 }).toString();


export let encryptData = (key:string) => (data:string) : string => {
    let cipher = CryptoJS.AES.encrypt(data, key);
    //sleep(1500)
    //debugger;
    return cipher.toString();
};


export let decryptData = (key:string) => (data:string)=> {
    let decrypted = CryptoJS.AES.decrypt(data, key);
    //sleep(1500)
    //debugger;
    return decrypted.toString(CryptoJS.enc.Utf8);
};


let getTransformations = (f:Function) => ({
    todos:{
        title:f,
        checklist:map( evolve({text:f}) )
        //note(RawDraftContentState) TODO
    },
    projects:{
        name:f, 
        layout:map( 
            when( 
                item => prop('type')(item)==="heading",// isHeading, 
                evolve({title:f}) 
            ) 
        )
        //description(RawDraftContentState) TODO
    },
    areas:{
        name:f, 
        description:f
    },
    calendars:{
        events:map( 
            evolve({
                name:f,
                description:f
            })  
        )
    }
});



export let encryptDoc = (dbname:string,key:string) : (doc:any) => any => {
    let setEncrypted = (doc) => ({enc:true,...doc});
    let transformations = getTransformations( encryptData(key) )[dbname];
    //encrypt only if doc is not encrypted 
    let encrypt = when( doc => !doc.enc, evolve( transformations ) );

    //if no key supplied - do nothing
    if(isNil(key)){
        return identity;
    }else{
        return compose(setEncrypted, encrypt);
    }
};



export let decryptDoc = (dbname:string,key:string) : (doc:any) => any => {
    let setDecrypted = (doc) => ({enc:false,...doc});
    let transformations =  getTransformations( decryptData(key) )[dbname];
    //decrypt only if doc was encrypted 
    let decrypt = when( doc => doc.enc, evolve( transformations ) );
    
    //if no key supplied - do nothing
    if(isNil(key)){
        return identity;
    }else{
        return compose(setDecrypted, decrypt);
    }
};
