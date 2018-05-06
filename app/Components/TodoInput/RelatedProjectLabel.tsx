
import { Todo, Project, Group, ChecklistItem, Category, RawDraftContentState } from '../../types';
import {  
    uniq, isEmpty, contains, isNil, not, multiply, remove, cond, ifElse,
    equals, any, complement, compose, defaultTo, path, prop, always,
    identity, when
} from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  


interface RelatedProjectLabelProps{
    name:string,
    selectedCategory:Category,
    groupTodos:boolean 
} 
 
interface RelatedProjectLabelState{}

export class RelatedProjectLabel extends Component<RelatedProjectLabelProps,RelatedProjectLabelState>{
    constructor(props){
        super(props); 
    }



    shouldComponentUpdate(nextProps:RelatedProjectLabelProps){
        return nextProps.name!==this.props.name ||
               nextProps.selectedCategory!==this.props.selectedCategory ||
               nextProps.groupTodos!==this.props.groupTodos;
    };



    render(){
        let {selectedCategory,groupTodos,name} = this.props;
        let disable : Category[] = groupTodos ?
                                   ["search","project","someday","today","next","area"] : 
                                   ["project","area"];
        
        if(contains(selectedCategory)(disable)){ return null }
        if(isNil(name)){ return null }    

        return <div 
            style={{ 
               paddingRight:"4px",   
               fontSize:"12px",   
               whiteSpace:"nowrap", 
               cursor:"default", 
               WebkitUserSelect:"none", 
               color:"rgba(0,0,0,0.6)"
            }}   
        > 
            {isEmpty(name) ? `New Project` : name}
        </div>   
    }
}; 
