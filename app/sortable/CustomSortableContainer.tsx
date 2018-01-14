import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { assert } from '../utils';
import { isEmpty, not, contains, isNil } from 'ramda';
import { Placeholder } from '../Components/TodosList';
  




let hideElement = (node:HTMLElement) : void => {
    node.style.visibility = 'hidden';
    node.style.opacity = '0';  
}


let showElement = (node:HTMLElement) : void => {
    node.style.visibility = 'visible';
    node.style.opacity = '1';  
}



let match = (nodes:HTMLElement[],items:{_id:string}[]) : boolean => {
         
    if(nodes.length!==items.length){
       return false; 
    }

    for(let i=0; i<nodes.length; i++){
        if(nodes[i].id!==items[i]._id){
           return false; 
        }
    }

    return true;
}



let cloneOne = (node:HTMLElement) : HTMLElement => {
    const fields = node.querySelectorAll('input, textarea, select');
    const clone = node.cloneNode(true) as HTMLElement;
    const {top,left,width,height} = node.getBoundingClientRect();
    const clonedFields = [...clone.querySelectorAll('input, textarea, select')];

    

    clonedFields.forEach((field:any, index) => {
      if(field.type !== 'file' && fields[index]) {
         field.value = fields[index]["value"];
         field.style.userSelect = "none";
         field.style.webkitUserSelect = "none";
      } 
    }); 
 
    clone.style.position = 'fixed';
    clone.style.top = `${top}px`;
    clone.style.left = `${left}px`;
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.boxSizing = 'border-box';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '200000';
    clone.style.userSelect = "none";
    clone.style.webkitUserSelect = "none";

      
    return clone;
}



let cloneMany = (nodes:HTMLElement[]) : HTMLElement => {
    let container = document.createElement('div');
    let containerWidth = 0;
    let containerHeight = 0;
    let containerTop = 0;
    let containerLeft = 0;

    let first = nodes[0];
    let {top,left} = first.getBoundingClientRect();
      
    containerTop = top; 
    containerLeft = left;

    for(let i=0; i<nodes.length; i++){
        let node = nodes[i];
        let fields = node.querySelectorAll('input, textarea, select');
        let clone = node.cloneNode(true) as HTMLElement;
        let {top,left,width,height} = node.getBoundingClientRect();
        let clonedFields = [...clone.querySelectorAll('input, textarea, select')];

        clonedFields.forEach((field:any, index) => {
          if(field.type !== 'file' && fields[index]) {
             field.value = fields[index]["value"];
             field.style.userSelect = "none";
             field.style.webkitUserSelect = "none";
          }  
        });    
           
        containerHeight = containerHeight + height;
        containerWidth = containerWidth < width ? width : containerWidth

        clone.style.position = 'relative';

        container.appendChild(clone);
    }

    container.style.position = 'fixed';
    container.style.top = `${containerTop}px`;
    container.style.left = `${containerLeft}px`;
    container.style.width = `${containerWidth}px`;
    container.style.height = `${containerHeight}px`;
    container.style.boxSizing = 'border-box';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '200000';
    container.style.userSelect = "none";
    container.style.webkitUserSelect = "none";

      
    return container;  
}   


 
let cloneSelectedElements = (
    nodes:HTMLElement[],
    indices:number[] 
) : {selectedElements:HTMLElement[], clone:HTMLElement}  => {
   
    if(indices.length===1){
        
       let index = indices[0]; 
       let node = nodes[index];
       let clone = cloneOne(node);
       
       return { selectedElements:[node], clone };

    }else if(indices.length>1){ 
       
       let selected = nodes.filter((node,index) => contains(index)(indices));  
       let clone = cloneMany(selected);   
 
       return { selectedElements:selected, clone }; 
    } 
}



let getNodes = (ref) : HTMLElement[] => {

    assert(!isNil(ref), `ref is Nil. getNodes.`);
    return [].slice.call(ref.children);
};



interface SortableContainerProps{
    items:any[],
    scrollableContainer:HTMLElement,
    selectElements:(index:number,items:any[]) => number[],
    shouldCancelStart:(event:any,item:any) => boolean, 
    onSortStart:(oldIndex:number,event:any) => void,  
    onSortEnd:(oldIndex:number,newIndex:number,event:any) => void,
    onSortMove:(oldIndex:number,event:any) => void,
    decorators:{ condition:(x:number,y:number) => boolean, decorator:HTMLElement }[]
}      

  

interface SortableContainerState{
    placeholderHeight:number,
    placeholderOffset:number, 
    showPlaceholder:boolean
}
 

export class SortableContainer extends Component<SortableContainerProps,SortableContainerState>{

    ref:HTMLElement;
    subscriptions:Subscription[]; 

    paused:boolean; 
     
    cloned:HTMLElement;
    selected:HTMLElement[];

    deltaX:number;
    deltaY:number;

    initial : {
        initialIndex:number,
        initialX:number,
        initialY:number,
        initialRect:ClientRect
    }
    


    constructor(props){
        super(props);
        this.subscriptions = [];

        this.state = { 
            placeholderHeight:0,
            placeholderOffset:0, 
            showPlaceholder:false
        }

        this.deltaX=0;
        this.deltaY=0;

        this.initial = {
            initialIndex:0,
            initialX:0,
            initialY:0,
            initialRect:null
        }
    
    }



    onError = (error) => console.log(error)



    componentDidMount(){ 
        this.init();
    }  


    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    } 
    

    pause = () => {
        hideElement(this.cloned);

        let nodes = getNodes(this.ref);

        nodes.forEach((node) => {
            node.style[`transition-duration`] = `${0}ms`; 
            node.style[`transform`] = `translate3d(${0}px,${0}px, 0)`;
        }) 

        this.selected.map((node:HTMLElement) => showElement(node));
        this.paused = true;

        this.setState({showPlaceholder:false});
    }
     

    resume = () => {
        showElement(this.cloned); 

        this.selected.map((node:HTMLElement) => hideElement(node));
        this.paused = false; 

        this.setState({showPlaceholder:true});        
    } 
 
    
    init = () => {

        let { scrollableContainer, shouldCancelStart, items } = this.props;
        let dragStartThreshold = 5;


        let byExceedThreshold = (event:any) => {
            let { initialX,initialY, initialIndex } = this.initial;
            let item = items[initialIndex];
            let x = Math.abs(event.clientX-initialX);
            let y = Math.abs(event.clientY-initialY);

            let canStartDrag = y > dragStartThreshold || x > dragStartThreshold;
            let dragNotAllowed = shouldCancelStart(event,item);
 
            return dragNotAllowed ? false : canStartDrag;    
        }
           
        
        let dragEnd = Observable
                     .fromEvent(window,"mouseup")
                     .do((event:any) => this.onDragEnd(event)); 
           

        let drag = Observable  
                    .fromEvent(this.ref,"mousedown") 
                    .filter(this.inside)
                    .do((event:any) => {
                        event.preventDefault();   
                        this.initial.initialIndex = this.indexFromClick(event);
                        this.initial.initialX = event.clientX;
                        this.initial.initialY = event.clientY;
                    })
                    .switchMap(
                        () => Observable 
                              .fromEvent(window,"mousemove")
                              .skipWhile(byExceedThreshold)
                              .takeUntil(dragEnd)
                    )   
                    .subscribe(
                        this.onDragMove,
                        this.onError  
                    );   
    

        this.subscriptions.push(drag);
    }


    
    onDragStart = (event:any) : void => {
       let { selectElements, items, onSortStart } = this.props; 
       let initialIndex = this.initial.initialIndex;
        
       let nodes = getNodes(this.ref); //collect children

       let indices : number[] = selectElements(initialIndex,items); //get indices of target elements
       let {selectedElements, clone} = cloneSelectedElements(nodes,indices); //clone element or a group of elements
       

       assert(match(nodes,items), `incorrect order. onDragStart.`);
       assert(
         selectedElements.length===indices.length, 
        `incorrect selection.selectedElements:${selectedElements.length}.indices:${indices.length}.onDragStart.`
       );


       this.cloned = document.body.appendChild(clone); //append cloned nodes in container to body
       this.selected = selectedElements; //preserve reference to replaced nodes
       this.selected.map((node:HTMLElement) => hideElement(node)); //hide replaced nodes
       let initialRect = this.cloned.getBoundingClientRect(); //initial client bounding box of target elements
       
       this.initial.initialRect = initialRect;

       onSortStart(initialIndex,event); 

       this.setState({
          showPlaceholder:true,
          placeholderHeight:0,
          placeholderOffset:0  
       });
    }
  


    onDragMove = (event:any) : void => { 
        event.preventDefault();  
        let {scrollableContainer,items, onSortMove} = this.props; 
        
        let {
            initialIndex,
            initialX,
            initialY,
            initialRect
        } = this.initial;


        if(isNil(initialRect)){
           this.onDragStart(event); //invoke on start if initial variables not defined
           return; 
        }

        let rootClientRect = scrollableContainer.getBoundingClientRect();
        let cloneClientRect = this.cloned.getBoundingClientRect();

        let deltaX = event.clientX-initialX;  //difference between current and initial position
        let deltaY = event.clientY-initialY;  

        let direction = deltaY - this.deltaY;

        this.deltaY = deltaY;
        this.deltaX = deltaX;

        this.animateClone(this.deltaX,this.deltaY);

        if(not(this.paused)){ 
           this.animateNodes(event, direction); 
        }   

        this.applyCustomStyle(event);
        onSortMove(initialIndex,event); 
    } 



    getCurrentIndex = (event:any) : number => {

        let { initialIndex } = this.initial;

        let { top } = this.cloned.getBoundingClientRect();
        let nodes = this.getNodesToBeAnimated();
        let above = [];
 
        for(let i=0; i<nodes.length; i++){
            let node = nodes[i];
            let box = node.getBoundingClientRect();
            let middle = (box.top+box.bottom)/2;
            if(middle<top){
               above.push(node) 
            }
        } 
        
        return above.length;
    }



    animateClone = (deltaX:number,deltaY:number) => { 
        this.cloned.style[`transform`] = `translate3d(${deltaX}px,${deltaY}px, 0)`;
    }



    animateNodes = (event, direction:number) => {

        let {
            initialIndex,
            initialX,
            initialY, 
            initialRect
        } = this.initial;

        let placeholderOffset = 0;
        let nodes = this.getNodesToBeAnimated();
        let cloneRect = this.cloned.getBoundingClientRect();
        

        let cloneTop = cloneRect.top;
        let cloneBottom = cloneRect.bottom;
        let cloneCenter = (cloneTop+cloneBottom)/2;   
        let cloneHeight = cloneRect.height;
     
      
        for(let i=0; i<nodes.length; i++){  
            let element = nodes[i];
            let margins = getElementMargin(element);

            element.style[`transition-duration`] = `${300}ms`; 
            element.style.userSelect = "none"; 
            element.style.webkitUserSelect = "none";

            let {top,bottom,height} = element.getBoundingClientRect();
            let center = (top+bottom)/2; 
 
            if(center<cloneCenter){
               placeholderOffset += height + margins.top + margins.bottom; 
            }
           
            let above = i < initialIndex;
            let below = i >= initialIndex;
            let down = direction > 0;   
            let up = direction < 0; 


            if(above){
 
               if(cloneTop<=center && up){

                  nodes[i].style[`transform`] = `translate3d(${0}px,${cloneHeight}px, 0)`;

               }else if(cloneBottom>=center){  

                  nodes[i].style[`transform`] = `translate3d(${0}px,${0}px, 0)`;
               }  
            }else if(below){
 
                if(cloneBottom>=center && down){

                   nodes[i].style[`transform`] = `translate3d(${0}px,${-cloneHeight}px, 0)`;
                   
                }else if(cloneTop<=center){    
 
                   nodes[i].style[`transform`] = `translate3d(${0}px,${0}px, 0)`;
                }  
            } 
        } 


        this.setState({ 
            placeholderHeight:cloneHeight,
            placeholderOffset 
        })
    }  
   
    
 
    onDragEnd = (event:any) => {

        if(isNil(this.initial.initialRect)){
           return;
        } 

        let newIndex = this.getCurrentIndex(event); 
        let nodes = this.getNodesToBeAnimated();

        for(let i=0; i<nodes.length; i++){ 
            let element = nodes[i];
            element.style[`transition-duration`] = ``; 
            element.style[`transform`] = ``;
        }   

        this.cloned.parentNode.removeChild(this.cloned);
        this.selected.map((node:HTMLElement) => showElement(node));
        this.cloned = null;
        this.selected = [];

        this.deltaX=0; 
        this.deltaY=0;
        
        console.log(`oldIndex : ${this.initial.initialIndex}; newIndex : ${newIndex};`);

        this.props.onSortEnd(this.initial.initialIndex,newIndex,event);     

        this.initial = {   
            initialIndex:0,
            initialX:0,
            initialY:0,
            initialRect:null
        }
        
       this.setState({showPlaceholder:false});
    }    
    


    applyCustomStyle = (event:any) : void => { 
        let {decorators} = this.props;
        let x = event.clientX;
        let y = event.clientY;

        for(let i=0; i<decorators.length; i++){
            let {condition, decorator} = decorators[i];
            if(condition(x,y)){
               if(not(this.paused)){ 
                  this.pause();
               }
               return;
            }     
        } 
        
        if(this.paused){
           this.resume(); 
        }
    }



    getNodesToBeAnimated = () : HTMLElement[] => {
        let selectedNodesIds = this.selected.map( node => node.id );
        return getNodes(this.ref).filter((node:any) => !contains(node.id)(selectedNodesIds));
    }

    

    indexFromClick = (event:any) : number => {
        let nodes = getNodes(this.ref);
        let x = event.clientX;
        let y = event.clientY;

        for(let i=0; i<nodes.length; i++){
            let target = nodes[i];
            if(insideTargetArea(target,x,y)){
               return i;  
            }
        }
 
        return -1; 
    }   



    inside = (event:any) : boolean => {
       let inside = this.indexFromClick(event)!==-1;
       return inside; 
    }


    
    render(){   
        let {placeholderHeight,placeholderOffset,showPlaceholder} = this.state;
        
        return <div  
            className="unselectable" 
            style={{
                width:"100%",
                position:"relative"
            }}    
        >     
                <Placeholder       
                    height={placeholderHeight}  
                    offset={placeholderOffset}
                    show={showPlaceholder}
                />  
            <div  
                ref={e => {this.ref=e;}} 
                style={{ 
                  display:"flex",  
                  flexDirection:"column"
                }}   
            >    
                {this.props.children}    
            </div>
        </div>
    }
} 



let insideTargetArea = (target:HTMLElement,x:number,y:number) : boolean => {

    if(target===null || target===undefined)
       return false;   

    let rect = target.getBoundingClientRect();
    let margins = getElementMargin(target); 
    let top = rect.top;
    let bottom = rect.bottom;    

    if(x>rect.left && x<rect.right)
       if(y>top && y<bottom)
          return true; 
    
    return false;
}    



function getCSSPixelValue(stringValue) {
    if (stringValue.substr(-2) === 'px') {
      return parseFloat(stringValue);
    }
    return 0;
}


 
function getElementMargin(element) {
    const style = window.getComputedStyle(element);
    
    return {
      top: getCSSPixelValue(style.marginTop),
      right: getCSSPixelValue(style.marginRight),
      bottom: getCSSPixelValue(style.marginBottom),
      left: getCSSPixelValue(style.marginLeft),
    };
}