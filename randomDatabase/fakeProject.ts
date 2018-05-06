import { randomInteger, randomWord, randomDate } from "./utils";
import { generateId } from "../app/utils/generateId";
import { noteFromText } from "../app/utils/draftUtils";
import { LayoutItem, Project } from "../app/types";



export let fakeProject = (attachedTags:string[], layout:LayoutItem[]) : Project => {
    
    let checked = Math.random() > 0.5 ? true : false;

    let name : string[] = [];
    
    let k = randomInteger(3) + 2;
    
    for(let i=0; i<k; i++)
        name.push(randomWord()); 
        
    let description : string[] = [];
             
    let l = randomInteger(3) + 2;
    
    for(let i=0; i<l; i++)
        description.push(randomWord());  
    
    return {    
        _id : generateId(),    
        type : "project", 
        name : name.join(' '),  
        priority : Math.random()*999999999,
        deleted : Math.random() < 0.2 ? randomDate(new Date(), new Date()["addDays"](-50)) : undefined,
        description : noteFromText(description.join(' ')), 
        created : randomDate(new Date()["addDays"](-50), new Date()),
        deadline : randomDate(new Date(), new Date()["addDays"](50)),
        completed : checked ? randomDate(new Date(), new Date()["addDays"](-50)) : null,
        layout,     
        attachedTags  
    };    
}; 
    