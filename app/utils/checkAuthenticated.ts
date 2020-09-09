import { getCouchCookies } from "./getCouchCookies";
import { isCouchSessionExpired } from "./isCouchSessionExpired";
import { host } from "./couchHost";

// usings of this file commented out
export let checkAuthenticated = () : Promise<boolean> => getCouchCookies(host).then( list => !isCouchSessionExpired(list) )

