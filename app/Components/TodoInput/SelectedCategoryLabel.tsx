import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button'; 
import { Footer } from '../../Components/Footer';
import { Tags } from '../../Components/Tags';
import { Transition } from 'react-transition-group';
import { Category } from '../MainContainer';
import { TodosList } from '../../Components/TodosList';
import Star from 'material-ui/svg-icons/toggle/star';
import Plus from 'material-ui/svg-icons/content/add';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Chip from 'material-ui/Chip';
import BusinessCase from 'material-ui/svg-icons/places/business-center';  



interface SelectedCategoryLabelProps{
    onRemove:Function,
    selectedCategory:string
}

interface SelectedCategoryLabelState{ 
    
}

  

export class SelectedCategoryLabel extends Component<SelectedCategoryLabelProps,SelectedCategoryLabelState>{

    constructor(props){
        super(props);
    }


    selectLabel = (selectedCategory:string) => {

        let containerStyle : any = {
            display: "flex",
            alignItems: "center",
            color: "rgba(0,0,0,0.7)",
            fontWeight: "bold",
            cursor: "default",
            marginLeft: "20px",
            marginRight: "20px",
            userSelect: "none"
        };

        switch(selectedCategory){

            case "today":
                return <div style={containerStyle}>
                            <Star style={{
                                color:"gold", 
                                height: "25px",
                                width: "25px",
                                cursor:"default" 
                            }}/> 
                            <div style={{marginLeft:"15px"}}>Today</div>
                        </div>
        


 
        
            case "evening":        
                return <div style={containerStyle}>
                            <Moon style={{ 
                                transform:"rotate(145deg)", 
                                color:"rgb(192,192,192)", 
                                height: "25px",
                                width: "25px",
                                cursor:"default" 
                            }}/>
                            <div style={{marginLeft:"15px"}}>This Evening</div>
                        </div>
        
        


            case "someday":
                return <div style={containerStyle}>
                            <BusinessCase style={{  
                                color:"burlywood", 
                                height: "25px",
                                width: "25px",
                                cursor:"default"  
                            }}/>
                            <div style={{marginLeft:"15px"}}>Someday</div>
                        </div>


 
        }
 

        return null

    }



 
    render(){
        return <Chip
            onRequestDelete={this.props.onRemove}
            onClick={(e) => {}}
            style={{
                backgroundColor:"",
                background:"",
                transform:"scale(0.9,0.9)" 
            }}
        >
            { this.selectLabel(this.props.selectedCategory) }
        </Chip>
    }
 
}

