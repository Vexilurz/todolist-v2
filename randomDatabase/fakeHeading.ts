import { generateId } from "../app/utils/generateId";
import { Heading } from "../app/types";
import { randomInteger, randomWord } from "./utils";

export let fakeHeading = () : Heading => {

    let title : string[] = []; 

    let k = randomInteger(3) + 2;
    
    for(let i=0; i<k; i++){
        title.push(randomWord());  
    }

    return {
        type : "heading", 
        priority:randomInteger(9999999),
        title : title.join(' '), 
        _id : generateId(), 
        key : generateId()
    };  
}; 
  