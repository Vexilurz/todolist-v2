import './../assets/styles.css';  
import './../assets/calendarStyle.css';    
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress'; 
import { Component } from "react"; 
import { createStore, combineReducers } from "redux"; 
import DayPicker from 'react-day-picker';
import { append, prepend, contains, not, isEmpty, intersection, compose } from 'ramda';
import { Subscription } from 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';

interface TagsProps{
    selectTags:(tags:string[]) => void,
    tags:string[],
    selectedTags:string[],
    show:boolean
} 

interface TagsState{
    multipleSelection:boolean
}


export class Tags extends Component<TagsProps,TagsState>{

    subscriptions:Subscription[]; 

    constructor(props){
        super(props);
        this.subscriptions = [];
    }


    componentDidMount(){
        let ctrl = (event) => event.ctrlKey;

        this.subscriptions.push(
            Observable.fromEvent(window,'keydown').filter(ctrl)
            .do(() => console.log('ctrl pressed'))
            .subscribe(
                (event) => this.setState({multipleSelection:true})
            ), 

            Observable.fromEvent(window,'keyup').filter(ctrl)
            .do(() => console.log('ctrl released'))
            .subscribe(
                (event) => this.setState({multipleSelection:false}) 
            )
        )
    }


    componentWillUnmount(){
        this.subscriptions.map( s => s.unsubscribe() );
        this.subscriptions = [];
    }


    componentWillReceiveProps(nextProps:TagsProps){
        let exist = tag => contains(tag)(nextProps.tags);

        if(this.props.tags!==nextProps.tags){
           nextProps.selectTags( nextProps.selectedTags.filter(exist) ) 
        }
    }  


    onTagClick = tag => {
        if(this.state.multipleSelection){
            this.props.selectTags( [tag,...this.props.selectedTags] ); 
        }else{
            if(
               this.props.selectedTags.length===1 && 
               contains(tag)(this.props.selectedTags)
            ){ 
                this.props.selectTags( ['All'] ); 
            }

            this.props.selectTags( [tag] ); 
        }
    };

  
    render(){
         let { show, tags, selectedTags } = this.props; 
          
         return not(show) ? null :
                isEmpty(tags) ? null :
                <div 
                style={{  
                    display:'flex', 
                    flexWrap:'wrap',
                    WebkitUserSelect:"none",
                    paddingBottom:"20px" 
                }}>  
                    {    
                        ["All",...tags.sort((a:string,b:string) : number => a.localeCompare(b))]
                        .map((tag:string) =>  
                            <div key={tag} style={{padding:"4px"}}> 
                                <div className="chip"       
                                    onClick={this.onTagClick} 
                                    style={{ 
                                        width:"auto",
                                        height:"20px", 
                                        alignItems:"center",   
                                        display:"flex",
                                        paddingLeft:"5px",
                                        paddingRight:"5px",  
                                        cursor:"pointer",
                                        borderRadius:"100px", 
                                        backgroundColor:contains(tag)(selectedTags) ? "dimgray" : "white",
                                        color:contains(tag)(selectedTags) ? "white" : "dimgray",                  
                                        fontWeight:700 
                                    }}     
                                >   
                                    <div style={{padding:"4px"}}>{tag}</div>  
                                </div> 
                            </div>   
                        )
                    }
                </div>
      } 
  } 
  
   