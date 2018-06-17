import '../../assets/styles.css';  
import { Todo } from '../../types';
import { isNil } from 'ramda';

/*
*
* Limit search results from Repeat groups to n items from each group.
* We sort todos by date, and then we walk through sorted todos,
* collecting items for each group until n limit is exceeded for this particular group.
*/
export let limitGroups = (n:number, todos:Todo[]) : Todo[] => {
    let table = {};
    let result = [];

    let sorted = todos.sort(
        (a:Todo,b:Todo) => {
            let A = a.attachedDate;
            let B = b.attachedDate;

            if(isNil(A) || isNil(B)){ return 0 };

            return A.getTime()-B.getTime();
        }
    ); 

    for(let i=0; i<sorted.length; i++){ 
        let todo = todos[i];

        if(isNil(todo.group)){ result.push(todo) }
        else{
            let groupId = todo.group._id;
            let entry = table[groupId];

            if(isNil(entry)){
                table[groupId] = 1;
                result.push(todo);
            }else{
                if(entry<n){  
                    table[groupId] = table[groupId] + 1; 
                    result.push(todo);   
                }
            } 
        }
    }

    return result;
}; 
