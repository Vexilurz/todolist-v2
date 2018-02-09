import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';  
import { Transition } from 'react-transition-group';
import { TodosList } from '../../Components/TodosList';
import { Todo, Project, Area } from '../../database';
import { ContainerHeader } from '.././ContainerHeader';
import { 
    compareByDate, getMonthName, byTags, isTodo, isProject, 
    byCompleted, byNotDeleted, byNotCompleted, getTagsFromItems, assert, isArrayOfStrings 
} from '../../utils';
import { allPass, compose, or, assoc, isNil, isEmpty } from 'ramda';
import { isDev } from '../../app';
import { TodoInput } from '../TodoInput/TodoInput';
import { ProjectLink, ProjectLinkLogbook } from '../Project/ProjectLink';
import { Category, filter } from '../MainContainer';
     

interface LogbookProps{
    dispatch:Function,
    todos:Todo[],
    selectedAreaId:string,
    selectedProjectId:string, 
    selectedCategory:string,  
    projects:Project[],
    areas:Area[],  
    selectedTag:string,
    rootRef:HTMLElement 
}
 
         
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
         
        let compare = compareByDate( (i : Todo | Project) => new Date(i.completed) );

        let objects = [...completedTodos, ...completedProjects].sort(compare);

        if(objects.length<2){ return [ [...objects] ] }
        
        let groups = [];

        let group : (Todo | Project)[] = [];
 
        let last : number = objects.length-2;
 
        for(let i=0; i<objects.length-1; i++){ 

            let key = getKey(new Date(objects[i].completed));

            let nextKey = getKey(new Date(objects[i+1].completed));
   
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

        return <div   
            style={{
                position:"relative", 
                display:"flex", 
                flexDirection:"column", 
                WebkitUserSelect:"none"
            }}
        >
            <div 
                style={{
                    WebkitUserSelect: "none", 
                    display:"flex",
                    width:"100%", 
                    fontWeight:"bold", 
                    fontFamily:"sans-serif",
                    paddingTop: "20px",
                    paddingBottom: "20px" 
                }}
            >  
                {month}
            </div> 

            <div style={{position:"relative", width:"100%"}}>
                {
                    [...todos,...projects]
                    .sort((a:Todo|Project,b:Todo|Project) => b.completed.getTime()-a.completed.getTime())
                    .map(  
                        (value:Todo|Project,index) => 

                        <div  
                          key={value._id}
                          style={{position:"relative", marginTop:"5px", marginBottom:"5px"}}
                        > 
                            {
                                value.type==="project" ? 
                                <ProjectLinkLogbook { ...{project:value} as any }/>
                                : 
                                value.type==="todo" ?
                                <TodoInput     
                                    id={value._id}
                                    key={value._id}
                                    projects={this.props.projects}  
                                    dispatch={this.props.dispatch}  
                                    selectedProjectId={this.props.selectedProjectId}
                                    selectedAreaId={this.props.selectedAreaId} 
                                    todos={this.props.todos} 
                                    selectedCategory={"logbook"}  
                                    rootRef={this.props.rootRef}  
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
 
        let tags = getTagsFromItems(this.props.todos);
        let groups = this.init(this.props);  
 
        return isNil(groups) ? null :
               isEmpty(groups) ? null : 
                <div>
                    <ContainerHeader 
                        selectedCategory={"logbook"} 
                        dispatch={this.props.dispatch}  
                        tags={tags} 
                        showTags={true} 
                        selectedTag={this.props.selectedTag}
                    />
                    <div id={`logbook-list`} style={{display:"flex", flexDirection:"column", width:"100%"}}> 
                    {   
                        groups.map( 
                         (group:any[], index:number) : JSX.Element => {
                            let todos:Todo[] = group.filter((item:Todo) => item.type==="todo");
                            let projects:Project[] = group.filter((item:Project) => item.type==="project"); 
                            let month:string = getMonthName(new Date(group[0].completed));
                                  
                            return <div key={index}> {this.getComponent(month, todos, projects)} </div>   
                          }   
                        )   
                    }  
                    </div>
                </div>
    } 
} 