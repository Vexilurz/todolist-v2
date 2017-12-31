import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from 'react';
import SortableContainer from '../sortable-hoc/sortableContainer';
import SortableElement from '../sortable-hoc/sortableElement';
import SortableHandle from '../sortable-hoc/sortableHandle';
import {arrayMove} from '../sortable-hoc/utils';
 
export interface Data {oldIndex : number, newIndex : number, collection:any[]}

interface SortableListProps{
    getElement : ( value : any, index : number ) => JSX.Element,
    items : any[],
    
    container : HTMLElement, 

    shouldCancelStart : ( e : any ) => boolean,
    shouldCancelAnimation : ( e : any ) => boolean,

    onSortEnd : ( data : Data, e : any ) => void,  
    onSortMove : ( e : any, helper : HTMLElement, newIndex:number ) => void,
    onSortStart : ( data : any, e : any, helper : HTMLElement) => void,

    lockToContainerEdges : boolean,
    distance : number,
    useDragHandle : boolean,
    lock : boolean
}



interface SortableListState{} 

   

export class SortableList extends Component<SortableListProps, SortableListState>{

    constructor(props){
        
        super(props);

        this.state = {};

    } 

     
    getSortableList = (items:any[]) : JSX.Element =>  {
        
        return <ul style={{ 
            padding:0,   
            margin:0, 
            display: "flex",
            flexDirection: "column" 
        }}>     
            {            
                items.map(        
                    (item:any, index) => {   
                        let SortableItem = SortableElement(({value}) => this.props.getElement(value,index)); 
                        return <SortableItem  key={`item-${index}`} index={index} value={item} />;
                    }
                )    
            }   
        </ul> 
        
    }    
 

    shouldComponentUpdate(nextProps:SortableListProps){
        let should = false;

        if(nextProps.items!==this.props.items)
            should=true; 
         
        if(nextProps.container!==this.props.container)
            should=true;

        return should;  
    } 

        
    getSortableContainer = () => {

        let Container = SortableContainer(({items}) => this.getSortableList(items),{withRef:true});
         
        return <Container 
            axis='y'   
            getContainer={() => this.props.container ? this.props.container : document.body} 
            shouldCancelStart={this.props.shouldCancelStart}
            shouldCancelAnimation={this.props.shouldCancelAnimation}
            hideSortableGhost={true} 
            lockToContainerEdges={this.props.lockToContainerEdges}  
            distance={this.props.distance}   
            items={this.props.items}   
            useDragHandle={this.props.useDragHandle} 
            lockAxis={this.props.lock ? 'y' : null}  
            onSortEnd={this.props.onSortEnd}  
            onSortMove={this.props.onSortMove}  
            onSortStart={this.props.onSortStart}
        /> 
    }

 
    render(){

        return this.getSortableContainer();  

    }

}  

