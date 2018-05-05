import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconMenu from 'material-ui/IconMenu'; 
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { Spinner } from '../Spinner';
import { 
    attachDispatchToProps, generateEmptyProject, generateEmptyArea, 
    byNotCompleted, byNotDeleted, byTags, byCategory, byCompleted, 
    byDeleted, byAttachedToProject, isTodayOrPast, isDeadlineTodayOrPast, 
    anyTrue
} from "../../utils/utils";  
import { ipcRenderer } from 'electron';
import Adjustments from 'material-ui/svg-icons/image/tune';
import Plus from 'material-ui/svg-icons/content/add';  
import { Todo, Project, Area, Category, Store } from '../../types';
import { AreasList } from './../Area/AreasList';
import { ResizableHandle } from './../ResizableHandle';
import { LeftPanelMenu } from './LeftPanelMenu';
import { NewProjectAreaPopup } from './NewProjectAreaPopup';
import { allPass, isNil, not, flatten, contains } from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { SearchInput } from '../Search';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { googleAnalytics } from '../../analytics';
import { isArrayOfStrings, isString } from '../../utils/isSomething';
import { isDev } from '../../utils/isDev';
 

interface LeftPanelProps{
    dispatch:Function,
    selectedCategory:Category,
    leftPanelWidth:number,
    openNewProjectAreaPopup:boolean,
    projects:Project[],
    areas:Area[], 
    amounts:{
        inbox:number,
        today:number,
        hot:number,
        next:number,
        someday:number,
        logbook:number,
        trash:number
    },
    indicators : { 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    searchQuery:string, 
    dragged:string, 
    selectedProjectId:string,
    selectedAreaId:string,
    id:number 
}


interface LeftPanelState{ collapsed:boolean }


export class LeftPanel extends Component<LeftPanelProps,LeftPanelState>{
    anchor:HTMLElement;
    subscriptions:Subscription[];
    leftPanelRef:HTMLElement;  

    constructor(props){  
        super(props);   
        this.subscriptions = [];    
        this.state = { collapsed:false };      
    } 


    onError = (error) => globalErrorHandler(error);
    

    initCtrlB = () => {
        this.subscriptions.push(
            Observable
            .fromEvent(ipcRenderer, "toggle", (event) => event)
            .subscribe(() => {
                this.setState({collapsed:!this.state.collapsed})
            })
        ); 
    }; 
    
     
    componentDidMount(){ 
        this.initCtrlB(); 
    }  
         

    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    } 


 
    onNewProjectClick = (e:any) => {  
        let timeSeconds = Math.round( new Date().getTime() / 1000 );
        let {dispatch} = this.props;

        googleAnalytics.send(
            'event', 
            { 
               ec:'ProjectCreation', 
               ea:`Project Created ${new Date().toString()}`, 
               el:`Project Created`, 
               ev:timeSeconds  
            }
        ) 
        .catch(err => this.onError(err)) 

        let project = generateEmptyProject();

        dispatch({
            type:"multiple",
            load:[
                {type:"addProject", load:project},
                {type:"selectedProjectId", load:project._id},
                {type:"openNewProjectAreaPopup", load:false},
                {type:"selectedCategory", load:"project"}
            ]
        }); 
    };   
 

         
    onNewAreaClick = (e:any) => {    
        let timeSeconds = Math.round( new Date().getTime() / 1000 );
        let {dispatch} = this.props;

        googleAnalytics.send(  
            'event', 
            { 
               ec:'AreaCreation', 
               ea:`Area Created ${new Date().toString()}`, 
               el:'Area Created', 
               ev:timeSeconds 
            }
        ) 
        .catch(err => this.onError(err))  

        let area = generateEmptyArea();

        dispatch({
            type:"multiple",
            load:[
                {type:"addArea", load:area},
                {type:"selectedAreaId", load:area._id},
                {type:"openNewProjectAreaPopup", load:false},
                {type:"selectedCategory", load:"area"}
            ]
        }); 
    }; 



    onResizableHandleDrag = (e,d) => this.props.dispatch({
        type:"leftPanelWidth",
        load:this.props.leftPanelWidth+d.deltaX
    });
      


    openNewProjectAreaPopup = () => {
        let {openNewProjectAreaPopup,dispatch} = this.props;
        if(not(openNewProjectAreaPopup)){
           dispatch({type:"openNewProjectAreaPopup",load:true})
        } 
    };



    openSettings = (e) => {  
        e.stopPropagation();  
        this.props.dispatch({type:"openSettings",load:true}); 
    };


     
    render(){      
        return <div style={{display:"flex",flexDirection:"row-reverse",height:window.innerHeight}}> 

            { not(this.state.collapsed) ? <ResizableHandle onDrag={this.onResizableHandleDrag}/> : null } 

            <div        
                id="leftpanel"
                ref={(e) => {this.leftPanelRef=e;}} 
                className="scroll"
                style={{ 
                    WebkitUserSelect:"none", 
                    transition: "width 0.2s ease-in-out", 
                    width:this.state.collapsed ? "0px" : `${this.props.leftPanelWidth}px`,
                    height:`100%`,      
                    backgroundColor:"rgb(248, 248, 248)"  
                }}      
            >   

                <SearchInput dispatch={this.props.dispatch} searchQuery={this.props.searchQuery}/>

                <LeftPanelMenu    
                    dragged={this.props.dragged}
                    dispatch={this.props.dispatch} 
                    selectedCategory={this.props.selectedCategory}
                    inbox={this.props.amounts.inbox} 
                    today={this.props.amounts.today} 
                    hot={this.props.amounts.hot} 
                    trash={this.props.amounts.trash}
                    logbook={this.props.amounts.logbook} 
                    id={this.props.id}
                />   

                <AreasList   
                    leftPanelWidth={this.props.leftPanelWidth}
                    leftPanelRef={this.leftPanelRef} 
                    dragged={this.props.dragged}  
                    dispatch={this.props.dispatch}   
                    indicators={this.props.indicators}
                    areas={this.props.areas}
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId}
                    selectedCategory={this.props.selectedCategory}
                    projects={this.props.projects}  
                    id={this.props.id}
                />

                <LeftPanelFooter  
                    width={ this.props.leftPanelWidth }  
                    collapsed={ this.state.collapsed }
                    openSettings={this.openSettings}
                    openNewProjectAreaPopup={ this.openNewProjectAreaPopup }
                    setNewProjectAnchor={(e) => {this.anchor=e}}  
                /> 

                <NewProjectAreaPopup   
                    anchor={this.anchor}
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
    width:number,
    collapsed:boolean,
    openNewProjectAreaPopup:(e:any) => void,
    setNewProjectAnchor:(e:any) => void,
    openSettings:(e:any) => void 
}



class LeftPanelFooter extends Component<LeftPanelFooterProps,{}>{
  
    constructor(props){
        super(props); 
    }



    shouldComponentUpdate(nextProps:LeftPanelFooterProps){
        return nextProps.width!==this.props.width || 
               nextProps.collapsed!==this.props.collapsed;
    }
 

    
    render(){ 
        let { collapsed, openSettings, openNewProjectAreaPopup, width, setNewProjectAnchor } = this.props; 

        return <div style={{    
            transition: "width 0.2s ease-in-out", 
            width:collapsed ? "0px" : `${width}px`,
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
                onClick={openNewProjectAreaPopup}
                style={{
                    display:"flex",
                    paddingLeft:"10px",
                    alignItems:"center",
                    cursor:"pointer"
                }}
            >     
                <div 
                    style={{
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center"}}
                    ref={setNewProjectAnchor}
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
            </div>   
            <div> <Spinner /> </div>            
            <div style={{
                display:"flex", 
                paddingRight:"10px", 
                alignItems:"center", 
                cursor:"pointer"
            }}>     
                <IconButton    
                onClick = {(e) => openSettings(e)}  
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
};


