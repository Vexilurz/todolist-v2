import '../../assets/styles.css';  
import { Category, Todo, Area, Project, Heading } from '../../types';
import { contains, flatten, compose, any, all } from 'ramda';
import { isString, isHeading } from '../../utils/isSomething';
import { isDev } from '../../utils/isDev';
import { assert } from '../../utils/assert';
import { groupByProject } from '../project/groupByProject';
import { limitGroups } from './limitGroups';
import { groupProjectsByArea } from '../Area/groupProjectsByArea';
import { getNotePlainTextFromRaw } from '../../utils/draftUtils';
import { stringToKeywords } from './stringToKeywords';
import { todoToKeywords } from './todoToKeywords';
import { cutBy } from './cutBy';



export let match = (searchKeywords:string[],keywords:string[]) => 
        any(
            (searchKeyword:string) => contains(searchKeyword)(cutBy(searchKeyword)(keywords))
        )(searchKeywords); 



const categories = ["inbox", "today", "upcoming", "next", "someday", "logbook", "trash"];



let projectToKeywords = table => (p:Project) : string[] => {
    let keywords = [];
    let headings = p.layout.filter(isHeading) as Heading[];
    let description = getNotePlainTextFromRaw(p.description);

    keywords.push( ...stringToKeywords(p.name) );
    keywords.push( ...stringToKeywords(description) );
    keywords.push( ...flatten( headings.map((h => stringToKeywords(h.title))) ) );

    if(isDev()){
        assert(
           all(isString,keywords), 
           `not all keywords are of type string. projectToKeywords. ${JSON.stringify(keywords)}`
        )
    }

    return keywords;
};



let tagToKeywords = (t:string) : string[] => {
    return stringToKeywords(t);
};



let categoryToKeywords = (c:Category) : string[] => {
    return [c];
};



export let todoMatch = (searchQuery:string) => (todo:Todo) : boolean => {
    let keywords = todoToKeywords(todo);
    
    return match(stringToKeywords(searchQuery),keywords);
};



let tagMatch = (searchQuery:string) => (tag:string) : boolean => {
    let keywords = tagToKeywords(tag);
    
    return match(stringToKeywords(searchQuery),keywords);
};



let projectMatch = (searchQuery:string,tableWithTodos) => 
    (project:Project) : boolean => {
        let toKeywords = projectToKeywords(tableWithTodos);
        let keywords = toKeywords(project);
        
        return match(stringToKeywords(searchQuery),keywords);
    };

    

let categoryMatch = (searchQuery:string) => (category:Category) : boolean => {
    let keywords = categoryToKeywords(category);
    
    return match(stringToKeywords(searchQuery),keywords);
};



let takeObjectsWhile = (condition,limit,setLimitReached) => (objects) => {
    let result = [];

    for(let i=0; i<objects.length; i++){
        let target = objects[i];
        if(condition(target)){
           result.push(target); 
        }

        if(result.length>=limit){ 
            setLimitReached(false);
            return result; 
        }
    }

    setLimitReached(true);
    return result;
};



export let getQuickFindSuggestions = (
    todos:Todo[], 
    projects:Project[], 
    areas:Area[],
    tags:string[],
    searchQuery:string,
    limit:number
) : {
    projects:Project[],
    todos:Todo[],
    tags:string[],
    categories:Category[],
    byProject:any,
    byArea:any,
    limitReached:boolean
} => {  
    let sortedTags = tags.sort((a:string,b:string) : number => a.localeCompare(b));
    let sortedCategories = categories.sort((a:string,b:string) : number => a.localeCompare(b));
    let selectedTodos = compose(
        todos => todos.sort((a:Todo,b:Todo) => a.priority-b.priority),    
        todos => limitGroups(3,todos)
    )(todos);  
    
    let byProject = groupByProject(projects)(selectedTodos);
    let byArea = groupProjectsByArea(projects,areas);
    let limitReached = true;
    let setLimitReached = reached => { limitReached=(limitReached && reached) }; 

    let pm = projectMatch(searchQuery,byProject);
    let tm = todoMatch(searchQuery);
    let tagm = tagMatch(searchQuery);
    let cm = categoryMatch(searchQuery);

    return {
        projects:takeObjectsWhile(pm,limit,setLimitReached)(projects),
        todos:takeObjectsWhile(tm,limit,setLimitReached)(selectedTodos), 
        tags:takeObjectsWhile(tagm,limit,setLimitReached)(sortedTags),  
        categories:takeObjectsWhile(cm,limit,setLimitReached)(sortedCategories), 
        byProject,
        byArea,
        limitReached
    };
};   



