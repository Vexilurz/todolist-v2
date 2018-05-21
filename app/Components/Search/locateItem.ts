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
    return cond([
        [isNil, always({type:"multiple", load:[]})],
        [
            typeEquals("todo"), 
            cond([
                [
                    allPass(filters.inbox), 
                    (todo) => ({
                        type:"multiple",
                        load:[{type:"scrolledTodo",load:todo},{type:"selectedCategory",load:"inbox"}]
                    })
                ],
                [
                    allPass(filters.today),
                    (todo) => ({
                        type:"multiple",
                        load:[{type:"scrolledTodo",load:todo},{type:"selectedCategory",load:"today"}]
                    })
                ],
                [
                    allPass(filters.hot),
                    (todo) => ({
                        type:"multiple",
                        load:[{type:"scrolledTodo",load:todo},{type:"selectedCategory",load:"today"}]
                    })
                ],
                [
                    allPass(filters.next),
                    (todo) => ({
                        type:"multiple",
                        load:[{type:"scrolledTodo",load:todo},{type:"selectedCategory",load:"next"}]
                    })
                ],
                [
                    allPass(filters.someday),
                    (todo) => ({
                        type:"multiple",
                        load:[{type:"scrolledTodo",load:todo},{type:"selectedCategory",load:"someday"}]
                    })
                ],
                [
                    allPass(filters.upcoming),
                    (todo) => ({
                        type:"multiple",
                        load:[{type:"scrolledTodo",load:todo},{type:"selectedCategory",load:"upcoming"}]
                    })
                ],
                [
                    allPass(filters.logbook),
                    (todo) => ({
                        type:"multiple",
                        load:[{type:"scrolledTodo",load:todo},{type:"selectedCategory",load:"logbook"}]
                    })
                ],
                [
                    allPass(filters.trash),
                    (todo) => ({
                        type:"multiple",
                        load:[{type:"scrolledTodo",load:todo},{type:"selectedCategory",load:"trash"}]
                    })
                ],
                [
                    always(true), () => ({type:"multiple",load:[]})
                ]
            ])
        ],
        [
            typeEquals("project"), 
            (project:Project) => ({
                type:"multiple",
                load:[{type:"selectedProjectId",load:project._id},{type:"selectedCategory",load:"project"}]
            })
        ],
        [
            typeEquals("area"), 
            (area:Area) => ({
                type:"multiple",
                load:[{type:"selectedAreaId",load:area._id},{type:"selectedCategory",load:"area"}]
            })
        ],
        [   isCategory, (category:Category) => ({type:"selectedCategory",load:category})],
        [
            isString, 
            (tag:string) => ({
                type:"multiple",
                load:[{type:"selectedTags",load:[tag]},{type:"selectedCategory", load:"search"}]
            })
        ],
        [always(true), always({type:"", load:null})]
    ])(item) 
};