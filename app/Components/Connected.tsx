// import Refresh from 'material-ui/svg-icons/navigation/refresh';
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { getMonthName } from '../utils/utils';
import { timeOfTheDay } from '../utils/time';
import { isToday, isNotDate } from '../utils/isSomething';
import { logout } from '../utils/logout';


interface ConnectedSectionProps{
    offset:number,
    name:string,
    value:string
}



let ConnectedSection = ({offset,name,value}:ConnectedSectionProps) : JSX.Element =>
    <div style={{display:"flex"}}>
        <div style={{ 
            fontSize:"16px",
            fontWeight:500,
            color:"rgba(100,100,100,1)",
            cursor:"default"   
        }}>
            {name}:
        </div>
        <div style={{ 
            fontSize:"15px",
            fontWeight:"bold",
            color:"rgba(10,10,10,1)",
            cursor:"default",
            marginLeft:`${offset}px`   
        }}>
            {value}
        </div>
    </div>;



interface ConnectedProps{
    dispatch:Function,
    setAuthenticated:Function,
    email:string,
    sync:boolean,
    lastSync:Date
}

interface ConnectedState{}

export class Connected extends Component<ConnectedProps,ConnectedState>{

    constructor(props){
        super(props);
    } 


    
    onLogout = () => logout().then(
        () => {
            this.props.setAuthenticated(false);
            this.props.dispatch({type:'sync', load:false});
        }
    );
    
    

    getLatUpdateMessage = () : string => {
        let month = getMonthName(this.props.lastSync);
        let day = this.props.lastSync.getDate();
        return isToday(this.props.lastSync) ? 
               `Today at ${timeOfTheDay(this.props.lastSync)}` :
               `${month} ${day} at ${timeOfTheDay(this.props.lastSync)}`;
    };

    render(){ 
        return <div style={{display:"flex", flexDirection:"column", justifyContent:"space-around"}}> 
            { ConnectedSection({offset:40,name:'Account',value:this.props.email}) }

            { ConnectedSection({offset:55,name:'Status',value:`Your account is active`}) }

            { ConnectedSection({offset:12,name:'Last update',value:this.getLatUpdateMessage()}) }
            <div     
                onClick={this.onLogout} 
                style={{     
                    display:"flex",
                    alignItems:"center", 
                    cursor:"pointer",
                    justifyContent:"center", 
                    height:"20px",
                    borderRadius:"5px", 
                    paddingLeft:"25px",
                    paddingRight:"25px",
                    paddingTop:"5px", 
                    paddingBottom:"5px", 
                    backgroundColor:"rgba(81, 144, 247, 1)"  
                }}   
            >   
                <div style={{color:"white",whiteSpace:"nowrap",fontSize:"16px"}}>  
                    Logout
                </div>    
            </div>  
            <div style={{ display:"flex", flexDirection:"column" }}> 
                <div style={{
                    paddingTop:"5px",
                    color:"rgb(81, 144, 247)",
                    borderBottom:"1px solid rgb(81, 144, 247)",
                    display:"inline-table",
                    lineHeight:"1em",
                    fontSize:"14px",
                    cursor:"pointer"
                }}>
                    Change password
                </div>
                <div style={{
                    paddingTop:"5px",
                    color:"rgb(81, 144, 247)",
                    borderBottom:"1px solid rgb(81, 144, 247)",
                    display:"inline-table",
                    lineHeight:"1em",
                    fontSize:"14px",
                    cursor:"pointer"
                }}>
                    Manage subscriptions
                </div>
            </div>
        </div>
    }
} 


