const jsftp = require("jsftp");
import fs = require('fs');     
let path = require("path");


let version = '1.0.1';//json.version
let from = path.resolve(`release`,`tasklist Setup ${version}.exe`);
let to = `tasklist Setup ${version}.exe`; 



let publish = (from:string, to:string) => 
    new Promise(
        resolve => {
            const ftp = new jsftp({
                host:"todoupdates.pixelbutler.com",  
                port:21,
                user:"updateservice@pixelbutler.com", 
                pass:"}gP*S}}l-Fwd"
            });  

            fs.readFile(
                from, 
                (err, buffer) => {
                    if(err) { resolve(err) }
                    else {
                        ftp.put(buffer, to, (err) => {
                            if (err) { resolve(err) }
                            else{ resolve(null) }
                        });
                    }
                }
            );
        }
    )
