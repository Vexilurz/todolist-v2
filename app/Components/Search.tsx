import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';   
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton';  
import { Component } from "react";  
import { Provider, connect } from "react-redux";
import Chip from 'material-ui/Chip';  
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import Checked from 'material-ui/svg-icons/navigation/check';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Layers from 'material-ui/svg-icons/maps/layers';
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Plus from 'material-ui/svg-icons/content/add'; 
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Clear from 'material-ui/svg-icons/content/clear';
import List from 'material-ui/svg-icons/action/list';
import Reorder from 'material-ui/svg-icons/action/reorder';  
let uniqid = require("uniqid");  
import Popover from 'material-ui/Popover';
import { TextField } from 'material-ui'; 
import { ThingsCalendar } from './ThingsCalendar';
import {  
    insideTargetArea, daysRemaining, replace, remove, todoChanged, 
    unique, daysLeftMark, generateTagElement, renderSuggestion, attachDispatchToProps, chooseIcon, stringToLength 
} from '../utils';
import { Todo, removeTodo, updateTodo, generateId, ObjectType, Area, Project, Heading } from '../database';
import { Store } from '../App';
import { ChecklistItem } from './TodoInput/TodoChecklist';
import { getAreaLink } from './Area/AreaLink';
import { getProjectLink } from './Project/ProjectLink';

 
interface keyworded{ object : any, keywords : string[] } 


let getTodoLink = (todo : Todo, index : number, dispatch : Function) : JSX.Element => {
    
     return <div key={`${todo._id}-${index}`} style={{position:"relative", padding:"5px"}}>  
                <div   
                    className="toggleFocus"  
                    onClick = {() => {
                        dispatch({ type:"selectedCategory", load:todo.category });
                        dispatch({ type:"selectedTodoId", load:todo._id });
                    }}    
                    id = {todo._id}       
                    style={{     
                        marginLeft:"4px",
                        marginRight:"4px", 
                        padding:"5px", 
                        position:"relative", 
                        height:"20px",
                        width:"95%",
                        display:"flex",
                        alignItems: "center" 
                    }}
                >             
                            {chooseIcon({width:"20px", height:"20px"}, todo.category)}
                            
                        <div    
                            id = {todo._id}   
                            style={{  
                                paddingLeft:"5px",
                                fontFamily: "sans-serif",
                                fontWeight: 600, 
                                color: "rgba(0, 0, 0, 1)",
                                fontSize: "18px", 
                                whiteSpace: "nowrap",
                                cursor: "default",
                                WebkitUserSelect: "none" 
                            }}
                        > 
                        
                            { stringToLength(todo.title, 25) }

                        </div>          

                            
                </div> 
            </div>  

}




let combineSearchableObjects = (props:QuickSearchProps) : any[] => {
     
    let todos = props.todos;
    let projects = props.projects;
    let areas = props.areas;
 
    let objects = [].concat.apply([], [todos, projects, areas])

    return objects;
 
}





let areaToKeywords = (a:Area) : string[] => {
    
    let description : string[] = a.description.split(",").filter( s => s.length>0 );

    let name : string[] = a.name.split(",").filter( s => s.length>0 );
    
    let tags : string[] = a.attachedTags; 
  
    return [].concat.apply([], [ name, tags, description ]);
     
} 




let projectToKeywords = (p:Project) : string[] => {

    let headings : string[][] = p.layout 
                                 .filter( i => typeof i !== "string" )
                                 .map((h:Heading) => h.title
                                                      .split(" ")
                                                      .filter( s => s.length>0 ) 
                                 ); 
     

    let description : string[] = p.description.split(",").filter( s => s.length>0 );
    let name : string[] = p.name.split(",").filter( s => s.length>0 );
     
    let layout : string [] = [].concat.apply([], headings);
    let tags : string[] = p.attachedTags; 

    return [].concat.apply([], [ name, description, layout, tags ]);
 
}




let todoToKeywords = (t:Todo) : string[] => {

    let category = t.category;
    let title : string [] = t.title.split(",").filter( s => s.length>0 );
    let note : string [] = t.note.split(",").filter( s => s.length>0 );
    let tags : string[] = t.attachedTags;  
    let checklist : string[] = t.checklist.map( c => c.text ).filter( s => s.length>0 );

    return [].concat.apply([], [ title, note, tags, checklist ]);

}

 

let objectToKeywords = (object : any) : string[] => {

    let type : ObjectType = object.type;
    
    if(type===undefined)
        return []; 

    switch(object.type){
        
        case "todo":
            return todoToKeywords(object);
                
        case "project":
            return projectToKeywords(object);

        case "area":
            return areaToKeywords(object);

        default:
            return [];  

    }
} 
 
 
 



let attachKeywordsToObjects = (objects : any[]) => {
  
    let objectsWithKeywords : keyworded[] = [];

    for(let i=0; i<objects.length; i++)
        objectsWithKeywords.push({ 
            object : objects[i], 
            keywords : objectToKeywords(objects[i]) 
        })

    return objectsWithKeywords; 
}





interface QuickSearchProps{
    container:HTMLElement,
    todos:Todo[],
    projects:Project[],
    areas:Area[],
    dispatch:Function  
}  

interface QuickSearchState{
    objectsWithKeywords:keyworded[],
    value:string,
    x:number,
    y:number, 
    width:number,
    suggestions:keyworded[]
} 
 
 
export class QuickSearch extends Component<QuickSearchProps,QuickSearchState>{

    ref:HTMLElement; 
    timeout:any; 

    constructor(props){

        super(props);

        this.state = {
            objectsWithKeywords : [],
            value:'',
            x:0,
            y:0, 
            width:300,
            suggestions:[] 
        };
  
    } 



    componentDidMount(){ 

        this.init(this.props);

        this.updatePosition(this.props); 
         
        this.timeout = setTimeout(() => window.addEventListener("click", this.onOutsideClick), 300);  

    }      
         
          
            
    componentWillUnmount(){

        clearTimeout(this.timeout as any);

        window.removeEventListener("click", this.onOutsideClick);

    }
     

    
    onOutsideClick = (e) => {
            
        if(this.ref===null || this.ref===undefined)
            return; 
 
        let rect = this.ref.getBoundingClientRect();

        let x = e.pageX;
        
        let y = e.pageY;
        
        let inside : boolean = insideTargetArea(this.ref)(x, y);

        if(!inside)
           this.props.dispatch({type:"openSearch", load:false})   
       
    }  
    

    init = (props) => {

        let objects = combineSearchableObjects(props);

        let objectsWithKeywords = attachKeywordsToObjects(objects);
        
        this.setState({objectsWithKeywords}); 
    }
 



    updatePosition = (props:QuickSearchProps) : void => { 
        
        if(!props.container)
            return; 

        let fixedOffsetTop = 200;
        let rect = props.container.getBoundingClientRect();
        let x = rect.width/2 - this.state.width/2; 
        let y = fixedOffsetTop + props.container.scrollTop;
 
        this.setState({x,y});  
  
    }


    componentWillReceiveProps(nextProps:QuickSearchProps){

        let update = false; 

        if(nextProps.todos !== this.props.todos)
           update = true;
        
        if(nextProps.areas !== this.props.areas)
           update = true;

        if(nextProps.projects !== this.props.projects)
           update = true;  


        if(update)
           this.init(nextProps);

        if(this.props.container!==nextProps.container)
           this.updatePosition(nextProps); 
          
    }  

    

    onChange = (e) => {
        console.log(this.state.objectsWithKeywords);


        var t0 = performance.now();
        let suggestions = this.state.objectsWithKeywords.filter( 
            k => {

                for(let i=0; i<k.keywords.length; i++){
                    
                    let value = e.target.value.toLowerCase();
                    let word = k.keywords[i].toLowerCase().slice(0, value.length);

                    if(value===word)
                       return true;

                }

            }
        );   
        var t1 = performance.now();
        console.log("Call to this.state.objectsWithKeywords.filter (Search) took " + (t1 - t0) + " milliseconds.");
         
        
        this.setState({
            value:e.target.value, 
            suggestions
        });
    }
 

    suggestionToComponent = (suggestion:keyworded, index:number) : JSX.Element => {

        let object = suggestion.object;
 
        switch(object.type){
  
            case "todo":
                return getTodoLink(object, index, this.props.dispatch)
            case "project":
                return getProjectLink({width:"12px", height:"12px"},object, index, this.props.dispatch);
            case "area":
                return getAreaLink({width:"20px", height:"20px"},object, index, this.props.dispatch);
        }
    
    }


    render(){ 
  
        return <div 
            ref={(e) => {this.ref=e;}}
            onClick = {(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}  
            style={{   
                padding: "10px", 
                boxShadow: "0 0 18px rgba(0,0,0,0.2)", 
                margin: "5px",
                borderRadius: "5px",
                zIndex: 30000, 
                width: `${this.state.width}px`, 
                height: "auto",    
                position: "absolute",
                backgroundColor: "rgba(238,237,239,1)",
                left:`${this.state.x}px`,
                top:`8%`   
            }}          
        >  
 
  
            <div style={{
                backgroundColor: "rgb(217, 218, 221)",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center"
            }}>  
                <div style={{
                    padding: "5px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                <Search style={{   
                    color: "rgb(100, 100, 100)",
                    height: "20px",
                    width: "20px"
                }}/>  
                </div>  
                 
                <input  style={{  
                            outline: "none",
                            border: "none", 
                            width: "100%", 
                            backgroundColor: "rgb(217,218,221)",
                            caretColor: "cornflowerblue"  
                        }} 
                        placeholder="Quick Find"
                        type="text" 
                        name="search" 
                        value={this.state.value} 
                        onChange={this.onChange}
                />
            </div> 
    
  
            <div className="scroll" style={{maxHeight:"600px", overflowX:"hidden"}}>  
                { 
                   this.state.value.length>0 ? null :
                    <div style={{
                       WebkitUserSelect: "none",
                       cursor:"default",  
                       fontSize: "14px", 
                       color: "rgba(100, 100, 100, 0.5)",
                       paddingTop: "30px",
                       paddingBottom: "30px",
                       paddingLeft: "25px",
                       paddingRight: "25px",       
                       textAlign: "center" 
                    }}>  
                        Quickly switch lists, find to-dos, search for tags 
                    </div>
                }     
               <div>  
                {    
                    this.state.value.length===0 ? null :
                    this.state.suggestions
                    .slice(0,10) 
                    .map((s,index) =>  
                        <div key={`suggestion-${index}`}>
                            {this.suggestionToComponent(s, index)}
                        </div>
                    )  
                }
               </div>  
            </div>  
        </div>

    }


}