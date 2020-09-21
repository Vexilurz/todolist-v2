import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { ipcRenderer } from 'electron';


interface LicenseManagementProps{
  dispatch:Function
}

interface LicenseManagementState{}

export class LicenseManagement extends Component<LicenseManagementProps,LicenseManagementState>{

  constructor(props){ 
    super(props) 
    ipcRenderer.on('receivedLicense', this.onAnswer)
  } 

  apiAnswer = 'empty';

  onTestFetchClick = (e) => {
    // let { url, error } = this.state;
    let url = 'https://5f687836dc0bff0016f437f6.mockapi.io/key'; 

    ipcRenderer.send("license-request", {url});
    
    return null;    
  };

  onAnswer = (event, ...args) => {
    console.log("onAnswer", event, {...args})
    this.apiAnswer = JSON.stringify(args);
    this.render()
    this.forceUpdate()
  }

  render(){
    return <div style={{
      width:"100%",
      display:"flex",
      paddingLeft:"25px",
      flexDirection:"column",
      alignItems:"flex-start",
      justifyContent:"space-around" 
    }}>    
      <div style={{fontSize:"13px", width:"80%", color:"rgba(100,100,100,0.9)", cursor:"default"}}>
          License management
      </div>        
      <div style={{
          display:"flex",
          justifyContent:"space-between",
          paddingTop:"5px",
          paddingBottom:"5px",
          flexWrap:"wrap"
      }}>
        <div     
          onClick={this.onTestFetchClick}
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
          <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
            Test fetch 
          </div>   
        </div>        
      </div>        
      <div>
        {this.apiAnswer}  
      </div>  
    </div>
  }   
};




