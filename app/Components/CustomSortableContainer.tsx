import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Rx';
import { not, contains, isNil, compose, ifElse } from 'ramda';
import { insideTargetArea } from '../utils/insideTargetArea';
import { assert } from '../utils/assert';
import { isArrayOfDOMElements, allHave, isDomElement, isArrayOfNumbers, isHeading } from '../utils/isSomething';
import { globalErrorHandler } from '../utils/globalErrorHandler';
import { isDev } from '../utils/isDev';



let getCSSPixelValue = (stringValue) => {
    if (stringValue.substr(-2) === 'px') {
      return parseFloat(stringValue);
    }
    return 0;
};



let getElementMargin = (element) => {
    const style = window.getComputedStyle(element);
    
    return {
      top: getCSSPixelValue(style.marginTop),
      right: getCSSPixelValue(style.marginRight),
      bottom: getCSSPixelValue(style.marginBottom),
      left: getCSSPixelValue(style.marginLeft),
    };
};   



let getNodes = (ref) : HTMLElement[] => { 
    if(isDev()){
       assert(!isNil(ref), `ref is Nil. getNodes.`);
    }
    return [].slice.call(ref.children);
};



let hideElement = (node:HTMLElement) : void => {
    node.style.visibility = 'hidden';
    node.style.opacity = '0';  
};



let showElement = (node:HTMLElement) : void => {
    node.style.visibility = 'visible';
    node.style.opacity = '1';  
};



/**
 * Operations which performed on sortable elements require correspondence between
 * item id and container id. This function will check correct order and correspondence
 * between this values in DOM elements and Objects.
 */
let match = (nodes:HTMLElement[],items:{_id:string}[]) : boolean => {
    if(isDev()){
       assert(isArrayOfDOMElements(nodes),`nodes is not of type Array Of DOM Elements. match. ${nodes}`);
       assert(allHave("_id")(items),`not all items have id. match.`);
    }

    if(nodes.length!==items.length){ return false }
    
    for(let i=0; i<nodes.length; i++){
        if(nodes[i].id!==items[i]._id){
           return false; 
        }
    } 

    return true;
};



/**
 * Clone one DOM Element.
 */
let cloneOne = (node:HTMLElement) : HTMLElement => {
    if(isDev()){
       assert(isDomElement(node),`node is not of type DOM Element. cloneOne.`);
    }
    
    const fields = node.querySelectorAll('input, textarea, select');
    const clone = node.cloneNode(true) as HTMLElement;
    const {top,left,width,height} = node.getBoundingClientRect();
    const clonedFields = [...clone.querySelectorAll('input, textarea, select')];

    clonedFields.forEach((field:any, index) => {
      if(field.type !== 'file' && fields[index]) {
         field.value = fields[index]["value"];
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

    return clone;
};


/**
 * Clone array of DOM Elements and assign them as children to 
 * empty container.
 */
let cloneMany = (nodes:HTMLElement[]) : HTMLElement => {
    if(isDev()){
        assert(
           isArrayOfDOMElements(nodes),
           `nodes is not of type Array Of DOM Elements. cloneMany. ${nodes}`
        );
    }

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
          }  
        });    
           
        containerHeight = containerHeight + height;
        containerWidth = containerWidth < width ? width : containerWidth;
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

    return container;  
};    

 
/**
 * Select elements from array based on supplied indices. 
 * Clone array of selected DOM Elements.
 */
let cloneSelectedElements = (
    nodes:HTMLElement[],
    indices:number[] 
) : {selectedElements:HTMLElement[], clone:HTMLElement}  => {

    if(isDev()){
        assert(isArrayOfDOMElements(nodes),`nodes is not of type Array Of DOM Elements. cloneSelectedElements. ${nodes}`);
        assert(isArrayOfNumbers(indices),`indices is not of type Array of Numbers. cloneSelectedElements.`);
    }

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
};


interface Decorator{
    area:HTMLElement,
    decorator:HTMLElement,
    id:string
} 

interface SortableContainerProps{
    items:any[],
    scrollableContainer:HTMLElement,
    selectElements:(index:number,items:any[]) => number[],
    shouldCancelStart:(event:any,item:any) => boolean, 
    onSortStart:(oldIndex:number,event:any) => void,  
    onSortEnd:any, //(oldIndex:number,newIndex:number,event:any,item?:any) => void,
    onSortMove:(oldIndex:number,event:any) => void,
    decorators:Decorator[],
    lock?:boolean,
    hidePlaceholder?:boolean 
}      

type Scroll = "up" | "down"; 

interface SortableContainerState{
    placeholderHeight:number,
    showPlaceholder:boolean
}

export class SortableContainer extends Component<SortableContainerProps,SortableContainerState>{

    ref:HTMLElement
    placeholderRef:HTMLElement
    subscriptions:Subscription[]
    paused:boolean
    scroll:Scroll
    cloned:HTMLElement
    decorator:Decorator
    selected:HTMLElement[]
    deltaX:number
    deltaY:number
    initial : {
        initialIndex:number,
        initialX:number,
        initialY:number,
        initialRect:ClientRect
    }
    


    constructor(props){
        super(props);
        this.subscriptions=[];
        this.state={
            placeholderHeight:0,
            showPlaceholder:false
        };
        this.deltaX=0;
        this.deltaY=0;
        this.scroll=null; 
        this.decorator=null;
        this.initial={
            initialIndex:0,
            initialX:0,
            initialY:0, 
            initialRect:null
        };
    }
    


    onError = (error) => globalErrorHandler(error); 



    componentDidMount(){ 
        this.init(); //Initialize event based Observables.
    }  
 


    componentWillUnmount(){
        this.initial.initialRect=undefined; 
        this.subscriptions.forEach(s => s.unsubscribe()); //Suspend event based Observables.
        this.subscriptions=[]; 
    }   
    


    init = () => {
        let { scrollableContainer, shouldCancelStart, items } = this.props;
        let dragStartThreshold = 5; 



        let byExceedThreshold = (event:any) => {
            let { initialX,initialY, initialIndex } = this.initial;

            let x = Math.abs(event.clientX-initialX);
            let y = Math.abs(event.clientY-initialY);

            let canStartDrag = y > dragStartThreshold || x > dragStartThreshold;

            return not(canStartDrag); //skipWhile -> Skip emitted items from source until provided expression is false...    
        };
    
        

        let insideWindow = event => {
            return (event.clientX > 0 && event.clientX < window.innerWidth) && (event.clientY > 0 && event.clientY < window.innerHeight);
        };


    
        this.subscriptions.push(
            Observable  
                .fromEvent(this.ref,"mousedown") 
                .filter(this.inside)
                .do((event:any) => { 
                    this.initial.initialIndex = this.indexFromClick(event);
                    this.initial.initialX = event.clientX;
                    this.initial.initialY = event.clientY;
                })
                .exhaustMap((event) => {
                    let cancel = shouldCancelStart(event,this.props.items[this.initial.initialIndex]);
                    
                    if(cancel){
                        return Observable.of();
                    }else{
                        event.preventDefault();
                        return Observable 
                                .fromEvent(document,"mousemove")
                                .filter(insideWindow)
                                .skipWhile(byExceedThreshold)
                                .takeUntil(
                                    Observable
                                    .fromEvent(document,"mouseup")
                                    .do(
                                       (event:any) => this.onDragEnd(event)
                                    )
                                ); 
                    }
                })    
                .subscribe(this.onDragMove, this.onError)
        );
    };


    
    onDragStart = (event:any) : void => {
       let { selectElements, items, onSortStart } = this.props; 
       let initialIndex = this.initial.initialIndex;

       //Invoke supplied with props onSortStart function.
       onSortStart(initialIndex,event); 

       let nodes = getNodes(this.ref);

       //Select elements from array of supplied items based on supplied function and 
       //index of item on top of which mouse pointer was located when dragging cycle was initialized.
       let indices : number[] = selectElements(initialIndex,items); 
       let {selectedElements, clone} = cloneSelectedElements(nodes,indices); //clone selected elements, selectedElements - original elements.
       
       assert(match(nodes,items), `incorrect order. onDragStart.`);
       assert(selectedElements.length===indices.length, `incorrect selection. selectedElements:${selectedElements.length}. indices:${indices.length}. onDragStart.`);

       this.cloned = document.body.appendChild(clone); //append cloned nodes wrapped in empty container to body

       this.selected = selectedElements; //preserve reference to replaced nodes

       this.selected.map((node:HTMLElement) => hideElement(node)); //hide original elements which were cloned

       let initialRect = this.cloned.getBoundingClientRect(); //initial client bounding box of target element (or elements)

       this.initial.initialRect = initialRect; //serve as a sign that onDragStart was invoked


       //Initialize placeholder
       this.setState({showPlaceholder:true,placeholderHeight:initialRect.height});
    };



    onDragEnd = (event:any) => {
        //If dragging cycle was not initialized - quit.
        if(isNil(this.initial.initialRect)){ return } 

        //stop scrolling
        this.scroll = null;

        this.setState({showPlaceholder:false}); //Hide placeholder

        let {newIndex,above} = this.getCurrentIndex(event); 
        let nodes = this.getNodesToBeAnimated();

        this.suspendDecorator(); //If decorator exists remove it from DOM tree

        //Remove displacement from all elements in current list.
        for(let i=0; i<nodes.length; i++){ 
            let element = nodes[i];
            element.style[`transition-duration`] = ``; 
            element.style[`transform`] = ``;
        }   

        this.cloned.parentNode.removeChild(this.cloned); //Remove clone of dragged element from DOM tree
        this.selected.map((node:HTMLElement) => showElement(node)); //Show original elements 
        this.cloned = null;
        this.selected = [];

        this.deltaX=0; 
        this.deltaY=0;
        
        //Invoke supplied with props onSortEnd function.
        this.props.onSortEnd(   
            this.initial.initialIndex,
            newIndex, 
            event,
            this.props.items[this.initial.initialIndex],
            above 
        );  

        //Set initial dragging parameters to initial state - means dragging is not started yet.
        this.initial = {   
            initialIndex:0,
            initialX:0,
            initialY:0,
            initialRect:null
        };
    };
  

 
    onDragMove = (event:any) : void => { 
        let {scrollableContainer,items,onSortMove,decorators} = this.props; 
        let {initialIndex,initialX,initialY,initialRect} = this.initial;
        
        if(isNil(initialRect)){
           this.onDragStart(event); //invoke onDragStart if initial variables are not defined
           this.updatePlaceholder();
           return; 
        }

        let deltaX = event.clientX-initialX; //difference between current and initial position
        let deltaY = event.clientY-initialY; 
        let direction = deltaY-this.deltaY;
        this.deltaY = deltaY;
        this.deltaX = deltaX; 

        compose(
            () => onSortMove(initialIndex,event),
            () => this.animateScroll(event),
            ifElse(
                isNil,
                () => {
                    this.suspendDecorator();
                    this.resume(); 
                    this.animateClone(this.deltaX,this.deltaY); 
                    this.animateNodes(event,direction); 
                },
                (decorator:Decorator) => {
                    this.pause();
                    this.initDecorator(decorator);
                    this.animateDecorator(this.deltaX,this.deltaY);
                }
            ),
            this.shouldDecorate
        )(event)
    };
    


    shouldDecorate = (event:any) : Decorator => { 
        let {decorators} = this.props;
        let x = event.clientX;
        let y = event.clientY;

        let addMargin = (rect:ClientRect) : ClientRect => {
            return {
                bottom: rect.bottom + 20,
                height: rect.height,
                left: rect.left - 20,
                right: rect.right,
                top: rect.top - 20,
                width: rect.width
            };
        };

        return decorators.find(
            ({area, decorator, id}) => insideTargetArea(null,area,x,y,addMargin)
        );
    }; 



    initDecorator = (target:Decorator) : void => {
        let {items} = this.props;
        let { top, left, transform, position } = this.cloned.style;
        let {
            initialIndex,
            initialX,
            initialY,
            initialRect
        } = this.initial;
        let draggedItem = items[initialIndex];
        let {decorator, id} = target;
         
        if(this.decorator){
            if(this.decorator.id===id){ return }
            else{ this.suspendDecorator() }
        } 
           
        decorator.style.top = `${initialY}px`; 
        decorator.style.left = `${initialX}px`;  
        decorator.style.transform = transform;
        decorator.style.position = position; 
        decorator.style.cursor = "default";
        document.body.appendChild(decorator);  
        
                //if heading dragged set number of selected todos on decorator
                if(isHeading(draggedItem)){
                    let counter = document.getElementById(`nested-counter`); 
                    if(counter && this.selected){
                        counter.innerHTML = `${this.selected.length-2}`
                    }
                };
                
        this.decorator = target;  
    }; 



    pause = () => {
        //1) Hide clone of selected item.
        hideElement(this.cloned);
        //2) Remove displacement from all elements.
        let nodes = getNodes(this.ref);
        nodes.forEach((node) => {
            node.style[`transition-duration`] = `${0}ms`; 
            node.style[`transform`] = `translate3d(${0}px,${0}px, 0)`;
        });
        //3) If one or multiple elements were cloned (Heading+Todos under this heading) -> Show original items.
        this.selected.map((node:HTMLElement) => showElement(node));
        //4) Hide placeholder.
        this.setState({showPlaceholder:false});
    };
     


    resume = () => {
        //Show clone of selected item.
        showElement(this.cloned); 
        //If one or multiple elements were cloned (Heading+Todos under this heading) -> Hide original items.
        this.selected.map((node:HTMLElement) => hideElement(node));
        //Show placeholder.
        this.setState({showPlaceholder:true});         
    }; 



    suspendDecorator = () => { 
        if(this.decorator){
           this
           .decorator
           .decorator
           .parentNode 
           .removeChild(this.decorator.decorator); 

           this.decorator = null;
        } 
    }; 



    animateScroll = (event:any) => {
        let container = this.selectScrollableContainer(event);
        if(isNil(container)){ 
           this.scroll=null; 
           return;
        }
        this.setScrollDirection(container); 
        this.performScrolling(container); 
    };   



    selectScrollableContainer = (event:any) : HTMLElement => {
        let { scrollableContainer, decorators } = this.props; 
        let containers : HTMLElement[] = [scrollableContainer, ...decorators.map(d => d.area)];

        let container = containers.find(
            (container) => insideTargetArea(null,container,event.clientX,event.clientY)
        );

        return container;  
    };   
    


    setScrollDirection = (container:HTMLElement) : void => {
        let {scrollTop, scrollHeight} = container;
        let scrollThreshold = 30;
        let cloned = isNil(this.decorator) ? this.cloned : this.decorator.decorator;
 
        if(isNil(cloned) || isNil(container)){ return }

        let cloneClientRect = cloned.getBoundingClientRect();
        let containerClientRect = container.getBoundingClientRect();

        let max = scrollHeight - containerClientRect.height; 

        let scrollDown =  ( cloneClientRect.bottom > (containerClientRect.bottom-scrollThreshold) ) && 
                            scrollTop < max;

        let scrollUp = ( cloneClientRect.top < (containerClientRect.top + scrollThreshold) ) && 
                         scrollTop > 0;
                      
        //prevent autoscroll if dragged item height bigger than container height.                 
        let preventScroll : boolean = cloneClientRect.height>=(containerClientRect.height*0.7);

        this.scroll = preventScroll ? null :
                      scrollDown ? "down" : 
                      scrollUp ? "up" : 
                      null;              
    };  
    


    performScrolling = (container:HTMLElement) => {
        if(isNil(container) || isNil(this.scroll)){ return } 
         
        let {scrollTop, scrollHeight} = container;
        let {height} = container.getBoundingClientRect(); 
        let speed = 8;

        if(this.scroll==="up"){ 

            if(scrollTop>0){
               let newScrollTop = scrollTop - speed;

               if(newScrollTop > 0){
                  container.scrollTop = newScrollTop; 
                  requestAnimationFrame(() => this.performScrolling(container));
               }else{
                  container.scrollTop = 0;  
                  this.scroll = null; //stop scrolling
               }
            }
        }else if(this.scroll==="down"){
            let max = scrollHeight - height; 

            if(scrollTop<max){
                let newScrollTop = scrollTop + speed; 

                if(newScrollTop < max){  
                    container.scrollTop = newScrollTop;
                    requestAnimationFrame(() => this.performScrolling(container));
                }else{
                    container.scrollTop = max;
                    this.scroll = null; //stop scrolling
                }   
            }
        } 
    };
 


    getCurrentIndex = (event:any) :  {
        newIndex:number,
        above:string[]
    } => {
        let { initialIndex } = this.initial;
        
        if(isNil(this.cloned)){ return {
            newIndex:0,
            above:[]
        } }

        let { top } = this.cloned.getBoundingClientRect();
        let nodes = this.getNodesToBeAnimated();
        let above = [];
 
        for(let i=0; i<nodes.length; i++){
            let node = nodes[i];
            let box = node.getBoundingClientRect();
            let middle = (box.top+box.bottom)/2;
            if(middle<top){
               above.push(node); 
            }
        } 
        
        return {
            newIndex:above.length,
            above:above.map(el => el['id'])
        };
    };



    animateClone = (deltaX:number,deltaY:number) => { 
        let { lock } = this.props;
        let x = lock ? 0 : deltaX;
        
        this.cloned.style[`transform`] = `translate3d(${x}px,${deltaY}px, 0)`;
    };
    


    animateNodes = (event, direction:number) => {
        let {initialIndex, initialX, initialY, initialRect} = this.initial;

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

            let {top,bottom,height} = element.getBoundingClientRect();
            let center = (top+bottom)/2; 
            let above = i < initialIndex;
            let below = i >= initialIndex;  
            let down = direction > 0;    
            let up = direction < 0; 

            if(center<=cloneCenter){ placeholderOffset+=height }

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
    };  
   


    updatePlaceholder = () => {
        let placeholderOffset = 0;
        let {initialIndex, initialX, initialY, initialRect} = this.initial;
        
        if(isNil(initialRect)){ return }

        let nodes = this.getNodesToBeAnimated();
        let cloneRect = this.cloned.getBoundingClientRect();
        let cloneTop = cloneRect.top;
        let cloneBottom = cloneRect.bottom;
        let cloneCenter = (cloneTop+cloneBottom)/2;   
 
        for(let i=0; i<nodes.length; i++){  
            let element = nodes[i];
            let {top,bottom,height} = element.getBoundingClientRect();
            let center = (top+bottom)/2; 
            if(center<=cloneCenter){ placeholderOffset+=height }
        }  

        if(!isNil(this.placeholderRef)){
            this.placeholderRef.style.transform=`translateY(${placeholderOffset}px)`;
        }
        
        requestAnimationFrame(this.updatePlaceholder);
    };



    animateDecorator = (deltaX:number,deltaY:number) => { 
        if(this.decorator){
           let {decorator} = this.decorator; 
           decorator.style[`transform`] = `translate3d(${deltaX}px,${deltaY}px, 0)`;
        }
    }; 


    
    getNodesToBeAnimated = () : HTMLElement[] => {
        if(isNil(this.selected)){ return [] }
           
        let selectedNodesIds = this.selected.map( node => node.id );
        return getNodes(this.ref).filter((node:any) => !contains(node.id)(selectedNodesIds));
    };



    indexFromClick = (event:any) : number => {
        let { scrollableContainer } = this.props;
        let nodes = getNodes(this.ref);
        let x = event.clientX;
        let y = event.clientY;

        for(let i=0; i<nodes.length; i++){ 
            let target = nodes[i];
            if(insideTargetArea(scrollableContainer,target,x,y)){ return i }
        }
 
        return -1; 
    };   



    inside = (event:any) : boolean => {
       let inside = this.indexFromClick(event)!==-1;
       return inside; 
    };


    
    render(){   
        let {placeholderHeight,showPlaceholder} = this.state;
        let {hidePlaceholder} = this.props;

        return <div style={{width:"100%", position:"relative"}}>     
                {   
                    hidePlaceholder ? null :
                    not(showPlaceholder) ? null :
                    <div 
                        ref={e => {this.placeholderRef=e;}}
                        style={{       
                            backgroundColor:"rgba(205,221,253,0.5)",
                            zIndex:100,     
                            height:`${placeholderHeight}px`, 
                            borderRadius:"5px",     
                            width:"100%",    
                            position:"absolute"
                        }}
                    >    
                    </div> 
                }  
                <div ref={e => {this.ref=e;}} style={{display:"flex",flexDirection:"column"}}>    
                    {this.props.children}    
                </div>
        </div>
    }
} 



