import { compose } from 'ramda';

export let getCredentialsFromToken = (token) => {
    let result = compose(
        tuple => ({username:tuple[0], password:tuple[1]}),
        s => s.split(':'),
        atob
    )(token);
    return result;
};