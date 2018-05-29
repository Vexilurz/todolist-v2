import { compose, split } from 'ramda'; 
const ADLER32 = require('adler-32'); 

export let emailToUsername = (email:string) : string => compose(
    list => `${list[0]}${ADLER32.str(email)}`, 
    split('@')
)(email);