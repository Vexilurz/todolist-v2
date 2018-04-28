import { compose, split } from 'ramda'; 

export let emailToUsername = (email:string) : string => compose(list => list[0], split('@'))(email);