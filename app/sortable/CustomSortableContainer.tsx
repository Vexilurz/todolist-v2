import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { SortableElement, Data } from './CustomSortableElement';
 

interface SortableContainerProps{
    getElement:Function,
    items:any[],
    shouldCancelStart:Function,
    shouldCancelAnimation:Function,
    rootRef:HTMLElement
}    

 
interface SortableContainerState{}
 

export class SortableContainer extends Component<SortableContainerProps,SortableContainerState>{
    ref:HTMLElement;

    constructor(props){
        super(props);
    }


    getCurrentIndex = (nodes:HTMLElement[], oldIndex:number, y:number) : number => {
        let above = [];

        for(let i=0; i<nodes.length; i++){ 
            if(i===oldIndex){ continue; }
            let element = nodes[i];

            let {top, bottom, left, right, height, width} = element.getBoundingClientRect();

            let center : number = (top+bottom)/2;
  
            if(center<y){      
               above.push(nodes[i]);   
            }  
        } 

        
        let newIndex : number = above.length;

        return newIndex;
    }


    
    onSortStart = (data:Data) : void => {
        let nodes = [].slice.call(this.ref.children);
        let { event, deltaX, deltaY, rect, index, item } = data;   
        
        for(let i=0; i<nodes.length; i++){ 
            nodes[i].style[`user-select`] = `none`;  
        }
    }  
      
     
 
    onSortMove = (data:Data) : void => {
        let nodes = [].slice.call(this.ref.children);
        
        let { event, deltaX, deltaY, rect, index, item } = data;  

        let y : number = (rect.top+rect.bottom)/2;  
        let offset : number = rect.height;
        let oldIndex : number = index;
        let newIndex : number = this.getCurrentIndex(nodes, index, y);

         
        for(let i=0; i<nodes.length; i++){ 

            let initiallyAbove : boolean = i < oldIndex;
            let initiallyBelow : boolean = i > oldIndex;

            if(i===index){ continue; }
 
            let element = nodes[i];

            element.style[`transition-duration`] = `${300}ms`; 

            let {top, bottom, left, right, height, width} = element.getBoundingClientRect();

            let center : number = (top+bottom)/2;

            let above = center < y; 
            let below = center > y; 

            if(initiallyAbove && below){ 

                nodes[i].style[`transform`] = `translate3d(${0}px,${offset}px, 0)`;
 
            }else if(initiallyBelow && above){  

                nodes[i].style[`transform`] = `translate3d(${0}px,${-offset}px, 0)`;

            }else{  

                nodes[i].style[`transform`] = `translate3d(${0}px,${0}px, 0)`;

            }
        }       
    }  
     


    onSortEnd = (data:Data) : void => {  
        let nodes = [].slice.call(this.ref.children);
        let { event, deltaX, deltaY, rect, index, item } = data;   
        let y : number = (rect.top+rect.bottom)/2;  
        
        let oldIndex : number = index;
        let newIndex : number = this.getCurrentIndex(nodes, index, y);

        for(let i=0; i<nodes.length; i++){ 
            nodes[i].style[`transform`] = ``;
            nodes[i].style[`transition-duration`] = ``;  
            nodes[i].style[`pointer-events`] = `auto`;
            nodes[i].style[`user-select`] = ``;  
        }
 
    }    

    


    render(){ 
        return <div 
            ref={e => {this.ref=e;}}
            style={{display:"flex", flexDirection:"column"}} 
        >
            {
                this.props.items
                .map((item,index:number) : JSX.Element => {

                     return <div key = {`${item["_id"]}-${index}`} >
                                <SortableElement 
                                    index={index}   
                                    item={item}
                                    rootRef={this.props.rootRef}
                                    onStart={this.onSortStart} 
                                    onMove={this.onSortMove} 
                                    onEnd={this.onSortEnd} 
                                >
                                    {this.props.getElement(item, index)}
                                </SortableElement>     
                            </div> 

                })
            }   
        </div>
    }
}