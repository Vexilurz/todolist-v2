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
import { Category, Project, Area } from '../../types';
import { anyTrue, different } from '../../utils/utils';
import { uppercase } from '../../utils/uppercase';
import { ipcRenderer } from 'electron'; 
import Checked from 'material-ui/svg-icons/navigation/check';
import { Separator } from './Separator'; 


let Hot = (hot:number) : JSX.Element => 
    hot===0 ? null :
    <div style={{ 
        display: "flex", 
        alignItems: "center",
        height: "16px",
        fontSize: "14px",
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
        display: "flex", 
        alignItems: "center",
        paddingRight: "5px",   
        paddingLeft: "5px", 
        height: "16px",
        fontSize: "14px",
        fontWeight: 700,
        color:"rgba(100, 100, 100, 0.6)" 
    }}>
        {counter}
    </div> 



interface CategoryPickerItemProps{
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
   
 

interface CategoryPickerItemState{
    highlight:boolean 
}



class CategoryPickerItem extends Component<CategoryPickerItemProps,CategoryPickerItemState>{

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
        let selectedStyle = { borderRadius: "3px", backgroundColor: "rgba(196,215,247,1)" };

        let {hot,counter,showCounter} = this.props;

        let style = {    
            position:"relative",
            height: "15px",  
            display: "flex",
            margin: "3px",
            padding: "4px",
            cursor: "pointer"  
        }; 

        let selected = this.props.selected;    
        
        return <div   
            className={this.props.selected ? `` : `dropdownmenuitem`}  
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
                    fontSize: "15px",  
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
                    { 
                        !selected ? null : 
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",paddingRight:"5px"}}>
                            <Checked style={{color:"rgb(56, 115, 207)",  width:"15px", height:"15px"}}/>
                        </div> 
                    }       
                    {   isNil(hot) ? null : Hot(hot)   }  
                    { 
                        isNil(counter) || not(showCounter) ? null : 
                        isNil(hot) ? Counter(counter) :
                        Counter(counter)  
                    } 
                </div>
            } 
        </div> 
    }   
}



interface CategoryPickerProps{ 
    dragged:string, 
    dispatch:Function,
    selectedCategory:Category,
    inbox:number,
    today:number,
    hot:number,
    logbook:number,
    trash:number,
    id:number 
} 
 
  

interface CategoryPickerState{}



export class CategoryPicker extends Component<CategoryPickerProps,CategoryPickerState>{

    constructor(props){
        super(props);
    }


    
    onClick = (title:string) => () => {
        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"selectedCategory",load:title},
                {type:"showProjectMenuPopover",load:false}, 
                {type:"searchQuery",load:""},
                {type:"selectedTags",load:["All"]} 
            ]
        }); 
    }


    render(){ 
        let {dispatch} = this.props;

        return <div style={{paddingLeft:"5px",paddingRight:"5px"}}>

            <CategoryPickerItem
                onClick={this.onClick("inbox")}
                dragged={this.props.dragged}
                icon={<Inbox style={{color:"dodgerblue", width:"17px", height:"17px"}}/>}
                title={"Inbox"} 
                category={"inbox"}
                selected={this.props.selectedCategory==="inbox"}
                showCounter={true}
                counter={this.props.inbox} 
            />  

            <Separator />

            <CategoryPickerItem
                onClick={this.onClick("today")} 
                dragged={this.props.dragged}
                icon={<Star style={{color:"gold", width:"17px", height:"17px"}}/>}
                title={"Today"}
                category={"today"}
                showCounter={true}
                selected={this.props.selectedCategory==="today"}
                counter={this.props.today}
                hot={this.props.hot}
            />

            <CategoryPickerItem
                onClick={this.onClick("next")} 
                dragged={this.props.dragged}
                icon={<Layers style={{color:"darkgreen", width:"17px", height:"17px"}}/>}
                title={"Next"}
                category={"next"}
                selected={this.props.selectedCategory==="next"}
                showCounter={false}
                counter={0} 
            /> 

            <CategoryPickerItem
                onClick={this.onClick("upcoming")} 
                dragged={this.props.dragged}
                category={"upcoming"}
                icon={<Calendar style={{color:"crimson", width:"17px", height:"17px"}}/>}
                selected={this.props.selectedCategory==="upcoming"}
                title={"Upcoming"}
                showCounter={false} 
                counter={0}
            />  

            <CategoryPickerItem
                onClick={this.onClick("someday")}
                dragged={this.props.dragged}
                category={"someday"}
                icon={<BusinessCase style={{color:"burlywood", width:"17px", height:"17px"}}/>}
                title={"Someday"}
                selected={this.props.selectedCategory==="someday"}
                showCounter={false}
                counter={0} 
            /> 

            <Separator />   

            { 
                this.props.logbook===0 ? null :
                <CategoryPickerItem 
                    onClick={this.onClick("logbook")}
                    dragged={this.props.dragged}
                    icon={<Logbook style={{color:"limegreen", width:"17px", height:"17px"}}/>}
                    title={"Logbook"}
                    category={"logbook"}
                    selected={this.props.selectedCategory==="logbook"}
                    showCounter={false}
                    counter={0}
                />   
            } 

            { 
                this.props.trash===0 ? null :    
                <CategoryPickerItem
                    onClick={this.onClick("trash")}
                    dragged={this.props.dragged}
                    icon={<Trash style={{color:"darkgray", width:"17px", height:"17px"}}/>}
                    title={"Trash"}  
                    category={"trash"}
                    selected={this.props.selectedCategory==="trash"}
                    showCounter={false} 
                    counter={0}
                />
            }    

            {/*<Separator />*/}
        </div> 
    }
}    
 





