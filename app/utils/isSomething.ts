import { all, isNil, contains } from 'ramda';
import { Area, Project, Todo } from './../database';
import { Category } from '.././Components/MainContainer';
export type Item = Area | Project | Todo; 


export let isItem = (item:Item) : boolean => item.type==="project" || item.type==="area" || item.type==="todo";


export let isArray = (item:any[]) : boolean => Array.isArray(item); 
 

export let isDate = (date) : boolean => (date instanceof Date) && !isNaN( date.getTime() ); 
 

export let isFunction = (item) : boolean => typeof item==="function"; 


export let isString = (item) : boolean => typeof item==="string"; 


export let isCategory = (category : Category) : boolean => { 

    let categories : Category[] = [
        "inbox" , "today" , "upcoming" , "next" , "someday" , 
        "logbook" , "trash" , "project" , "area" , "evening" , 
        "deadline", "group", "search"
    ];  

    let yes = contains(category,categories);
 
    return yes; 
}     



export let bySomeday = (todo:Todo) : boolean => todo.category==="someday";



export let isTodo = (todo:any) : boolean => { 
    if(isNil(todo)){ return false } 

    return todo.type==="todo";
}



export let isArrayOfTodos = (array:any[]) : boolean => {
    return all((todo:Todo) => isTodo(todo), array );
} 



export let isProject = (project:Project) : boolean => {
    if(isNil(project)){ return false }

    return project.type==="project"; 
} 



export let isArrayOfProjects = (array:any[]) : boolean => {
   return all((project:Project) => isProject(project), array );
} 
 


export let isArea = (area:Area) : boolean => {
    if(isNil(area)){ return false }
    return area.type==="area"; 
}
  

  
export let isArrayOfAreas = (array:any[]) : boolean => {
    return all((area:Area) => isArea(area), array );
}



export let isArrayOfStrings = (array:any[]) : boolean => {
    if(!isArray(array))
       return false;

    for(let i=0; i<array.length; i++){
        if(!isString(array[i]))
           return false;   
    }

    return true; 
}
 