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
import { generateRandomDatabase } from './generateRandomDatabase';
 
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