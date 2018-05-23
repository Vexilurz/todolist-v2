import * as mocha from 'mocha'
import { pick, range, isEmpty, xprod, flatten } from 'ramda'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { defaultStoreItems } from '../../../app/defaultStoreItems';
import { MainContainer } from '../../../app/Components/MainContainer';
const MockDate = require('mockdate');  
import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-15';
import { getFilters } from '../../../app/utils/getFilters';
import { wrapMuiThemeLight } from '../../../app/utils/wrapMuiThemeLight';
import { nDaysFromNow } from '../../../app/utils/utils';
import { generateRandomDatabase } from '../../../randomDatabase/generateRandomDatabase';
import { fakeCalendar } from '../../../randomDatabase/fakeCalendar';
import { randomInteger } from '../../../randomDatabase/utils';
import { repeat } from '../../../app/Components/RepeatPopup';
import { generateId } from '../../../app/utils/generateId';
const chai = require('chai');
let assert = require('chai').assert;
let expect = require('chai').expect;


Enzyme.configure({ adapter: new Adapter() });
//let testDate = () => MockDate.set( oneMinuteBefore(nextMidnight()) );



const MainContainerProps = [
    "selectedCategory",
    "limit",
    "nextUpdateCheck",
    "nextBackupCleanup",
    "selectedTodo",
    "scrolledTodo",
    "showRepeatPopup",
    "hideHint",
    "firstLaunch",
    "clone",
    "groupTodos",
    "showRightClickMenu",
    "showCalendarEvents",
    "showTrashPopup",
    "showWhenCalendar",
    "indicators",
    "calendars",
    "projects",
    "areas",
    "todos",
    "selectedProjectId",
    "selectedAreaId",
    "moveCompletedItemsToLogbook",
    "selectedTags",
    "dragged"
]; 



let randomRepeatOptions = () => {
    let types = xprod(['week' , 'day' , 'month' , 'year'], ['on' , 'never']);
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
    '<MainContainer />', 
    () => {  
        it(    
            `should extend repeated sequence`,
            function(){ 
                this.timeout(0);
                let firstLaunch = false;
                let hideHint = true;
                let initialLimit=nDaysFromNow(200);
                let finalLimit=nDaysFromNow(600);
                let store = [];
                let dispatch = (action) => {store.push(action)};
                let fc = () => fakeCalendar({
                    NsameDay:randomInteger(10) + 1,
                    NfullDay:randomInteger(10) + 1,
                    NmultipleDays:randomInteger(10) + 1,
                    Nrecurrent:randomInteger(5) + 1,
                }); 
                let opt = { todos:50, projects:20, areas:10 };
                let data = { calendars:range(0,10).map(() => fc()), ...generateRandomDatabase(opt, 0) };
                let groupsInitial = data
                .todos
                .map(todo => repeat(randomRepeatOptions(),todo,new Date(),initialLimit,generateId()))
                .filter(group => !isEmpty(group));

                
                const wrapper = Enzyme.shallow(
                    wrapMuiThemeLight(
                        <MainContainer {
                            ...{ 
                                ...pick([MainContainerProps], defaultStoreItems),
                                firstLaunch,
                                hideHint,
                                limit:finalLimit,
                                filters:getFilters([]),
                                cloneWindow:() => {} ,
                                dispatch
                            }
                        }/>
                    )
                ).dive();

                let inst : any = wrapper.instance();

                inst.setData({
                    projects:data.projects, 
                    areas:data.areas, 
                    todos:flatten([groupsInitial,data.todos]), 
                    calednars:data.calendars
                });
                
               let groupsFinal = data
               .todos
               .map(todo => repeat(randomRepeatOptions(),todo,new Date(),finalLimit,generateId()))
               .filter(group => !isEmpty(group));

                //analyze store, find action 
                let multiple = store.find(i => i.type==="multiple" && i.load.find(v => v.type==="addTodos"));
                let extendedAction = multiple.load.find(v => v.type==="addTodos");
            
                let extendedTodos = extendedAction.load;
                let finalLength = flatten(groupsFinal).length; 


                let gif = flatten(groupsInitial);
                let initialLength = gif.length;
                let amountExtended = extendedTodos.length;
            } 
        );
    }
); 