import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { ipcRenderer } from 'electron';
import { isDev } from '../../utils/isDev';
import { License } from '../../types'
import { checkLicense, createLicense, deleteLicense } from '../../utils/licenseUtils'
import { prop, isNil } from 'ramda'
const { shell } = window.require('electron'); 
const TEST_LICENSE_KEY = 'E69C1EF6-1AAD4E9E-89C4A9EB-BE587A69'; 

interface LicenseManagementProps{
  license:License,
  licenseErrorMessage:string,
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
    console.log("onReceiveAnswerFromApi", event, response)  
    let data = prop('data')(response)
    if (isNil(prop('success')(data))) {
      this.props.dispatch({type:"setLicenseErrorMessage", load:'License data does not match API'})      
    } else if (data.success === false) {
      this.props.dispatch({type:"setLicenseErrorMessage", load:data.message})            
    } else {
      checkLicense(createLicense(data), this.props.dispatch)
    }
  }

  createDisplayDateString = (date: Date): string => {
    let fixDate = new Date(date)
    let monthName = fixDate.toLocaleString('default', { month: 'long' })
    return `${monthName} ${fixDate.getDate()}, ${fixDate.getFullYear()}`;
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
      {
        isNil(prop('license')(this.props)) ? null :
        <div>
          <div 
            style={{  
                  marginTop: "15px",
                  marginBottom: "25px"
            }}> 
              {'License Key: '}  
              {this.props.license.key}
          </div>
          <div style={{ marginBottom: "25px"}}> 
            {'Valid until: '} 
            {this.createDisplayDateString(this.props.license.dueDate)}
          </div> 
          {/* <div style={{ marginBottom: "25px"}}> 
            {'Days remaining: '} 
            {this.props.license.status.daysRemaining}
          </div> */}
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
        {
          !isDev() ? null : 
          <div     
            onClick={deleteLicense}
            style={{     
              cursor:"pointer",
              height:"20px",
              borderRadius:"5px",
              textAlign:"center",
              width: "80px",
              paddingTop:"5px", 
              paddingBottom:"5px",
              marginLeft:"3px",
              backgroundColor:"rgba(81, 144, 247, 1)"  
            }}  
          >   
            <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
              DELETE
            </div>   
          </div>
        }        
      </div>
      {
        isNil(prop('license')(this.props)) ? null :
        !this.props.license.demo ? null : 'You are using the demo version. '
      }
      <a href="#" onClick={this.hrefClickFunction}> Get a license key here</a>       
      <p></p> 
      <div>    
        {this.props.licenseErrorMessage}
      </div>  
    </div>
  }   
};




