import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags'; 
import { Transition } from 'react-transition-group';
import { TodosList } from '../../Components/TodosList';
import { Todo, Project } from '../../database';
import { ContainerHeader } from '.././ContainerHeader';
import { compareByDate, getMonthName, byTags, byCompleted, byNotDeleted, byNotCompleted, getTagsFromItems } from '../../utils';
import { allPass, compose } from 'ramda';
     

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
    groups:(Todo | Project)[][]
} 


export class Logbook extends Component<LogbookProps,LogbookState>{

    constructor(props){
        super(props);
        this.state={
            groups:null 
        }
    } 
    
 

    init = (props:LogbookProps) => {
        let groups : (Todo | Project)[][] = this.groupByMonth(props);
        this.setState({groups});
    } 



    componentDidMount(){
        this.init(this.props);
    }



    componentWillReceiveProps(nextProps:LogbookProps){
        if(this.props.todos!==nextProps.todos)
           this.init(nextProps);
        if(this.props.projects!==nextProps.projects) 
           this.init(nextProps);
        if(this.props.selectedTag!==nextProps.selectedTag)
           this.init(nextProps);
    } 

    

    shouldComponentUpdate(nextProps:LogbookProps, nextState:LogbookState){

        if(this.state.groups!==nextState.groups)
            return true;

     
        if(this.props.todos!==nextProps.todos)
            return true;
        if(this.props.projects!==nextProps.projects) 
            return true;
        if(this.props.selectedTag!==nextProps.selectedTag)
            return true;

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
 
        let tags = compose(
            getTagsFromItems,
            (todos) => todos.filter(
                allPass([
                    byCompleted,  
                    byNotDeleted 
                ])  
            )
        )([...this.props.todos, ...this.props.projects]);
        

        return !this.state.groups ? null :
        <div>
            <ContainerHeader 
                selectedCategory={"logbook"} 
                dispatch={this.props.dispatch} 
                tags={tags} 
                showTags={true} 
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