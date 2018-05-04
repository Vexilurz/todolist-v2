import * as mocha from 'mocha'
import {shallow} from 'enzyme';
import { MainContainer } from '../../../app/Components/MainContainer';
import { oneMinuteBefore, nextMidnight } from '../../../app/utils/utils';
import { Store } from '../../../app/types';
import { pick } from 'ramda'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { defaultStoreItems } from '../../../app/defaultStoreItems';
const MockDate = require('mockdate');  
//Enzyme.configure({ adapter: new Adapter() });
//mocha.setup('bdd')
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
        const wrapper = shallow(
            <MainContainer {
                ...{ 
                    ...pick([MainContainerProps], defaultStoreItems),
                    filters:{
                        inbox:[],
                        today:[],
                        hot:[],
                        next:[],
                        someday:[],
                        upcoming:[],
                        logbook:[],
                        trash:[]
                    },
                    cloneWindow:() => {} ,
                    dispatch:() => {} 
                }
            }/>
        );

        console.log(wrapper)

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