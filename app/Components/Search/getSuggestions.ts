import '../../assets/styles.css';  
import { Todo, Area, Project } from '../../types';
import { isNil, not, isEmpty, contains, compose, any } from 'ramda';
import { isArray } from '../../utils/isSomething';
import { limitGroups } from './limitGroups';
import { todoToKeywords } from './todoToKeywords';



export let getSuggestions = (
    todos:Todo[], 
    projects:Project[], 
    areas:Area[],
    searchQuery:string,
    limit:number
) : {
    attached : { project:Project, todos:Todo[] }[],
    detached : Todo[],
    limitReached : boolean 
} => { 
    let limitedGroups = limitGroups(3, todos);  
    let cutBy = (by:String, words:string[]) => words.map(word => word.substring(0,by.length));
    let table = {};
    let detached = []; 
    let attached = []; 
    let limitReached = true;
    let match = (searchKeywords:string[],keywords:string[]) => 
        any(
            (searchKeyword:string) => contains(searchKeyword)(cutBy(searchKeyword,keywords))
        )(searchKeywords); 

    for(let i=0; i<limitedGroups.length; i++){

        if((attached.length + detached.length) > limit){ 
            limitReached = false;
            break; 
        }
    
        let todo = limitedGroups[i];
        let keywords = todoToKeywords(todo); //lowered and trimmed words from todo title + attachedTags
        let searchKeywords = searchQuery
                             .trim()
                             .toLowerCase()
                             .split(' ')
                             .filter(compose(not,isEmpty)); 
        
        if(match( searchKeywords , keywords )){
            let project = projects.find((p) => contains(todo._id)(p.layout as any)); 

            if(isNil(project)){ detached.push(todo) }
            else{ 
                attached.push(todo);

                if(isNil(table[project._id])){
                   table[project._id] = [todo]; 
                }else if(isArray(table[project._id])){ 
                   table[project._id].push(todo); 
                }  
            }
        } 
    }

    return {    
        attached:projects
                .map((project:Project) => ({project, todos:table[project._id]}))
                .filter(({project,todos}) => isNil(todos) ? false : !isEmpty(todos)),
        detached,
        limitReached   
    }; 
};   



