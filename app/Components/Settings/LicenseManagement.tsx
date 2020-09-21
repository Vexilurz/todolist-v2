import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { ipcRenderer } from 'electron';
import { pouchWorker } from '../../app';
import { actionSaveLicense, actionLoadLicense, License } from '../../types'

const LICENSE_ID = "license-id";


interface LicenseManagementProps{
  dispatch:Function
}

interface LicenseManagementState{}

export class LicenseManagement extends Component<LicenseManagementProps,LicenseManagementState>{

  constructor(props){ 
    super(props) 
    ipcRenderer.on('receivedLicense', this.onReceivedLicense)
    ipcRenderer.on('receivedLicenseFromDB', this.onReceivedLicenseFromDB)
  } 

  apiAnswer = 'empty';

  onTestFetchClick = (e) => {
    // let { url, error } = this.state;
    let url = 'https://5f687836dc0bff0016f437f6.mockapi.io/key'; 

    ipcRenderer.send("license-request", {url});

    return null;    
  };

  onTestSaveToDB = (e) => {
    let license:License = { _id:LICENSE_ID, someField:"test "+(new Date()) }
    let actionSaveLicense : actionSaveLicense = { type:"saveLicense", load:license };
    let actionSaveLicense_json = JSON.parse(JSON.stringify(actionSaveLicense));
    pouchWorker.postMessage(actionSaveLicense_json);
  }

  onTestLoadFromDB = (e) => {
    let license:License = { _id:LICENSE_ID, someField:"dummy" }
    let actionLoadLicense : actionLoadLicense = { type:"loadLicense", load:license };
    let actionLoadLicense_json = JSON.parse(JSON.stringify(actionLoadLicense));
    pouchWorker.postMessage(actionLoadLicense_json);
  }

  onReceivedLicense = (event, ...args) => {
    console.log("onReceivedLicense", event, {...args})
    this.apiAnswer = JSON.stringify(args);
    this.render()
    this.forceUpdate()
  }

  onReceivedLicenseFromDB = (event, ...args) => {
    console.log("onReceivedLicenseFromDB", event, {...args})
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
        <div     
          onClick={this.onTestSaveToDB}
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
            Test save to DB 
          </div>   
        </div>  
        <div     
          onClick={this.onTestLoadFromDB}
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
            Test load from DB 
          </div>   
        </div>      
      </div>        
      <div>
        {this.apiAnswer}  
      </div>  
    </div>
  }   
};




