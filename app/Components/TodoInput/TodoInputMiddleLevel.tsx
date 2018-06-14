import 'react-tippy/dist/tippy.css'
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import { debounce } from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';   
import { Component } from "react";  
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import { ChecklistItem } from '../../types';
import { Checklist } from './TodoChecklist';
import { TodoTags } from './TodoTags';
import { not } from 'ramda';
import {shell} from 'electron'; 
import Editor from 'draft-js-plugins-editor';
import {
    convertToRaw,
    convertFromRaw,
    CompositeDecorator,
    ContentState,
    EditorState,
    RichUtils
} from 'draft-js';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import 'draft-js/dist/Draft.css';

const linkifyPlugin = createLinkifyPlugin({
    component:(props) => {
      const {contentState, ...rest} = props;
      return <a {...rest} style={{cursor:"pointer"}} onClick={() => shell.openExternal(rest.href)}/>
    }
});  



interface TodoInputMiddleLevelProps{
    onNoteChange:Function, 
    updateChecklist:Function, 
    closeChecklist:() => void,
    closeTags:() => void,
    open:boolean,
    editorState:any,
    onAttachTag:(tag:string) => void,
    onRemoveTag:(tag:string) => void,
    showChecklist:boolean,
    showTags:boolean,
    _id:string,
    checklist:ChecklistItem[],
    attachedTags:string[]
} 

interface TodoInputMiddleLevelState{}
 
export class TodoInputMiddleLevel extends Component<TodoInputMiddleLevelProps,TodoInputMiddleLevelState>{
    
    constructor(props){ super(props) }

    render(){
        let {
            open,
            closeTags,
            closeChecklist,
            updateChecklist,
            showChecklist,
            onAttachTag,
            onRemoveTag,
            _id,
            checklist,
            attachedTags,
            showTags
        } = this.props;

        return <div style={{
            transition:"opacity 0.2s ease-in-out", 
            opacity:open ? 1 : 0, 
            paddingLeft:"25px", 
            paddingRight:"25px"
        }}>    
            <div style={{
                display:"flex",
                paddingTop:"10px", 
                fontSize:'14px',
                color:'rgba(10,10,10,0.9)',
                paddingBottom:"10px"
            }}>
                <Editor
                    editorState={this.props.editorState}
                    onChange={this.props.onNoteChange as any} 
                    plugins={[linkifyPlugin]} 
                    keyBindingFn={(e) => { if(e.keyCode===13){ e.stopPropagation(); } }}
                    placeholder="Notes"
                />
            </div> 
            {    
                not(showChecklist) ? null : 
                <Checklist 
                    checklist={checklist} 
                    closeChecklist={closeChecklist}
                    updateChecklist={updateChecklist as any}
                /> 
            }    
            {  
                not(showTags) ? null :
                <div style={{display:"flex",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <TriangleLabel />
                    </div>
                    <TodoTags 
                        attachTag={onAttachTag} 
                        removeTag={onRemoveTag} 
                        tags={attachedTags}
                        closeTags={closeTags}
                    /> 
                </div>
            } 
        </div>   
    } 
};  










