import './../assets/styles.css'; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import PouchDB from 'pouchdb-browser';  
import { ChecklistItem } from '.././Components/TodoInput/TodoChecklist'; 
import { Category } from '.././Components/MainContainer'; 
import { randomArrayMember, randomInteger, randomDate, fiveMinutesLater, onHourLater, isToday } from './utils';
import { Todo, Heading, LayoutItem, Project, Area } from './../database';
import { uniq, splitEvery, contains, isNil, not } from 'ramda';
import { generateId } from './generateId';
import { isString } from './isSomething';
import { assert } from './assert';
const randomWord = require('random-word');
let uniqid = require("uniqid"); 
 


let randomCategory = () : Category => {
    
    let categories : Category[] = [
        "inbox" , "today" , "upcoming" , "next" , "someday" , 
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
        text : words.join(' '), 
        checked : Math.random() > 0.5 ? true : false,
        idx : idx, 
        key : generateId(),
        _id : generateId()  
    } 

}
    
    
export let fakeTodo = (tags:string[], remind = null) : Todo => {
    let checked = Math.random() > 0.5 ? true : false;
    
    let title : string[] = [];
    let note : string[] = [];
    let checklist = [];

    let k = randomInteger(3) + 2;
    let n = randomInteger(6) + 2;
    let c = randomInteger(5) + 2;
    
    for(let i=0; i<k; i++){
        title.push(randomWord()); 
    } 

    for(let i=0; i<n; i++){ 
        note.push(randomWord());  
    }

    for(let i=0; i<c; i++){ 
        checklist.push(fakeCheckListItem(i));  
    }

    let attachedDate = Math.random() < 0.3 ? null :
                       Math.random() > 0.5 ? 
                       randomDate(new Date(), new Date()["addDays"](50)) : 
                       new Date();

    let deleted = Math.random() < 0.2 ? randomDate(new Date(), new Date()["addDays"](-50)) : undefined; 
    
    let completedSet = checked ? new Date() : null;
    let completedWhen = checked ? randomDate(new Date(), new Date()["addDays"](-50)) : null;                

    let reminder = isToday(attachedDate) && isNil(deleted) && not(checked) ?  
                   randomDate(new Date(), fiveMinutesLater(new Date())) : 
                   null; //onHourLater(date) //fiveMinutesLater(date);
    
    //reminder = randomDate(new Date(), new Date()["addDays"](-50)); 
    
    return ({  
        _id:generateId(),     
        type:"todo",
        category:randomCategory(), 
        title:title.join(' '), 
        priority:Math.random()*999999999,
        note:note.join(' '),
        checklist:checklist,   
        reminder:null,//:remind,  
        attachedTags:tags,   
        deadline:Math.random() < 0.3 ? null :
                 Math.random() > 0.5 ?
                 randomDate(new Date(), new Date()["addDays"](50)) : 
                 new Date(), 
        created:randomDate(new Date(), new Date()["addDays"](50)),
        deleted,
        attachedDate,
        completedSet,
        completedWhen 
    });   
};
    
    
let fakeHeading = () : Heading => {

    let title : string[] = []; 

    let k = randomInteger(3) + 2;
    
    for(let i=0; i<k; i++)
        title.push(randomWord());  

    return {
        type : "heading", 
        priority:randomInteger(9999999),
        title : title.join(' '), 
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
        name : name.join(' '),  
        priority : Math.random()*999999999,
        deleted : Math.random() < 0.2 ? randomDate(new Date(), new Date()["addDays"](-50)) : undefined,
        description : description.join(' '), 
        created : randomDate(new Date()["addDays"](-50), new Date()),
        deadline : randomDate(new Date(), new Date()["addDays"](50)),
        completed : checked ? randomDate(new Date(), new Date()["addDays"](-50)) : null,
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
        deleted : Math.random() < 0.2 ? randomDate(new Date(), new Date()["addDays"](-50)) : undefined,
        priority : Math.random()*999999999,
        name : name.join(' '),    
        description : description.join(' '),  
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
            let heading = fakeHeading();

            if(!contains(heading._id)( layout.map(i => isString(i) ? i : i._id) ))
               layout.push(heading); 
        }else{
            let todoId = randomArrayMember(generateTodosIds);

            if(!contains(todoId)(layout))  
               layout.push(todoId);
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
        let fakeLayout = generateProjectLayout(generateTodosIds,25);

        let ids = fakeLayout.map( (i:any) => isString(i) ? i : i._id ); 

        assert(uniq(ids).length===ids.length, 'duplicate ids in project layout.');
         
        let project = fakeProject(randomArrayMember(tagsChunks),fakeLayout);
 
        projectItems.push(project);
    }
       
    let generateProjectsIds = projectItems.map( (p:Project) => p._id );
    let projectsIdsChunks = splitEvery(Math.round(Math.random()*5)+1, generateProjectsIds );
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
    
    
    
    
    