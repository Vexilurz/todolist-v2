import { ipcRenderer, remote } from 'electron';
const fs = remote.require('fs');


export let readJsonFile = (path:string) : Promise<any> => 
    new Promise(
        resolve => {
            fs.readFile(
                path, 
                'utf8', 
                (err, data) => {
                    if (err){ resolve(err) }
                    else{ resolve(JSON.parse(data)) }
                }
            );
        }
    );

export let writeJsonFile = (obj:any,pathToFile:string) : Promise<any> => 
    new Promise(
        resolve => {
            let json : string = JSON.stringify(obj);
            fs.writeFile(
                pathToFile, 
                json, 
                'utf8', 
                (err) => {
                    if(err){ resolve(err) }
                    else{ resolve() }
                } 
            );
        }
    );