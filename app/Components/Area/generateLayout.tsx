import { 
    uniq, allPass, remove, intersection, reject, slice, prop, flatten,
    isEmpty, contains, assoc, isNil, not, merge, map, concat, ifElse, identity, 
    addIndex, compose, cond, defaultTo, last, insertAll, prepend, find  
} from 'ramda'; 
import { byNotCompleted, byNotDeleted, typeEquals, isNotNil, anyTrue, attachDispatchToProps, different, isNotEmpty } from '../../utils/utils';

let byNotEmpty = (table) => (area) => compose((id) => isNotEmpty(table[id]),prop('_id')) 

export let generateLayout = (  
    areas : any[],
    { table, detached } : { table : { [key: string]: any[]; }, detached:any[] }, 
    hideEmpty ? : boolean
) : any[] => 
    compose(
        insertAll(0,detached.sort((a:any, b:any) => a.priority-b.priority)),
        prepend({type:"separator", _id:"separator"}),
        flatten,
        (areas) => areas.map(
            (area) => compose(
                prepend(area),
                (projects) => projects.sort((a,b) => a.priority-b.priority),
                defaultTo([]),
                (key) => table[key],
                prop('_id')
            )(area)
        ),
        (areas) => areas.sort((a,b) => a.priority-b.priority),
        (areas) => areas.filter(
            allPass([
                byNotDeleted,
                ifElse(() => hideEmpty,byNotEmpty(table),identity)
            ])
        )
    )(areas);