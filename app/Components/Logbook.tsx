import '../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button'; 
import { Footer } from '../Components/Footer';
import { Tags } from '../Components/Tags';
import { Transition } from 'react-transition-group';
import { Category } from '../MainContainer';
import { TodosList } from '../Components/TodosList';
import { Todo, Project } from '../databaseCalls';
import { ContainerHeader } from './ContainerHeader';
import { compareByDate, getMonthName, byTags } from '../utils';
   
 

interface LogbookProps{
    dispatch:Function,
    todos:Todo[],
    selectedTodoId:string, 
    projects:Project[],
    selectedTag:string,
    tags:string[],
    rootRef:HTMLElement 
}


interface LogbookState{ 

} 





export class Logbook extends Component<LogbookProps,LogbookState>{


    
    constructor(props){
        super(props);
    } 


    componentWillMount(){
        
        let onMountTodos = this.props.todos;

        let onMountProjects = this.props.projects; 

    }
            


    componentDidMount(){

        let onMountTodos = this.props.todos;

        let onMountProjects = this.props.projects; 

    }
    

    groupByMonth = () : any[][] => { 
 

        let getKey = (d:Date) : string => `${d.getFullYear()}-${d.getMonth()}`;

        let todos = this.props.todos;

        let projects = this.props.projects;  

        let compare = compareByDate( (i : Todo | Project) => new Date(i.completed) );
 
        let objects = [...todos, ...projects].filter((i) => i.completed!==null && i.completed!==undefined).sort(compare);
 
        let groups = [];

        let group = [];

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
            key={month} 
            style={{position:"relative", display:"flex", flexDirection:"column"}}
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
                <TodosList 
                    dispatch={this.props.dispatch}    
                    filters={[byTags(this.props.selectedTag)]}
                    selectedCategory={"logbook"} 
                    selectedTag={this.props.selectedTag}  
                    rootRef={this.props.rootRef}
                    todos={todos}  
                    tags={this.props.tags} 
                />  
            </div>         

        </div> 

    }
  


    groupsToComponents = (groups : any[][]) : JSX.Element[] => {

        let elements = [];


        if(groups.length===0){

           return elements;
        
        }

   
        for(let i=0; i<groups.length; i++){

            let group : any[] = groups[i];

            if(group.length===0)
               continue; 

            let todos : Todo[] = group.filter( (item:Todo) => item.type==="todo" );
            let projects : Project[] = group.filter( (item:Project) => item.type==="project" );

            let month : string = getMonthName(new Date(group[0].completed));
  
            elements.push(this.getComponent(month,todos,projects));

        }

        return elements; 


    }

 

    render(){ 

        let groups = this.groupByMonth();

        return <div>
             
            <ContainerHeader 
                selectedCategory={"logbook"} 
                dispatch={this.props.dispatch} 
                tags={this.props.tags}
                selectedTag={this.props.selectedTag}
            />
   
            <div style={{
                display:"flex", 
                flexDirection:"column", 
                width:"100%"
            }}> 
             
                { this.groupsToComponents(groups) }

            </div>

        </div>

    }

} 