import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { prop, contains } from 'ramda'; 
import { Component } from "react";   
import { attachDispatchToProps } from './../utils/utils'; 
import { Store, Databases } from './../types';
import { OptionsPopup } from './OptionsPopup';
import { connect } from "react-redux";
import { filter, debounce } from 'lodash';


interface ImportPopupProps extends Store{} 



interface ImportPopupState{}

@connect((store,props) => store, attachDispatchToProps)   
export class ImportPopup extends Component<ImportPopupProps,ImportPopupState>{
    ref:HTMLElement; 

    constructor(props){
       super(props); 
    }   
 


    onClose = debounce(() => this.props.dispatch({type:"import", load:null}), 300);  



    onCancel = (e) => this.onClose();



    replace = () : void => {
        let database:Databases = this.props.import.database;

        let {todos,projects,areas,calendars} = database;

        this.props.dispatch({type:"erase", load:undefined});

        this.props.dispatch({
            type:"multiple",
            load:[
              {type:"addTodos",load:todos,import:true},
              {type:"addProjects",load:projects,import:true},   
              {type:"addAreas",load:areas,import:true},      
              {type:"addCalendars",load:calendars,import:true}   
            ]
        });

        this.onClose();  
    };



    merge = () : void => {
        let database:Databases = this.props.import.database;
        let {todos,projects,areas,calendars} = database;

        let todosids = this.props.todos.map(prop('_id'));
        let projectids = this.props.projects.map(prop('_id'));
        let areasids = this.props.areas.map(prop('_id'));
        let calendarsids = this.props.calendars.map(prop('_id'));
        
        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"addTodos", load:filter( todos, t => !contains(t._id)(todosids) ), import:true },
                {type:"addProjects", load:filter( projects, p => !contains(p._id)(projectids) ), import:true },   
                {type:"addAreas", load:filter( areas, a => !contains(a._id)(areasids) ), import:true },   
                {type:"addCalendars", load:filter( calendars, c => !contains(c._id)(calendarsids) ), import:true }   
            ]
        });
    
        this.onClose();  
    };



    render(){ 
        return <OptionsPopup
            title={'Import database'}
            message={this.props.import.pathToFile}
            options={[{ title:'Merge databases', f:this.merge },{ title:'Replace database', f:this.replace }]}
            onCancel={this.onCancel}
            onClose={this.onClose}
        />
    }
} 
 
   