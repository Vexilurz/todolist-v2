import { Todo, CalendarEvent, Project, CalendarObject, Sequence } from "../types";
import { groupBy, compose, prop, sortBy, values, mapObjIndexed, isEmpty, splitEvery } from 'ramda';

let getHash = (date:Date) => `${date.getFullYear()}-${date.getMonth()}`;



export let generateUpcomingSequence = (
    daysCounter:number, 
    weeksCounter:number, 
    monthsCounter:number
) => (items:CalendarObject[]) : Sequence => {

    let days = [];
    let weeks = [];
    let months = [];


    for(let i = 0; i<items.length; i++){
        let item = items[i];
        let date = item.date;
        let weekDay = date.getDay(); //0 - 6, monday - 1
        let monthDay = date.getDate(); //1 - 31

        
        //day
        if( i < daysCounter ){

           days.push(item); 

        //week   
        }else if( i < weeksCounter * 7 ){
         
            if( isEmpty(weeks) && weekDay!==1 ){
                
               days.push(item);

            }else{

               weeks.push(item);

            }

        //month    
        }else{

            if( isEmpty(months) && monthDay!==1 ){

                weeks.push(item);

            }else{

                months.push(item);

            }
        }
    }


    return {
        days,
        weeks:splitEvery(7, weeks),
        months:compose(values, groupBy( item => getHash(item.date) ))(months)
    } 
};

 