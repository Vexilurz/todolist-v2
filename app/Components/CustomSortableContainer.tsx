import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { isEmpty, not, contains, isNil } from 'ramda';
import { insideTargetArea } from '../utils/insideTargetArea';


let assert = (condition:boolean , error:string, throwError=true) : void => {
    if(not(condition)){ 
        if(throwError) { 
            throw new Error(error) 
        }
    }    
}  



let selectContainer = (x:number,y:number,containers:HTMLElement[]) : HTMLElement => {

    for(let i=0; i<containers.length; i++){
        if(insideTargetArea(null,containers[i],x,y)){
           return containers[i]; 
        }
    } 
 
    return undefined;
}
 

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
}

interface Decorator{area:HTMLElement,decorator:HTMLElement,id:string} 

interface SortableContainerProps{
    items:any[],
    scrollableContainer:HTMLElement,
    selectElements:(index:number,items:any[]) => number[],
    shouldCancelStart:(event:any,item:any) => boolean, 
    onSortStart:(oldIndex:number,event:any) => void,  
    onSortEnd:(oldIndex:number,newIndex:number,event:any,item?:any) => void,
    onSortMove:(oldIndex:number,event:any) => void,
    decorators:Decorator[],
    lock?:boolean,
    hidePlaceholder?:boolean 
}      

type Scroll = "up" | "down"; 

interface SortableContainerState{placeholderHeight:number,showPlaceholder:boolean}

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
        this.state={placeholderHeight:0,showPlaceholder:false};
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
     

    onError = (error) => console.log(error); 


    componentDidMount(){ this.init() }  


    componentWillUnmount(){
        this.initial.initialRect=undefined; 
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions=[]; 
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

            let x = Math.abs(event.clientX-initialX);
            let y = Math.abs(event.clientY-initialY);

            let canStartDrag = y > dragStartThreshold || x > dragStartThreshold;

            return not(canStartDrag);    
            //skipWhile -> Skip emitted items from source until provided expression is false...    
        }
           
         
        let dragEnd = Observable
                      .fromEvent(document.body,"mouseup")
                      .do((event:any) => this.onDragEnd(event)); 
           

        let drag = Observable  
                    .fromEvent(this.ref,"mousedown") 
                    .filter(this.inside)
                    .do((event:any) => { 
                        this.initial.initialIndex = this.indexFromClick(event);
                        this.initial.initialX = event.clientX;
                        this.initial.initialY = event.clientY;
                    })
                    .switchMap(
                        (event) => {
                            let cancel = shouldCancelStart(event,items[this.initial.initialIndex]);
                            
                            if(cancel){
                                return Observable.of()
                            }else{
                                event.preventDefault()
                                return Observable 
                                        .fromEvent(document.body,"mousemove")
                                        .skipWhile(byExceedThreshold)
                                        .takeUntil(dragEnd) 
                            }
                        }           
                    )    
                    .subscribe(this.onDragMove, this.onError);   
    
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
        `incorrect selection.selectedElements:${selectedElements.length}.
         indices:${indices.length}.onDragStart.`
       );

       this.cloned = document.body.appendChild(clone); //append cloned nodes in container to body
       this.selected = selectedElements; //preserve reference to replaced nodes
       this.selected.map((node:HTMLElement) => hideElement(node)); //hide replaced nodes
       let initialRect = this.cloned.getBoundingClientRect(); //initial client bounding box of target elements
       
       this.initial.initialRect = initialRect;
       this.setState({showPlaceholder:true,placeholderHeight:initialRect.height});
       onSortStart(initialIndex,event); 
    }
  
 
    onDragMove = (event:any) : void => { 
        let {scrollableContainer,items,onSortMove,decorators} = this.props; 
        let {initialIndex,initialX,initialY,initialRect} = this.initial;
        
        if(isNil(initialRect)){
           this.onDragStart(event); //invoke on start if initial variables not defined
           this.updatePlaceholder();
           return; 
        }

        let deltaX = event.clientX-initialX;  //difference between current and initial position
        let deltaY = event.clientY-initialY; 
        let direction = deltaY-this.deltaY;

        this.deltaY = deltaY;
        this.deltaX = deltaX;

        this.animateClone(this.deltaX,this.deltaY); 
        this.animateDecorator(this.deltaX,this.deltaY);
        this.animateNodes(event,direction); 
        this.applyCustomStyle(event);
        this.animateScroll(event);
        onSortMove(initialIndex,event); 
    }    
    

    animateScroll = (event:any) => {
        let container = this.selectScrollableContainer(event);
        if(isNil(container)){ 
            this.scroll = null;
            return; 
        }
        this.setScrollDirection(container);
        this.performScrolling(container); 
    }   


    selectScrollableContainer = (event:any) : HTMLElement => {
        let { scrollableContainer, decorators } = this.props; 
        let containers : HTMLElement[] = [scrollableContainer, ...decorators.map(d => d.area)];
        let container = selectContainer(event.clientX,event.clientY,containers); 
        return container;  
    }   
    

    setScrollDirection = (container:HTMLElement) : void => {
        let {scrollTop, scrollHeight} = container;
        let {height} = container.getBoundingClientRect(); 
        let max = scrollHeight - height; 
        let scrollThreshold = 30;

        let cloneClientRect = this.cloned.getBoundingClientRect();
        let containerClientRect = container.getBoundingClientRect();

        let scrollDown =  ( cloneClientRect.bottom > (containerClientRect.bottom-scrollThreshold) ) && 
                            scrollTop < max;

        let scrollUp = ( cloneClientRect.top < (containerClientRect.top + scrollThreshold) ) && 
                         scrollTop > 0;

        this.scroll = scrollDown ? "down" : scrollUp ? "up" : null;  
    }
    

    performScrolling = (container:HTMLElement) => {

        if(isNil(container) || isNil(this.scroll)){ return } 
         
        let {scrollTop, scrollHeight} = container;
        let {height} = container.getBoundingClientRect(); 
        let speed = 10;

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
    }
 

    getCurrentIndex = (event:any) : number => {

        let { initialIndex } = this.initial;
        
        if(isNil(this.cloned)){ return 0 }

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
        let { lock } = this.props;
        let x = lock ? 0 : deltaX;
        
        this.cloned.style[`transform`] = `translate3d(${x}px,${deltaY}px, 0)`;
    }
    
    
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
    }


    animateNodes = (event, direction:number) => {
        if(this.paused){ return }

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
    }  
   
 
    onDragEnd = (event:any) => {

        if(isNil(this.initial.initialRect)){ return } 

        this.setState({showPlaceholder:false});

        let {items} = this.props;
        let newIndex = this.getCurrentIndex(event); 
        let nodes = this.getNodesToBeAnimated();

        this.suspendDecorator();

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
        
        this.props.onSortEnd(   
            this.initial.initialIndex,
            newIndex, 
            event,
            items[this.initial.initialIndex] 
        );     

        this.initial = {   
            initialIndex:0,
            initialX:0,
            initialY:0,
            initialRect:null
        };
    }     
    

    animateDecorator = (deltaX:number,deltaY:number) => { 
        if(this.decorator){
           let {decorator} = this.decorator; 
           decorator.style[`transform`] = `translate3d(${deltaX}px,${deltaY}px, 0)`;
        }
    } 


    applyCustomStyle = (event:any) : void => { 
        let {decorators} = this.props;
        let x = event.clientX;
        let y = event.clientY;

        for(let i=0; i<decorators.length; i++){

            let {area, decorator, id} = decorators[i];

            if(insideTargetArea(null,area,x,y)){
                this.initDecorator(decorators[i]);
                return;
            }     
        } 
        
        this.suspendDecorator(); 
        if(this.paused){ this.resume() } 
    }


    suspendDecorator = () => { 
        if(this.decorator){
           this
           .decorator
           .decorator
           .parentNode 
           .removeChild(this.decorator.decorator); 

           this.decorator = null;
        }
    } 

    
    initDecorator = (target:Decorator) : void => {
        let { top, left, transform, position } = this.cloned.style;
        let {
            initialIndex,
            initialX,
            initialY,
            initialRect
        } = this.initial;

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
         
        this.decorator = target;  
        
        if(not(this.paused)){ this.pause() }
    } 

    
    getNodesToBeAnimated = () : HTMLElement[] => {
        if(isNil(this.selected)){ return [] }
           
        let selectedNodesIds = this.selected.map( node => node.id );
        return getNodes(this.ref).filter((node:any) => !contains(node.id)(selectedNodesIds));
    }


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
    }   


    inside = (event:any) : boolean => {
       let inside = this.indexFromClick(event)!==-1;
       return inside; 
    }

    
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
                <div  
                    ref={e => {this.ref=e;}} 
                    style={{display:"flex", flexDirection:"column"}}   
                >    
                    {this.props.children}    
                </div>
        </div>
    }
} 



let getCSSPixelValue = (stringValue) => {
    if (stringValue.substr(-2) === 'px') {
      return parseFloat(stringValue);
    }
    return 0;
}


 
let getElementMargin = (element) => {
    const style = window.getComputedStyle(element);
    
    return {
      top: getCSSPixelValue(style.marginTop),
      right: getCSSPixelValue(style.marginRight),
      bottom: getCSSPixelValue(style.marginBottom),
      left: getCSSPixelValue(style.marginLeft),
    };
}   


let getNumberFromString = (s:string) : number => Number(s.replace(/\D/g,''))