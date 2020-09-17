import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';   
import { Component } from "react";  
import SearchIcon from 'material-ui/svg-icons/action/search'; 
import Clear from 'material-ui/svg-icons/content/clear';
import { stopPropagation } from '../../utils/stopPropagation';
import { isEmpty } from 'ramda';
import { debounce } from 'lodash'; 

interface SearchInputProps{
    onChange:(e:any) => void,
    clear:() => void,
    searchQuery:string,
    autofocus:boolean,
    setRef?:Function  
}  


interface SearchInputState{
    value:string
}  
 

export class SearchInput extends Component<SearchInputProps,SearchInputState>{
    ref:any;

    constructor(props){ 
        super(props);
        this.state={value:this.props.searchQuery};
    } 



    componentWillReceiveProps(nextProps){
        if(nextProps.searchQuery!==this.state.value){
           this.setState({value:nextProps.searchQuery});
        }
    }


 
    componentDidMount(){
        if(this.props.autofocus){
           this.focus();
        }

        if(this.props.setRef && this.ref){
           this.props.setRef(this.ref); 
        }
    }


    
    focus = () => {
        if(this.ref){ 
            let value = this.ref.value;
            this.ref.value = ''; 
            this.ref.blur()
            this.ref.focus();
            this.ref.value = value;  
        } 
    }; 



    shouldComponentUpdate(nextProps:SearchInputProps, nextState){
        return this.state.value!==nextState.value;
        //nextProps.searchQuery!==this.props.searchQuery;
    };



    onChange = debounce((e) => { this.props.onChange(e) }, 250);



    render(){  
        return <div 
            style={{   
                zIndex:30000,
                backgroundColor:"rgb(248, 248, 248)",
                borderRadius:"5px",
                position:"relative", 
                WebkitUserSelect:"none",  
                maxHeight:isEmpty(this.state.value) ? "0px" : "30px",
                overflow:"visible",
                overflowY:"visible"
            }}   
        >               
            <div style={{ 
                backgroundColor:"rgb(217, 218, 221)", 
                borderRadius:"5px",
                display:"flex",
                height:"30px",  
                alignItems:"center"
            }}>  
                <div style={{padding:"5px",display:"flex",alignItems:"center",justifyContent:"center"}}>                    
                  <SearchIcon style={{color:"rgb(100, 100, 100)",height:"20px",width:"20px"}}/>   
                </div>   
                <input 
                    ref={e => {this.ref=e;}}
                    onKeyDown={stopPropagation}
                    style={{  
                        outline:"none",
                        border:"none", 
                        width:"100%", 
                        backgroundColor:"rgb(217,218,221)",
                        caretColor:"cornflowerblue"  
                    }} 
                    placeholder="Quick Find" 
                    type="text" 
                    name="search"  
                    value={this.state.value} 
                    onChange={e => {
                        e.persist();
                        this.setState({value:e.target.value}, () => this.onChange(e));
                    }}
                />
                <div style={{display:"flex",cursor:"pointer",alignItems:"center",paddingRight:"5px"}}>
                    <Clear  
                        onClick={this.props.clear} 
                        style={{color:"rgba(100, 100, 100,0.7)",height:"20px",width:"20px"}}
                    />
                </div> 
            </div>   
        </div>
    }
}
