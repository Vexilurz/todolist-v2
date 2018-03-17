import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import Star from 'material-ui/svg-icons/toggle/star';
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Layers from 'material-ui/svg-icons/maps/layers';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Trash from 'material-ui/svg-icons/action/delete';
import Calendar from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import { merge, isNil, not } from 'ramda';
import { Category } from '../MainContainer';
import { assert } from '../../utils/assert';
import { isNotNil, anyTrue } from '../../utils/utils';


let Hot = (hot:number) : JSX.Element => 
    hot===0 ? null :
    <div style={{ 
        display: "flex", 
        alignItems: "center",
        height: "18px",
        width: "auto",
        borderRadius: "10px", 
        backgroundColor: "rgb(239, 80, 120)",
        color: "white"
    }}>   
        <div style={{
            paddingTop:"2px",
            paddingBottom:"2px", 
            paddingLeft:"5px",
            paddingRight:"5px",
            width: "100%",  
            textAlign: "center"  
        }}>
            {hot}
        </div>
    </div> 


let Counter = (counter:number) : JSX.Element =>
    counter===0 ? null :    
    <div style={{
        height: "100%",
        display: "flex", 
        alignItems: "center",
        paddingRight: "5px",   
        paddingLeft: "5px", 
        fontWeight: 700,
        color:"rgba(100, 100, 100, 0.6)" 
    }}>
        {counter}
    </div> 


interface LeftPanelMenuItemProps{
    onClick : (e) => void, 
    icon:JSX.Element,
    dragged:string, 
    selected:boolean,
    category:Category, 
    title:string,
    showCounter:boolean, 
    counter?:number,
    hot?:number  
}
   
 

interface LeftPanelMenuItemState{
    highlight:boolean 
}



class LeftPanelMenuItem extends Component<LeftPanelMenuItemProps,LeftPanelMenuItemState>{

    constructor(props){
        super(props);
        this.state = {highlight:false};
    } 


    onMouseOver = (e) => {
        let {dragged, category} = this.props;

        if(e.buttons == 1 || e.buttons == 3){

            if(category==="upcoming"){
               return
            }
 
            if(
                (dragged==="todo" || dragged==="heading") || 
                (dragged==="project" && category==="trash")
            ){   

                this.setState({highlight:true}); 
            }
        }   
    }


    onMouseLeave = (e) => {  
        if(this.state.highlight){
           this.setState({highlight:false})
        }
    }


    render(){  

        let selectedStyle = { borderRadius: "5px", backgroundColor: "rgba(228,230,233,1)" };

        let {hot,counter,showCounter} = this.props;

        let style = {    
            position: "relative" as "relative",
            height: "25px",  
            borderRadius: !this.state.highlight ? "0px" : "5px", 
            backgroundColor: !this.state.highlight ? "" : 
                              this.props.category==="trash" ? "rgba(200,0,0,0.3)" : 
                              "rgba(0,200,0,0.3)", 
            display: "flex",
            padding: "5px",  
            cursor: "pointer"  
        }; 

        let selected = this.props.selected;    
        
        if(isNotNil(hot) && isNotNil(counter)){
           assert((counter-hot)>=0,`incorrect values counter : ${counter}; hot : ${hot};`);
        }   

        return <div   
            onMouseMove={this.onMouseOver} 
            onMouseOut={this.onMouseLeave}    
            className={this.props.selected ? `` : `leftpanelmenuitem`}  
            onClick={this.props.onClick}   
            id={this.props.category}    
            style={selected ? merge(style,selectedStyle) : style}
        >      
            <div style={{display:"flex"}}>    
                <div style={{    
                    paddingRight:"5px",
                    display:"flex", 
                    alignItems:"center",
                    WebkitUserSelect:"none"  
                }}>
                    {this.props.icon}
                </div>  
                <div style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 500,
                    fontSize: "18px",  
                    color: "rgba(10, 10, 10, 0.9)", 
                    WebkitUserSelect:"none"   
                }}>     
                    {this.props.title}
                </div>
            </div> 
            {   
                isNil(hot) && isNil(counter) ? null :
                <div style={{
                  display:"flex",
                  alignItems:"center",
                  flexGrow:1,
                  justifyContent:"flex-end"
                }}>         
                    { isNil(hot) ? null : Hot(hot) }  
                    { 
                        isNil(counter) || not(showCounter) ? null : 
                        isNil(hot) ? Counter(counter) :
                        Counter(counter-hot)  
                    } 
                </div>
            } 
        </div> 
    }   
}


export class Separator extends Component<{},{}>{
    render(){ 
        return <div style={{outline:"none",position:"relative",width:"100%",height:"10px"}}></div>
    } 
}


interface LeftPanelMenuProps{ 
    dragged:string, 
    dispatch:Function,
    selectedCategory:Category,
    inbox:number,
    today:number,
    hot:number,
    logbook:number,
    trash:number 
} 
 
  

interface LeftPanelMenuState{}



export class LeftPanelMenu extends Component<LeftPanelMenuProps,LeftPanelMenuState>{

    constructor(props){
        super(props);
    }

/*
    shouldComponentUpdate(nextProps:LeftPanelMenuProps){
        let {
            dragged, dispatch, selectedCategory,
            inbox, today, hot,
            logbook, trash 
        } = nextProps;


        let draggedChanged =  dragged!==this.props.dragged;
        let selectedCategoryChanged =  selectedCategory!==this.props.selectedCategory
        let inboxChanged =  inbox!==this.props.inbox
        let todayChanged =  today!==this.props.today
        let hotChanged =  hot!==this.props.hot
        let logbookChanged =  logbook!==this.props.logbook
        let trashChanged =  trash!==this.props.trash
  

        return anyTrue([
            draggedChanged,
            selectedCategoryChanged,
            inboxChanged,
            todayChanged,
            hotChanged,
            logbookChanged,
            trashChanged 
        ]);
    }
*/  

    render(){ 
        let {dispatch} = this.props;

        return <div style={{paddingLeft:"15px",paddingRight:"15px"}}>

            <Separator />

            <LeftPanelMenuItem
                onClick={() => {
                    dispatch({type:"selectedCategory", load:"inbox"});
                    dispatch({type:"searchQuery", load:""});
                    dispatch({type:"selectedTag", load:"All"});
                }}
                dragged={this.props.dragged}
                icon={<Inbox style={{color:"dodgerblue"}}/>}
                title={"Inbox"} 
                category={"inbox"}
                selected={this.props.selectedCategory==="inbox"}
                showCounter={true}
                counter={this.props.inbox} 
            />  

            <Separator />

            <LeftPanelMenuItem
                onClick={() => {
                    dispatch({type:"selectedCategory", load:"today"});
                    dispatch({type:"searchQuery", load:""});
                    dispatch({type:"selectedTag", load:"All"});
                }} 
                dragged={this.props.dragged}
                icon={<Star style={{color:"gold"}}/>}
                title={"Today"}
                category={"today"}
                showCounter={true}
                selected={this.props.selectedCategory==="today"}
                counter={this.props.today}
                hot={this.props.hot}
            />

            <LeftPanelMenuItem
                onClick={() => {
                    dispatch({type:"selectedCategory", load:"next"});
                    dispatch({type:"searchQuery", load:""});
                    dispatch({type:"selectedTag", load:"All"});
                }} 
                dragged={this.props.dragged}
                icon={<Layers style={{color:"darkgreen"}}/>}
                title={"Next"}
                category={"next"}
                selected={this.props.selectedCategory==="next"}
                showCounter={false}
                counter={0} 
            /> 

            <LeftPanelMenuItem
                onClick={() => {
                    dispatch({type:"selectedCategory", load:"upcoming"});
                    dispatch({type:"searchQuery", load:""});
                    dispatch({type:"selectedTag", load:"All"}); 
                }}
                dragged={this.props.dragged}
                category={"upcoming"}
                icon={<Calendar style={{color:"crimson"}}/>}
                selected={this.props.selectedCategory==="upcoming"}
                title={"Upcoming"}
                showCounter={false} 
                counter={0}
            />  

            <LeftPanelMenuItem
                onClick={() => {
                    dispatch({type:"selectedCategory", load:"someday"});
                    dispatch({type:"searchQuery", load:""});
                    dispatch({type:"selectedTag", load:"All"}); 
                }} 
                dragged={this.props.dragged}
                category={"someday"}
                icon={<BusinessCase style={{color:"burlywood"}}/>}
                title={"Someday"}
                selected={this.props.selectedCategory==="someday"}
                showCounter={false}
                counter={0} 
            /> 

            <Separator />   

            { 
                this.props.logbook===0 ? null :
                <LeftPanelMenuItem 
                    onClick={() => {
                        dispatch({type:"selectedCategory", load:"logbook"});
                        dispatch({type:"searchQuery", load:""});
                        dispatch({type:"selectedTag", load:"All"});
                    }}   
                    dragged={this.props.dragged}
                    icon={<Logbook style={{color:"limegreen"}}/>}
                    title={"Logbook"}
                    category={"logbook"}
                    selected={this.props.selectedCategory==="logbook"}
                    showCounter={false}
                    counter={0}
                />   
            } 

            { 
                this.props.trash===0 ? null :    
                <LeftPanelMenuItem
                    onClick={() => {
                        dispatch({type:"selectedCategory", load:"trash"});
                        dispatch({type:"searchQuery", load:""});
                        dispatch({type:"selectedTag", load:"All"});
                    }}  
                    dragged={this.props.dragged}
                    icon={<Trash style={{color:"darkgray"}}/>}
                    title={"Trash"}  
                    category={"trash"}
                    selected={this.props.selectedCategory==="trash"}
                    showCounter={false} 
                    counter={0}
                />
            }    
        </div> 
    }
}  
 
 



