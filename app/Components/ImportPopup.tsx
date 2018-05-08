import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { equals, isNil } from 'ramda';
import { ipcRenderer } from 'electron'; 
import { Component } from "react";   
import { getMonthName, attachDispatchToProps } from './../utils/utils'; 
import { Todo, Store, Databases, ImportActionLoad } from './../types';
import { SimplePopup } from './SimplePopup';
import { OptionsPopup } from './OptionsPopup';



interface ImportPopupProps{
    import:ImportActionLoad,
    dispatch:Function
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



    replace = () : void => {
        let database:Databases = this.props.import.database;

        let {todos,projects,areas,calendars} = database;

        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"addTodos", load:todos},
                {type:"addProjects", load:projects},   
                {type:"addAreas", load:areas},      
                {type:"addCalendars", load:calendars}   
            ]
        });


        this.onClose();  
    };



    merge = () : void => {
        let database:Databases = this.props.import.database;

        let {todos,projects,areas,calendars} = database;

        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"erase", load:undefined},

                {type:"addTodos", load:todos},
                {type:"addProjects", load:projects},   
                {type:"addAreas", load:areas},      
                {type:"addCalendars", load:calendars}   
            ]
        });

        this.onClose();  
    };



    render(){ 
        return <OptionsPopup
            title={'Import database'}
            message={this.props.import.pathToFile}
            options={[
                { title:'Merge databases', f:this.merge },                  
                { title:'Replace database', f:this.replace }
            ]}
            onCancel={this.onCancel}
            onClose={this.onClose}
        />
    }
} 
 
   