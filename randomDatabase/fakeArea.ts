import { randomInteger, randomWord, randomDate } from "./utils";
import { generateId } from "../app/utils/generateId";
import { uniq } from 'ramda';
import { Area } from "../app/types";



export let fakeArea = (attachedTodosIds,attachedProjectsIds,attachedEventsIds,attachedTags) : Area => {
    
    let name : string[] = [];
    
    let k = randomInteger(3) + 2;
    
    for(let i=0; i<k; i++){
        name.push(randomWord());
    } 
    
    let description : string[] = [];
            
    let l = randomInteger(3) + 2;
    
    for(let i=0; i<l; i++){
        description.push(randomWord());  
    }

    return {  
        _id : generateId(),   
        type : "area", 
        deleted : null, // Math.random() < 0.2 ? randomDate(new Date(), new Date()["addDays"](-50)) : undefined,
        priority : Math.random()*999999999,
        name : name.join(' '),    
        description : description.join(' '),  
        attachedTags, 
        created : null, //randomDate(new Date()["addDays"](-50), new Date()),
        attachedProjectsIds:uniq(attachedProjectsIds)
    };
};