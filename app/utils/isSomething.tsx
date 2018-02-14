import { all, isNil, contains, not, has, compose } from 'ramda';
import { Area, Project, Todo } from './../database';
import { Category } from '.././Components/MainContainer';
export type Item = Area | Project | Todo; 

 
export let isDomElement = (element:any) => element instanceof Element;
 

export let allHave = (prop:string) => (items:any[]) => isNotArray(items) ? false : all(has(prop), items);


export let isNumber = (item) => compose(not,isNaN)(item);


export let isArrayOfDOMElements = (array:any) : boolean => 
            isNotArray(array) ? 
            false : 
            all((item) => isDomElement(item), array);


export let isArrayOfNumbers = (array:any[]) : boolean => isNotArray(array) ? false : all(isNumber,array);


export let isNotArray = (items:any[]) => compose(not, isArray)(items); 


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


export let isArrayOfStrings = (array:any[]) : boolean => isNotArray(array) ? false : all(isString,array);
