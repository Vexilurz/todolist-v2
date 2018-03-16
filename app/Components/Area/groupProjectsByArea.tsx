import {not,contains} from 'ramda';

export let groupProjectsByArea = (projects:any[],areas:any[]) : {
    table : { [key: string]: any[]; }, 
    detached:any[]  
} => {
    let table = {};
    let detached : any[] = [];

    for(let i=0; i<areas.length; i++){
        table[areas[i]._id] = [];
    }  
     
    for(let i=0; i<projects.length; i++){
        let projectId = projects[i]._id;
        let haveArea = false;

        for(let j=0; j<areas.length; j++){
            let attachedProjectsIds : string[] = areas[j].attachedProjectsIds;

            if(contains(projectId,attachedProjectsIds)){
               let key = areas[j]._id;
               table[key].push(projects[i]);
               haveArea = true;
               break; 
            }
        } 

        if(not(haveArea)){
           detached.push(projects[i]);
        }
    }   

    return {table,detached};
};