const session = require('electron').remote.session;
//require('electron-cookies')


export let removeAuthCookies = (url:string) : Promise<void> => 
    new Promise( 
        (resolve, reject) => {
            let type = 'AuthToken';
            session.defaultSession.cookies.remove(
                url, 
                type, 
                err => resolve() 
            )
        }
    ); 