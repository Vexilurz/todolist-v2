import { sleep } from "../sleep";
import { 
    cond, compose, equals, prop, isEmpty, when, fromPairs, 
    isNil, forEachObjIndexed, toPairs, evolve, ifElse, last, 
    map, mapObjIndexed, values, flatten, path, pick, identity
} from 'ramda';
let aesjs = require('aes-js');

let CryptoJS = require("crypto-js");



export let pwdToKey = (salt:string) => (pwd:string) => 
    CryptoJS.PBKDF2(pwd, salt, { keySize: 512/32, iterations: 10 }).toString();



export let encryptData = (key:string) => (data) : string => {
    //let k = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    let iv = [ 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,35, 36 ];
    let testKey = "abcdabcdabcdabcd";
    //aesjs.utils.utf8.toBytes(key);
    //let m = (n) => n + (32 - (n % 32));
    /*var textBytes = aesjs.utils.utf8.toBytes(data);
    var aesOfb = new aesjs.ModeOfOperation.ofb(k, iv);
    var encryptedBytes = aesOfb.encrypt(textBytes);
    var cipher = aesjs.utils.hex.fromBytes(encryptedBytes);*/
    
    let cipher = CryptoJS.AES.encrypt(
        data, 
        testKey, 
        {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7, iv}
    ).toString();

    return cipher;
};
 


export let decryptData = (key:string) => (data:string)=> {
    //let k =  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    //aesjs.utils.utf8.toBytes(key);
    let iv = [ 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,35, 36 ];
    let testKey = "abcdabcdabcdabcd";
    /*let encryptedBytes = aesjs.utils.hex.toBytes(data);
    var aesOfb = new aesjs.ModeOfOperation.ofb(k, iv);
    let decryptedBytes = aesOfb.decrypt(encryptedBytes);

    let decrypted = aesjs.utils.utf8.fromBytes(decryptedBytes);*/

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
    //encrypt only if doc is not encrypted 
    let encrypt = when( doc => !doc.enc, evolve( transformations ) );

    //if no key supplied - do nothing
    if(isNil(key)){
        return identity;
    }else{
        return compose(setEncrypted, encrypt);
    } 
};



export let decryptDoc = (dbname:string, key:string, onError:Function) : (doc:any) => any => {
    let setDecrypted = (doc) => ({...doc,enc:false});
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
 