import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
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


interface LeftPanelMenuItemProps{
    onClick : (e) => void, 
    icon:JSX.Element,
    title:string,
    counter:number  
}



interface LeftPanelMenuItemState{

}


class LeftPanelMenuItem extends Component<LeftPanelMenuItemProps,LeftPanelMenuItemState>{

    constructor(props){

        super(props);

    }


    render(){ 

        return <div
            className="no-drag leftpanelmenuitem"  
            onClick={this.props.onClick} 
            style={{    
                justifyContent: "space-between",
                display: "flex",
                height: "25px",
                alignItems: "center",
                padding: "5px",
                cursor: "pointer" 
            }}
        >     
            <div style={{   
                display:"flex",
                alignItems:"center", 
                height:"100%"
            }}>  
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
                    height:"100%",  
                    display:"flex",
                    alignItems:"center",
                    WebkitUserSelect:"none"   
                }}> 
                    {this.props.title}
                </div>
            </div>

            <div style={{
                height: "100%",
                display: "flex", 
                alignItems: "center",
                paddingRight: "5px", 
                fontWeight: 700,
                color:"rgba(100, 100, 100, 0.6)" 
            }}>
                {this.props.counter}
            </div>
        </div> 
        
    }
 
}



class Separator extends Component<{},{}>{
    render(){
        return <div style={{outline: "none", width:"100%",height:"10px"}}></div>
    }
}



interface LeftPanelMenuProps{
    dispatch:Function,
    inbox:number,
    today:number,
    upcoming:number,
    anytime:number,
    someday:number,
    logbook:number,
    trash:number 
} 
 


interface LeftPanelMenuState{

}



export class LeftPanelMenu extends Component<LeftPanelMenuProps,LeftPanelMenuState>{

    constructor(props){

        super(props);

    }


    render(){

        
 
        return <div style={{
            display:"flex",
            flexDirection:"column",
            marginTop: "25px", 
            width:"95%", 
            padding:"10px"
        }}>

            <Separator />
        
            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory",load:"inbox"})}
                icon={<Inbox style={{ color:"dodgerblue" }} />}
                title={"Inbox"}
                counter={this.props.inbox}
            /> 

            <Separator />

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory",load:"today"})} 
                icon={<Star style={{color:"gold"}}/>}
                title={"Today"}
                counter={this.props.today}
            /> 

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory",load:"upcoming"})}
                icon={<Calendar style={{color:"crimson"}}/>}
                title={"Upcoming"}
                counter={this.props.upcoming}
            /> 

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory", load:"anytime"})} 
                icon={<Layers style={{color:"darkgreen"}}/>}
                title={"Anytime"}
                counter={this.props.anytime}
            /> 

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory", load:"someday"})} 
                icon={<BusinessCase style={{color:"burlywood"}}/>}
                title={"Someday"}
                counter={this.props.someday}
            /> 

            <Separator />    

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory",load:"logbook"})} 
                icon={<Logbook style={{color:"limegreen"}}/>}
                title={"Logbook"}
                counter={this.props.logbook}
            /> 

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory",load:"trash"})} 
                icon={<Trash style={{color:"darkgray"}}/>}
                title={"Trash"}
                counter={this.props.trash}
            /> 

            <Separator /> 

        </div>     
    }

}  





