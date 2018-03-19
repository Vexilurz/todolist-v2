import { debounce } from 'lodash';
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import Clear from 'material-ui/svg-icons/content/clear';
import { SimplePopup } from '../SimplePopup';
import { text, value } from '../../utils/text';



interface LicensePopupProps{
    showLicense:boolean,
    dispatch:Function
}


interface LicensePopupState{}


export class LicensePopup extends Component<LicensePopupProps,LicensePopupState>{
    
    constructor(props){ super(props) }

    render(){
        return <SimplePopup 
            show={this.props.showLicense}
            onOutsideClick={() => this.props.dispatch({type:"showLicense",load:false})}
        > 
            <div 
            className="scroll"  
            style={{
                display:"flex", 
                flexDirection:"column",
                maxWidth:"650px", 
                maxHeight:"500px",
                minHeight:"400px",
                borderRadius:"5px",
                position:"relative", 
                backgroundColor:"rgba(254, 254, 254, 1)"
            }}>  
                <div style={{
                    width:"100%",
                    display:"flex",  
                    justifyContent:"center",
                    alignItems:"center",
                    flexDirection:"column",
                    backgroundColor:"rgb(234, 235, 239)",
                }}>   
                    <div style={{width:"100%",alignItems:"center",position:"relative",justifyContent:"center",display:"flex"}}>
                        <div style={{position:"absolute", top:0, right:5, cursor:"pointer", zIndex:200}}>   
                            <div   
                                style={{padding:"2px",alignItems:"center",cursor:"pointer",display:"flex"}} 
                                onClick={() => this.props.dispatch({type:"showLicense",load:false})}
                            >
                                <Clear style={{color:"rgba(100,100,100,0.5)",height:25,width:25}}/>
                            </div>
                        </div>
                    </div>  
                </div> 
                <div style={{whiteSpace:"pre", padding:"10px"}}>{value}</div>
                <div style={{padding:"10px"}}>{text}</div>
            </div>
        </SimplePopup> 
    }
};
