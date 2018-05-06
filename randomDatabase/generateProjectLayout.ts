import { randomArrayMember } from "./utils";
import { isString } from "../app/utils/isSomething";
import { contains } from 'ramda';
import { LayoutItem } from "../app/types";
import { fakeHeading } from "./fakeHeading";


export let generateProjectLayout = (generateTodosIds:string[],n:number) : LayoutItem[] => { 

    let layout = [];

    for(let i=0; i<n; i++){
        let r = Math.random(); 
        if(r > 0.7){
            let heading = fakeHeading();

            if(!contains(heading._id)( layout.map(i => isString(i) ? i : i._id) ))
               layout.push(heading); 
        }else{
            let todoId = randomArrayMember(generateTodosIds);

            if(!contains(todoId)(layout))  
               layout.push(todoId);
        }
    }  

    return layout;
};