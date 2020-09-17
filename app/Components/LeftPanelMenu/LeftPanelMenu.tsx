import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { generateEmptyProject, generateEmptyArea } from "../../utils/utils";  
import { Project, Area, Category } from '../../types';
import { ResizableHandle } from './../ResizableHandle';
import { NewProjectAreaPopup } from './NewProjectAreaPopup';
import { not, isEmpty } from 'ramda';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
// import { googleAnalytics } from '../../analytics';
import { SearchInput } from '../Search/SearchInput';
import { CategoryMenu } from './CategoryMenu';  
import { Footer } from './Footer';  
import { AreasList } from './AreasList';



interface LeftPanelMenuProps{
    dispatch:Function,
    selectedCategory:Category,
    leftPanelWidth:number,
    collapsed:boolean,
    openNewProjectAreaPopup:boolean,
    projects:Project[],
    areas:Area[], 
    sync:boolean,
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



interface LeftPanelMenuState{
    drag:boolean
}



export class LeftPanelMenu extends Component<LeftPanelMenuProps,LeftPanelMenuState>{
    anchor:HTMLElement;
    inputRef:HTMLElement;
    leftPanelRef:HTMLElement;  

    

    constructor(props){  
        super(props); 
        this.state={drag:false};  
    } 



    onError = (error) => globalErrorHandler(error);
    
    
 
    onNewProjectClick = (e:any) => {  
        let timeSeconds = Math.round( new Date().getTime() / 1000 );
        let {dispatch} = this.props;

        // googleAnalytics.send(
        //     'event', 
        //     { 
        //        ec:'ProjectCreation', 
        //        ea:`Project Created ${new Date().toString()}`, 
        //        el:`Project Created`, 
        //        ev:timeSeconds  
        //     }
        // ) 
        // .catch(err => this.onError(err)) 

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

        // googleAnalytics.send(  
        //     'event', 
        //     { 
        //        ec:'AreaCreation', 
        //        ea:`Area Created ${new Date().toString()}`, 
        //        el:'Area Created', 
        //        ev:timeSeconds 
        //     }
        // ) 
        // .catch(err => this.onError(err))  

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
      


    onStart = (e,d) => {
        this.setState({drag:true});
    };
    
    

    onStop = (e,d) => {
        this.setState({drag:false});
    };
      


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



    openSyncSettings = () => {
        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"openSettings",load:true},
                {type:"selectedSettingsSection", load:'Sync'}
            ]
        }); 
    };



    onSearchQueryChange = (e) => { 
        let {dispatch} = this.props; 
        
        if(isEmpty(e.target.value)){
            dispatch({
                type:"multiple",
                load:[{type:"searchQuery", load:""}, {type:"selectedCategory", load:"inbox"}]
            }); 
        }else{ 
            dispatch({
                type:"multiple",
                load:[{type:"searchQuery", load:e.target.value}, {type:"selectedCategory", load:"search"}]
            }); 
        }       
    };
      


    clear = () => this.props.dispatch({
        type:"multiple",
        load:[
            {type:"searchQuery", load:""}, 
            {type:"selectedCategory", load:"inbox"}
        ]
    }); 


     
    render(){ 
        return <div style={{display:"flex", flexDirection:"row-reverse", height:window.innerHeight}}> 
            { 
                not(this.props.collapsed) ? 
                <ResizableHandle 
                    onDrag={this.onResizableHandleDrag}
                    onStart={this.onStart}
                    onStop={this.onStop}
                /> 
                : 
                null 
            } 
            <div        
                id="leftpanel"
                ref={(e) => {this.leftPanelRef=e;}}  
                className="scroll" 
                style={{ 
                    WebkitUserSelect:"none", 
                    width:this.props.collapsed ? "0px" : `${this.props.leftPanelWidth}px`,
                    transition: this.state.drag ? "" : "width 0.2s ease-in-out", 
                    height:`100%`,
                    marginLeft:"-1px",
                    marginTop:"-1px",      
                    backgroundColor:"rgb(248, 248, 248)"  
                }}      
            >   
                {/* <div style={{padding:"15px", display:"none"}}> */}
                <div style={{padding:"15px", marginBottom:"20px"}}>
                {
                    this.props.collapsed ? null :
                    <SearchInput 
                        setRef={e => {this.inputRef=e;}}
                        autofocus={false} 
                        onChange={this.onSearchQueryChange} 
                        clear={this.clear} 
                        searchQuery={this.props.searchQuery}
                    />
                }
                </div>
                <CategoryMenu    
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

                <Footer  
                    sync={this.props.sync}
                    dispatch={this.props.dispatch}
                    drag={this.state.drag}
                    width={ this.props.leftPanelWidth }  
                    collapsed={ this.props.collapsed }
                    openSettings={this.openSettings}
                    openSyncSettings={this.openSyncSettings}
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
 

