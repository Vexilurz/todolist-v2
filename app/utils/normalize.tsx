import { isNil } from 'ramda';
import { isNotNil } from './isSomething';

export let normalize = (dates:Date[]) : Date[]  => { 
    let day = 1000 * 60 * 60 * 24;
    let distance = null;
    let list = [];

    for(let i=0; i<dates.length; i++){
        let current = dates[i];
        let next = dates[i+1];

        if(isNil(next)){ 
            if(isNotNil(current)){ list.push(current); }
            continue; 
        }//end 

        let difference = Math.round( (next.getTime() - current.getTime()) / day );

        if(isNil(distance)){ //start 
            distance = difference; //difference in days
            list.push(current);
            continue;
        }

        if(difference<=0){
           continue;
        }else if(difference>1){
           list.push( current );
           list.push( new Date( current.getTime() + day*( difference/2 ) ) );
           continue;
        }else{
           distance = difference;
           list.push(current);
           continue;
        }
    }

    /*
    for(let i=0; i<list.length; i++){
        let current = list[i];
        let next = list[i+1];

        if(isNil(next)){ continue; } //end
        let difference = Math.round( (next.getTime() - current.getTime()) / day );
        if(difference!==1){
            console.log(
                `distance between ${current} - ${next}`,
                difference
            ); 
        }
    }
    */

    return list;
};    
