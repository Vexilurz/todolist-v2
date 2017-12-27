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
import { QuickSearch } from '../Search';


interface LeftPanelMenuItemProps{
    onClick : (e) => void, 
    icon:JSX.Element,
    title:string,
    showCounter:boolean, 
    counter:number,
    hot?:number  
}
 
 

interface LeftPanelMenuItemState{}



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
 


class Separator extends Component<{},{}>{
    render(){
        return <div style={{outline: "none", width:"100%",height:"20px"}}></div>
    }
}



interface LeftPanelMenuProps{
    dispatch:Function,
    inbox:number,
    today:number,
    hot:number
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
                paddingLeft:"10px",
                paddingRight:"10px",
                paddingTop:"50px",
                paddingBottom:"10px"  
            }}>
            <Separator />
        
            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory",load:"inbox"})}
                icon={<Inbox style={{ color:"dodgerblue" }} />}
                title={"Inbox"}
                showCounter={true}
                counter={this.props.inbox}
            />  

            <Separator />

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory",load:"today"})} 
                icon={<Star style={{color:"gold"}}/>}
                title={"Today"}
                showCounter={true}
                counter={this.props.today}
                hot={this.props.hot}
            /> 

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory",load:"upcoming"})}
                icon={<Calendar style={{color:"crimson"}}/>}
                title={"Upcoming"}
                showCounter={false}
                counter={0}
            /> 

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory", load:"next"})} 
                icon={<Layers style={{color:"darkgreen"}}/>}
                title={"Next"}
                showCounter={false}
                counter={0}
            /> 

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory", load:"someday"})} 
                icon={<BusinessCase style={{color:"burlywood"}}/>}
                title={"Someday"}
                showCounter={false}
                counter={0}
            /> 

            <Separator />    

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory",load:"logbook"})} 
                icon={<Logbook style={{color:"limegreen"}}/>}
                title={"Logbook"}
                showCounter={false}
                counter={0}
            />  

            <LeftPanelMenuItem
                onClick={() => this.props.dispatch({type:"selectedCategory",load:"trash"})} 
                icon={<Trash style={{color:"darkgray"}}/>}
                title={"Trash"}  
                showCounter={false} 
                counter={0}
            />  

            <Separator /> 
            </div>
        </div>     
    }

}  





