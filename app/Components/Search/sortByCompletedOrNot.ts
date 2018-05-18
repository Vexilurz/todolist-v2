import { isNotDate, isDate } from "../../utils/isSomething";
import { Todo } from "../../types";

export let sortByCompletedOrNot = (a:Todo,b:Todo) => {
    if(isDate(a.completedSet) && isNotDate(b.completedSet)){
        return 1; 
    }else if(isDate(b.completedSet) && isNotDate(a.completedSet)){
        return -1; 
    }else{
        return 0;
    }
};