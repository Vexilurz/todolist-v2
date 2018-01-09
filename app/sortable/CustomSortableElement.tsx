import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
 

interface SortableElementProps{
    getElement:(item:any) => JSX.Element,
    item:any,
    onDrag:(x:number,y:number) => void  
} 
 
interface SortableElementState{
    x:number,
    y:number 
}

export class SortableElement extends Component<SortableElementProps,SortableElementState>{

    mouseMoveStream:Observable<{}>;
    subscription:Subscription;
    ref:HTMLElement; 

    constructor(props){
        super(props);
        this.state = {x:0, y:0};
    }
    
    componentDidMount(){
        if(this.ref){
            this.mouseMoveStream = Observable
                                    .fromEvent(this.ref,"mousedown")
                                    .switchMap(
                                    () => Observable
                                          .fromEvent(this.ref, "mousemove")
                                          .map((event:any) => ({
                                                x:event.clientX,
                                                y:event.clientY
                                           }))
                                           .takeUntil(
                                                Observable.fromEvent(this.ref,"mouseup") //or mouse out
                                           )
                                    ) 
                                     
            this.subscription = this.mouseMoveStream.subscribe(
                (value:{x:number,y:number}) => {
                    this.setState(
                        {x:value.x,y:value.y}, 
                        () => this.props.onDrag(this.state.x,this.state.y)
                    )
                }
                , 
                (error) => console.log(error)
            )
        }
    }
 
    componentWillUnmount(){
        if(this.subscription){
            this.subscription.unsubscribe();
        }
    } 

    render(){
        return <div
            ref={(e) => {this.ref=e;}}
            style={{
                display:"inline-block",
                width:"auto",
                height:"auto", 
                transform:`translate(${this.state.x}px,${this.state.y}px)`,
                transition:"transform 0.2s ease-in-out",
            }}
        >  
            {this.props.getElement(this.props.item)}
        </div>
    }
}



