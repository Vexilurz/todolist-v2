//const session = require('electron').remote.session;
//require('electron-cookies')

export let removeCouchCookies = (url:string) : Promise<void> => 
    new Promise( 
        (resolve, reject) => {
            let type = "AuthSession";
            const session = require('electron').remote.session; // TODO
            session.defaultSession.cookies.remove(
                url, 
                type, 
                err => resolve() 
            )
        }
    ); 