import * as EmailValidator from 'email-validator';
 
export let validateEmail = (email:string) : boolean => {
    let emailValid = EmailValidator.validate(email);
    return emailValid;
};