import {isDate,isString, isNotDate} from './isSomething';
import {compose,equals,prop,not,isNil} from 'ramda';

export let threeDaysLater = (date:Date) : Date => { 
    if(isNotDate(date)){ return date }

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    };
      
    return new Date(date.getTime())["addDays"](3);
}; 



export let oneDayMore = (date:Date) : Date => { 
    if(isNotDate(date)){ return date }

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;    
    };
      
    return new Date(date.getTime())["addDays"](1);
}; 



export let threeDaysAhead = (date:Date) : Date => { 
    if(isNotDate(date)){ return date }

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    };
      
    return new Date(date.getTime())["addDays"](3);
}; 



export let oneMinutesBefore = (date:Date) : Date => { 
    if(isNotDate(date)){ return date }

    let oneMinuteMs = 1000 * 60;
    return new Date(date.getTime() - oneMinuteMs);
}; 



export let fiveMinutesLater = (date:Date) : Date => { 
    if(isNotDate(date)){ return date }

    let fiveMinutesMs = 1000 * 60 * 5;
    return new Date(date.getTime() + fiveMinutesMs);
}; 



export let fiveMinutesBefore = (date:Date) : Date => { 
    if(isNotDate(date)){ return date }

    let fiveMinutesMs = 1000 * 60 * 5;
    return new Date(date.getTime() - fiveMinutesMs);
}; 



export let onHourLater = (date:Date) : Date => {  
    if(isNotDate(date)){ return date }

    let oneHourMs = 1000 * 60 * 60; 
    return new Date(date.getTime() + oneHourMs);
}; 



export let oneDayBehind = () : Date => { 
    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    };
      
    return new Date()["addDays"](-1);
}; 




export let timeDifferenceHours = (from:Date,to:Date) : number => {
    let first = isString(from) ? new Date(from).getTime() : from.getTime();
    let second = isString(to) ? new Date(to).getTime() : to.getTime();
    let diff = (second - first)/(1000*60*60);
    return Math.abs(diff);  
};



export let timeIsMidnight = (date:Date) : boolean => {
    if(isNotDate(date)){ return false }

    return (date.getHours()===0) &&  
           (date.getMinutes()===0) &&   
           (date.getSeconds()===0); 
}; 



export let fromMidnightToMidnight = (start:Date, end:Date) : boolean => {
    if(isNotDate(start) || isNotDate(end)){ return false }
    return timeIsMidnight(start) && timeIsMidnight(end);
};




export let addDays = (date:Date, days:number) => {

    let next = new Date();
        
    next.setDate(date.getDate() + days);

    return next; 
};
 


export let subtractDays = (date:Date, days:number) => {
 
    let next = new Date();
        
    next.setDate(date.getDate() - days);

    return next; 
};




export let inPast = (date:Date) : boolean => {
    if(isNil(date)){ return false }
    
    return new Date().getTime()>new Date(date).getTime();
};



export let inPastRelativeTo = (to:Date) => (date:Date) : boolean => {
    if(isNil(date)){ return false }

    return to.getTime()>new Date(date).getTime();
};

  

export let inFuture =  (date:Date) : boolean => {
    if(isNil(date)){ return false }
    return new Date().getTime()<new Date(date).getTime();
};



export let timeOfTheDay = (date:Date) : string => {
    let hours = String(date.getHours());
    let minutes = String(date.getMinutes());
    
    hours = hours.length === 1 ? `0${hours}` : hours;
    minutes = minutes.length === 1 ? `0${minutes}` : minutes;                                                                                         
    
    return `${hours}:${minutes}`;
};  


 
export let inTimeRange = (from:Date,to:Date,date:Date) : boolean => {

    if(isDate(from) && isDate(to) && isDate(date)){

        if(
            date.getTime() <= to.getTime() &&
            date.getTime() >= from.getTime()
        ){
            return true;
        }

    }

    return false;
};



export let addTime = (date:Date, time:number) : Date => {
    return new Date(date.getTime() + time);
};



export let subtractTime = (date:Date, time:number) : Date => {
    return new Date(date.getTime() - time);
};



export let typeEquals = (type:string) => compose(equals(type), prop(`type`));
 


export let getTime = (date:Date) : {minutes : number,hours : number} => {
    let defaultValue = {minutes:0,hours:0};

    if(isDate(date)){
        return {
            minutes:date.getMinutes(),
            hours:date.getHours()
        };
    }else if(isString(date)){
        let target = new Date(date);

        if(isDate(target)){
            return {
                minutes:target.getMinutes(),
                hours:target.getHours()
            };     
        }
    }

    return defaultValue;
};



export let setTime = (date:Date, time:{minutes:number,hours:number}) : Date => {
    let {minutes,hours} = time;

    if(isDate(date)){
        let updated = new Date(date.getTime());
        updated.setHours(hours);
        updated.setMinutes(minutes); 
        return updated;
    }else if(isString(date)){ 
        let target = new Date(date);

        if(isDate(target)){
           target.setHours(hours);
           target.setMinutes(minutes);
           return target;
        }
    }

    return date;
};
 

 
export let keyFromDate = (d:Date) : string => {  
    //assert(isDate(date), `keyFromDate. input is not a date. ${date}`);
    
    if(isNil(d)){ return '' }
    let date = isString(d) ? new Date(d) : d;

    let year = date.getFullYear();
    let day = date.getDate(); 
    let month = date.getMonth();

    return [year,month+1,day].join('-'); 
};



export let sameDay = (a:Date,b:Date) : boolean => {
    if(isNotDate(a) || isNotDate(b)){
       return false; 
    }

    return keyFromDate(a)===keyFromDate(b); 
};



export let differentDays = (a:Date,b:Date) : boolean => not(sameDay(a,b));



export let distanceInOneDay = (a:Date,b:Date) : boolean => {
    let distance = Math.abs(a.getDate() - b.getDate());
    return distance === 1;
};