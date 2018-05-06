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
let randomWords = require('random-words');
const randomWord = () => randomWords();//require('random-word');
let uniqid = require("uniqid"); 
let ical = require('ical-generator');
let different = complement(equals);
const fs = require('fs');
const path = require('path');





export let fakeCalendar = ({
    NsameDay,
    NfullDay,
    NmultipleDays,
    Nrecurrent
}) => {
    let from = 0;
    let to = 50;

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
    let title : string[] = ['R sameDay'];
    let note : string[] = [];
    let k = randomInteger(2) + 1;
    let n = randomInteger(2) + 1;

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
    let title : string[] = ['R fullDay'];
    let note : string[] = [];
    let k = randomInteger(2) + 1;
    let n = randomInteger(2) + 1;

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
    let title : string[] = ['R multipleDays'];
    let note : string[] = [];
    let k = randomInteger(2) + 1;
    let n = randomInteger(2) + 1;

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

    event.summary = 'R recurrent ' + event.summary; 

    let repeating = {
        freq: randomArrayMember(['YEARLY','MONTHLY','WEEKLY','DAILY']), // required
        count: never ? 0 : (randomInteger(15) + 1),
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