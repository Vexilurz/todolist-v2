import 'react-tippy/dist/tippy.css'
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
import Star from 'material-ui/svg-icons/toggle/star';
import BusinessCase from 'material-ui/svg-icons/content/archive';
import { getMonthName, different } from '../../utils/utils'; 
import { Category } from '../../types';
import { isNil } from 'ramda';
import { isDate, isNotNil, isToday } from '../../utils/isSomething';
import 'draft-js/dist/Draft.css';



interface DueDateProps{
    date:Date,
    selectedCategory:Category,
    onClick:Function,
    category:Category,
    completed:Date,
    showDueDate?:boolean
}



export class DueDate extends Component<DueDateProps,{}>{
    constructor(props){
        super(props); 
    }



    shouldComponentUpdate(nextProps:DueDateProps){
        return  different(nextProps.date,this.props.date) ||
                different(nextProps.completed,this.props.completed) ||
                nextProps.selectedCategory!==this.props.selectedCategory ||
                nextProps.category!==this.props.category;
    };



    getContent = () : JSX.Element => {
        let containerStyle= {  
            backgroundColor:"rgb(235, 235, 235)",
            cursor:"default", 
            WebkitUserSelect:"none", 
            display:"flex",
            alignItems:"center",  
            justifyContent:"center", 
            paddingLeft:"5px",
            paddingRight:"5px", 
            borderRadius:"15px",
            color:"rgb(100,100,100)",
            fontWeight:"bold",
            height:"15px" 
        } as any;
 
        let style = {    
            width:18,  
            height:18, 
            marginLeft:"3px",
            color:"gold", 
            cursor:"default", 
            marginRight:"5px" 
        };

        let {date,category,selectedCategory,completed,showDueDate} = this.props;

        let showSomeday : boolean = selectedCategory!=="someday" && category==="someday";


        if(isNil(completed) && showSomeday){
            return <div style={{height:"18px",marginTop:"-2px"}}>
                <BusinessCase style={{...style,color:"burlywood"}}/>
            </div>;

        //if has date and not completed    
        }else if(
            (showDueDate && isDate(date))  
            ||
            (
                isNotNil(date) && isNil(completed) &&
                (
                    selectedCategory==="next" ||
                    selectedCategory==="someday" ||
                    selectedCategory==="trash" ||
                    selectedCategory==="project" ||
                    selectedCategory==="area" ||
                    selectedCategory==="search" 
                ) 
            )
        ){

            let month = getMonthName(date); 
            let day = date.getDate();  

            return isToday(date) ? 
            <div style={{height:"18px",marginTop:"-2px"}}> 
                <Star style={{...style,color:"gold"}}/> 
            </div> 
            :
            <div style={{paddingRight:"5px",minWidth:"70px"}}>
                <div style={containerStyle}>     
                    <div style={{display:"flex",padding:"5px",alignItems:"center",fontSize:"11px"}}>      
                        <div style={{paddingRight:"5px"}}>{month.slice(0,3)+'.'}</div>  
                        <div>{day}</div>
                    </div> 
                </div>
            </div>; 
 
        //if completed    
        }else if(isNotNil(completed) && ( selectedCategory==="logbook" || selectedCategory==="search" )){ 
            let month = getMonthName(completed);
            let day = completed.getDate(); 

            return <div style={{paddingRight:"5px",minWidth:"70px"}}> 
                <div style={{
                    backgroundColor:"rgba(0,0,0,0)",
                    cursor:"default", 
                    WebkitUserSelect:"none", 
                    display:"flex",
                    paddingLeft:"5px", 
                    paddingRight:"5px", 
                    borderRadius:"15px",
                    color:"rgb(0, 60, 250)",
                    fontWeight:"bold",
                    height:"15px" 
                }}>      
                    <div style={{display:"flex",alignItems:"center",fontSize:"12px"}}>      
                        {
                            isToday(completed) ? 
                            <div style={{display:"flex",padding:"5px",alignItems:"center",fontSize:"12px"}}>Today</div> :  
                            <div style={{display:"flex",padding:"5px",alignItems:"center",fontSize:"12px"}}>    
                                <div style={{paddingRight:"5px"}}>{month.slice(0,3)+'.'}</div>  
                                <div>{day}</div>
                            </div>
                        }   
                    </div>  
                </div> 
            </div>;
        }else{
            return null;
        }
    };



    render(){   
        let content = this.getContent();
        
        return isNil(content) ? null :
        <div onClick = {(e) => {
            e.stopPropagation(); 
            e.nativeEvent.stopImmediatePropagation();
            this.props.onClick(e);
        }}>
            {content}
        </div>
    }
};