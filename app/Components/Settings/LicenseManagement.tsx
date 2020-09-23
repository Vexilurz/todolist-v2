import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { ipcRenderer } from 'electron';
import { pouchWorker } from '../../app';
import { actionSaveLicense, License } from '../../types'
import { prop } from 'ramda'

interface LicenseManagementProps{
  license:License,
  dispatch:Function
}

interface LicenseManagementState{
  licenseKey:string  
}

export class LicenseManagement extends Component<LicenseManagementProps,LicenseManagementState>{

  constructor(props){ 
    super(props) 
    ipcRenderer.on('receivedLicense', this.onReceivedLicense)
  } 

  onUseKeyClick = (e) => {
    // let license_key = 'E69C1EF6-1AAD4E9E-89C4A9EB-BE587A69'; 

    ipcRenderer.send("license-request", {license_key:prop('licenseKey')(this.state)});

    return null;    
  };

  onReceivedLicense = (event, response) => {
    console.log("onReceivedLicense", event, response)  
    let license:License = { 
      data:response.data, 
      status:response.status, 
      statusText:response.statusText 
    }    
    let actionSaveLicense:actionSaveLicense = { type:"saveLicense", load:license }
    let actionSaveLicense_json = JSON.parse(JSON.stringify(actionSaveLicense));
    pouchWorker.postMessage(actionSaveLicense_json); // save to DB
    this.props.dispatch({type:"setLicense", load:license}) // set to redux store (StateReducer.tsx)
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
        <input 
            className="license-key-input"
            type="text" 
            onChange={(event) => this.setState({licenseKey:event.target.value})}
            // value={"E69C1EF6-1AAD4E9E-89C4A9EB-BE587A69"}
        />
        <div     
          onClick={this.onUseKeyClick}
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
            Use key 
          </div>   
        </div>               
      </div>        
      <div>                
        {
          prop('message')(this.props.license) ? 
          this.props.license.message : 
          'Enter your license key and press "Use key" button'
        }
      </div>  
    </div>
  }   
};




