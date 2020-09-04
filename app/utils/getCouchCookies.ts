import { Cookie } from "../types";
// const session = require('electron').remote.session;
//require('electron-cookies')

export let getCouchCookies = (url:string) : Promise<Cookie[]> => 
    new Promise( 
        (resolve, reject) => {
            const session = require('electron').remote.session; // TODO
            session.defaultSession.cookies.get(
                {url}, 
                (error, cookies:any[]) => {
                    if(error){ reject(error) }
                    else{ resolve(cookies) } 
                }
            )
        }
    );
