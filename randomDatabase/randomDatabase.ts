import { 
    uniq, splitEvery, contains, isNil, not, and, 
    evolve, when, map, reject, range, flatten, 
    isEmpty, complement, equals, compose, ifElse, anyPass 
} from 'ramda';
import { parseCalendar } from '../app/Components/Calendar';
import { isToday, isString } from '../app/utils/isSomething';
import { keyFromDate, getTime, setTime, fiveMinutesBefore, fiveMinutesLater } from '../app/utils/time';
import { Project, Calendar, Area, Todo, Category, ChecklistItem, Heading, LayoutItem, IcalData } from '../app/types';
import { generateId } from '../app/utils/generateId';
import { noteFromText } from '../app/utils/draftUtils';
const randomWord = require('random-word');
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



let randomDatabase = (t:number,p:number,a:number,c:number) : Promise<void> => { 
    let {todos, projects, areas} = generateRandomDatabase({todos:t, projects:p, areas:a});      
     
    let calendars = range(0,c)
                    .map(
                        () => ({
                            NsameDay:randomInteger(10),
                            NfullDay:randomInteger(10),
                            NmultipleDays:randomInteger(10),
                            Nrecurrent:randomInteger(5),
                        })
                    )
                    .map(randomCalendar)
                    .map(parseCalendar)
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


    let to:string = path.resolve(`${keyFromDate(new Date())}-${uniqid()}.json`);
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



let randomInteger = (n:number) : number => {
    return Math.round(Math.random() * n);
}; 



let randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));


    
let randomArrayMember = (array : any[]) => {
    let range = array.length - 1;
    let idx = randomInteger(range);
    let member = array[idx]; 
    return member;
}; 



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



let randomCalendar = ({
    NsameDay,
    NfullDay,
    NmultipleDays,
    Nrecurrent
}) => {
    let from = -50;
    let to = 70;

    let sameDay = range(0,NsameDay).map(randomEventsameDay({from,to}));
    let fullDay = range(0,NfullDay).map(randomEventfullDay({from,to}));
    let multipleDays = range(0,NmultipleDays).map(randomEventmultipleDays({from,to}));
    let recurrent = range(0,Nrecurrent).map(randomEventrecurrent({from,to}));

    return ical({
        domain: 'tasklist.net',
        prodId: {company: 'tasklist', product: 'tasklist'},
        name: randomWord(),
        timezone: 'Europe/Berlin',
        events: flatten([sameDay,fullDay,multipleDays,recurrent])
    }).toString();
};
 


//sameDay
let randomEventsameDay = ({from,to}:{from:number,to:number}) => () => {
    let title : string[] = ['sameDay'];
    let note : string[] = [];
    let k = randomInteger(3) + 2;
    let n = randomInteger(6) + 2;

    for(let i=0; i<k; i++){ title.push(randomWord()) }
    for(let i=0; i<n; i++){ note.push(randomWord()) }

    let start = randomDate( new Date()["addDays"](from), new Date()["addDays"](to) );
    let time = getTime(start);
    let rangeHours = 23 - time.hours;
    let hours = time.hours + randomInteger(rangeHours) + 1;
    let minutes = randomInteger(59);

    if(hours>23){ hours = 23 }
    if(minutes>59){ minutes = 59 }

    let end = setTime(new Date(start.getTime()),{minutes,hours});

    let event = {
        start,
        end,
        timestamp: new Date(),
        summary: title.join(' '),
        allDay:false,
        description: note.join(' ')
    };

    return event;
};



//fullDay
let randomEventfullDay = ({from,to}:{from:number,to:number}) => () => {
    let title : string[] = ['fullDay'];
    let note : string[] = [];
    let k = randomInteger(6) + 2;
    let n = randomInteger(15) + 2;

    for(let i=0; i<k; i++){ title.push(randomWord()) }
    for(let i=0; i<n; i++){ note.push(randomWord()) }

    let start = randomDate( new Date()["addDays"](from), new Date()["addDays"](to) );

    let end = setTime(new Date(start.getTime())["addDays"](1), {minutes:0,hours:0}); 

    let event = {
        start,
        end,
        timestamp:new Date(),
        summary:title.join(' '),
        allDay:true,
        description:note.join(' ')
    };

    return event;
};



let randomEventmultipleDays = ({from,to}:{from:number,to:number}) => () => {
    let title : string[] = [];
    let note : string[] = [];
    let k = randomInteger(3) + 2;
    let n = randomInteger(6) + 2;

    for(let i=0; i<k; i++){ title.push(randomWord()) }
    for(let i=0; i<n; i++){ note.push(randomWord()) }


    let start = randomDate( new Date()["addDays"](from), new Date()["addDays"](to) );
    let end =  randomDate( start, new Date()["addDays"](to+10) );

    let event = {
        start,
        end,
        timestamp: new Date(),
        summary: title.join(' '),
        allDay: Math.random() > 0.5 ? true : false,
        description: note.join(' ')
    };

    return event;
};



let randomEventrecurrent = ({from,to}:{from:number,to:number}) => () => {
    let event = randomEventsameDay({from,to})();
    let never = Math.random() > 0.7;


    let repeating = {
        freq: randomArrayMember(['YEARLY','MONTHLY','WEEKLY','DAILY','HOURLY','MINUTELY','SECONDLY']), // required
        count: never ? 0 : (randomInteger(100) + 1),
        interval: randomInteger(10) + 1,
        until: never ? undefined :  randomDate( new Date(), new Date()["addDays"](to) ),
        //byDay: ['su', 'mo'], // repeat only sunday and monday
        //byMonth: [1, 2], // repeat only in january und february,
        //byMonthDay: [1, 15], // repeat only on the 1st and 15th
    }

    
    return {
        ...event,
        repeating
    };
};



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
};
      


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
};
  

    
let fakeTodo = (tags:string[], remind = null) : Todo => {
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

    /*let reminder = isToday(attachedDate) && isNil(deleted) && not(checked) ?  
                   randomDate(new Date(), fiveMinutesBefore(new Date())) : 
                   null; */

    let reminder = isToday(attachedDate) && isNil(deleted) && not(checked) ?  
                   randomDate(fiveMinutesBefore(new Date()), fiveMinutesLater(new Date())) :  
                   null; //onHourLater(date) //fiveMinutesLater(date);
    
    //reminder = randomDate(new Date(), new Date()["addDays"](-50)); 
    
    return {   
        _id:generateId(),     
        type:"todo",
        category:randomCategory(), 
        title:title.join(' '), 
        priority:Math.random()*999999999,
        note:noteFromText(note.join(' ')), 
        checklist:checklist,   
        reminder:null,  
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
    };   
};
    

    
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
}; 
    
    

let fakeArea = (attachedTodosIds,attachedProjectsIds,attachedEventsIds,attachedTags) : Area => {
    
    let name : string[] = [];
    
    let k = randomInteger(3) + 2;
    
    for(let i=0; i<k; i++){
        name.push(randomWord());
    } 
    
    let description : string[] = [];
            
    let l = randomInteger(3) + 2;
    
    for(let i=0; i<l; i++){
        description.push(randomWord());  
    }

    return {  
        _id : generateId(),   
        type : "area", 
        deleted : Math.random() < 0.2 ? randomDate(new Date(), new Date()["addDays"](-50)) : undefined,
        priority : Math.random()*999999999,
        name : name.join(' '),    
        description : description.join(' '),  
        attachedTags, 
        created : randomDate(new Date()["addDays"](-50), new Date()),
        attachedProjectsIds:uniq(attachedProjectsIds)
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
    }
    
) : { 
    
    todos : Todo[],
    projects : Project[],
    areas : Area[] 
        
} => { 
      
    let tags = fakeTags(50);
    let tagsChunks = splitEvery(10, tags); 
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
    Number( process.argv[5] )
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