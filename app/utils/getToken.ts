import { btoa } from 'pouchdb-binary-utils';
import { compose } from 'ramda';


export let getToken = compose(
    btoa,
    unescape,
    encodeURIComponent,
    auth => auth.username + ':' + auth.password
);   