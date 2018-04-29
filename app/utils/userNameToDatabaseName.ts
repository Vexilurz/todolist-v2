import { toLower } from 'ramda';
const ADLER32 = require('adler-32'); 

/**
 * convert username into specific database type name
 */
export let userNameToDatabaseName = (username:string) => (type:string) : string => {
    return toLower(`${username}-${type}-${ADLER32.str(username)}`);
};