import { 
    uniq, isEmpty, contains, isNil, not, multiply, remove, cond, ifElse,
    equals, any, complement, compose, defaultTo, path, first, prop, always,
    identity, anyPass
} from 'ramda';
import Editor from 'draft-js-plugins-editor';
import {
    convertToRaw,
    convertFromRaw,
    CompositeDecorator,
    ContentState,
    EditorState,
    RichUtils
} from 'draft-js';
import { isString } from './isSomething';
import { RawDraftContentState } from '../types';



let getEmptyRaw : () => RawDraftContentState = 
    compose(
        convertToRaw, 
        (state) => state.getCurrentContent(),
        //content => EditorState.createWithContent(content), 
        //state => state.getCurrentContent(), 
        EditorState.createEmpty 
    );


let getText : (state:any) => string = 
    compose(
        content => content.getPlainText(),
        state => state.getCurrentContent()
    ); 


//Raw -> Content -> State
export let noteToState : (note:RawDraftContentState) => any = 
        ifElse(
            anyPass([isNil,isString]), 
            EditorState.createEmpty, 
            compose(EditorState.createWithContent, convertFromRaw)
        );


//State -> Content -> Raw
export let noteFromState : (state:any) => RawDraftContentState = 
        ifElse(
            anyPass([isNil,isString]),
            getEmptyRaw,
            compose(convertToRaw, (state) => state.getCurrentContent())
        );

 
//State -> Content -> String
export let getNotePlainText : (state:any) => string = 
        ifElse(
            anyPass([isNil,isString]), 
            always(''), 
            getText
        );


//Raw -> State -> String
export let getNotePlainTextFromRaw : (note:RawDraftContentState) => string = 
        compose(
            getText,
            noteToState, 
            ifElse(anyPass([isNil,isString]),getEmptyRaw,identity)
        );


//String -> Content -> Raw
export let noteFromText : (text:string) => RawDraftContentState = 
        compose(
            noteFromState,
            (content) => EditorState.createWithContent(content),  
            ContentState.createFromText
        );  