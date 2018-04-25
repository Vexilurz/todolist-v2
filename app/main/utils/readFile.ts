const fs = require('fs');

export let readFile = (path:string) : Promise<any> => 
    new Promise(
        resolve => fs.readFile(
            path, 
            'utf8', 
            (err, data) => {
                if(err){ 
                resolve(null); 
                }else{ 
                resolve(data);  
                }
            }
        )
    );




