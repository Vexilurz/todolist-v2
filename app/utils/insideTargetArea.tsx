import {isNil} from 'ramda';
 
export let insideTargetArea = (
     scrollableContainer:HTMLElement,
     target:HTMLElement,
     x:number,
     y:number,
     addMargin?:(rect:ClientRect) => ClientRect
) : boolean => {

    if(isNil(target)){ return false }
    let rect = target.getBoundingClientRect();

    if(!isNil(addMargin)){
        rect = addMargin(rect); 
    }

    let {left,right,top,bottom} = rect;
    let scrolledLeft = left;
    let scrolledTop = top;
    
    if(x>scrolledLeft && x<right){
       if(y>scrolledTop && y<bottom){ return true }
    }
       
    return false
}