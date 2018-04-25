const fs = require('fs');

export let readJsonFile = (path:string) : Promise<any> => 
    new Promise(
        resolve => {
            try{
                fs.readFile(
                    path, 
                    'utf8', 
                    (err, data) => {
                        if (err){ resolve(err) }
                        else{ 
                            let result = {};

                            try{
                                result = JSON.parse(data);
                            }catch(e){
                                resolve(result);
                            }

                            resolve(result);  
                        }
                    }
                );
            }catch(e){
                resolve({});
            }
        }
    );