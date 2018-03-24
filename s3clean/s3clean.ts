
import { isNil, not, forEachObjIndexed, any, split, all, when, contains, compose, equals, ifElse, reject, isEmpty, defaultTo, map } from 'ramda';  
import AWS = require('aws-sdk');
import { isNewVersion } from '../app/utils/isNewVersion';
AWS.config.update({ 
    "accessKeyId": "AKIAJIB2J2OEHLXZYACQ", 
    "secretAccessKey": "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", 
    "region": "us-east-1" 
});
let s3 = new AWS.S3();


interface s3Item{ 
    Key: string,
    LastModified: string,
    ETag: string,
    Size: number,
    StorageClass: string,
    Owner: any 
}

interface s3List{ 
    IsTruncated?: boolean,
    Marker?: string,
    Contents: s3Item[],
    Name: string,
    Prefix: string,
    MaxKeys: number,
    CommonPrefixes: any[] 
}

const Bucket = "todoappupdates";

let getS3List = () : Promise<s3Item[]> => new Promise(
    resolve => s3.listObjects(
        {Bucket}, 
        (err,data) => {

            if(isNil(err)){
                let list = data.Contents;
                resolve(list as any)
            }else{
                resolve([])
            }
        }
    ) 
);


let removeObjects = (keys:string[]) : Promise<any> => new Promise(
    resolve => {
        s3.deleteObjects(
            {
                Bucket, 
                Delete:{ Objects:compose(map( Key => ({Key}) ), defaultTo([]))(keys) }
            }, 
           (err, data) => {
                if(isNil(err)){
                    resolve(data)
                }else{
                    resolve(undefined)
                }
            }
        );
    }
);


let removeOlderVersions = () : Promise<any> => {
    let lastValuableVersion = `tasklist Setup ${process.argv[2]}-master.exe`;

    if(isNil(process.argv[2])){
       console.log(`Incorrect argument`); 
       return;
    }else if(typeof process.argv[2] !=="string"){
       console.log(`Incorrect argument`); 
       return;
    }else if( compose(any(isNaN), map((v) => Number(v)), split('.') )(process.argv[2]) ){
       console.log(`Incorrect argument`); 
       return;
    }
  
    console.log(`remove all versions before ${lastValuableVersion}`);

    return getS3List()
    .then(
        compose(
            (items) => items.filter((Key) => isNewVersion(Key,lastValuableVersion)), 
            (items) => items.filter((Key) => contains('tasklist')(Key)),
            map((item:s3Item) => item.Key),
            defaultTo([])
        )
    ).then(
        (keys:any[]) => {
            console.log(`items to remove`,keys);
            return keys;
        }
    ).then( 
        (keys:string[]) => removeObjects(keys)
    ).then(
        (result) => console.log(result)
    )
};




removeOlderVersions()
.then(() => 
    getS3List()
    .then((list) => console.log(`done`, list))
);