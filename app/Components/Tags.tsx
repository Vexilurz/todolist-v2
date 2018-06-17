import './../assets/styles.css';  
import './../assets/calendarStyle.css';    
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { contains, not, isEmpty, compose, equals, all, reject, prop, when, always } from 'ramda';
import { Subscription } from 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';

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
        this.state = {multipleSelection:false};
        this.subscriptions = [];
    }


    componentDidMount(){

        this.subscriptions.push(
            Observable.fromEvent(window,'keydown')
            .filter((e:any) => e.ctrlKey)
            .subscribe(
                (event) => this.setState({multipleSelection:true})
            ), 

            Observable.fromEvent(window,'keyup')
            .filter((e:any) => e.key==="Control")
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
        let tags = ['All', ...nextProps.tags];

        let allSelectedTagsExist = tags => all( selected => contains(selected)(tags) );

        if(!allSelectedTagsExist(tags)(nextProps.selectedTags)){

            compose(
                result => nextProps.selectTags(result),
                when(isEmpty, always(['All'])), 
                selectedTags => selectedTags.filter( tag => contains(tag)(tags) ),
                prop('selectedTags')
            )(nextProps);
        }
    };  


    onTagClick = tag => {
        let onlyAllSelected = equals(['All']);

        if(this.state.multipleSelection){
            if(contains(tag)(this.props.selectedTags)){
                this.props.selectTags( reject(equals(tag))(this.props.selectedTags) ); 
            }else{
                if(onlyAllSelected(this.props.selectedTags)){
                    this.props.selectTags( [tag] ); 
                }else{
                    this.props.selectTags( [tag,...this.props.selectedTags] ); 
                }
            }

        }else{
            if(contains(tag)(this.props.selectedTags)){ 
                this.props.selectTags( ['All'] ); 
            }else{
                this.props.selectTags( [tag] ); 
            }
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
                                    onClick={() => this.onTagClick(tag)} 
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
  
   