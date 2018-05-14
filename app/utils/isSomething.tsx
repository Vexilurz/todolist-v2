import { all, isNil, contains, not, has, compose, and, complement } from 'ramda';
import { Area, Project, Todo, Heading, Category, Item } from './../types';
import { daysRemaining } from './daysRemaining';


export let isNotNil = complement(isNil);



export let isRepeatOptions = (options:any) : boolean => {
    if(isNil(options)){ return false }

    let freq = ['week' , 'day' , 'month' , 'year'];
    let option = ['on' , 'after' , 'never'];
    
    return isNumber(options.interval) && 
           isNumber(options.count) && 
           contains(options.freq)(freq) && 
           contains(options.selectedOption)(option) 
           //&& isDate(options.until);
};



export let isToday = (date : Date) => {
    if(isNil(date)){ return false }; 

    if(isDate(date)){ 
       return daysRemaining(date)===0;
    } 

    if(isString(date)){
       let maybeDate = new Date(date);
       if(isDate(maybeDate)){
          return daysRemaining(date)===0;
       }
    } 
  
    return false;
};  



export let isTomorrow = (date : Date) => {
    if(isNil(date)){ return false }; 

    if(isDate(date)){ 
       return daysRemaining(date)===1;
    } 

    if(isString(date)){
       let maybeDate = new Date(date);
       if(isDate(maybeDate)){
          return daysRemaining(date)===1;
       }
    } 
  
    return false;
};  



export let isDomElement = (element:any) => element instanceof Element;
 


export let allHave = (prop:string) => (items:any[]) => isNotArray(items) ? false : all(has(prop), items);



export let isNumber = (item) => compose(not,isNaN)(item);



export let isArrayOfDOMElements = (array:any) : boolean => 
           isNotArray(array) ? 
           false : 
           all((item) => isDomElement(item), array);



export let isArrayOfNumbers = (array:any[]) : boolean => isNotArray(array) ? false : all(isNumber,array);



export let isNotArray = (items:any[]) => compose(not, isArray)(items); 



export let isItem = (item:Item) : boolean => isNil(item) ? false : item.type==="project" || 
                                                                   item.type==="area" || 
                                                                   item.type==="todo";



export let isCalendar = (item:any) => item.type==="calendar";    



export let isEvent = (item:any) => {
    if(isNil(item)){ return false }
    return isString(item.name) && isDate(item.start) && isDate(item.end);
};



export let isHeading = (item:any) : boolean => isNil(item) ? false : item.type==="heading";



export let isArray = (item:any[]) : boolean => Array.isArray(item); 
   


export let isOneElementArray = (list:any[]) : boolean => {
    if(isArray(list)){ return list.length===1; }
    return false;
};



export let isManyElementsArray = (list:any[]) : boolean => {
    if(isArray(list)){ return list.length>1; }
    return false;
};



export let isDate = (date) : boolean => isNil(date) ? false : (date instanceof Date && isFunction(date.getTime)); 
 


export let isNotDate = (date) : boolean => not(isDate(date)); 



export let isFunction = (item) : boolean => typeof item==="function"; 
 


export let isString = (item) : boolean => typeof item==="string"; 


  
export let isCategory = (category : Category) : boolean => { 
    if(isNil(category)){ return false; }
    let categories : Category[] = [
        "inbox" , "today" , "upcoming" , "next" , "someday" , 
        "logbook" , "trash" , "project" , "area" , "evening" , 
        "deadline", "group", "search"
    ];  
    let yes = contains(category,categories);
    return yes; 
};     



export let bySomeday = (todo:Todo) : boolean => todo.category==="someday";



export let isBoolean = (variable:any) : boolean => {
    return typeof(variable) == typeof(true); 
};



export let isTodo = (todo:any) : boolean => { 
    if(isNil(todo)){ return false } 
    return todo.type==="todo";
};



export let isNotTodo = complement(isTodo);



export let isArrayOfTodos = (array:any[]) : boolean => {
    return all((todo:Todo) => isTodo(todo), array );
}; 



export let isProject = (project:Project) : boolean => {
    if(isNil(project)){ return false }
    return project.type==="project"; 
}; 



export let isArrayOfProjects = (array:any[]) : boolean => {
   return all((project:Project) => isProject(project), array );
}; 
 


export let isArea = (area:Area) : boolean => {
    if(isNil(area)){ return false }  
    return area.type==="area"; 
};


  
export let isArrayOfAreas = (array:any[]) : boolean => {
    return all((area:Area) => isArea(area), array );
};



export let isArrayOfStrings = (array:any[]) : boolean => isNotArray(array) ? false : all(isString,array);
