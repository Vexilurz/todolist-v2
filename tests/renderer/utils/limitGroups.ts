import { reducer } from '../../../app/reducer';
import { evolve, not, mapObjIndexed, compose, values, equals, isNil, isEmpty, range, all, xprod, map } from 'ramda';
import { defaultConfig } from '../../../app/defaultConfig';
import { randomArrayMember, randomWord, randomDate, randomInteger, fakeTags } from '../../../randomDatabase/utils';
import { action, Config } from '../../../app/types';
import { defaultStoreItems } from './../../../app/defaultStoreItems';
import { requestFromMain } from '../../../app/utils/requestFromMain';
import { stateReducer } from '../../../app/stateReducer';
import { objectsReducer } from '../../../app/objectsReducer';
import { fakeCalendar } from '../../../randomDatabase/fakeCalendar';
import { sleep } from '../../../app/utils/sleep';
import { getFilters } from '../../../app/utils/getFilters';
import { generateRandomDatabase } from "../../../randomDatabase/generateRandomDatabase";
import { limitGroups } from '../../../app/Components/Search/limitGroups';
import { isNotNil } from '../../../app/utils/isSomething';
import { AreaBody } from '../../../app/Components/Area/AreaBody';
import { repeat } from '../../../app/Components/RepeatPopup';
import { fakeTodo } from '../../../randomDatabase/fakeTodo';
import { nDaysFromNow } from '../../../app/utils/utils';
import { generateId } from '../../../app/utils/generateId';
const chai = require('chai');
let assert = require('chai').assert;
let expect = require('chai').expect;



let randomRepeatOptions = () => {
    let types = xprod([/*'week' , 'day' , 'month' , 'year'*/"day","week"], ['on' , 'never']);
    let idx = Math.round( Math.random() * (types.length - 1) );
    let options = types[idx];
    let l = Math.round(Math.random() * 100) + 400;
    let interval = Math.round(Math.random() * 3) + 2;

    return ({
        interval,
        freq : options[0],
        until : options[1]==='on' ? 
                nDaysFromNow(l + 1) : 
                null,
        count : 0,
        selectedOption : options[1]
    }); 
};



describe(
    'limitGroups', 
    () => {  
        it(    
            `should always cut to length`,
            function(){ 
                this.timeout(0);
                let fc = () => fakeCalendar({
                    NsameDay:randomInteger(10) + 1,
                    NfullDay:randomInteger(10) + 1,
                    NmultipleDays:randomInteger(10) + 1,
                    Nrecurrent:randomInteger(5) + 1,
                }); 
                let opt = { todos:150, projects:30, areas:10 };
                let data = { calendars:range(0,10).map(() => fc()), ...generateRandomDatabase(opt, 0) };
                let todos = data.todos;
                let n = Math.round(Math.random() * 100);
                let groups = todos
                .map(
                    todo => repeat(
                        randomRepeatOptions(),
                        todo, 
                        new Date(),
                        nDaysFromNow(150),
                        generateId()
                    )
                )
                .filter(group => !isEmpty(group) && group.length>n);
               

                groups.forEach(
                    group => {
                        
                        let limited = limitGroups(n,group);
                        
                        if(limited.length!==n){
                            debugger;
                        }   

                        expect(limited.length).to.equal(n);

                    }
                )
            }  
        );
    }
); 