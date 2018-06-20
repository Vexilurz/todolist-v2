import { 
    cond, isNil, map, compose, contains, append, omit,
    when, evolve, applyTo, add, groupBy 
} from 'ramda';


let daysRemaining = (date:Date) : number => {
   
    return dateDiffInDays(new Date(), date); 
}; 

let dateDiffInDays = (A : Date, B : Date) : number  => {
    if(typeof A === "string"){
       A = new Date(A);
    }
    
    if(typeof B === "string"){
       B=new Date(B);
    } 

    let _MS_PER_DAY = 1000 * 60 * 60 * 24;

    let utc1 = Date.UTC(A.getFullYear(), A.getMonth(), A.getDate());

    let utc2 = Date.UTC(B.getFullYear(), B.getMonth(), B.getDate());
  
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};
    



let isTodayOrPast = (date:Date) : boolean => isNil(date) ? false : daysRemaining(date)<=0;  
const sendMessage = postMessage as any;


let generateIndicators : 
(data) => { [key:string]:{active:number,completed:number,deleted:number}; } = 
 
({projects, todos}) => compose(
    map(  
        data => data
        .filter((t:any) => isNil(t.group) ? true : isTodayOrPast(t.attachedDate) )
        .reduce(
            (acc,val:any) => cond([
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
   let {type, load} = e.data; 

   let indicators = generateIndicators(load);

   sendMessage({type,load:indicators});
}; 
