import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Clear from 'material-ui/svg-icons/content/clear';
import Popover from 'material-ui/Popover';
import { attachDispatchToProps } from '../../utils/utils';
import AutosizeInput from 'react-input-autosize'; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { connect } from "react-redux";
import { Store } from '../../app';
import { compose, uniq, flatten, concat, isNil, not, prop} from 'ramda';
import { insideTargetArea } from '../../utils/insideTargetArea';
import { assert } from '../../utils/assert';
import { isArrayOfStrings } from '../../utils/isSomething';
import { uppercase } from '../../utils/uppercase';


interface TagsPopupProps extends Store{
    close : Function,
    open : boolean,
    attachTag:(tag:string) => void,
    origin : any,  
    rootRef : HTMLElement, 
    anchorEl : HTMLElement,
    point : any 
}   

 
@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps) 
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
                    className={"darkscroll"}
                    onClick = {(e) => { 
                        e.stopPropagation();
                        e.preventDefault(); 
                    }} 
                    style={{borderRadius:"10px", width:"180px"}}
                > 
                    <div    
                        className={"darkscroll"}
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
                                    className={"tagItem"} 
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
 


interface TodoTagsProps{
    tags:string[],
    attachTag:(tag:string) => void,
    removeTag:(tag:string) => void,
}    

interface TodoTagsState{tag:string}
 
export class TodoTags extends Component<TodoTagsProps,TodoTagsState>{

    constructor(props){
        super(props);
        this.state={ tag:'' };  
    } 
    
    
    onEnterPress = (e) => { 
        if(e.keyCode!==13){ return }
        e.stopPropagation(); 

        let {attachTag} = this.props;
        let {tag} = this.state;
        attachTag(tag);
        this.setState({tag:''}); 
    }
    

    onRemoveTag = (tag:string) => () => {
        let {removeTag} = this.props;
        removeTag(tag);
    }
    
    
    render(){
        let {attachTag} = this.props;
        let {tag} = this.state;

        return <div
          onClick={(e) => {e.stopPropagation();}} 
          style={{display:"flex",paddingTop:"5px",paddingBottom:"5px",flexWrap:"wrap"}}
        >
            {      
                this.props.tags
                .sort((a:string,b:string) : number => a.localeCompare(b))
                .map( 
                    (tag:string, index:number) => 
                    <div  
                        key={`${tag}-${index}`} 
                        style={{ 
                            paddingLeft:"4px", 
                            paddingRight:"4px", 
                            paddingTop:"4px",  
                            cursor:"default",  
                            WebkitUserSelect:"none"
                        }}   
                    > 
                        <div 
                            style={{
                                borderRadius:"15px", 
                                backgroundColor:"rgb(189,219,209)",
                                paddingLeft:"5px",
                                paddingRight:"5px",
                                display:"flex"   
                            }}
                        >
                            <div 
                                style={{  
                                    height:"15px",
                                    display:"flex",
                                    alignItems:"center",
                                    padding:"4px", 
                                    color:"rgb(115,167,152)",
                                    fontWeight: 600    
                                }} 
                            > 
                                {uppercase(tag)} 
                            </div> 
                            <div  
                              style={{padding:"2px",alignItems:"center",display:"flex",cursor:"pointer"}} 
                              onClick={this.onRemoveTag(tag)}
                            >
                                <Clear style={{color:"rgba(100,100,100,0.5)",height:20,width:20}}/>
                            </div>
                        </div> 
                    </div> 
                )   
            }
            <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>   
                <AutosizeInput   
                    type="text"  
                    name="form-field-name-tag"   
                    minWidth={40}
                    style={{display:"flex", alignItems:"center", cursor:"default"}}            
                    inputStyle={{                
                        color:"black",  
                        fontSize:"16px",  
                        cursor:"default", 
                        caretColor:"cornflowerblue",  
                        boxSizing:"content-box", 
                        backgroundColor:"rgba(0,0,0,0)",
                        border:"none",  
                        outline:"none"   
                    }}  
                    placeholder=""  
                    value={this.state.tag} 
                    onKeyDown={this.onEnterPress} 
                    onChange={(event) => this.setState({tag:event.target.value})} 
                /> 
            </div>
        </div>
    }
}
 