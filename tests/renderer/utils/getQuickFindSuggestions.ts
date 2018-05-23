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
import { getQuickFindSuggestions, match, todoMatch } from '../../../app/Components/Search/getQuickFindSuggestions';
import { todoToKeywords } from '../../../app/Components/Search/todoToKeywords';
import { stringToKeywords } from '../../../app/Components/Search/stringToKeywords';
const chai = require('chai');
let assert = require('chai').assert;
let expect = require('chai').expect;



describe(
    'getQuickFindSuggestions', 
    () => {  
        it(    
            `should always return correct results`,
            function(){ 
                this.timeout(0);
                let fc = () => fakeCalendar({
                    NsameDay:randomInteger(10) + 1,
                    NfullDay:randomInteger(10) + 1,
                    NmultipleDays:randomInteger(10) + 1,
                    Nrecurrent:randomInteger(5) + 1,
                }); 
                let opt = { todos:10, projects:5, areas:2 };
                let data = { calendars:range(0,10).map(() => fc()), ...generateRandomDatabase(opt, 0) };
                let todos = data.todos;
                let tags = fakeTags(10);
                const categories = ["inbox", "today", "upcoming", "next", "someday", "logbook", "trash"];

                todos.map(
                    (todo,idx) => {
                        let keywords = todoToKeywords(todo);
                        keywords.forEach( 
                            searchQuery => {
                                let {todos} = getQuickFindSuggestions(
                                    data.todos, 
                                    data.projects, 
                                    data.areas,
                                    tags,
                                    searchQuery,
                                    150
                                );

                                /*if(isNil(todos.find( t => t._id===todo._id))){
                                    let theyMatch = match([searchQuery],keywords);
                                    let keyworded = stringToKeywords(searchQuery);
                                    let theyShouldMatch = match(keyworded,keywords);
                                    let m = todoMatch(searchQuery)(todo);
                                    console.log(keywords)
                                    console.log(todo)
                                    debugger;
                                }*/ 
                                let target = todos.find( t => t._id===todo._id);

                                if(!target){
                                    keywords;
                                    todos;
                                    searchQuery;
                                    debugger;
                                }
 
                                expect( 
                                    target._id,
                                    "located todos"
                                ).to.equal(todo._id);
                            }
                        )
                    }
                )
            }  
        );
    }
); 