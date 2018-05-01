import { checkAuthenticated } from './utils/checkAuthenticated';
import { emailToUsername } from './utils/emailToUsername';
import { refreshReminders } from './utils/reminderUtils';
import { objectsReducer } from './objectsReducer';
import { stateReducer } from './stateReducer';
import { Reducer, Store, action } from "./types";
import { prop, ifElse, compose, not, when, identity, contains } from 'ramda';
import { typeEquals, wrapArray, turnedOn, turnedOff } from "./utils/utils";
import { pouchWorker } from './app';
import { isString } from './utils/isSomething';
import { updateDatabase } from './database/updateDatabase';



 
 
let getActionsList : (action:action) => action[] = ifElse( typeEquals("multiple"), prop('load'), wrapArray );



let isMainWindow : (state:Store) => boolean = compose(not,prop('clone'));



let reducers = [stateReducer, objectsReducer];



let applyActionToState = (reducers:Reducer[]) => (state:Store,action:action) : Store => {
    for(let i=0; i<reducers.length; i++){
        let newState = reducers[i](state, action);
        if(newState){ 
           return newState;
        }  
    }    
    return state;
};



let reducer = (reducers:Reducer[]) => (state:Store, action:any) : Store => {
    let actions : action[] = getActionsList(action);
    let apply = applyActionToState(reducers);
    let applyActionsToState = (state:Store) : Store => actions.reduce((state,action) => apply(state,action), state);
   

    return compose( 
        refreshReminders(state), 

        when(isMainWindow, updateDatabase(state, actions)),

        applyActionsToState 
    )(state);
};  



export let applicationReducer = reducer(reducers); 
   

  


  
   