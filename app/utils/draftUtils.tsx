import { isEmpty, isNil, ifElse, compose, always, identity, anyPass } from 'ramda';
import { convertToRaw, convertFromRaw, ContentState, EditorState } from 'draft-js';
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


export let noteToState : (note:RawDraftContentState) => any = (note) => {
    // console.log(`noteToState note:`, note);
    let cond = anyPass([isNil,isString,isEmpty])(note);
    // console.log("anyPass: ", cond);
    if (cond) {
      return EditorState.createEmpty();
    } else {
      return compose(EditorState.createWithContent, convertFromRaw)(note)
    }    

    // ifElse(
    //     anyPass([isNil,isString,isEmpty]), 
    //     EditorState.createEmpty, 
    //     compose(EditorState.createWithContent, convertFromRaw)
    // );
};
        


//State -> Content -> Raw
export let noteFromState : (state:any) => RawDraftContentState = 
        ifElse(
            anyPass([isNil,isString,isEmpty]),
            getEmptyRaw,
            compose(convertToRaw, (state) => state.getCurrentContent())
        );

 
//State -> Content -> String
export let getNotePlainText : (state:any) => string = 
        ifElse(
            anyPass([isNil,isString,isEmpty]), 
            always(''), 
            getText
        );


//Raw -> State -> String
export let getNotePlainTextFromRaw : (note:RawDraftContentState) => string = 
        compose(
            getText,
            noteToState, 
            ifElse(anyPass([isNil,isString,isEmpty]),getEmptyRaw,identity)
        );


//String -> Content -> Raw
export let noteFromText : (text:string) => RawDraftContentState = 
        compose(
            noteFromState,
            (content) => EditorState.createWithContent(content),  
            ContentState.createFromText
        );  