import { Category } from "../app/types";
let randomWords = require('random-words');
const randomWord = () => randomWords();//require('random-word');



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



export let fakeTags = (n) : string[] => {
    
    let tags = [];
    let i  = randomInteger(n) + 5;

    
    for(let j=0; j<i; j++)
        tags.push(randomWord()); 

    return tags;
};
      