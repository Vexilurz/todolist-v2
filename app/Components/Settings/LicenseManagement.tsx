import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { ipcRenderer } from 'electron';
import { pouchWorker } from '../../app';
import { actionSaveLicense, License } from '../../types'
import { prop } from 'ramda'
const { shell } = window.require('electron'); 

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
      statusText:response.statusText,
      lisenceDueDate: null
    }    
    let actionSaveLicense:actionSaveLicense = { type:"saveLicense", load:license }
    let actionSaveLicense_json = JSON.parse(JSON.stringify(actionSaveLicense));
    pouchWorker.postMessage(actionSaveLicense_json); // save to DB
    this.props.dispatch({type:"setLicense", load:license}) // set to redux store (StateReducer.tsx)
  }

  createDisplayDateString = (date: Date): string => {
    let monthName = date.toLocaleString('default', { month: 'long' })
    return `${monthName} ${date.getDay()}, ${date.getFullYear()}`;
  }

  hrefClickFunction = () => {
    // CHANGE LINK HERE
    let link = "http://google.com";
    shell.openExternal(link);   // Here I utilize the feature. 
  }

  render(){
    return <div style={{
      height: "90%",
      display:"flex",
      paddingTop:"25px",
      paddingLeft:"25px",
      flexDirection:"column",
      alignItems:"flex-start",
    }}>    

      <div 
        style={{  
              marginTop: "15px",
              marginBottom: "25px"
        }}> 
          License Key:  
          {this.props.license.data.purchase ? this.props.license.data.purchase.license_key : "No key"}
      </div>
      { 
        this.props.license.data.purchase && 
        <div style={{ marginBottom: "25px"}}> 
          Valid until:  
          {this.createDisplayDateString(this.props.license.lisenceDueDate)}
        </div>
      }
      
      <div> Enter new license key:</div>
      <div style={{
          display:"flex",
          justifyContent:"space-between",
          paddingBottom:"5px",
          flexWrap:"wrap"
      }}>
        <input 
            className="license-key-input"
            type="text" 
            style={{  
              width: "350px",
              marginRight: "50px"
            }}
            onChange={(event) => this.setState({licenseKey:event.target.value})}
            // value={"E69C1EF6-1AAD4E9E-89C4A9EB-BE587A69"}
        />
        <div     
          onClick={this.onUseKeyClick}
          style={{     
            cursor:"pointer",
            height:"20px",
            borderRadius:"5px",
            textAlign:"center",
            width: "100px",
            paddingTop:"5px", 
            paddingBottom:"5px",
            backgroundColor:"rgba(81, 144, 247, 1)"  
          }}  
        >   
          <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
            Activate
          </div>   
        </div>               
      </div>
      <a href="#" onClick={this.hrefClickFunction}> Get a new license key here</a>        
      {/* <div>    
        // PLACE ERRORS FROM API HERE            
        {
          prop('message')(this.props.license) ? 
          this.props.license.message : 
          'Enter your license key and press "Use key" button'
        }
      </div>   */}
    </div>
  }   
};




