import './banner.css'
import * as React from 'react'; 
import { Component } from "react"; 

export class Banner extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div className="license-banner"><b>
      BANNER HERE
    </b></div>
  }
}