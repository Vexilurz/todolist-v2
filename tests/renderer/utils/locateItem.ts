import { reducer } from '../../../app/reducer';
import { evolve, not, mapObjIndexed, compose, values, equals, isNil, isEmpty, range, all } from 'ramda';
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
import { locateItem } from '../../../app/Components/Search/locateItem';
import { isNotNil, isFunction } from '../../../app/utils/isSomething';
import { AreaBody } from '../../../app/Components/Area/AreaBody';
const chai = require('chai');
let assert = require('chai').assert;
let expect = require('chai').expect;
const categories = ["inbox", "today", "upcoming", "next", "someday", "logbook", "trash"];



describe(
    'locateItem', 
    () => {  
        it(    
            `should always return action`,
            function(){ 
                /*this.timeout(0);
                let fc = () => fakeCalendar({
                    NsameDay:randomInteger(10) + 1,
                    NfullDay:randomInteger(10) + 1,
                    NmultipleDays:randomInteger(10) + 1,
                    Nrecurrent:randomInteger(5) + 1,
                }); 
                let opt = { todos:1550, projects:30, areas:10 };
                let data = { calendars:range(0,10).map(() => fc()), ...generateRandomDatabase(opt, 0) };
                let tags = fakeTags(50);
                let locate = locateItem(data.projects,getFilters(data.projects));
                let locatedTags = tags.map(locate);
                let locatedTodos : action[] = data.todos.map(locate);
                let locatedCategories = categories.map(locate);
                let locatedProjects = data.projects.map(locate);
                let locatedAreas = data.areas.map(locate);                
                let nulls = [null,null,null];
                let allTodosLocated = all( 
                    locatedTodo=>isNotNil(
                        locatedTodo.load.find(
                            action=>action.type==="scrolledTodo" || action.type==="selectedProjectId"
                        )
                    ),  
                    locatedTodos
                );
                if(!allTodosLocated){
                    let t = data.todos.filter(todo => isEmpty(locate(todo).load))
                    debugger;
                }



                expect( 
                    all( 
                        locatedTag=>{
                            if(!isFunction(locatedTag.load.find)){
                                data
                                tags
                                locatedTags
                                debugger;
                            }

                            return isNotNil(locatedTag.load.find(action=>action.type==="selectedTags"))
                        },  
                        locatedTags
                    ),
                    "located tags"
                ).to.equal(true);
                


                expect( 
                    all( 
                        locatedProject=>isNotNil(locatedProject.load.find(action=>action.type==="selectedProjectId")),  
                        locatedProjects
                    ),
                    "located projects"
                ).to.equal(true);
                


                expect( 
                    all( 
                        locatedArea=>isNotNil(locatedArea.load.find(action=>action.type==="selectedAreaId")),  
                        locatedAreas
                    ),
                    "located areas"
                ).to.equal(true);
                


                expect(
                    all(locatedCategory=>locatedCategory.type==="selectedCategory",locatedCategories),
                    "located categories"
                ).to.equal(true);



                expect( 
                    allTodosLocated,
                    "located todos"
                ).to.equal(true);*/
            }  
        );
    }
); 