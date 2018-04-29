const passwordValidator = require('password-validator');
import { cond, contains } from 'ramda';

export let getPasswordErrorMessage =
    cond([
        [contains("min"), () => `Passwords must be at least 8 characters long`],
        [contains("max"), () => `The password must not contain more tha 100 characters`],
        [contains("uppercase"), () => `Passwords must have uppercase letters`],
        [contains("lowercase"), () => `Passwords must have lowercase letters`],
        [contains("digits"), () => `Passwords must have digits`],
        [contains("spaces"), () => `Passwords should not have spaces`],
        [() => true, () => null]
    ]);



export let validatePassword = (password:string) => {
    let schema = new passwordValidator();

    schema
    .is().min(8)                                    
    .is().max(100)                                 
    .has().uppercase()                              
    .has().lowercase()                              
    .has().digits()                                 
    .has().not().spaces()                           

    
    return schema.validate(password, { list: true });   
};
