import { Category, Project } from "../app/types";
let randomWords = require('random-words');
import { 
    uniq, splitEvery, contains, isNil, not, and, 
    evolve, when, map, reject, range, flatten, 
    isEmpty, complement, equals, compose, ifElse, anyPass 
} from 'ramda';
let different = complement(equals);


export const randomWord = () => randomWords();//require('random-word');



export let randomInteger = (n:number) : number => {
    return Math.round(Math.random() * n);
}; 



export let randomCategory = () : Category => {
    
    let categories : Category[] = [
        "inbox" , "today" , "upcoming" , "next" , "someday" , 
        //"logbook" , "trash" , "project" , "area" , 
        "evening"
    ];  

    return randomArrayMember(categories); 

};



export let randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));


    
export let randomArrayMember = (array : any[]) => {
    let range = array.length - 1;
    let idx = randomInteger(range);
    let member = array[idx]; 
    return member;
}; 



export let assertLayoutUniqueness : (projects:Project[]) => Project[] = when(
    (projects) => true, 
    (projects) => map(
        p => evolve(
            {
                layout:reject( 
                    i => projects.find( 
                        t => and( 
                            contains(i)(t.layout), 
                            different(t._id,p._id) 
                        ) 
                    ) 
                )
            },
            p
        ),
        projects
    )
);



export let fakeTags = (n) : string[] => {
    
    let tags = [];
    let i  = randomInteger(n) + 5;

    
    for(let j=0; j<i; j++)
        tags.push(randomWord()); 

    return tags;
};
      