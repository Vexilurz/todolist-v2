import { action } from "../types";

const sendMessage = postMessage as (action:action) => void;

export let onError = (error) => {
    sendMessage({type:'error', load:`pouch error ${error.message}  ${error.stack}`});
};