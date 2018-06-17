import '../../assets/styles.css';  
import { Todo } from '../../types';
import { isNil, flatten, all } from 'ramda';
import { isString, isDate } from '../../utils/isSomething';
import { isDev } from '../../utils/isDev';
import { assert } from '../../utils/assert';
import { getNotePlainTextFromRaw } from '../../utils/draftUtils';
import { stringToKeywords } from './stringToKeywords';



let dateToKeywords = (date:Date) : string[] => {
    if(!isDate(date)){ return []; }
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    return flatten(date.toLocaleDateString("ENG", options).split(',').map(stringToKeywords));
};



export let todoToKeywords = (t:Todo) : string[] => {
    if(isNil(t)){ return []; }
    let keywords : string[] = [];
    let note = getNotePlainTextFromRaw(t.note);
    let checklist = t.checklist.map( c => stringToKeywords( c.text ) );
    
    keywords.push( ...stringToKeywords(t.title) );
    keywords.push( ...stringToKeywords(note) );
    keywords.push( ...flatten(checklist) );
    
    if(isDate(t.deadline)){  
        keywords.push(...dateToKeywords(t.deadline));  
    }
    if(isDate(t.attachedDate)){  
        keywords.push(...dateToKeywords(t.attachedDate));  
    }

    //should i add tags in search ?
    //let attachedTags = flatten( t.attachedTags.map((tag) => stringToKeywords(tag)) );                                 
    
    if(isDev()){
        assert(
           all(isString,keywords), 
           `not all keywords are of type string. todoToKeywords. ${JSON.stringify(keywords)}`
        )
    }

    return keywords;
}; 
