import {isNil} from 'ramda';
 
export let insideTargetArea = (
     scrollableContainer:HTMLElement,
     target:HTMLElement,
     x:number,
     y:number
) : boolean => {

    if(isNil(target)){ return false }

    let {left,right,top,bottom} = target.getBoundingClientRect();
    let scrolledLeft = left;
    let scrolledTop = top;
    
    if(x>scrolledLeft && x<right){
       if(y>scrolledTop && y<bottom){ return true }
    }
       
    return false
}