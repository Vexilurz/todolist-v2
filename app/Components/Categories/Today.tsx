import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, 
    chooseIcon, showTags, allPass, byNotCompleted, byNotDeleted 
} from "../../utils";  
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo } from '../../database';
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';
import { Footer } from '../../Components/Footer';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import { Store } from '../../App';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { ContainerHeader } from '.././ContainerHeader';
import { TodosList } from '.././TodosList'; 
import Moon from 'material-ui/svg-icons/image/brightness-3';
import { byTags, byCategory } from '../../utils';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
 
 

interface TodayProps{ 
    dispatch:Function,
    selectedTodoId:string,
    selectedTag:string,
    rootRef:HTMLElement,
    todos:Todo[], 
    tags:string[]
} 

 

interface TodayState{
    emptyEvening:boolean,
    emptyToday:boolean 
}
 

 
export class Today extends Component<TodayProps,TodayState>{

    constructor(props){
        super(props);
        this.state={
            emptyEvening:false,
            emptyToday:false
        }
    }
 
    render(){ 
 
        return <div style={{disaply:"flex", flexDirection:"column"}}> 
            <div style={{width: "100%"}}> 
        
                    <div style={{
                        display:"flex", 
                        position:"relative",
                        alignItems:"center",
                        marginBottom:"20px"
                    }}>  

                        <div>{chooseIcon({width:"50px",height:"50px"}, "today")}</div>

                        <div style={{  
                            fontFamily: "sans-serif",  
                            fontSize: "xx-large",
                            fontWeight: 600,
                            paddingLeft: "10px", 
                            WebkitUserSelect: "none", 
                            cursor:"default" 
                        }}>   
                            {uppercase("today")} 
                        </div> 
                     
                    </div> 

                    <FadeBackgroundIcon    
                        container={this.props.rootRef} 
                        selectedCategory={"today"}  
                        show={this.state.emptyEvening && this.state.emptyToday}
                    />          
 
                    <Tags  
                        selectTag={(tag) => this.props.dispatch({type:"selectedTag", load:tag})}
                        tags={this.props.tags}
                        selectedTag={this.props.selectedTag}
                        show={showTags("today")} 
                    /> 

                       
                    <div   
                        className="unselectable" 
                        id="todos" 
                        style={{
                            marginBottom: "50px", 
                            marginTop:"20px"
                        }} 
                    >  
                        <TodosList   
                            filters={[ 
                                byTags(this.props.selectedTag),
                                byCategory("today"),
                                byNotCompleted, 
                                byNotDeleted 
                            ]}  
                            isEmpty={(empty:boolean) => this.setState({emptyToday:empty})}   
                            dispatch={this.props.dispatch}   
                            selectedCategory={"today"}
                            selectedTag={this.props.selectedTag}  
                            rootRef={this.props.rootRef}
                            todos={this.props.todos} 
                            tags={this.props.tags} 
                        />  
                    </div>  
                    
  
                    <div>
                        <div style={{
                            display: "flex",
                            color: "rgba(0,0,0,0.8)",
                            fontWeight: "bold",
                            fontFamily: "sans-serif", 
                            fontSize:"16px", 
                            cursor: "default",  
                            userSelect: "none",
                            width:"100%",
                            alignItems: "center", 
                            borderBottom:"1px solid rgba(0,0,0,0.1)"  
                        }}>
                            <Moon style={{  
                                transform:"rotate(145deg)", 
                                color:"cornflowerblue", 
                                height: "25px",
                                width: "25px",
                                cursor:"default" 
                            }}/>   
                            <div style={{marginLeft: "10px"}}>This Evening</div>
                        </div>

                        <div   
                            className="unselectable" 
                            id="todos" 
                            style={{
                                marginBottom: "50px", 
                                marginTop:"20px"
                            }}   
                        >  
                            <TodosList     
                                filters={[ 
                                    byTags(this.props.selectedTag),
                                    byCategory("evening"),
                                    byNotCompleted, 
                                    byNotDeleted  
                                ]} 
                                isEmpty={(empty:boolean) => this.setState({emptyEvening:empty})} 
                                dispatch={this.props.dispatch}    
                                selectedCategory={"evening"} 
                                selectedTag={this.props.selectedTag}  
                                rootRef={this.props.rootRef}
                                todos={this.props.todos}  
                                tags={this.props.tags} 
                            /> 
                        </div> 
                    </div>  

            </div>
    </div>
  } 
}


 
  




interface TodayScheduleProps{
    show:boolean  
}

export class TodaySchedule extends Component<TodayScheduleProps,any>{

    constructor(props){
        super(props);
    }

    render(){

        return !this.props.show ? null :
           
        <div style={{    
            paddingTop: "10px", 
            paddingBottom: "10px", 
            marginBottom: "20px", 
            display:"flex",
            flexDirection:"column",
            borderRadius:"10px", 
            backgroundColor:"rgba(100,100,100,0.1)",
            width:"100%",
            fontFamily: "sans-serif", 
            height:"auto"
        }}> 

            <div style={{padding:"10px"}}>

                <div style={{
                    borderLeft:"4px solid dimgray", 
                    fontSize:"14px", 
                    color:"rgba(100,100,100,0.6)"
                }}> 
                    {" Paul Martin's Birthday"}
                </div>

                <div style={{  
                    fontSize:"14px", 
                    color:"rgba(100, 100, 100, 0.9)",
                    paddingTop:"5px",
                    
                }}>
                    {"08:30 Blinkist // Quora"}
                </div>


                <div style={{
                    fontSize:"14px", 
                    color:"rgba(100, 100, 100, 0.9)",
                    paddingTop:"5px",
                }}>
                    {"11:00 Newton // Marketing"}
                </div>


                <div style={{
                    fontSize:"14px", 
                    color:"rgba(100, 100, 100, 0.9)",
                    paddingTop:"5px",
                }}>
                    {"12:00 FlashSticks // Marketing"}
                </div>
 

                <div style={{
                    fontSize:"14px", 
                    color:"rgba(100, 100, 100, 0.9)",
                    paddingTop:"5px",
                }}>
                    {"18:00 Scott Woods"}
                </div> 

            </div> 
                
        </div>

    }

}



 