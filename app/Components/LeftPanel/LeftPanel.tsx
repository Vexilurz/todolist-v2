import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconMenu from 'material-ui/IconMenu'; 
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, generateEmptyProject, generateEmptyArea, 
    byNotCompleted, byNotDeleted, byTags, byCategory, byCompleted, 
    byDeleted, dateDiffInDays, byNotAttachedToProjectFilter, byNotAttachedToAreaFilter, isDate, daysRemaining 
} from "../../utils"; 
import { Provider, connect } from "react-redux";
import Menu from 'material-ui/Menu';
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Layers from 'material-ui/svg-icons/maps/layers';
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Plus from 'material-ui/svg-icons/content/add';  
import Inbox from 'material-ui/svg-icons/content/inbox';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books'; 
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import Popover from 'material-ui/Popover';
import { addProject, Project, Area, addArea, Todo } from '../../database';
import Clear from 'material-ui/svg-icons/content/clear';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import FullScreen from 'material-ui/svg-icons/image/crop-square';
import { Store, isDev } from '../../app';
import { Data } from './../SortableList';
import { AreasList } from './../Area/AreasList';
import { ResizableHandle } from './../ResizableHandle';
import { LeftPanelMenu } from './LeftPanelMenu';
import { NewProjectAreaPopup } from './NewProjectAreaPopup';
import { allPass, isNil } from 'ramda';
import { QuickSearch } from '../Search';
 
 
interface ItemsAmount{
    inbox:number,
    today:number,
    hot:number,
    trash:number,
    logbook:number  
}

 
let hotFilter = (todo:Todo) : boolean => {

    if(isNil(todo)){
        if(isDev()){ 
           throw new Error(`Todo is undefined ${JSON.stringify(todo)}. hotFilter`);
        }
    }
        
    if(isNil(todo.deadline))
        return false;
           
    if(!isDate(todo.deadline)){ 
        if(isDev()){ 
           throw new Error(`Deadline is not date. ${JSON.stringify(todo.deadline)} hotFilter`);
        }
    }
      
    return daysRemaining(todo.deadline)<=0;  
}   


export let calculateAmount = (areas:Area[], projects:Project[], todos:Todo[]) : ItemsAmount => {

    let todayFilter = (i) => byCategory("today")(i) || byCategory("evening")(i); 
  
    let inboxFilters = [ 
        byNotAttachedToAreaFilter(areas), 
        byNotAttachedToProjectFilter(projects), 
        byCategory("inbox"),
        byNotCompleted, 
        byNotDeleted 
    ]; 
 
    let todayFilters = [todayFilter, byNotCompleted, byNotDeleted];

    let trashFilters = [byDeleted];

    let logbookFilters = [byCompleted, byNotDeleted]; 
    
    let hotFilters = [byNotCompleted, byNotDeleted, hotFilter];
          
    return {      
       inbox:todos.filter((t:Todo) => allPass(inboxFilters)(t)).length,
       today:todos.filter((t:Todo) => allPass(todayFilters)(t)).length,
       hot:todos.filter((t:Todo) => allPass(hotFilters)(t)).length,
       trash:todos.filter((t:Todo) => allPass(trashFilters)(t)).length, 
       logbook:todos.filter((t:Todo) => allPass(logbookFilters)(t)).length
    }   
} 
 

  
interface LeftPanelState{ 
    collapsed:boolean,
    fullWindowSize:boolean,
    ctrlPressed:boolean  
}
 
   

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
export class LeftPanel extends Component<Store,LeftPanelState>{
    newProjectAnchor:HTMLElement;
    deltaX:number;  
        
    constructor(props){  
        super(props);      
        this.deltaX = window.innerWidth/12; 
        this.state = {
            collapsed:this.props.clone ? true : false,     
            fullWindowSize:true,
            ctrlPressed:false  
        }    
    };   
    

    componentDidMount(){
        window.addEventListener("keydown", this.onCtrlBPress);
        window.addEventListener("keydown", this.onCtrlDown);
        window.addEventListener("keyup", this.onCtrlUp);
    };  
         

    componentWillUnmount(){
        window.removeEventListener("keydown", this.onCtrlBPress);
        window.removeEventListener("keydown", this.onCtrlDown); 
        window.removeEventListener("keyup", this.onCtrlUp); 
    }; 


    onCtrlDown = (e) => e.keyCode == 17 ? this.setState({ctrlPressed:true}) : null;


    onCtrlUp = (e) => e.keyCode == 17 ? this.setState({ctrlPressed:false}) : null;
    

    onCtrlBPress = (e) => {
        if(this.props.clone)
           return;

        if(e.keyCode == 66){
            if(this.state.ctrlPressed)
               this.setState({collapsed:!this.state.collapsed});
        }  
    }; 


    componentDidUpdate(){
        if(!this.props.clone){
            requestAnimationFrame(this.collapse);
        }
    }; 
     

    collapse = () => {
        if(this.props.clone)
           return; 

        let width : number = this.props.currentleftPanelWidth;
        let collapsed : boolean = this.state.collapsed;
        let leftPanelWidth : number = this.props.leftPanelWidth;
        let threshold : number = 5; 
        let factor = null;  
        
        if(width>0 && collapsed){
           factor = -this.deltaX;
        }else if(width<this.props.leftPanelWidth && !collapsed){
           factor = this.deltaX;
        } 

        let newWidth = width+factor < 0 ? 0 :
                       width+factor > leftPanelWidth ? leftPanelWidth :
                       width+factor;
 
        if(!isNil(factor)){
            this.props.dispatch({type:"currentleftPanelWidth",load:newWidth}); 
        } 
    };  
  
 
    onNewProjectClick = (e:any) => {
        let project = generateEmptyProject();
        this.props.dispatch({type:"addProject", load:project});
        this.props.dispatch({type:"selectedProjectId", load:project._id});
        this.props.dispatch({type:"openNewProjectAreaPopup", load:false});
        this.props.dispatch({type:"selectedCategory", load:"project"});
    };
 
         
    onNewAreaClick = (e:any) => {   
        let area = generateEmptyArea();
        this.props.dispatch({type:"addArea", load:area});
        this.props.dispatch({type:"selectedAreaId", load:area._id});
        this.props.dispatch({type:"openNewProjectAreaPopup", load:false}); 
        this.props.dispatch({type:"selectedCategory", load:"area"});
    };


    onResizableHandleDrag = (e,d) => {
        this.props.dispatch({
            type:"leftPanelWidth",
            load:this.props.currentleftPanelWidth+d.deltaX
        })
        this.props.dispatch({
            type:"currentleftPanelWidth",
            load:this.props.currentleftPanelWidth+d.deltaX
        }) 
    }
      

    openNewProjectAreaPopup = () => {
        if(!this.props.openNewProjectAreaPopup){
            this.props.dispatch({type:"openNewProjectAreaPopup",load:true})
        } 
    } 

  
    render(){      
        let {areas,projects,todos} = this.props; 
        let {inbox,today,hot,trash,logbook} : ItemsAmount = calculateAmount(areas,projects,todos);

        let getWidth = () => this.props.clone ? `${0}px` : `${this.props.currentleftPanelWidth}px`;
                   
        return  <div style={{display: "flex",flexDirection: "row-reverse"}}>
                <ResizableHandle onDrag={this.onResizableHandleDrag}/>  
                    <div      
                        id="leftpanel"
                        className="scroll"
                        style={{ 
                            display:"flex",    
                            flexDirection:"column", 
                            WebkitUserSelect:"none",
                            width:getWidth(), 
                            overflowX:"hidden", 
                            height:`${window.innerHeight}px`,     
                            position:"relative", 
                            backgroundColor:"rgb(248, 248, 248)"  
                        }}
                    >       
                        <div style={{
                            position:"relative", 
                            display:"flex", 
                            alignItems:"center",
                            WebkitUserSelect:"none",
                            justifyContent:"center", 
                            paddingTop:"15px" 
                        }}>   
                            <div style={{    
                                marginLeft:"15px",
                                marginRight:"15px", 
                                position:"relative",
                                width:"100%" 
                            }}>  
                                <QuickSearch {...{} as any}/>
                            </div> 
                        </div>   
                        <div>  
                            <LeftPanelMenu   
                                dragged={this.props.dragged}
                                dispatch={this.props.dispatch} 
                                selectedCategory={this.props.selectedCategory}
                                inbox={inbox} 
                                today={today} 
                                hot={hot} 
                                trash={trash}
                                logbook={logbook}
                            />    
                        </div>
                        <div   
                            id="areas"
                            style={{
                                WebkitUserSelect:"none",
                                paddingLeft: "20px",
                                paddingRight: "20px",  
                                marginBottom:"150px" 
                            }}
                        > 
                            <AreasList  
                                dragged={this.props.dragged} 
                                dispatch={this.props.dispatch}   
                                areas={this.props.areas}
                                selectedProjectId={this.props.selectedProjectId}
                                selectedAreaId={this.props.selectedAreaId}
                                selectedCategory={this.props.selectedCategory}
                                projects={this.props.projects} 
                            />
                        </div> 

                        <LeftPanelFooter 
                            width={getWidth()}
                            openNewProjectAreaPopup={this.openNewProjectAreaPopup}
                            setNewProjectAnchor={(e) => {this.newProjectAnchor=e}}
                        /> 
                       
                        <NewProjectAreaPopup   
                            anchor={this.newProjectAnchor}
                            open={this.props.openNewProjectAreaPopup}
                            close={() => this.props.dispatch({type:"openNewProjectAreaPopup",load:false})} 
                            onNewProjectClick={this.onNewProjectClick}
                            onNewAreaClick={this.onNewAreaClick}
                        />
                </div>   
                </div>   
    };    
};  
 


interface LeftPanelFooterProps{
    width:string,
    openNewProjectAreaPopup:(e:any) => void,
    setNewProjectAnchor:(e:any) => void,
}



class LeftPanelFooter extends Component<LeftPanelFooterProps,{}>{
  
    constructor(props){
        super(props); 
    }


    render(){
        return <div style={{    
            width:this.props.width,  
            display:"flex",  
            alignItems:"center",  
            position:"fixed",    
            overflowX: "hidden",
            justifyContent:"space-between",  
            bottom:"0px",   
            height:"60px",
            backgroundColor:"rgb(248, 248, 248)",
            borderTop:"1px solid rgba(100, 100, 100, 0.2)"
        }}>         

            <div  
                onClick = {this.props.openNewProjectAreaPopup}
                style={{display: "flex", padding: "5px", alignItems: "center", cursor: "pointer"}}
            >     
                <div 
                    style={{display: "flex", alignItems: "center", justifyContent: "center"}}
                    ref = {this.props.setNewProjectAnchor}
                >
                    <Plus    
                        style = {{     
                            color:"rgb(79, 79, 79)",
                            width:"25px",
                            height:"25px",
                            paddingLeft: "5px",
                            paddingRight: "5px"     
                        }}
                    />
                </div>  
                <div style={{
                    color: "rgba(100, 100, 100, 1)",
                    fontSize: "15px",
                    cursor: "pointer",
                    WebkitUserSelect: "none" 
                }}>   
                    New List 
                </div>    
            </div>   

            <div>     
                <IconButton    
                onClick = {() => {}}  
                iconStyle={{  
                    color:"rgba(100, 100, 100, 1)",
                    width:"25px", 
                    height:"25px"   
                }}>        
                    <Adjustments /> 
                </IconButton>  
            </div> 
        </div> 
    }
}


