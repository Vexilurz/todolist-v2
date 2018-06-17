import { defaultConfig } from './defaultConfig';
import { refreshReminders } from './utils/reminderUtils';
import { objectsReducer } from './objectsReducer';
import { stateReducer } from './stateReducer';
import { Reducer, Store, action, Config } from "./types";
import { prop, ifElse, compose, not, when, keys, equals, pick } from 'ramda';
import { typeEquals, wrapArray } from "./utils/utils";
import { updateDatabase } from './database/updateDatabase';
import { requestFromMain } from './utils/requestFromMain';


 
let getActionsList : (action:action) => action[] = ifElse(typeEquals("multiple"), prop('load'), wrapArray);



let isMainWindow : (state:Store) => boolean = compose(not, prop('clone'));



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



type UpdateConfig = (config:Config) => Promise<Config>;



export let updateConfigFromStore = (updateConfig:UpdateConfig, state:Store) => (newState:Store) : Store => {
    let pickConfig = pick( keys(defaultConfig) );

    let oldConfig = pickConfig(state);
    let newConfig = pickConfig(newState);
    
    if(!equals(oldConfig,newConfig)){
        updateConfig(newConfig);
    }
    
    return newState;
};



let updateConfig = (newConfig:Config) : Promise<Config> => requestFromMain(
    "updateConfig", 
    [newConfig], 
    (event, config) => config
);







export let reducer = (reducers:Reducer[], updateConfig:UpdateConfig) => (state:Store, action:any) : Store => {
    let actions : action[] = getActionsList(action);
    let apply = applyActionToState(reducers);
    let applyActionsToState = (state:Store) : Store => actions.reduce((state,action) => apply(state,action), state);
   
    return compose( 
        updateConfigFromStore(updateConfig, state),
        refreshReminders(state), 
        when(isMainWindow, updateDatabase(state, actions)),
        applyActionsToState 
    )(state);
};  



export let applicationReducer = reducer(reducers,updateConfig); 
   

  


  
   