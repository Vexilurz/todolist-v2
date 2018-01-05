import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
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
import { QuickSearch } from '../Search';
import { merge } from 'ramda';
import { Category } from '../MainContainer';


interface LeftPanelMenuItemProps{
    onClick : (e) => void, 
    icon:JSX.Element,
    dragged:string, 
    selected:boolean,
    category:Category, 
    title:string,
    showCounter:boolean, 
    counter:number,
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
        if(e.buttons == 1 || e.buttons == 3){

            if(this.props.category==="upcoming"){
               return
            }
 
            if(
                this.props.dragged==="todo" ||
                (
                    this.props.dragged==="project" && 
                    this.props.category==="trash"
                ) 
            ){ 
                this.setState({highlight:true}) 
            }
        }   
    }


    onMouseOut = (e) => {  
        if(this.state.highlight){
           this.setState({highlight:false})
        }
    }


    render(){  

        let selectedStyle = { borderRadius: "5px", backgroundColor: "rgba(228,230,233,1)" };

        let style = {    
            justifyContent: "space-between" as any,
            display: "flex",
            height: "25px",  
            borderRadius: !this.state.highlight ? "0px" : "5px", 
            backgroundColor: !this.state.highlight ? "" : 
                              this.props.category==="trash" ? "rgba(200,0,0,0.3)" : 
                              "rgba(0,200,0,0.3)", 
            alignItems: "center" as any, 
            padding: "5px",  
            cursor: "pointer"  
        }; 

        let selected = this.props.selected;   

        return <div  
            onMouseOver={this.onMouseOver} 
            onMouseOut={this.onMouseOut}  
            className={this.props.selected ? `` : `leftpanelmenuitem`}  
            onClick={this.props.onClick}  
            id={this.props.category}    
            style={selected ? merge(style,selectedStyle) : style}
        >     
            <div  
                style={{         
                    display:"flex",
                    alignItems:"center", 
                    height:"100%"
                }}
            >   
                <div style={{  
                    paddingRight:"5px",
                    height:"100%", 
                    display:"flex", 
                    alignItems:"center",
                    WebkitUserSelect:"none"  
                }}>
                    {this.props.icon}
                </div>  
                <div style={{    
                    position: "relative",
                    height: "100%",
                    width: "0px"
                }}>
                    <div style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        transform: "scale(0.3, 0.3)",
                        fontWeight: 500,
                        fontSize: "53px",  
                        color: "rgba(10, 10, 10, 0.9)", 
                        WebkitUserSelect:"none"   
                    }}>     
                        {this.props.title}
                    </div>
                </div>
            </div>

            {   
                !this.props.hot && !this.props.counter ? null :
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>    
                {
                    !this.props.hot ? null : 
                    <div style={{ 
                        display: "flex", 
                        alignItems: "center",
                        height: "18px",
                        width: "25px",
                        borderRadius: "10px", 
                        backgroundColor: "rgb(239, 80, 120)",
                        color: "white"
                    }}>   
                        <div style={{
                            padding: "2px",
                            width: "100%",
                            textAlign: "center"  
                        }}>
                            {this.props.hot}
                        </div>
                    </div> 
                }    

                {   
                    !this.props.showCounter ? null : 
                    <div style={{
                        height: "100%",
                        display: "flex", 
                        alignItems: "center",
                        paddingRight: "5px", 
                        paddingLeft: "5px", 
                        fontWeight: 700,
                        color:"rgba(100, 100, 100, 0.6)" 
                    }}>
                        {this.props.counter}
                    </div>
                }
                </div> 
            } 
        </div> 
    }
}
 


export class Separator extends Component<{},{}>{
    render(){
        return <div style={{outline: "none", width:"100%",height:"20px"}}></div>
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
    

    render(){ 

        return <div style={{
            display:"flex",
            flexDirection:"column",
            width:"100%"
        }}>
            <div style={{ 
                paddingLeft:"15px", 
                paddingRight:"15px",
                paddingTop:"50px",
                paddingBottom:"10px"  
            }}>
 
            <Separator />
        
            <LeftPanelMenuItem
                onClick={() => {
                    this.props.dispatch({type:"selectedCategory", load:"inbox"});
                    this.props.dispatch({type:"selectedTag", load:"All"});
                }}
                dragged={this.props.dragged}
                icon={<Inbox style={{ color:"dodgerblue" }} />}
                title={"Inbox"}
                category={"inbox"}
                selected={this.props.selectedCategory==="inbox"}
                showCounter={true}
                counter={this.props.inbox} 
            />  
 
            <Separator />

            <LeftPanelMenuItem
                onClick={() => {
                    this.props.dispatch({type:"selectedCategory", load:"today"});
                    this.props.dispatch({type:"selectedTag", load:"All"});
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
                    this.props.dispatch({type:"selectedCategory", load:"next"});
                    this.props.dispatch({type:"selectedTag", load:"All"});
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
                    this.props.dispatch({type:"selectedCategory", load:"upcoming"});
                    this.props.dispatch({type:"selectedTag", load:"All"}); 
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
                    this.props.dispatch({type:"selectedCategory", load:"someday"});
                    this.props.dispatch({type:"selectedTag", load:"All"}); 
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
                        this.props.dispatch({type:"selectedCategory", load:"logbook"});
                        this.props.dispatch({type:"selectedTag", load:"All"});
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
                        this.props.dispatch({type:"selectedCategory", load:"trash"});
                        this.props.dispatch({type:"selectedTag", load:"All"});
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
        </div>     
    }
}  
 
 



