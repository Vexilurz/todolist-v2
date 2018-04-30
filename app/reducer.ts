import { updateDatabase } from './updateDatabase';
import { refreshReminders } from './utils/reminderUtils';
import { objectsReducer } from './ObjectsReducer';
import { stateReducer } from './StateReducer';
import { Reducer, Store, action } from "./types";
import { prop, ifElse, compose, not, when } from 'ramda';
import { typeEquals, wrapArray } from "./utils/utils";


let applyActionToState = (reducers:Reducer[]) => (state:Store,action:action) => {
    for(let i=0; i<reducers.length; i++){
        let newState = reducers[i](state, action);
        if(newState){ 
           return newState;
        }  
    }    
    return state;
};



let getActionsList : (action:action) => action[] = ifElse( typeEquals("multiple"), prop('load'), wrapArray );



let isMainWindow : (state:Store) => boolean = compose(not,prop('clone'));



let reducers = [stateReducer, objectsReducer];



let reducer = (reducers:Reducer[]) => (state:Store, action:any) : Store => {
    let actions : action[] = getActionsList(action);
    let apply = applyActionToState(reducers);
    let applyActionsToState = (state:Store) => actions.reduce((state,action) => apply(state,action), state);
    let applyActionsToDatabase = (state:Store) => actions.reduce((state,action) => apply(state,action), state);

    return compose( 

        refreshReminders(state), 

        when(isMainWindow, updateDatabase(state, actions)), // shouldAffectDatabase 

        applyActionsToState 
    )(state);
};  



export let applicationReducer = reducer(reducers); 
  

  


  
   