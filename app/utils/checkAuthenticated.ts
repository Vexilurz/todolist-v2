import { getCouchCookies } from "./getCouchCookies";
import { isCouchSessionExpired } from "./isCouchSessionExpired";
import { host } from "./couchHost";


export let checkAuthenticated = () : Promise<boolean> => getCouchCookies(host).then( list => !isCouchSessionExpired(list) )

