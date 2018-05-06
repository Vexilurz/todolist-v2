import { changesToActions } from '../../../app/utils/changesToActions';
import { fakeTodo } from '../../../randomDatabase/fakeTodo';

import { fakeProject } from '../../../randomDatabase/fakeProject';
import { fakeArea } from '../../../randomDatabase/fakeArea';
import { fakeCalendar } from '../../../randomDatabase/fakeCalendar';
import { fakeTags, randomArrayMember, randomInteger } from '../../../randomDatabase/utils';
import { splitEvery, prop, contains, all } from 'ramda';
let assert = require('chai').assert;
let expect = require('chai').expect;




describe(
    'changesToActions', 
    () => {   
        let tags = fakeTags(150);
        let tagsChunks = splitEvery(10, tags); 
        let ft = () => fakeTodo(randomArrayMember(tagsChunks),0);
        let fp = () => fakeProject(randomArrayMember(tagsChunks),[]);
        let fa = () => fakeArea([], [], [], randomArrayMember(tagsChunks));
        let fc = () =>  fakeCalendar({
                            NsameDay:randomInteger(10) + 1,
                            NfullDay:randomInteger(10) + 1,
                            NmultipleDays:randomInteger(10) + 1,
                            Nrecurrent:randomInteger(5) + 1,
                        }); 

        it(    
            ``,
            function(){ 
                this.timeout(0);
                

                let actionsTodosMany = changesToActions("todos")(
                    {
                        add:[ft(),ft(),ft()],
                        remove:[ft(),ft(),ft()],
                        update:[ft(),ft(),ft()]
                    }
                );


                let actionsTodosOne = changesToActions("todos")(
                    {add:[ft()], remove:[ft()], update:[ft()]}
                );


                let actionsProjectsMany = changesToActions("projects")(
                    {
                        add:[fp(),fp(),fp()],
                        remove:[fp(),fp(),fp()],
                        update:[fp(),fp(),fp()]
                    }
                );


                let actionsProjectsOne = changesToActions("projects")(
                    {
                        add:[fp()],
                        remove:[fp()],
                        update:[fp()]
                    }
                );


                let actionsAreasOne = changesToActions("areas")(
                    {
                        add:[fa()],
                        remove:[fa()],
                        update:[fa()]
                    }
                );


                let actionsAreasMany = changesToActions("areas")(
                    {
                        add:[fa(),fa(),fa()],
                        remove:[fa(),fa(),fa()],
                        update:[fa(),fa(),fa()]
                    }
                );


                let actionsCalendarsOne = changesToActions("calendars")(
                    {
                        add:[fc()],
                        remove:[fc()],
                        update:[fc()]
                    }
                );


                let actionsCalendarsMany = changesToActions("calendars")(
                    {
                        add:[fc(),fc(),fc()],
                        remove:[fc(),fc(),fc()],
                        update:[fc(),fc(),fc()]
                    }
                );


                let a = actionsTodosMany.map(prop('type'));
                let b = actionsTodosOne.map(prop('type'));
                let c = actionsProjectsMany.map(prop('type'));
                let d = actionsProjectsOne.map(prop('type'));
                let e = actionsAreasOne.map(prop('type'));
                let f = actionsAreasMany.map(prop('type'));
                let g = actionsCalendarsOne.map(prop('type'));
                let h = actionsCalendarsMany.map(prop('type'));

                expect( contains("addTodos")(a) ).to.equal(true);
                expect( contains("removeTodos")(a) ).to.equal(true);
                expect( contains("updateTodos")(a) ).to.equal(true);

                expect( contains("addTodo")(b) ).to.equal(true);
                expect( contains("removeTodo")(b) ).to.equal(true);
                expect( contains("updateTodo")(b) ).to.equal(true);
                

                expect( contains("addProject")(d) ).to.equal(true);
                expect( contains("removeProject")(d) ).to.equal(true);
                expect( contains("updateProject")(d) ).to.equal(true);

                expect( contains("addProjects")(c) ).to.equal(true);
                expect( contains("removeProjects")(c) ).to.equal(true);
                expect( contains("updateProjects")(c) ).to.equal(true);


                expect( contains("addArea")(e) ).to.equal(true);
                expect( contains("removeArea")(e) ).to.equal(true);
                expect( contains("updateArea")(e) ).to.equal(true);

                expect( contains("addAreas")(f) ).to.equal(true);
                expect( contains("removeAreas")(f) ).to.equal(true);
                expect( contains("updateAreas")(f) ).to.equal(true);


                expect( contains("addCalendar")(g) ).to.equal(true);
                expect( contains("removeCalendar")(g) ).to.equal(true);
                expect( contains("updateCalendar")(g) ).to.equal(true);

                expect( contains("addCalendars")(h) ).to.equal(true);
                expect( contains("removeCalendars")(h) ).to.equal(true);
                expect( contains("updateCalendars")(h) ).to.equal(true);
            } 
        );
    }
); 