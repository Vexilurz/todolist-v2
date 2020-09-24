import './banner.css'
import * as React from 'react'; 
import { Component } from "react"; 
import { BannerText } from '../../types'

interface BannerProps{
  bannerText:BannerText
}

interface BannerState{}

export class Banner extends Component<BannerProps, BannerState> {
  constructor(props) {
    super(props)
  }

  openSettings = () => {
    
  }

  render() {
    return <div className="license-banner"><b>
      {this.props.bannerText.text}
      <a href="#" onClick={this.openSettings}>{this.props.bannerText.hrefText}</a>       
    </b></div>
  }
}