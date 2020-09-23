import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { ipcRenderer } from 'electron';
import { actionSaveLicense, License } from '../../types'
import { prop } from 'ramda'
const { shell } = window.require('electron'); 
const TEST_LICENSE_KEY = 'E69C1EF6-1AAD4E9E-89C4A9EB-BE587A69'; 

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
    ipcRenderer.on('receivedLicense', this.onReceiveAnswerFromApi)
  } 

  onUseKeyClick = (e) => { 
    ipcRenderer.send("license-request", {license_key:prop('licenseKey')(this.state)});
    return null;    
  };

  onReceiveAnswerFromApi = (event, response) => {
    console.log("onReceivedLicense", event, response)  
    let license:License = { 
      data:response.data, 
      status:response.status, 
      statusText:response.statusText,
      errorMessage:null,
      active:null,
      lisenceDueDate:null,
      gettedFromDB:false
    }        
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
          {'License Key: '}  
          {this.props.license.data.purchase ? this.props.license.data.purchase.license_key : "No key"}
      </div>
      { 
        this.props.license.data.purchase && 
        <div>
          <div style={{ marginBottom: "25px"}}> 
            {'Status: '}  
            {this.props.license.active ? 'Active' : 'Expired'}
          </div>
          <div style={{ marginBottom: "25px"}}> 
            {'Valid until: '} 
            {this.createDisplayDateString(this.props.license.lisenceDueDate)}
          </div> 
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
            // value={TEST_LICENSE_KEY}
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
      <div>    
        {
          prop('errorMessage')(this.props.license) ? 
          this.props.license.errorMessage : ''
          //'Enter your license key and press "Activate" button'
        }
      </div>  
    </div>
  }   
};




