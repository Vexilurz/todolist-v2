import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { equals } from 'ramda';
import { ipcRenderer } from 'electron'; 
import { Component } from "react";   
import { getMonthName, attachDispatchToProps } from './../utils/utils'; 
import { Todo, Store, Databases, ImportActionLoad } from './../types';
import { SimplePopup } from './SimplePopup';
import { OptionsPopup } from './OptionsPopup';



interface ImportPopupProps{
    dispatch:Function,
    import:ImportActionLoad
} 



interface ImportPopupState{}



export class ImportPopup extends Component<ImportPopupProps,ImportPopupState>{
    ref:HTMLElement; 

    constructor(props){
        super(props); 
    }   
 


    onClose = () => {   
        this.props.dispatch({type:"import", load:null}); 
    };  



    onCancel = (e) => {
        this.onClose();  
    };



    replace = (database:Databases) : Promise<void> => {
        this.onClose();  
        return null;
    };



    merge = (database:Databases) : Promise<void> => {
        this.onClose();  
        return null;
    };


    //TODO
    /*
    setData = (load:Databases) : Promise<void> => {
        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"setProjects", load:load.projects},
                {type:"setAreas", load:load.areas},
                {type:"setTodos", load:load.todos},
                {type:"setCalendars", load:load.calendars},
                {type:"selectedCategory", load:"inbox"}
            ]
        }); 

        let actionSetDatabase : actionSetDatabase = { type:"set", load };

        return workerSendAction(pouchWorker)(actionSetDatabase);
    };
    */



    render(){ 
        return <OptionsPopup
            title={'Import database'}
            message={``}
            options={[
                { title:'Merge databases', f:this.merge },                  
                { title:'Replace database', f:this.replace }
            ]}
            onCancel={this.onCancel}
            onClose={this.onClose}
        />
    }
} 
 
   