import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { isNil } from 'ramda';
 

export interface Data{
    event:any,
    deltaX:number,
    deltaY:number,
    rect:ClientRect, 
    index:number,
    item?:any     
} 

  
interface SortableElementProps{ 
    index:number, 
    item:any,
    rootRef:HTMLElement,  
    onStart:(data:Data) => void,
    onMove:(data:Data) => void,
    onEnd:(data:Data) => void 
}       
  

interface SortableElementState{
    height:number,
    drag:boolean,
    scrollTop:number, 
    x:number,
    y:number,
    initialX:number,
    initialY:number,
    top:number,
    left:number  
}


export class SortableElement extends Component<SortableElementProps,SortableElementState>{

    subscriptions:Subscription[];

    ref:HTMLElement; 

    constructor(props){
        super(props);
        this.subscriptions = [];
        this.state = {
            height:0,
            drag:false,
            scrollTop:0,
            initialX:0,
            initialY:0,
            x:0,   
            y:0,
            top:0,
            left:0
        };    
    } 


    onError = (error) => console.log(error)


    setInitialPosition = (event:any) => 
        new Promise( 
            resolve => this.setState(
                {
                    initialX:event.clientX,
                    initialY:event.clientY
                }, 
                () => resolve()
            )
        )


    componentDidMount(){ 

        let dragStartThreshold = 5;
        let start = true;

        let sufficientDistance = Observable 
                                 .fromEvent(window, "mousemove") 
                                 .filter((event:any) => {
                                    let {initialX,initialY} = this.state;

                                    let x = Math.abs(event.clientX-initialX);
                                    let y = Math.abs(event.clientY-initialY);
 
                                    return x > dragStartThreshold || y > dragStartThreshold;
                                 });

        let dragEnd = Observable 
                        .fromEvent(window,"mouseup")
                        .do((event:any) => { start = true; })
                        .do(this.onDragEnd)

        
        let scroll = Observable
                     .fromEvent(this.props.rootRef,"scroll")
                     .subscribe(e => this.setState({scrollTop:this.props.rootRef.scrollTop}));                  

        let drag = Observable
                    .fromEvent(this.ref,"mousedown") 
                    .switchMap((event:any) => Observable.fromPromise(this.setInitialPosition(event)))
                    .switchMap(
                        () => Observable 
                                .fromEvent(window, "mousemove")
                                .skipUntil(sufficientDistance)
                                .do((event:any) => {
                                    if(start){ 
                                        this.onDragStart(event);
                                        start = false;
                                    } 
                                })
                                .takeUntil(dragEnd)
                    ) 
                    .subscribe(this.onDrag,this.onError);  

        this.subscriptions.push(drag,scroll);              
    }  
 


    onDragStart = (event:any) => { 
        let {onStart, index, item} = this.props;

        let rect = this.ref.getBoundingClientRect();

        this.ref.setAttribute("tabIndex", "-1"); 
 
        let data:Data = { 
            event,
            deltaX:0, 
            deltaY:0,
            rect,
            index,
            item  
        };    

        console.log("onDragStart",rect);

        this.setState(  
            {
                drag:true, 
                top:rect.top,
                left:rect.left,
                height:rect.height
            }, 
            () => onStart(data)
        ); 
    }



    onDrag = (event:any) => { 
        let {onMove, index, item} = this.props;
        let {initialX,initialY,scrollTop} = this.state;

        let deltaX = event.clientX-initialX;  
        let deltaY = event.clientY-initialY+scrollTop; 

        let root = this.props.rootRef.getBoundingClientRect();
        let rect = this.ref.getBoundingClientRect();

        deltaY = event.clientY < root.bottom ? deltaY : root.bottom; 
         
        let data:Data = {  
            event,
            deltaX,
            deltaY,
            rect,
            index, 
            item 
        };  

        this.setState({x:deltaX, y:deltaY},() => onMove(data));
    }

    onDragEnd = (event:any) => {   
        let {onEnd, index, item} = this.props;
         
        let x = event.clientX;
        let y = event.clientY;

        let rect = this.ref.getBoundingClientRect();

        this.ref.style["z-index"] = 100;
        this.ref.style[`pointer-events`] = ``;
        this.ref.style[`user-select`] = ``;  
 
        let data:Data = {
            event,
            deltaX:0,
            deltaY:0,
            rect,
            index, 
            item  
        };   
 
        this.setState(
            { 
                drag:false,
                initialX:0,
                initialY:0,
                x:0,
                y:0,
                scrollTop:0
            }, 
            () => onEnd(data)
        );
    }
  
    componentWillUnmount(){
           this.subscriptions.map( s => s.unsubscribe());
           this.subscriptions = []; 
    } 

    render(){  
        let {x,y,drag,top,left,height} = this.state; 
        
        return <div
            ref={(e) => {this.ref=e;}}  
            style={{  
                width:"100%", 
                //height:drag ? `${height}px` : `100%`,   
                //top:drag ? `${top}px` : ``, 
                //left:drag ? `${left}px` : ``, 
                //position:drag ? 'fixed' : 'relative',
                pointerEvents:drag ? 'none' : '',
                zIndex:drag ? 200000 : '' as any,
                transform:`translate3d(${x}px,${y}px,0)`,
                 
                MozUserSelect:"none",
                WebkitUserSelect:"none",
                msUserSelect:"none", 
                userSelect:"none"
            }} 
        >    
            {this.props.children}  
        </div> 
    } 
}

 

