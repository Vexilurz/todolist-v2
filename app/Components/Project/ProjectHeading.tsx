import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { Component } from "react"; 
import Popover from 'material-ui/Popover';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import { TextField } from 'material-ui';
import { Heading } from '../../types'; 
import { isEmpty, when, prop } from 'ramda';
import { uppercase } from '../../utils/uppercase';
import { isFunction, isNotNil } from '../../utils/isSomething'; 
import { stopPropagation } from '../../utils/stopPropagation';


interface ProjectHeadingProps{
    heading : Heading,
    rootRef : HTMLElement, 
    onChange : (heading_id:string, newValue:string) => void,
    onRemoveHeading : (heading_id:string) => void,
    onRemoveHeadingWithTasks : (heading_id:string) => void,
}

 

interface ProjectHeadingState{
    open:boolean
}
  
   
  
export class ProjectHeading extends Component<ProjectHeadingProps,ProjectHeadingState>{
    actionsAnchor:HTMLElement; 
    inputRef:any; 

    constructor(props){ 
        super(props);
        this.state={open:false};   
    } 



    componentDidMount(){
        let {heading} = this.props;
        if(isEmpty(heading.title)){ this.focus(this.inputRef) } 
    } 



    focus = when(
        isNotNil, 
        (TextField) => {
            let {rootRef} = this.props; 
            let input = prop('input',TextField);

            if(input && isFunction(input.focus) && isFunction(input.blur)){ 
               let value = input.value;
               input.value = ''; 
               input.blur()
               input.focus();
               input.value = value;  
            } 
        } 
    );



    render(){
        let {heading,onChange} = this.props;

        return <div>
        <div   
            onClick={() => this.focus(this.inputRef)}
            className="projectHeading"  
            style={{ 
                display:"flex", 
                height:"30px", 
                alignItems:"center",
                cursor:"default",
                justifyContent:"space-between", 
                WebkitUserSelect: "none"
            }} 
        >      
            <div style={{width:"100%",paddingLeft:"10px",WebkitUserSelect:"none"}}>  
                <div style={{display:"flex",cursor:"default"}}>  
                    <TextField     
                        autoFocus={true}
                        ref={(e) => {this.inputRef=e;}} 
                        hintText="Heading"      
                        id={`${heading._id}-input`} 
                        defaultValue={uppercase(heading.title)} 
                        fullWidth={true}   
                        onChange={(event,newValue:string) => onChange(heading._id,newValue)}
                        inputStyle={{
                            fontWeight:600,
                            color:"rgba(10,110,205,1)",
                            fontSize:"16px", 
                            cursor:"default",
                            userSelect:"none" 
                        }}  
                        onKeyDown={stopPropagation}
                        hintStyle={{top:"3px",left:0,width:"100%",height:"100%"}}   
                        style={{height:"30px"}}      
                        underlineFocusStyle={{borderColor:"rgba(0,0,0,0)"}}    
                        underlineStyle={{borderColor:"rgba(0,0,0,0)"}}  
                    /> 
                </div>  
            </div> 
            <div   
                onClick={() => this.setState({open:true})}  
                style={{
                    marginLeft:"5px", 
                    marginRight:"5px", 
                    width:"30px",
                    height:"30px",
                    cursor:"pointer"
                }}
                ref={(e) => {this.actionsAnchor=e;}}
            > 
               <ThreeDots style={{color:"dodgerblue",width:"30px",height:"30px",cursor:"pointer"}}/>
            </div> 
        </div>
        <div>
            <Popover 
                className="nocolor"
                style={{marginTop:"20px",backgroundColor:"rgba(0,0,0,0)",background:"rgba(0,0,0,0)",borderRadius:"10px"}}    
                scrollableContainer={this.props.rootRef}
                useLayerForClickAway={false}  
                open={this.state.open}
                onRequestClose={() => this.setState({open:false})}
                targetOrigin={{vertical:'top',horizontal:'right'}}
                anchorOrigin={{vertical:'center',horizontal:'left'}} 
                anchorEl={this.actionsAnchor} 
            >   
                <div    
                    style={{  
                        backgroundColor:"rgb(238, 237, 239)", //"rgb(39, 43, 53)",
                        paddingRight:"10px",
                        paddingLeft:"10px",
                        borderRadius:"10px",
                        paddingTop:"5px",
                        paddingBottom:"5px", 
                        cursor:"pointer" 
                    }} 
                >    
                    <div  
                        onClick={() => this.props.onRemoveHeading(this.props.heading._id) as any} 
                        className="tagItem" 
                        style={{
                            display:"flex",  
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >   
                        <TrashIcon style={{
                            height:"18px",
                            width:"18px",
                            color:"rgb(69, 95, 145)"
                        }}/> 
                        <div style={{
                            color:"black",
                            fontSize:"14px",
                            marginLeft:"5px", 
                            marginRight:"5px"
                        }}>
                            Remove headline 
                        </div>     
                    </div> 

                    <div   
                        onClick={() => this.props.onRemoveHeadingWithTasks(this.props.heading._id)  as any} 
                        className="tagItem" 
                        style={{ 
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <TrashIcon style={{
                            height:"18px",
                            width:"18px",
                            color:"rgb(69, 95, 145)"
                        }}/> 
                        <div style={{
                            color:"black",
                            fontSize:"14px",
                            marginLeft:"5px", 
                            marginRight:"5px"
                        }}>
                            Remove headline and tasks  
                        </div>     
                    </div>
                </div> 
            </Popover> 
        </div>    
        </div>
    }
}