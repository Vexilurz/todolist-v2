import * as mocha from 'mocha'
import { pick } from 'ramda'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { defaultStoreItems } from '../../app/defaultStoreItems';
import { MainContainer } from '../../app/Components/MainContainer';
const MockDate = require('mockdate');  
import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-15';
import { getFilters } from '../../app/utils/getFilters';
import { wrapMuiThemeLight } from '../../app/utils/wrapMuiThemeLight';

const repeat = require('./utils/repeat'); 
const applicationReducer = require('./utils/applicationReducer'); 
const changesToActions = require('./utils/changesToActions'); 
const crypto = require('./utils/crypto'); 
const database = require('./utils/database'); 
const detectChanges = require('./utils/detectChanges'); 
const fixIncomingData = require('./utils/fixIncomingData'); 
const generateIndicatorsWorker = require('./utils/generateIndicatorsWorker'); 
const pouchWorker = require('./utils/pouchWorker'); 
const toStoreChanges = require('./utils/toStoreChanges'); 
const updateConfigFromStore = require('./utils/updateConfigFromStore'); 


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
   

describe(
    '<MainContainer />', 
    () => {  
        const wrapper = Enzyme.shallow(
            <MainContainer {
                ...{ 
                    ...pick([MainContainerProps], defaultStoreItems),
                    filters:getFilters([]),
                    cloneWindow:() => {} ,
                    dispatch:() => {} 
                }
            }/>
        );

        const wrapperMount = Enzyme.mount(
            wrapMuiThemeLight(
                <MainContainer {
                    ...{ 
                        ...pick([MainContainerProps], defaultStoreItems),
                        filters:getFilters([]),
                        cloneWindow:() => {} ,
                        dispatch:() => {} 
                    }
                }/>
            )
        );

        console.log(wrapper);

        it(    
            ``,
            function(){ 
                //let x = MainContainer
                //const wrapper = mount();
                this.timeout(0);
            } 
        );
        
    }
); 