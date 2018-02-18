import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';  
import { Transition } from 'react-transition-group';
import { Todo, Project, Area } from '../../database';
import { ContainerHeader } from '.././ContainerHeader';
import { 
  compareByDate, getMonthName, byTags, byCompleted, byNotDeleted, byNotCompleted, getTagsFromItems
} from '../../utils/utils';
import { allPass, compose, or, assoc, isNil, isEmpty } from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput';
import { ProjectLink, ProjectLinkLogbook } from '../Project/ProjectLink';
import { Category, filter } from '../MainContainer';
import { isTodo, isProject } from '../../utils/isSomething';



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
           bTime = b.completedWhen.getTime(); 
        }
    }else if(isProject(b)){
        if(b.completed){
           bTime = b.completed.getTime();  
        }
    }

    if(isTodo(a)){
        if(a.completedWhen){
           aTime = a.completedWhen.getTime();  
        }
    }else if(isProject(a)){
        if(a.completed){
           aTime = a.completed.getTime();  
        }
    }

    return bTime-aTime;
};



interface LogbookProps{
    dispatch:Function,
    todos:Todo[],
    selectedTodo:Todo, 
    moveCompletedItemsToLogbook:string,
    groupTodos:boolean, 
    selectedAreaId:string,
    selectedProjectId:string, 
    selectedCategory:Category,  
    projects:Project[],
    areas:Area[],    
    selectedTag:string,
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

        let completedTodos : Todo[] = filter(
            todos,
            byTags(props.selectedTag),
            "completedTodos"
        );

        //TODO should projects be filtered by tags ? 
        let completedProjects : Project[] = filter(
            projects, 
            allPass([ byCompleted, byNotDeleted ]),
            "completedProjects"
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
            dispatch,selectedProjectId,selectedAreaId,rootRef,selectedTodo
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
                    [...todos,...projects]
                    .sort(sortByCompleted)
                    .map(  
                        (value:Todo|Project,index) => 

                        <div  
                          key={value._id}
                          style={{position:"relative", marginTop:"5px", marginBottom:"5px"}}
                        > 
                            {
                                isProject(value as any) ? 
                                <ProjectLinkLogbook { ...{project:value} as any }/>
                                : 
                                isTodo(value) ?
                                <TodoInput     
                                    id={value._id}
                                    key={value._id}
                                    groupTodos={groupTodos}
                                    selectedTodo={selectedTodo}
                                    moveCompletedItemsToLogbook={moveCompletedItemsToLogbook}
                                    projects={this.props.projects}  
                                    dispatch={dispatch}  
                                    selectedProjectId={selectedProjectId}
                                    selectedAreaId={selectedAreaId} 
                                    todos={this.props.todos} 
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
    }
    


    render(){  
        let { selectedCategory, dispatch, selectedTag } = this.props;
        let tags = getTagsFromItems(this.props.todos);
        let groups = this.init(this.props);  
 
        return isNil(groups) ? null :
               isEmpty(groups) ? null : 
                <div id={`${selectedCategory}-list`} >
                    <ContainerHeader 
                        selectedCategory={selectedCategory} 
                        dispatch={dispatch}  
                        tags={tags} 
                        showTags={true} 
                        selectedTag={selectedTag}
                    />
                    <div style={{display:"flex", flexDirection:"column", width:"100%"}}> 
                        {   
                        groups.map( 
                            (group:any[], index:number) : JSX.Element => {
                             let todos:Todo[] = filter(group, isTodo, "");
                             let projects:Project[] = filter(group, isProject, "");
                             let month:string = getMonthName(getDateFromObject(group[0]));
                                    
                             return <div key={index}> {this.getComponent(month, todos, projects)} </div>   
                            }   
                        )   
                        }  
                    </div>
                </div>
    } 
} 