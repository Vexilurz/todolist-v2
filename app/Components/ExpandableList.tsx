import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';   
import { Component } from "react";  
import { not } from 'ramda';


interface ExpandableListProps{
    showAll?:boolean,
    minLength:number,
    buttonOffset:number,
    type:string   
} 
 


interface ExpandableListState{
    expanded:boolean
}   


 
export class ExpandableList extends Component<ExpandableListProps,ExpandableListState>{

    constructor(props){
        super(props);
        this.state={
            expanded:false
        };
    } 



    onToggle = () => this.setState({expanded:!this.state.expanded})



    render(){ 
        let { minLength, showAll, buttonOffset } = this.props;
        let { expanded } = this.state;
        let maxLength = React.Children.count(this.props.children);
        let length = expanded || showAll ? maxLength : minLength;
        let children = React.Children.toArray(this.props.children);

        
        return <div>          
                {
                    children.slice(0,length)
                }
                {   
                    showAll ? null :
                    (maxLength-minLength) <= 0 ? null :
                    <div style={{cursor: "pointer", height: "30px", paddingLeft:`${buttonOffset}px`}}>
                        {   
                            <div     
                                onClick={this.onToggle}
                                style={{
                                    width:"100%",
                                    height:"30px",
                                    fontSize:"14px",
                                    display:"flex",
                                    alignItems:"center",
                                    cursor:"pointer",  
                                    color:"rgba(100, 100, 100, 0.6)"
                                }}
                            >     
                                { 
                                    not(expanded) ? 
                                    `Show ${ maxLength-minLength } more ${this.props.type}` :
                                    `Hide` 
                                } 
                            </div>
                        }
                    </div>
                }
            </div>
    }
} 