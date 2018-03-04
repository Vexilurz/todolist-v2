
import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom';  
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import Popover from 'material-ui/Popover';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import { isEmpty } from 'ramda';
import AutosizeInput from 'react-input-autosize';

interface AreaHeaderProps{
    name:string, 
    selectedAreaId:string,
    updateAreaName:(value:string) => void,
    deleteArea:() => void
} 


interface AreaHeaderState{
    name:string,
    menuAnchor:HTMLElement,
    openMenu:boolean,
    showTagsPopup:boolean
}  


export class AreaHeader extends Component<AreaHeaderProps,AreaHeaderState>{
    menuAnchor:HTMLElement;
    inputRef:HTMLElement;  
    
    constructor(props){ 
        super(props);
        this.state = {
            name:this.props.name,
            menuAnchor:null,
            openMenu:false,
            showTagsPopup:false 
        }; 
    }  
 

    componentDidMount(){
        if(this.inputRef && isEmpty(this.props.name)){
           this.inputRef.focus();  
        }

        if(this.menuAnchor){
           this.setState({menuAnchor:this.menuAnchor});
        }
    }


    componentWillReceiveProps(nextProps:AreaHeaderProps){
        if(nextProps.selectedAreaId!==this.props.selectedAreaId){
           this.setState({openMenu:false}); 
        }

        if(this.inputRef && isEmpty(nextProps.name)){
           this.inputRef.focus();  
        }

        if(nextProps.name!==this.props.name){
           this.setState({name:nextProps.name}); 
        }
    }


    openMenu = () => this.setState({openMenu:true});
 

    closeMenu = () => this.setState({openMenu:false});


    render(){ 
     let {updateAreaName,deleteArea} = this.props;   

     return <div>  
        <div style={{display:"flex", alignItems:"center"}}>
            <div style={{    
                width:"35px",
                height:"35px",
                position:"relative",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                boxSizing:"border-box",
                marginRight:"10px" 
            }}> 
                <NewAreaIcon style={{color:"lightblue", width:"28px", height:"28px"}}/>    
            </div>  
            <div style={{overflow:"hidden"}}>
                <AutosizeInput 
                    ref={e => {this.inputRef=e;}}
                    type="text"
                    name="form-field-name" 
                    minWidth={"170px"}
                    inputStyle={{  
                        boxSizing: "content-box", 
                        backgroundColor:"rgba(0,0,0,0)",   
                        height: "42px",
                        fontWeight: "bold", 
                        maxWidth:"450px",
                        fontFamily: "sans-serif",
                        border: "none",
                        fontSize: "26px",
                        outline: "none"  
                    }}     
                    value={this.state.name}
                    placeholder="New Area" 
                    onChange={(event) => {
                        let name = event.target.value;
                        this.setState({name},() => updateAreaName(name));
                    }} 
                />  
            </div>   
            <div    
                onClick={this.openMenu}  
                style={{marginLeft:"5px",marginRight:"5px",width:"32px",height:"32px",cursor:"pointer"}}  
                ref={(e) => { this.menuAnchor=e; }}  
            > 
                <ThreeDots style={{color:"rgb(179, 179, 179)",width:"32px",height:"32px",cursor:"pointer"}}/>
            </div> 
            <AreaMenu 
                open={this.state.openMenu}
                close={this.closeMenu}
                onDeleteArea={() => {
                    this.closeMenu();
                    deleteArea();
                }}
                anchorEl={this.state.menuAnchor}  
            />
        </div>
     </div> 
    }
}



interface AreaMenuProps{
    open:boolean,
    close:Function,
    onDeleteArea:Function,
    anchorEl:HTMLElement  
}    
 
interface AreaMenuState{}
 
export class AreaMenu extends Component<AreaMenuProps,AreaMenuState>{
 
    constructor(props){ 
        super(props);  
    }   

    render(){  
        return <Popover 
            className="nocolor"
            style={{
                marginTop:"20px", 
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",
                borderRadius:"10px"
            }}   
            open={this.props.open}
            anchorEl={this.props.anchorEl}   
            onRequestClose={this.props.close}  
            anchorOrigin={{vertical: "center", horizontal: "middle"}} 
            targetOrigin={{vertical: "top", horizontal: "middle"}} 
        >   
            <div  className="darkscroll"
                  style={{  
                        backgroundColor: "rgb(39, 43, 53)",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                        borderRadius: "10px",
                        paddingTop: "5px",
                        paddingBottom: "5px",
                        cursor:"pointer" 
                  }} 
            >      
                    <div    
                        onClick={this.props.onDeleteArea as any} 
                        className="tagItem" 
                        style={{display:"flex", height:"auto", alignItems:"center", padding:"5px"}}
                    >  
                        <TrashIcon style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Delete Area
                        </div>     
                    </div>
            </div> 
        </Popover> 
    } 
}

