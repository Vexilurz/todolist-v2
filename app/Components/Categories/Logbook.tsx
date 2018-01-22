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
import { allPass, compose, or, assoc } from 'ramda';
import { isDev } from '../../app';
import { TodoInput } from '../TodoInput/TodoInput';
import { ProjectLink } from '../Project/ProjectLink';
import { Category } from '../MainContainer';
     

interface LogbookProps{
    dispatch:Function,
    todos:Todo[],
    searched:boolean, 
    selectedAreaId:string,
    selectedProjectId:string, 
    selectedCategory:string,   
    selectedTodoId:string, 
    projects:Project[],
    areas:Area[],  
    selectedTag:string,
    tags:string[],
    rootRef:HTMLElement 
}
 
         
interface LogbookState{}   
 

export class Logbook extends Component<LogbookProps,LogbookState>{

    constructor(props){
        super(props);
    }  



    shouldComponentUpdate(nextProps:LogbookProps,nextState:LogbookState){
        let should = false;


        if(nextProps.todos!==this.props.todos)
            should = true; 
        if(nextProps.searched!==this.props.searched)
            should = true;
        if(nextProps.selectedAreaId!==this.props.selectedAreaId)
            should = true;
        if(nextProps.selectedProjectId!==this.props.selectedProjectId)
            should = true;
        if(nextProps.selectedCategory!==this.props.selectedCategory)
            should = true;
        if(nextProps.selectedTodoId!==this.props.selectedTodoId)
           should = true;
        if(nextProps.projects!==this.props.projects)
            should = true;
        if(nextProps.areas!==this.props.areas)  
            should = true;
        if(nextProps.selectedTag!==this.props.selectedTag)
            should = true;
        if(nextProps.tags!==this.props.tags)
            should = true;
        
        return should;
    } 

    

    init = (props:LogbookProps) => {
        let groups : (Todo | Project)[][] = this.groupByMonth(props);

        if(isDev()){
           for(let i=0; i<groups.length; i++){
               let group : (Todo | Project)[] = groups[i];
               for(let j=0; j<group.length; j++){
                    assert(
                       or(isProject(group[j] as Project),isTodo(group[j] as Todo)), 
                       `item have incorrect type 
                        ${JSON.stringify(group[j])}. 
                        ${JSON.stringify(group)}. 
                        init.Logbook.`
                    );  
               }
           } 
        } 
        return groups;
    } 
 

    groupByMonth = (props:LogbookProps) : (Todo | Project)[][] => {  
 
        let filters = [
            byTags(props.selectedTag),
            byCompleted, 
            byNotDeleted  
        ];     

        let getKey = (d:Date) : string => `${d.getFullYear()}-${d.getMonth()}`;

        let todos : Todo[] = props.todos.filter(allPass(filters));

        let projects : Project[] = props.projects.filter(allPass(filters)); 

        let compare = compareByDate( (i : Todo | Project) => new Date(i.completed) );

        let objects = [...todos, ...projects].sort(compare);

        if(objects.length<2)
           return [ [...objects] ];
        
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
                    todos
                    .sort((a:Todo,b:Todo) => b.completed.getTime()-a.completed.getTime())
                    .map(  
                        (value:Todo,index) => <div 
                            key={value._id}
                            style={{
                                position:"relative",
                                marginTop:"5px",
                                marginBottom:"5px"
                            }}
                        >
                            <TodoInput   
                                id={value._id}
                                key={value._id}
                                projects={this.props.projects}  
                                dispatch={this.props.dispatch}  
                                selectedProjectId={this.props.selectedProjectId}
                                selectedAreaId={this.props.selectedAreaId} 
                                todos={this.props.todos} 
                                selectedCategory={"logbook"} 
                                selectedTodoId={this.props.selectedTodoId}
                                tags={this.props.tags} 
                                searched={this.props.searched}
                                rootRef={this.props.rootRef}  
                                todo={value}
                            />     
                        </div>
                    )
                }   
            </div> 

            <div> 
            {
                projects.map( 
                    (p:Project, index:number) => 
                        <ProjectLink
                            dispatch={this.props.dispatch}
                            index={index}
                            selectedCategory={this.props.selectedCategory as Category}
                            project={p}
                            todos={this.props.todos}
                            simple={true}
                        />
                )
            }
            </div>       
        </div> 
    }
  

    render(){  
 
        let tags = compose(
            getTagsFromItems,
            (todos) => todos.filter(allPass([byCompleted,byNotDeleted]))
        )([...this.props.todos, ...this.props.projects]);

        if(isDev()){
           assert(
               isArrayOfStrings(tags), 
               `tags is not a string array ${JSON.stringify(tags)}. Logbook. render.`
           ) 
        } 
  
        let groups = this.init(this.props);  

        return !groups ? null :
                <div>
                    <ContainerHeader 
                        selectedCategory={"logbook"} 
                        dispatch={this.props.dispatch}  
                        tags={tags} 
                        showTags={true} 
                        selectedTag={this.props.selectedTag}
                    />
                    <div style={{display:"flex", flexDirection:"column", width:"100%"}}> 
                    {   
                        groups.map( 
                         (group:any[], index:number) : JSX.Element => {
                              let todos:Todo[] = group.filter((item:Todo) => item.type==="todo");
                              let projects:Project[] = group.filter((item:Project) => item.type==="project"); 
                              let month:string = getMonthName(new Date(group[0].completed));
                                  
                              return <div key={index}>
                                {this.getComponent(month, todos, projects)}
                              </div>   
                          } 
                        )   
                    }  
                    </div>
                </div>
    } 
} 