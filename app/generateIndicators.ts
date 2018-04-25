import { 
    cond, isNil, not, defaultTo, map, isEmpty, compose, contains, append, omit, concat,
    prop, equals, identity, all, when, evolve, ifElse, applyTo, reduce, add, groupBy 
} from 'ramda';
const sendMessage = postMessage as any;



let generateIndicators : 
(projects, todos) => { [key:string]:{active:number,completed:number,deleted:number}; } = 
 
(projects, todos) => compose(
    map(  
        data => data.reduce(
            (acc,val) => cond([
                    [
                        t => !isNil(t.deleted), 
                        t => evolve(
                                {
                                    deleted:add(1),
                                    trash:{
                                        completed:when(() => !isNil(t.completedSet), add(1)), 
                                        active:when(() => isNil(t.completedSet), add(1)) 
                                    }
                                }, 
                                acc
                            )
                    ],  
                    [ 
                        t => !isNil(t.completedSet), 
                        t => evolve({completed:add(1)}, acc) 
                    ],
                    [  
                        t => isNil(t.completedSet) && isNil(t.deleted), 
                        t => evolve({active:add(1)}, acc) 
                    ], 
                    [
                        t => true,
                        t => acc
                    ]  
            ])(val),
            { 
                active:0, 
                completed:0, 
                deleted:0,
                trash:{
                    completed:0,
                    active:0 
                }
            }
        )
    ), 
    omit(['detached']), 
    applyTo(todos),
    groupBy, 
    cond,
    append([ () => true, () => 'detached' ]),
    map(p => [t => contains(t._id, p.layout), () => p._id])
)(projects); 


onmessage = (e) => {
   let [projects,todos] = e.data; 
   sendMessage(generateIndicators(projects,todos));
}
