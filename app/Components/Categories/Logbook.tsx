import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import { Footer } from '../../Components/Footer';
import { Tags } from '../../Components/Tags'; 
import { Transition } from 'react-transition-group';
import { TodosList } from '../../Components/TodosList';
import { Todo, Project } from '../../database';
import { ContainerHeader } from '.././ContainerHeader';
import { compareByDate, getMonthName, byTags, byCompleted, byNotDeleted, allPass, byNotCompleted, getTagsFromItems } from '../../utils';
    
 

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
    groups:any,
    tags:string[] 
} 

 



export class Logbook extends Component<LogbookProps,LogbookState>{


    
    constructor(props){
        super(props);
        this.state={
            groups:null,
            tags:[] 
        }
    } 

    componentDidMount(){
        this.init(this.props);
    }


    init = (props:LogbookProps) => this.setState(this.groupByMonth(props));
    
    
    componentWillReceiveProps(nextProps:LogbookProps){
        if(this.props.todos!==nextProps.todos)
           this.init(nextProps);
        if(this.props.projects!==nextProps.projects)
           this.init(nextProps);
        if(this.props.selectedTag!==nextProps.selectedTag)
           this.init(nextProps);
    } 


    groupByMonth = (props:LogbookProps) => { 

        let filters = [
            byTags(props.selectedTag),
            byCompleted, 
            byNotDeleted  
        ];    
     

        let getKey = (d:Date) : string => `${d.getFullYear()}-${d.getMonth()}`;

        let todos = props.todos.filter( i => allPass(filters,i));

        let projects = props.projects.filter( i => allPass(filters,i)); 

        let tags = getTagsFromItems([...todos,...projects]);

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
  


        return {groups,tags};
        

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
                    filters={[]}  
                    isEmpty={(empty:boolean) => {}} 
                    setSelectedTags={(tags:string[]) => {}} 
                    dispatch={this.props.dispatch}     
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

        return !this.state.groups ? null :
        <div>
            <ContainerHeader 
                selectedCategory={"logbook"} 
                dispatch={this.props.dispatch} 
                tags={this.state.tags} 
                selectedTag={this.props.selectedTag}
            />
   
            <div style={{ 
                display:"flex", 
                flexDirection:"column",  
                width:"100%"
            }}> 
             
                { this.groupsToComponents(this.state.groups) }

            </div>
        </div>

    }

} 