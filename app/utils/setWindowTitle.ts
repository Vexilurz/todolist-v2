import { ipcRenderer } from 'electron';
import { isEmpty } from 'ramda';
import { uppercase } from './uppercase';
import { Store } from '../types';



export let setWindowTitle = (props:Store,newProps:Store,today:number) : void => {
    if(newProps.selectedCategory==="area"){
        let area = newProps.areas.find( a => a._id===newProps.selectedAreaId );
        if(area){
            ipcRenderer.send(
               'setWindowTitle', 
               `${today===0 ? '' : `(${today})`} tasklist - ${uppercase(isEmpty(area.name) ? 'New Area' : area.name)}`, 
                newProps.id
            );
        }
    }else if(newProps.selectedCategory==="project"){
        let project = newProps.projects.find( p => p._id===newProps.selectedProjectId );

        if(project){
            ipcRenderer.send(
               'setWindowTitle',  
               `${today===0 ? '' : `(${today})`} tasklist - ${uppercase( isEmpty(project.name) ? 'New Project' : project.name )}`, 
                newProps.id
            );
        }
    }else{
        ipcRenderer.send(
           'setWindowTitle',
           `${today===0 ? '' : `(${today})`} tasklist - ${uppercase(newProps.selectedCategory)}`, 
            newProps.id
        );    
    }
};