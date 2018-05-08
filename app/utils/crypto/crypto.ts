import { sleep } from "../sleep";
import { 
    cond, compose, equals, prop, isEmpty, when, fromPairs, 
    isNil, forEachObjIndexed, toPairs, evolve, ifElse, last, 
    map, mapObjIndexed, values, flatten, path, pick, identity
} from 'ramda';
let CryptoJS = require("crypto-js");
const testKey = "abcdabcdabcdabcd";



export let encryptData = (key:string) => (data) : string => {
    let iv = [ 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,35, 36 ];

    let cipher = CryptoJS.AES.encrypt(
        data, 
        testKey, 
        {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7, iv}
    ).toString();

    return cipher;
};
 


export let decryptData = (key:string) => (data:string)=> {
    let iv = [ 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,35, 36 ];

    let decrypted = CryptoJS.AES.decrypt(
        data, 
        testKey,
        {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7, iv}
    ).toString(CryptoJS.enc.Utf8);
    return decrypted;
};



let getTransformations = (f:Function) => ({
    todos:{
        title:f,
        checklist:map( evolve({text:f}) ),
        attachedTags:map( f )
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



export let encryptDoc = (dbname:string, key:string, onError:Function) : (doc:any) => any => {
    let setEncrypted = (doc) => ({...doc,enc:true});
    let transformations = getTransformations( encryptData(key) )[dbname];
    
    //if no key supplied - do nothing
    if(isNil(key)){
        return identity;
    }else{
        return compose(setEncrypted, evolve( transformations ));
    } 
};



export let decryptDoc = (dbname:string, key:string, onError:Function) : (doc:any) => any => {
    let setDecrypted = (doc) => ({...doc,enc:false});
    let transformations =  getTransformations( decryptData(key) )[dbname];
    
    //if no key supplied - do nothing
    if(isNil(key)){ 
        return identity;
    }else{
        return compose(setDecrypted, evolve( transformations )); 
    } 
};
 