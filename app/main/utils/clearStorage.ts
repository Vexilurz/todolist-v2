import { isNil } from 'ramda';
const storage = require('electron-json-storage');
const os = require('os');
storage.setDataPath(os.tmpdir());

export let clearStorage = () : Promise<void> => {
    return new Promise( 
        (resolve) => storage.clear(
            (error) => {
                if(!isNil(error)){ 
                    resolve(error) 
                }else{ 
                    resolve() 
                }
            }
        )
    )
};
