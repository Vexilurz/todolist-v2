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
import { randomInteger, randomDate, randomArrayMember, fakeTags } from './utils';
import { fakeTodo } from './fakeTodo';
import { fakeProject } from './fakeProject';
import { fakeArea } from './fakeArea';
import { fakeCalendar } from './fakeCalendar';
let randomWords = require('random-words');
const randomWord = () => randomWords();//require('random-word');
let uniqid = require("uniqid"); 
let ical = require('ical-generator');
let different = complement(equals);
const fs = require('fs');
const path = require('path');



Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 



let randomDatabase = (t:number,p:number,a:number,c:number,withReminder:number) : Promise<void> => { 
    let {todos, projects, areas} = generateRandomDatabase({todos:t, projects:p, areas:a}, withReminder);      
    
    
    let calendars = range(0,c)
                    .map(
                        () => ({
                                NsameDay:randomInteger(10) + 1,
                                NfullDay:randomInteger(10) + 1,
                                NmultipleDays:randomInteger(10) + 1,
                                Nrecurrent:randomInteger(5) + 1,
                        }) 
                    ) 
                    .map((c) => {
                       let text = fakeCalendar(c);
                       let parsed = parseCalendar(new Date()["addDays"](50),text);
                       return parsed;
                    })
                    .map(
                        (data:IcalData) => ({
                            url:'',  
                            name:data.calendar.name,
                            description:data.calendar.description,
                            timezone:data.calendar.timezone,
                            active:true,
                            events:data.events,
                            type:"calendar", 
                            _id:generateId()
                        })
                    ); 
                    

    if(!fs.existsSync("databases")){ 
        fs.mkdirSync("databases"); 
    }

    let to:string = path.resolve("databases",`${keyFromDate(new Date())}-${uniqid()}.json`);

    let data = { database : { todos, projects, areas, calendars } };
  
    return writeJsonFile(data,to);
};
   


let writeJsonFile = (obj:any,pathToFile:string) : Promise<any> => 
    new Promise(
        resolve => {
            let json : string = JSON.stringify(obj);
            fs.writeFile(
                pathToFile, 
                json, 
                'utf8', 
                (err) => {
                    if(err){ resolve(err) }
                    else{ resolve() }
                } 
            );
        }
    );







let assertLayoutUniqueness : (projects:Project[]) => Project[] = when(
    (projects) => true, 
    (projects) => map(
        p => evolve(
            {
                layout:reject( 
                    i => projects.find( 
                        t => and( 
                            contains(i)(t.layout), 
                            different(t._id,p._id) 
                        ) 
                    ) 
                )
            },
            p
        ),
        projects
    )
);




 

 
    
let fakeHeading = () : Heading => {

    let title : string[] = []; 

    let k = randomInteger(3) + 2;
    
    for(let i=0; i<k; i++){
        title.push(randomWord());  
    }

    return {
        type : "heading", 
        priority:randomInteger(9999999),
        title : title.join(' '), 
        _id : generateId(), 
        key : generateId()
    };  
}; 
       
   
    
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
};



let generateRandomDatabase = (
    
    { todos, projects, areas } : 
    
    {  
        todos : number, 
        projects : number, 
        areas : number  
    },

    withReminder : number
    
) : { 
    
    todos : Todo[],
    projects : Project[],
    areas : Area[] 
        
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
    
   

randomDatabase(
    Number( process.argv[2] ),
    Number( process.argv[3] ),
    Number( process.argv[4] ),
    Number( process.argv[5] ),
    Number( process.argv[6] )
).then(
    () => console.log(
        `
        todos - ${process.argv[2]}; 
        projects - ${process.argv[3]}; 
        areas - ${process.argv[4]}; 
        calendars : - ${process.argv[5]}
        `,
    )
);  