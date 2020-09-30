import './banner.css'
import * as React from 'react'; 
import { Component } from "react"; 
import { BannerText } from '../../types'

interface BannerProps{
  bannerText:BannerText
  dispatch:Function
}

interface BannerState{}

export class Banner extends Component<BannerProps, BannerState> {
  constructor(props) {
    super(props)
  }

  openSettings = () => {
    this.props.dispatch({type:'multiple', load:[
      {type:"selectedSettingsSection", load:'LicenseManagement'},
      {type:"openSettings", load:true}]
    })    
  }

  render() {
    return <div className="license-banner"><b>
      {this.props.bannerText.text}
      <a href="#" style={{color:"black"}} onClick={this.openSettings}>{this.props.bannerText.hrefText}</a>       
    </b></div>
  }
}