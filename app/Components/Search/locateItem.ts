import { cond, isNil, always, allPass, equals } from 'ramda';
import { typeEquals } from '../../utils/utils';
import { action, Todo, Category, Project, Area } from '../../types';
import { isString, isCategory } from '../../utils/isSomething';
import { getSearchItemType } from './getSearchItemType';



export let locateItem = ( 
    filters:{
        inbox:((todo:Todo) => boolean)[],
        today:((todo:Todo) => boolean)[],
        hot:((todo:Todo) => boolean)[],
        next:((todo:Todo) => boolean)[],
        someday:((todo:Todo) => boolean)[],
        upcoming:((todo:Todo) => boolean)[],
        logbook:((todo:Todo) => boolean)[],
        trash:((todo:Todo) => boolean)[]
    }
) => (item:any) : action => {
    let type = getSearchItemType(item);

    return cond([
        [isNil, always({type:"", load:null})],
        [
            equals("todo"), 
            (todo:Todo) => {

                if(allPass(filters.inbox)){

                    return {
                        type:"multiple",
                        load:[
                            {type:"scrolledTodo",load:todo},
                            {type:"selectedCategory",load:"inbox"}
                        ]
                    };

                }else if(allPass(filters.today)){

                    return {
                        type:"multiple",
                        load:[
                            {type:"scrolledTodo",load:todo},
                            {type:"selectedCategory",load:"today"}
                        ]
                    };

                }else if(allPass(filters.hot)){

                    return {
                        type:"multiple",
                        load:[
                            {type:"scrolledTodo",load:todo},
                            {type:"selectedCategory",load:"today"}
                        ]
                    };

                }else if(allPass(filters.next)){

                    return {
                        type:"multiple",
                        load:[
                            {type:"scrolledTodo",load:todo},
                            {type:"selectedCategory",load:"next"}
                        ]
                    };

                }else if(allPass(filters.someday)){

                    return {
                        type:"multiple",
                        load:[
                            {type:"scrolledTodo",load:todo},
                            {type:"selectedCategory",load:"someday"}
                        ]
                    };

                }else if(allPass(filters.upcoming)){

                    return {
                        type:"multiple",
                        load:[
                            {type:"scrolledTodo",load:todo},
                            {type:"selectedCategory",load:"upcoming"}
                        ]
                    };

                }else if(allPass(filters.logbook)){

                    return {
                        type:"multiple",
                        load:[
                            {type:"scrolledTodo",load:todo},
                            {type:"selectedCategory",load:"logbook"}
                        ]
                    };

                }else if(allPass(filters.trash)){

                    return {
                        type:"multiple",
                        load:[
                            {type:"scrolledTodo",load:todo},
                            {type:"selectedCategory",load:"trash"}
                        ]
                    };

                }else{
                    //todo handle error
                }
            }
        ],

        [
            equals("project"), 
            (project:Project) => ({
                type:"multiple",
                load:[
                    {type:"selectedProjectId",load:project._id},
                    {type:"selectedCategory",load:"project"}
                ]
            })
        ],

        [
            equals("area"), 
            (area:Area) => ({
                type:"multiple",
                load:[
                    {type:"selectedAreaId",load:area._id},
                    {type:"selectedCategory",load:"area"}
                ]
            })
        ],

        [equals('category'), (category:Category) => ({type:"selectedCategory",load:category})],

        [
            equals('tag'), 
            (tag:string) => {
                //open search
                //filter all items by tag
            }
        ],

        [always(true), always({type:"", load:null})]
    ])(type) 
};