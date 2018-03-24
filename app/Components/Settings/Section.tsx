import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 


interface SectionProps{
    onClick:() => void,
    icon:JSX.Element,
    name:string,
    selected:boolean
}


export class Section extends Component<SectionProps,{}>{

    render(){
        let {icon, name, onClick, selected} = this.props;
          
        return <div  
            className={selected ? "" : "settingsSection"}
            onClick={() => onClick()}
            style={{
                paddingTop:"4px",
                paddingBottom:"4px",
                paddingLeft:"8px",
                paddingRight:"8px",
                borderRadius:"5px",
                display:'flex',  
                backgroundColor:selected ? "rgba(100,100,100,0.1)" : '',
                alignItems:"center", 
                justifyContent:"center", 
                cursor:"pointer"  
            }}
        >
            <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}> 
                {icon}
            </div>
            <div style={{
                color:"black", 
                whiteSpace:"nowrap", 
                display:"flex", 
                alignItems:"center", 
                justifyContent:"center",
                textAlign:"center", 
                paddingLeft:"2px"
            }}>   
                {name}  
            </div>
        </div>
    }   
};
