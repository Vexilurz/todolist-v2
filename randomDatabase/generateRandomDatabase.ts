import { 
    uniq, splitEvery, contains, isNil, not, and, 
    evolve, when, map, reject, range, flatten, 
    isEmpty, complement, equals, compose, ifElse, anyPass 
} from 'ramda';
import { parseCalendar } from '../app/Components/Calendar';
import { isToday, isString } from '../app/utils/isSomething';
import { keyFromDate, getTime, setTime, fiveMinutesBefore, fiveMinutesLater, onHourLater } from '../app/utils/time';
import { Project, Calendar, Area, Todo, Category, ChecklistItem, Heading, LayoutItem, IcalData } from '../app/types';
import { generateId } from '../app/utils/generateId';
import { noteFromText } from '../app/utils/draftUtils';
import { randomInteger, randomDate, randomArrayMember, fakeTags, assertLayoutUniqueness } from './utils';
import { fakeTodo } from './fakeTodo';
import { fakeProject } from './fakeProject';
import { fakeArea } from './fakeArea';
import { fakeCalendar } from './fakeCalendar';
import { generateProjectLayout } from './generateProjectLayout';
let randomWords = require('random-words');
const randomWord = () => randomWords();//require('random-word');
let uniqid = require("uniqid"); 
let ical = require('ical-generator');
let different = complement(equals);
const fs = require('fs');
const path = require('path');



export let generateRandomDatabase = (
    { todos, projects, areas } : 
    { todos:number, projects:number, areas:number },
    withReminder : number
) : { 
    todos:Todo[],
    projects:Project[],
    areas:Area[] 
} => {  
    let tags = fakeTags(50);
    let tagsChunks = splitEvery(10, tags); 
    let todosItems : Todo[] = [];
 
    for(let i=0; i<todos; i++)
        todosItems.push(fakeTodo(randomArrayMember(tagsChunks),withReminder));

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
        projects : assertLayoutUniqueness(projectItems),
        areas : areasItems 
    };
};