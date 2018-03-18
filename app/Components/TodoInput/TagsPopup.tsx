import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Popover from 'material-ui/Popover';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscription } from 'rxjs/Rx';
import { connect } from "react-redux";
import { compose, uniq, flatten, concat, isNil, not, prop, isEmpty } from 'ramda';
import { insideTargetArea } from '../../utils/insideTargetArea';
import { assert } from '../../utils/assert';
import { isArrayOfStrings } from '../../utils/isSomething';
import AutosizeInput from 'react-input-autosize';
import { Store } from '../../app';
import { attachDispatchToProps } from '../../utils/utils';
 
interface TagsPopupProps{
    close : Function,
    open : boolean,
    attachTag:(tag:string) => void,
    origin : any,  
    rootRef : HTMLElement, 
    anchorEl : HTMLElement,
    point : any,
    defaultTags : string[],
    todos : any[]
}   

 
@connect(
    (store:Store,props:TagsPopupProps) : TagsPopupProps => {
        let out = {
             ...props,
             defaultTags:[...store.defaultTags],
             todos:[...store.todos]
        }; 
        console.log(out)
        return out; 
    },    
    attachDispatchToProps
) 
export class TagsPopup extends Component<TagsPopupProps,{}>{
        ref:HTMLElement;
        subscriptions:Subscription[];

        constructor(props){  
            super(props); 
            this.subscriptions = [];
        }   

        componentDidMount(){ 
            this.subscriptions.push(
                Observable
                .fromEvent(document.body,"click")
                .subscribe(this.onOutsideClick)
            );
        }   

        componentWillUnmount(){
            this.subscriptions.map(s => s.unsubscribe());
            this.subscriptions = []; 
        } 

        onOutsideClick = (e) => {
            if(isNil(this.ref)){ return } 

            let x = e.pageX;
            let y = e.pageY; 

            let inside = insideTargetArea(null,this.ref,x,y);
        
            if(not(inside)){ this.props.close() }   
        }      

        getTags = () => {
            let {todos, defaultTags} = this.props;

            return compose( 
                uniq,
                flatten,
                concat(defaultTags),
                (todos) => todos.map(prop("attachedTags"))
            )(todos as any)
        }
                
        render(){ 
            let tags = this.getTags();
            assert(isArrayOfStrings(tags),'TodoTags');

            return <Popover  
                open={this.props.open}
                style={{
                    zIndex:40005,
                    background:"rgba(39, 43, 53, 0)", 
                    backgroundColor:"rgb(39, 43, 53, 0)"
                }}
                anchorEl={this.props.anchorEl}
                canAutoPosition={true}
                onRequestClose={this.props.close}
                scrollableContainer={this.props.rootRef}
                useLayerForClickAway={false} 
                anchorOrigin={this.props.origin} 
                targetOrigin={this.props.point} 
                zDepth={0}        
            >      
                <div   
                    ref={(e) => { this.ref=e; }}
                    className="darkscroll"
                    onClick = {(e) => { 
                        e.stopPropagation();
                        e.preventDefault(); 
                    }} 
                    style={{borderRadius:"10px", width:"180px"}}
                > 
                    <div    
                        className="darkscroll"
                        style={{   
                            backgroundColor: "rgb(39, 43, 53)",
                            paddingRight: "10px",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            paddingBottom: "5px",
                            maxHeight:"150px",
                            cursor:"pointer",
                            overflowX:"hidden" 
                        }}
                    >    
                    {  
                        tags
                        .sort((a:string,b:string) : number => a.localeCompare(b))
                        .map(
                            (tag:string) => {
                                return <div   
                                    key={tag}  
                                    onClick={(e) => {
                                        e.stopPropagation();  
                                        this.props.attachTag(tag);
                                    }} 
                                    className="tagItem"
                                    style={{
                                        display:"flex", 
                                        height:"auto",
                                        width:"140px", 
                                        paddingLeft:"5px", 
                                        paddingRight:"10px"  
                                    }}
                                >   
                                    <div style={{width:"24px",height:"24px"}}>
                                        <TriangleLabel style={{color:"gainsboro"}}/>
                                    </div> 
                                    <div style={{
                                        color:"gainsboro", 
                                        marginLeft:"5px", 
                                        marginRight:"5px",
                                        overflowX:"hidden",
                                        whiteSpace: "nowrap" 
                                    }}> 
                                        {tag}   
                                    </div>  
                                </div>
                            }
                        )
                    } 
                    </div>  
                </div>  
        </Popover> 
    } 
      
}
 

