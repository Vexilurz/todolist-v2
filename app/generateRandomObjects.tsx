import './assets/styles.css'; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import PouchDB from 'pouchdb-browser';  
import { ChecklistItem } from './Components/TodoInput/TodoChecklist';
import { Category } from './Components/MainContainer';
import { randomArrayMember, randomInteger, randomDate } from './utils';
import { generateId, Todo, Heading, LayoutItem, Project, Area } from './database';
import { uniq, splitEvery } from 'ramda';
const randomWord = require('random-word');
let uniqid = require("uniqid"); 



let randomCategory = () : Category => {
    
    let categories : Category[] = [
    "inbox" , "today" , "upcoming" , "anytime" , "someday" , 
    //"logbook" , "trash" , "project" , "area" , 
    "evening"
    ];  

    return randomArrayMember(categories); 

};
 
   
    
let fakeTags = (n) : string[] => {
    
    let tags = [];
    let i  = randomInteger(n) + 5;

    
    for(let j=0; j<i; j++)
        tags.push(randomWord()); 

    return tags;

}
      


let fakeCheckListItem = (idx) : ChecklistItem => {

    let words : string[] = [];
    let k = randomInteger(3) + 2;


    for(let i=0; i<k; i++)
        words.push(randomWord());  
    

    return {  
        text : words.join(), 
        checked : Math.random() > 0.5 ? true : false,
        idx : idx,
        key : generateId()  
    } 

}
    
    
let fakeTodo = (tags:string[]) : Todo => {
    
    let checked = Math.random() > 0.5 ? true : false ;
    
    let title : string[] = [];
    let note : string[] = [];
    let checklist = [];

    let k = randomInteger(3) + 2;
    let n = randomInteger(6) + 2;
    let c = randomInteger(5) + 2;
    

    for(let i=0; i<k; i++)
        title.push(randomWord());  

    for(let i=0; i<n; i++) 
        note.push(randomWord());  

    for(let i=0; i<c; i++) 
        checklist.push(fakeCheckListItem(i));  
    
    
    return ({ 
        _id : generateId(),   
        type:"todo",
        category : randomCategory(), 
        title : title.join(),
        priority : Math.random()*999999999,
        note : note.join(),
        checklist : checklist, 
        reminder : Math.random() > 0.7 ? randomDate(new Date(), new Date()["addDays"](50)) : null, 
        attachedTags:tags,  
        deadline : randomDate(new Date(), new Date()["addDays"](50)),
        created : randomDate(new Date(), new Date()["addDays"](50)),
        deleted : Math.random() < 0.5 ? new Date() : undefined,
        attachedDate : randomDate(new Date(), new Date()["addDays"](50)), 
        completed : checked ? randomDate(new Date(), new Date()["addDays"](50)) : null,
        checked 
    });  
      
}
    
    
let fakeHeading = () : Heading => {

    let title : string[] = []; 

    let k = randomInteger(3) + 2;
    
    for(let i=0; i<k; i++)
        title.push(randomWord());  

    return {
        type : "heading", 
        title : title.join(), 
        _id : generateId(), 
        key : generateId()
    };  

} 
       
     
     
let fakeProject = (attachedTags:string[], layout:LayoutItem[]) : Project => {
    
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
        name : name.join(),  
        priority : Math.random()*999999999,
        deleted : Math.random() < 0.5 ? new Date() : undefined,
        description : description.join(),
        created : randomDate(new Date()["addDays"](-50), new Date()),
        deadline : randomDate(new Date(), new Date()["addDays"](50)),
        completed : checked ? randomDate(new Date(), new Date()["addDays"](50)) : null,
        layout,   
        attachedTags  
    };    

} 
    
    
    
let fakeArea = ( 
    attachedTodosIds, 
    attachedProjectsIds,
    attachedEventsIds, 
    attachedTags 
) : Area => {
    
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
        type : "area", 
        deleted : Math.random() < 0.5 ? new Date() : undefined,
        priority : Math.random()*999999999,
        name : name.join(),    
        description : description.join(),  
        attachedTags, 
        created : randomDate(new Date()["addDays"](-50), new Date()),
        attachedTodosIds:uniq(attachedTodosIds), 
        attachedProjectsIds:uniq(attachedProjectsIds)
    }  
    
}
    
    
    
let generateProjectLayout = (generateTodosIds:string[],n:number) : LayoutItem[] => { 

    let layout = [];

    for(let i=0; i<n; i++){
        let r = Math.random(); 
        if(r > 0.7){
            layout.push(fakeHeading());
        }else{
            layout.push(randomArrayMember(generateTodosIds));
        }
    }  

    return layout;

}

    
export let generateRandomDatabase = (
    
    { todos, projects, areas } : 
    
    {  
        todos : number, 
        projects : number, 
        areas : number  
    }
    
) : { 
    
    todos : Todo[],
    projects : Project[],
    areas : Area[] 
        
} => { 
      
    let tags = fakeTags(8);
    let tagsChunks = splitEvery(3, tags); 
    let todosItems : Todo[] = [];

    for(let i=0; i<todos; i++)
        todosItems.push(fakeTodo(randomArrayMember(tagsChunks)));

    let generateTodosIds = todosItems.map( (t:Todo) => t._id );
    let generateTodosIdsChunks = [];

    for(let i=0; i<todos; i++){   
        let interval = Math.round(Math.random() * todos);
        let chunk = [];
        for(let j=0; j<interval; j++)
            chunk.push(randomArrayMember(generateTodosIds));
        generateTodosIdsChunks.push(chunk);   
    }
     
    let projectItems = [];
      
    for(let i=0; i<projects; i++){
        let project = fakeProject(
            randomArrayMember(tagsChunks), 
            generateProjectLayout(generateTodosIds,10)
        );

        projectItems.push(project);
    }
       
    let generateProjectsIds = projectItems.map( (p:Project) => p._id );
    let projectsIdsChunks = splitEvery( Math.round(Math.random()*5), generateProjectsIds );
    let areasItems = [];
     
    for(let i=0; i<areas; i++){
        let areaItem = fakeArea(
            generateTodosIdsChunks[i] ? generateTodosIdsChunks[i] : [], 
            projectsIdsChunks[i] ? projectsIdsChunks[i] : [], 
            [],
            randomArrayMember(tagsChunks)
        );
    
        areasItems.push(areaItem)
    }

    return { 
        todos : todosItems,
        projects : projectItems,
        areas : areasItems 
    }

}
    
    
    
    
    