import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';  
import { Transition } from 'react-transition-group';
import { Todo, Project, Area, Category } from '../../types';
import { ContainerHeader } from '.././ContainerHeader';
import { compareByDate, getMonthName, byTags, byCompleted, byNotDeleted, byNotCompleted, getTagsFromItems } from '../../utils/utils';
import { allPass, compose, or, isNil, isEmpty, defaultTo, all, contains, flatten } from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput';
import { ProjectLink, ProjectLinkLogbook } from '../Project/ProjectLink';
import { filter } from 'lodash';
import { isTodo, isProject, isDate, isString } from '../../utils/isSomething';
import { isDev } from '../../utils/isDev';
import { assert } from '../../utils/assert';

 

let getDateFromObject = (i : Todo & Project) => { 
    if(isNil(i)){ return new Date() }

    if(isTodo(i)){ 
        return new Date(i.completedWhen) 
    }else if(isProject(i)){ 
        return new Date(i.completed) 
    } 
};



let sortByCompleted = (a:(Todo & Project),b:(Todo & Project)) => {
    let aTime = 0;
    let bTime = 0;

    if(isTodo(b)){
        if(b.completedWhen){ 
           bTime = new Date(b.completedWhen).getTime(); 
        }
    }else if(isProject(b)){
        if(b.completed){
           bTime = new Date(b.completed).getTime();  
        }
    }

    if(isTodo(a)){
        if(a.completedWhen){
           aTime = new Date(a.completedWhen).getTime();  
        }
    }else if(isProject(a)){
        if(a.completed){
           aTime = new Date(a.completed).getTime();  
        }
    }

    return bTime-aTime;
};



interface LogbookProps{
    dispatch:Function,
    todos:Todo[],
    moveCompletedItemsToLogbook:string,
    groupTodos:boolean, 
    selectedAreaId:string,
    scrolledTodo:Todo,
    selectedProjectId:string, 
    selectedCategory:Category,  
    indicators:{ 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    projects:Project[],
    areas:Area[],    
    selectedTags:string[],
    rootRef:HTMLElement 
};
 


interface LogbookState{}   
 


export class Logbook extends Component<LogbookProps,LogbookState>{
 
    constructor(props){
        super(props);
    }  
    
    
    
    init = (props:LogbookProps) => {
        let groups : (Todo | Project)[][] = this.groupByMonth(props);
        return groups;
    } 
 


    groupByMonth = (props:LogbookProps) : (Todo | Project)[][] => {  
 
        let {todos,projects} = props;   

        let getKey = (d:Date) : string => `${d.getFullYear()}-${d.getMonth()}`;

        let completedProjects : Project[] = filter(
            projects, 
            allPass([ byCompleted, byNotDeleted ])
        );  

        let ids = flatten( completedProjects.map( p => p.layout.filter(isString) ) );

        let completedTodos : Todo[] = filter(
            todos, 
            allPass([ t => !contains(t._id)(ids), byTags(props.selectedTags) ])
        );

        let compare = compareByDate(getDateFromObject);

        let objects = [...completedTodos, ...completedProjects].sort(compare);

        if(objects.length<2){ return [ [...objects] ] }
        
        let groups = [];

        let group : (Todo | Project)[] = [];
 
        let last : number = objects.length-2;
 
        for(let i=0; i<objects.length-1; i++){ 

            let key = compose(getKey,getDateFromObject)(objects[i] as (Todo & Project));

            let nextKey = compose(getKey,getDateFromObject)(objects[i+1] as (Todo & Project)); 
   
            if(i === last){
                if(key===nextKey){
                    group.push(objects[i]);
                    group.push(objects[i+1]);
                    groups.push(group);
                }else{
                    group.push(objects[i]);
                    groups.push(group);
                    groups.push([objects[i+1]]);
                }

                break;
            }

            group.push(objects[i]);

            if(key !== nextKey){
                groups.push(group);
                group = [];  
            } 
        }

        return groups;
    }



    getComponent = (month:string, todos:Todo[], projects:Project[]) : JSX.Element => {
        let {
            moveCompletedItemsToLogbook,selectedCategory,groupTodos,
            dispatch,selectedProjectId,selectedAreaId,rootRef
        } = this.props;

        return <div style={{position:"relative", display:"flex", flexDirection:"column", WebkitUserSelect:"none"}}>
            <div 
                style={{
                    WebkitUserSelect:"none", 
                    display:"flex",
                    width:"100%", 
                    fontWeight:"bold", 
                    fontFamily:"sans-serif",
                    paddingTop:"20px",
                    paddingBottom: "20px" 
                }}
            >  
                {month}
            </div> 
            <div style={{position:"relative", width:"100%"}}>
                {
                    [
                        ...todos,
                        ...projects
                    ]
                    .sort(sortByCompleted)
                    .map(  
                        (value:Todo|Project,index:number) => 
                        <div   
                           key={value._id}
                           style={{position:"relative",marginTop:"5px",marginBottom:"5px"}}
                        > 
                            {
                                isProject(value as any) ? 
                                <ProjectLinkLogbook
                                    project={value as Project}
                                    dispatch={this.props.dispatch}
                                    indicator={defaultTo({completed:0, active:0})(this.props.indicators[value._id])}
                                    selectedCategory={this.props.selectedCategory} 
                                />  
                                : 
                                isTodo(value) ?
                                <TodoInput     
                                    id={value._id}
                                    key={value._id}
                                    groupTodos={groupTodos}
                                    scrolledTodo={this.props.scrolledTodo}
                                    moveCompletedItemsToLogbook={moveCompletedItemsToLogbook}
                                    projects={this.props.projects}  
                                    dispatch={dispatch}  
                                    selectedProjectId={selectedProjectId}
                                    selectedAreaId={selectedAreaId} 
                                    selectedCategory={selectedCategory}  
                                    rootRef={rootRef}  
                                    todo={value as Todo}
                                />    
                                :
                                null
                            }   
                        </div> 
                    ) 
                }   
            </div>      
        </div> 
    };
    


    render(){  
        let { selectedCategory, dispatch, selectedTags } = this.props;
        let groups = this.init(this.props);  
        let completedTodos = flatten( groups.map((group:any[]) => filter(group, isTodo)) );
        let tags = getTagsFromItems(completedTodos);
       


        if(isDev()){
        
            let completedProjects = flatten( groups.map((group:any[]) => filter(group, isProject)) );
            let ids = flatten( completedProjects.map( p => p.layout.filter(isString) ) );
            assert(
                all((todo:Todo) => !contains(todo._id,ids), completedTodos), 
                `Error: Completed todos from completed projects.`
            );
        }

 
        return isNil(groups) ? null :
               isEmpty(groups) ? null : 
                <div id={`${selectedCategory}-list`}>
                    <ContainerHeader 
                        selectedCategory={selectedCategory} 
                        dispatch={dispatch}  
                        tags={tags} 
                        showTags={true} 
                        selectedTags={selectedTags}
                    />
                    <div style={{display:"flex", flexDirection:"column", width:"100%"}}> 
                        {   
                        groups.map( 
                            (group:any[], index:number) : JSX.Element => {
                                let todos:Todo[] = filter(group, isTodo);
                                let projects:Project[] = filter(group, isProject);
                                let month:string = getMonthName(getDateFromObject(group[0]));
                                return <div key={index}>{this.getComponent(month, todos, projects)}</div>   
                            }   
                        )   
                        }  
                    </div>
                </div>
    } 
} 