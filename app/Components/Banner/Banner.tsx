import './banner.css'
import * as React from 'react'; 
import { Component } from "react"; 

interface BannerProps{
  text:string,
  hrefText:string,
  onClick:Function
}

interface BannerState{}

export class Banner extends Component<BannerProps, BannerState> {
  constructor(props) {
    super(props)
  }

  render() {
    return <div className="license-banner"><b>
      {this.props.text}
      <a href="#" onClick={()=>{}}>{this.props.hrefText}</a>       
    </b></div>
  }
}