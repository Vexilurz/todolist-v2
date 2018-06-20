import * as mocha from 'mocha'
import { 
    remove, isNil, not, isEmpty, last, compose, map, cond, defaultTo, flatten, groupBy, difference,
    equals, all, when, prop, complement, adjust, path, drop, add, uniqBy, reduce, range, xprod, splitEvery 
} from 'ramda';
import { nDaysFromNow } from '../../../app/utils/utils';
import { assert } from '../../../app/utils/assert';
import { isDate, isArrayOfTodos, isNotNil } from '../../../app/utils/isSomething';
import { Todo, RepeatOptions } from '../../../app/types';
import { repeat } from '../../../app/Components/RepeatPopup';
import { generateId } from '../../../app/utils/generateId';
import { fakeTodo } from '../../../randomDatabase/fakeTodo';
import { randomArrayMember, fakeTags } from '../../../randomDatabase/utils';
import { extend } from '../../../app/utils/extend';



let test = (targets : {todo:Todo,options:RepeatOptions}[], limits : Date[]) : void => {
    let initial = limits[0];

    let groups : Todo[][] = map( 
        (target:{todo:Todo,options:RepeatOptions}) => {
            let groupId = generateId();

            let repeats = repeat(
                target.options,
                target.todo,
                defaultTo(new Date)(target.todo.attachedDate),
                initial,
                groupId,
                null
            );

            let repeatsHaveDate = all( t => isDate(t.attachedDate) )(repeats);
            let repeatsHaveGroup = all( t => isNotNil(t.group) )(repeats);
            
            assert(isArrayOfTodos(repeats), `repeats - incorrect type. test.`);
            assert(repeatsHaveDate, `repeats - missing date. test.`);
            assert(repeatsHaveGroup, `repeats - missing group. test.`);
            
            return [ 
                { 
                    ...target.todo, 
                    group:{
                        type:target.options.selectedOption, 
                        _id:groupId, 
                        options:target.options
                    } 
                },
                ...repeats
            ];
        },  
        targets 
    );

    let todos = flatten(groups);
    let withInitial = extend(initial,todos,null);

    let groupOne = groupBy(path(['group','_id']), todos);
    let groupTwo = groupBy(path(['group','_id']), withInitial);
    
    assert(isEmpty(withInitial), `extend with initial limit should be empty, have ${withInitial.length} instead.`);
  
    let remainingLimits = drop(1)(limits);
    let lastLimit = remainingLimits[remainingLimits.length-1];

    let gradually = remainingLimits.reduce((acc,val) => [...acc, ...extend(val,acc,null)], todos); 
    let immediately = [...todos,...extend(lastLimit,todos,null)];

    let graduallyDateUndefined = gradually.filter( t => isNil(t.attachedDate));
    let immediatelyDateUndefined = immediately.filter( t => isNil(t.attachedDate));


    assert( 
        all( t => targets.find( target => target.todo._id===t._id ))(graduallyDateUndefined), 
        `date undefined, graduallyDateUndefined, target is not a source. test.`
    )
    assert( 
        all( t => targets.find( target => target.todo._id===t._id ))(immediatelyDateUndefined) , 
        `date undefined, immediatelyDateUndefined, target is not a source. test.`
    )
    
    
    let diff = difference(
        gradually.map((t:Todo) => isDate(t.attachedDate) ? t.attachedDate.toString() : null), 
        immediately.map((t:Todo) => isDate(t.attachedDate) ? t.attachedDate.toString() : null)
    );


    if(gradually.length!==immediately.length){
        let groupGradually = groupBy(path(['group','_id']), gradually);
        let groupImmediately = groupBy(path(['group','_id']), immediately);
        //console.log(diff); 
    }


    assert(
        gradually.length===immediately.length, 
        `
        lengths differ. gradually : ${gradually.length}; 
        immediately : ${immediately.length};
        diff : ${JSON.stringify(diff)}
        `
    );

 
    groups.forEach(
        (g:Todo[]) => {
            let withDates = g.filter( t => isDate(t.attachedDate) );
            let by = uniqBy( 
                t => isDate(t.attachedDate) ? t.attachedDate.toString() : null, 
                withDates 
            );

            assert(
                by.length===withDates.length, 
                `
                dates repeat. groups.forEach. test. ${g[0].group.options.selectedOption}. 
                withDates: ${JSON.stringify(withDates)}; 
                by : ${JSON.stringify(by)};
                `
            ); 
        }
    );
};



describe(
    'repeat', 
    () => {  

        it(    
            ``,
            function(){ 
                this.timeout(0);
                let tags = fakeTags(50);
                let tagsChunks = splitEvery(10, tags); 

                for(let i = 0; i<10; i++){
                    let types = xprod(['week' , 'day' , 'month' , 'year'], ['on' , 'never']);
                    let todo = fakeTodo(randomArrayMember(tagsChunks),0);

                    let testOptions = compose(
                        map((options) => ({ todo, options })),
                        map( 
                            n => { 
                                let idx = Math.round( Math.random() * (types.length - 1) );
                                let options = types[idx];

                                return ({
                                    interval : n,
                                    freq : options[0],
                                    until : options[1]==='on' ? 
                                            nDaysFromNow(Math.round(Math.random() * 100) + 1) : 
                                            null,
                                    count : 0,
                                    selectedOption : options[1]
                                }); 
                            }
                        ),
                        map(n => Math.round(Math.random() * n) + 1),  
                        range(0)  
                    )(10);

                    test( testOptions, compose(map(nDaysFromNow), map( n => n*20 ))(range(1,5)) );
                    //console.log(`iteration : ${i}`);
                }
            } 
        );
    }
); 




