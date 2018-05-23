import { generateUpcomingSequence } from "../../../app/utils/generateUpcomingSequence";

import { changesToActions } from '../../../app/utils/changesToActions';
import { fakeTodo } from '../../../randomDatabase/fakeTodo';

import { fakeProject } from '../../../randomDatabase/fakeProject';
import { fakeArea } from '../../../randomDatabase/fakeArea';
import { fakeCalendar } from '../../../randomDatabase/fakeCalendar';
import { fakeTags, randomArrayMember, randomInteger } from '../../../randomDatabase/utils';
import { splitEvery, prop, contains, all } from 'ramda';
import { generateCalendarObjectsFromRange } from "../../../app/utils/generateCalendarObjectsFromRange";
import { objectsToHashTableByDate } from "../../../app/utils/objectsToHashTableByDate";
import { getDatesRange } from "../../../app/utils/utils";
import { range, isEmpty } from 'ramda';
import { generateRandomDatabase } from "../../../randomDatabase/generateRandomDatabase";
import { isToday } from "../../../app/utils/isSomething";
let assert = require('chai').assert;
let expect = require('chai').expect;



let testGenerateUpcomingSequence = (daysC:number,weeksC:number,monthsC:number) => {
    /*
        let tags = fakeTags(150);
        let tagsChunks = splitEvery(10, tags); 
        let ft = () => fakeTodo(randomArrayMember(tagsChunks),0);
        let fp = () => fakeProject(randomArrayMember(tagsChunks),[]);
        let fa = () => fakeArea([], [], [], randomArrayMember(tagsChunks));
    */

    let fc = () => fakeCalendar({
        NsameDay:randomInteger(10) + 1,
        NfullDay:randomInteger(10) + 1,
        NmultipleDays:randomInteger(10) + 1,
        Nrecurrent:randomInteger(5) + 1,
    }); 
                    
    let opt = { todos:150, projects:150, areas:150 };
    let data = { calendars:range(0,10).map(() => fc()), ...generateRandomDatabase(opt, 0) }; 

    let objectsByDate = objectsToHashTableByDate({
        showCalendarEvents:true,
        todos:data.todos,
        projects:data.projects,
        calendars:data.calendars,
        selectedTags:[]
    }); 

    let rangeDates = getDatesRange(new Date(), 150, true, true); 
    let objects = generateCalendarObjectsFromRange(rangeDates, objectsByDate);
    let result = generateUpcomingSequence(daysC,weeksC,monthsC)(objects);
    
    let { days, weeks, months } = result;

    if(!isEmpty(days)){
        expect( isToday(days[0].date) ).to.equal(true);
    }

    if(!isEmpty(weeks)){
        expect( all(week => week[0].date.getDay()===1, weeks) ).to.equal(true);
    }

    if(!isEmpty(months)){
        expect( all(month => month[0].date.getDate()===1, months) ).to.equal(true);
    }

    return result;
};



describe(
    'generateUpcomingSequence', 
    () => { 
        it(    
            `all`,
            function(){ 
                this.timeout(0);
                let length = 20;
                let result = testGenerateUpcomingSequence(14,5,3);
                let { days, weeks, months } = result; 
          
                expect( !isEmpty(days) ).to.equal(true);   
                expect( !isEmpty(weeks) ).to.equal(true);   
                expect( !isEmpty(months) ).to.equal(true);   
            } 
        );
    }
); 