import * as mocha from 'mocha'
import { pick } from 'ramda'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { defaultStoreItems } from '../../app/defaultStoreItems';
import { MainContainer } from '../../app/Components/MainContainer';
import * as repeat from './utils/repeat'; 
const MockDate = require('mockdate');  

//import { configure, shallow } from 'enzyme';
import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-15';
import { getFilters } from '../../app/utils/getFilters';
import { wrapMuiThemeLight } from '../../app/utils/wrapMuiThemeLight';
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
    "selectedTag",
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

        debugger;

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