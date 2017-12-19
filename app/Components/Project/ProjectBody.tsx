
import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Provider } from "react-redux";
import { Transition } from 'react-transition-group';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { Todo, Project, Heading, LayoutItem } from '../../database';
import { uppercase, debounce } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { ProjectHeading } from './ProjectHeading'; 
import { SortableList, Data } from '../SortableList';
import { TodoInput } from '../TodoInput/TodoInput';



interface ProjectBodyProps{
    layout:LayoutItem[],
    updateLayout:(layout:LayoutItem[]) => void,
    updateHeading: (heading_id:string, newValue:string) => void,
    archiveHeading: (heading_id:string) => void,
    moveHeading: (heading_id:string) => void,  
    removeHeading: (heading_id:string) => void,
    todos:Todo[],
    tags:string[],
    rootRef:HTMLElement,
    dispatch:Function
} 
 

 
interface ProjectBodyState{
    selectedItems:any[] 
} 


 
export class ProjectBody extends Component<ProjectBodyProps,ProjectBodyState>{

     

    constructor(props){

        super(props);

        this.state = { 
            selectedItems : [] 
        }

    }



    componentDidMount(){ 
        
        let selectedItems = this.selectItems(this.props.layout, this.props.todos);

        this.setState({selectedItems}); 

    }


        
    componentWillReceiveProps(nextProps:ProjectBodyProps){

        let selectedItems = this.selectItems(nextProps.layout, nextProps.todos);

        this.setState({selectedItems});

    } 
        
    
        
    shouldComponentUpdate(nextProps:ProjectBodyProps, nextState:ProjectBodyState){ 
    
        let layoutChanged = nextProps.layout !== this.props.layout;
        let todosChanged = nextProps.todos !== this.props.todos; 
        let tagsChanged = nextProps.tags !== this.props.tags;
        let selectedItemsChanged = nextState.selectedItems !== this.state.selectedItems; 
         
        if(layoutChanged)
           return true; 

        if(todosChanged) 
           return true; 

        if(tagsChanged)
           return true; 

        if(selectedItemsChanged)
           return true;    

        return false; 
    
    }   



    selectItems = (layout:LayoutItem[], todos:Todo[]) : any[] => { 

        let items = [];

        for(let i=0; i<layout.length; i++){

            let item : LayoutItem = layout[i];

            if(item===undefined || item===null){

               continue; 

            }


            if(typeof item === "string"){
                
               let todo : Todo = todos.find( (t:Todo) => t._id===item );

               if(todo!==undefined && todo!==null){

                    if(todo.type==="todo"){

                        items.push(todo);

                    }

               }

            }else if(item.type==="heading"){

                items.push(item);

            }

        }

        return items; 
    
    }



    getElement = (value:Heading | Todo, index:number) : JSX.Element => { 
        
        switch(value.type){

            case "todo":

                    return  <div style={{position:"relative"}}> 
                                <TodoInput   
                                    id={value["_id"]} 
                                    key = {value["_id"]} 
                                    dispatch={this.props.dispatch}   
                                    tags={this.props.tags} 
                                    rootRef={this.props.rootRef} 
                                    todo={value as Todo}
                                />     
                            </div> 

            case "heading":    
            
                    return  <div style={{ 
                                position:"relative", 
                                paddingTop: "10px",
                                paddingBottom: "10px"
                            }}>
                                <ProjectHeading 
                                    heading = {value as Heading}
                                    onChange = {this.props.updateHeading}
                                    onArchive = {this.props.archiveHeading}
                                    onMove = {this.props.moveHeading} 
                                    onRemove = {this.props.removeHeading}
                                />
                            </div> 

            default:

                return null

        }

    }
    


    shouldCancelStart = (e) => {
        
        let nodes = [].slice.call(e.path);

        for(let i=0; i<nodes.length; i++){
            if(nodes[i].preventDrag)
                return true;
        }

        return false; 

    }
        
                
                    
        
    shouldCancelAnimation = (e) => {

        if(!this.props.rootRef)
            return true;

        let rect = this.props.rootRef.getBoundingClientRect();    
    
        let x = e.pageX;

        return x < rect.left;   

    } 
    


    onSortEnd = ( data : Data, e : any ) => {

        this.setState( 
            {
                selectedItems:arrayMove([...this.state.selectedItems], data.oldIndex, data.newIndex)
            }, 
            () => {
                let items : LayoutItem[] = this.state.selectedItems.map( 
                  (item: Todo | Heading) : any => item.type==="todo" ? item._id : item 
                );
 
                this.props.updateLayout(items);
            }
        )
         
    } 

 

    onSortMove = ( e : any, helper : HTMLElement ) => {

    }



    onSortStart = ( data : Data, e : any, helper : HTMLElement) => {
         
    }



    render(){

        return <div> 

            <SortableList
                getElement={this.getElement}
                items={this.state.selectedItems}
                
                shouldCancelStart={this.shouldCancelStart}
                shouldCancelAnimation={this.shouldCancelAnimation}

                onSortEnd={this.onSortEnd}
                onSortMove={this.onSortMove}
                onSortStart={this.onSortStart}

                lockToContainerEdges={false}
                distance={3}
                useDragHandle={false}
                lock={false} 
            />

        </div>

    }

} 







    
    
    
        
















