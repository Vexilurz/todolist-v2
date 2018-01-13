import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
//import { SortableElement } from './CustomSortableElement';
import { insideTargetArea, assert } from '../utils';
import { isEmpty, not, contains } from 'ramda';
  

interface Data{
    event:any,
    deltaX:number,
    deltaY:number,
    rect:ClientRect, 
    initialIndex:number,
    currentIndex:number, 
    item?:any     
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



interface SortableContainerProps{
    items:any[],
    scrollableContainer:HTMLElement,
    selectElements:(index:number,items:any[]) => number[],
    shouldCancelStart:(event:any,item:any) => boolean,
    shouldCancelAnimation:(event:any,item:any) => boolean,
    decorators:{ condition:(x:number,y:number) => boolean, decorator:HTMLElement }[]
}      

 
interface SortableContainerState{
    scrollTop:number,
    x:number,   
    y:number,
    initialIndex:number, 
    initialX:number,
    initialY:number,
    initialRect:ClientRect 
}
 

export class SortableContainer extends Component<SortableContainerProps,SortableContainerState>{


    ref:HTMLElement;

    cloned:HTMLElement;

    selected:HTMLElement[];

    subscriptions:Subscription[];

    start:boolean;

    constructor(props){
        super(props);
        this.subscriptions = [];
        this.start = false;
        this.state = {
            scrollTop:0,
            x:0,
            y:0,

            initialIndex:0,
            initialX:0,
            initialY:0,
            initialRect:null
        };    
    }

    componentDidMount(){ 
        this.init();
    }  

    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    } 


    onError = (error) => console.log(error)

    getNodes = () : HTMLElement[] => [].slice.call(this.ref.children)

    getNodesToBeAnimated = () : HTMLElement[] => {
        let selectedNodesIds = this.selected.map( node => node.id );
        return this.getNodes().filter((node:any) => !contains(node.id)(selectedNodesIds));
    }
    
    indexFromClick = (event:any) : number => {
        let nodes = this.getNodes();
        let x = event.clientX;
        let y = event.clientY;

        for(let i=0; i<nodes.length; i++){
            let target = nodes[i];
            if(insideTargetArea(target,x,y)){
               console.log(`inside : true; initial index ${i}; x : ${x}, y : ${y}`); 
               return i; 
            }
        }
 
        return -1; 
    }    

    inside = (event:any) : boolean => {
       let inside = this.indexFromClick(event)!==-1;
       console.log(`${inside ? 'inside element' : 'not inside element'}`);
       return inside; 
    }

    
    
    init = () => {

        let dragStartThreshold = 5;
        let {scrollableContainer} = this.props;

        let scroll = Observable  
                     .fromEvent(scrollableContainer,"scroll")
                     .subscribe(e => {
                        this.setState(
                            {scrollTop:scrollableContainer.scrollTop}, 
                            () => console.log(`scrollTop ${this.state.scrollTop}`)
                        )
                     });    

        let sufficientDistance = Observable 
                                 .fromEvent(window, "mousemove") 
                                 .filter((event:any) => {
                                        let { initialX,initialY } = this.state;

                                        let x = Math.abs(event.clientX-initialX);
                                        let y = Math.abs(event.clientY-initialY);
    
                                        let canStartDrag = y > dragStartThreshold || x > dragStartThreshold;
                                        console.log(`canStartDrag  ${canStartDrag }. sufficientDistance.`)
                                        return canStartDrag; 
                                 });
        
        let dragEnd = Observable 
                      .fromEvent(window,"mouseup") 
                      .do((event:any) => this.start ? this.onDragEnd(event) : null);
  
        let drag = Observable 
                   .fromEvent(this.ref,"mousedown") 
                   .filter(this.inside)
                   .switchMap(
                       (event:any) => Observable.fromPromise(
                            new Promise(  
                                resolve => this.setState(
                                    {
                                        initialX:event.clientX,
                                        initialY:event.clientY
                                    }, 
                                    () => resolve()
                                )
                            )
                        )
                    )
                   .switchMap(
                        () => Observable 
                                .fromEvent(window, "mousemove")
                                .skipUntil(sufficientDistance)
                                .do((event:any) => !this.start ? this.onDragStart(event) : null)
                                .takeUntil(dragEnd)
                    ) 
                   .subscribe(this.onDragMove,this.onError);  

        this.subscriptions.push(drag,scroll);
    }


    onDragStart = (event:any) => {
       this.start = true;

       //all children
       let children = this.getNodes();

       let initialIndex : number = this.indexFromClick(event); 
       
       //nodes - selected nodes. clone - cloned selected nodes.
       let {nodes, clone} = this.clone(initialIndex,children);  
         
       //append cloned nodes in container to body
       this.cloned = document.body.appendChild(clone);

       //preserve replaced nodes
       this.selected = nodes;
       //hide replaced nodes
       this.selected.map((node:HTMLElement) => this.hideElement(node));

       //initial client rect of cloned node
       let initialRect = this.cloned.getBoundingClientRect();
       
       console.log(`initial height ${initialRect.height}`);
       console.log(`onDragStart.initialIndex:${initialIndex}.initialRect:${JSON.stringify(initialRect)}.`);

       this.setState({initialRect,initialIndex}); 
    }


    

    getCurrentIndex = (event:any) : number => {
        let { initialIndex } = this.state;
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


    onDragMove = (event:any) => {
        

        assert(this.start,'onDragMove invoked before onDragStart');

        if(not(this.start)){ return }

        let {scrollableContainer,items} = this.props;

        let rootClientRect = scrollableContainer.getBoundingClientRect();
        let cloneClientRect = this.cloned.getBoundingClientRect();

        let {initialX,initialY,initialIndex,scrollTop} = this.state;

        let deltaX = event.clientX-initialX;  
        let deltaY = event.clientY-initialY;  


        let currentIndex = this.getCurrentIndex(event); 
        console.log(`currentIndex ${currentIndex}.`);

        this.animateClone(deltaX,deltaY);

        this.animateNodes(event);
        this.applyCustomStyle(event);
    } 


    animateClone = (deltaX:number,deltaY:number) => { 
        this.cloned.style[`transform`] = `translate3d(${deltaX}px,${deltaY}px, 0)`;
    }


    animateNodes = (event) => {

        let {initialIndex,initialRect} = this.state;
        let currentIndex = this.getCurrentIndex(event); 
        let nodes = this.getNodesToBeAnimated();
        let cloneRect = this.cloned.getBoundingClientRect();
        let cloneTop = cloneRect.top;
        let cloneHeight = cloneRect.height;
        let cloneInitialTop = initialRect.top;

        for(let i=0; i<nodes.length; i++){ 
            let element = nodes[i];
            element.style[`transition-duration`] = `${300}ms`; 
            let {top} = element.getBoundingClientRect();


            let initiallyAbove : boolean = top < cloneInitialTop;
            let initiallyBelow : boolean = top > cloneInitialTop;
            let above = top < cloneTop; 
            let below = top > cloneTop; 

            if(initiallyAbove && below){ 

                nodes[i].style[`transform`] = `translate3d(${0}px,${cloneHeight}px, 0)`;
            }else if(initiallyBelow && above){  
 
                nodes[i].style[`transform`] = `translate3d(${0}px,${-cloneHeight}px, 0)`;
            }else{  

                nodes[i].style[`transform`] = `translate3d(${0}px,${0}px, 0)`;
            }
        }       
    }


    initDecorator = (
        value : {
            condition:(x:number,y:number) => boolean, 
            decorator:HTMLElement
        }
    ) => {

        let {condition,decorator} = value; 

    }


    applyCustomStyle = (event:any) => {
        let x = event.clientX;
        let y = event.clientY;
        this.showElement(this.cloned);
        let {decorators} = this.props;

        for(let i=0; i<decorators.length; i++){
            let {condition, decorator} = decorators[i];
            if(condition(x,y)){
               this.hideElement(this.cloned);
            }    
        }  
    }


    onDragEnd = (event:any) => {
        this.start = false;

        let newIndex = this.getCurrentIndex(event); 

        this.cloned.parentNode.removeChild(this.cloned);
        this.selected.map((node:HTMLElement) => this.showElement(node));
        this.cloned = null;
        this.selected = [];

        console.log(`onDragEnd.newIndex:${newIndex}.`);

        this.setState({
            scrollTop:0,
            x:0,
            y:0,
            initialIndex:0,
            initialX:0,
            initialY:0,
            initialRect:null
        });    
    }


    cloneOne = (node:HTMLElement) : HTMLElement => {
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
        clone.style.userSelect = "none"; 
        
        return clone;
    }

    cloneMany = (nodes:HTMLElement[]) : HTMLElement => {
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
        container.style.userSelect = "none"; 

        return container;  
    }   
 
    clone = (index:number,nodes:HTMLElement[]) : {nodes:HTMLElement[], clone:HTMLElement}  => {
       
       let { selectElements, items } = this.props; 

       if(isEmpty(items)){ return null }


       assert(match(nodes,items),`incorrect order. clone.`);


       let selection : number[] = selectElements(index,items);

       
       assert(not(isEmpty(selection)),`selection empty. clone.`);


       if(selection.length===1){
            
          let index = selection[0]; 
          let node = nodes[index];
          let clone = this.cloneOne(node);
          
          return {nodes:[node],clone};

       }else if(selection.length>1){
            
          let selected = nodes.filter((node,index) => contains(index)(selection));  
          
          assert(selected.length===selection.length, `incorrect selection. clone.`);

          let clone = this.cloneMany(selected);    
          
          return {nodes:selected,clone};
       } 
    }

    hideElement = (node:HTMLElement) : void => {
        node.style.visibility = 'hidden';
        node.style.opacity = '0';  
    }

    showElement = (node:HTMLElement) : void => {
        node.style.visibility = 'visible';
        node.style.opacity = '1';  
    }
   
    render(){ 
        return <div 
            ref={e => {this.ref=e;}} 
            style={{display:"flex", flexDirection:"column"}}
        > 
            {this.props.children}    
        </div>
    }
}