import { 
    cond, isNil, not, defaultTo, map, isEmpty, compose, contains, append, omit, concat,
    prop, equals, identity, all, when, evolve, ifElse, applyTo, reduce, add, groupBy 
} from 'ramda';
const sendMessage = postMessage as any;
import PouchDB from 'pouchdb-browser'; 

let global = {};


let calendars_db = new PouchDB('calendars'); 
let todos_db : any = new PouchDB('todos');   
let projects_db = new PouchDB('projects');
let areas_db = new PouchDB('areas'); 

let x = [ 
    {
        type:"todo",
        category:"project",
        title:"Add task from anywhere",
        priority:13,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Add task from anywhere"
    }, 
    {
        type:"todo",
        category:"project",
        title:"Link to emails, files, and web pages",
        priority:14,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Link to emails, files, and web pages"
    }, 
    {
        type:"todo",
        category:"project",
        title:"Open multiple windows",
        priority:21,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null, 
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Open multiple windows"
    },
    {
        type:"todo",
        category:"project",
        title:"Convert a task into a project",
        priority:22,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Convert a task into a project"
    },
    {
        type:"todo",
        category:"project",
        title:"Make your task repeat",
        priority:23,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Make your task repeat"
    },            
    {
        type : "heading", 
        priority:24,
        title : "Before you go...", 
        _id : "Before you go...", 
        key : "Before you go..."
    },
    {
        type:"todo",
        category:"project",
        title:"Any questions ? We're here to help!",
        priority:25,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Any questions ? We're here to help!"
    }
];


x.map( i => i.type==="todo" ? todos_db.put(i) : null )
 

let generateIndicators : 
(projects, todos) => { [key:string]:{active:number,completed:number,deleted:number}; } = 
 
(projects, todos) => compose(
    map(  
        data => data.reduce(
            (acc,val) => cond([
                    [
                        t => !isNil(t.deleted), 
                        t => evolve(
                                {
                                    deleted:add(1),
                                    trash:{
                                        completed:when(() => !isNil(t.completedSet), add(1)), 
                                        active:when(() => isNil(t.completedSet), add(1)) 
                                    }
                                }, 
                                acc
                            )
                    ],  
                    [ 
                        t => !isNil(t.completedSet), 
                        t => evolve({completed:add(1)}, acc) 
                    ],
                    [  
                        t => isNil(t.completedSet) && isNil(t.deleted), 
                        t => evolve({active:add(1)}, acc) 
                    ], 
                    [
                        t => true,
                        t => acc
                    ]  
            ])(val),
            { 
                active:0, 
                completed:0, 
                deleted:0,
                trash:{
                    completed:0,
                    active:0 
                }
            }
        )
    ), 
    omit(['detached']), 
    applyTo(todos),
    groupBy, 
    cond,
    append([ () => true, () => 'detached' ]),
    map(p => [t => contains(t._id, p.layout), () => p._id])
)(projects); 


onmessage = (e) => {
   let [projects,todos] = e.data; 
   sendMessage(generateIndicators(projects,todos));
}
