import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import Clear from 'material-ui/svg-icons/content/clear';
import { section } from './section';
import { Calendar, Area, Project, Todo } from '../../database';
import { requestFromMain } from '../../utils/requestFromMain';
import { updateConfig } from '../../utils/config';
import { 
    remove, isNil, not, isEmpty, compose, toPairs, map, findIndex, equals, prop,
    contains, last, cond, defaultTo, flatten, uniq, concat, all, identity 
} from 'ramda';
import { Checkbox } from '../TodoInput/TodoInput';
import { isArrayOfTodos } from '../../utils/isSomething';
import { filter } from '../MainContainer';
import { assert } from '../../utils/assert';
import { defaultTags } from '../../utils/defaultTags';
import { uppercase } from '../../utils/uppercase';



interface TagsSettingsProps{
    todos:Todo[],
    defaultTags:string[], 
    dispatch:Function
}

interface TagsSettingsState{}

export class TagsSettings extends Component<TagsSettingsProps,TagsSettingsState>{

    constructor(props){ super(props) }



    getTags = (defaultTags:string[],todos:Todo[]) : string[] =>
    compose(
        uniq,
        flatten,
        concat(defaultTags),
        map(prop('attachedTags'))
    )(todos);
     


    onRemoveTag = (tag:string) => () => {
        if(contains(tag)(defaultTags)){
            compose(
                (p) => p.then( config => this.props.dispatch({type:"updateConfig",load:config}) ),
                updateConfig,
                (idx:number) => ({defaultTags:remove(idx,1,defaultTags)}),
                findIndex((item) => item===tag)
            )(defaultTags)
        }
 

        this.props.dispatch({
            type:"updateTodos", 
            load:compose(
                map( 
                    (todo:Todo) : Todo => compose(
                        (idx) => ({...todo,attachedTags:remove(idx,1,todo.attachedTags)}),
                        findIndex((todoTag:string) => todoTag===tag),
                        (todo) => todo.attachedTags
                    )(todo)
                ), 
                (todos) => filter(todos, (t:Todo) => contains(tag)(t.attachedTags))
            )(this.props.todos)
        });
    };



    onReset = () => updateConfig({defaultTags}).then(
        (config) => {
            let updatedTodos = this.props.todos.map(
                (todo:Todo) => ({ 
                    ...todo, 
                    attachedTags:todo.attachedTags.filter((tag) => contains(tag)(defaultTags)) 
                })
            );
            this.props.dispatch({
                type:"multiple",
                load:[
                    {type:"updateConfig",load:config}, 
                    {type:"updateTodos", load:updatedTodos}
                ]
            });  
            
        }
    ); 
    


    render(){
        let tags = this.getTags(this.props.defaultTags,this.props.todos); 
        
        return <div style={{
            width:"100%", display:"flex", paddingTop:"25px", height:"100%",
            alignItems:"center", paddingLeft:"25px", paddingRight:"25px",
            justifyContent:"space-between", flexDirection:"column" 
        }}>
        <div style={{
            display:"flex",
            justifyContent:"space-between",
            paddingTop:"5px",
            paddingBottom:"5px",
            flexWrap:"wrap"
        }}>
            {       
                tags
                .sort((a:string,b:string) : number => a.localeCompare(b))
                .map( 
                    (tag:string, index:number) => 
                        <div key={`${tag}-${index}`}>
                            <div style={{ 
                                borderRadius:"15px", 
                                border:"1px solid rgba(100,100,100,0.9)",
                                paddingLeft:"5px",
                                paddingRight:"5px", 
                                display:"flex",
                                alignItems:"center",
                                height:"20px",
                                margin:"2px"
                            }}>
                                <div style={{  
                                    height:"15px",
                                    display:"flex",
                                    alignItems:"center",
                                    padding:"4px", 
                                    color:"rgba(100,100,100,0.9)",
                                    fontWeight:500    
                                }}> 
                                    {uppercase(tag)} 
                                </div> 
                                <div  
                                    style={{padding:"2px",alignItems:"center",cursor:"pointer",display:"flex"}} 
                                    onClick={this.onRemoveTag(tag)}
                                >
                                    <Clear style={{color:"rgba(100,100,100,0.9)",height:20,width:20}}/>
                                </div>
                            </div>
                        </div> 
                )   
            } 
        </div>
        <div     
            onClick={this.onReset}
            style={{ 
              display:"flex",
              alignItems:"center",
              cursor:"pointer",
              marginTop:"30px", 
              justifyContent:"center",
              width: "30%",
              height:"20px", 
              borderRadius:"5px",
              paddingLeft:"25px",
              paddingRight:"25px",
              paddingTop:"5px", 
              paddingBottom:"5px",
              backgroundColor:"rgba(100,100,100,0.9)"   
            }}  
        >   
            <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                Reset
            </div>   
        </div> 
        </div>
    }   
};



