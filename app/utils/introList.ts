import { noteFromText } from "./draftUtils";
import { Project, Heading, Todo } from "../types";


export let getIntroList = () : Project => {
    let layout = introListLayout.map((item) => item.type==="todo" ? item._id : item);

    return {    
        _id : "Intro List",    
        type : "project",  
        name : "Intro List",  
        priority : 1,
        deleted : undefined,
        description : noteFromText(`This project shows you everything you need to know to hit the ground running. Don't hesistate to play around in it - you can always create a new one from the help menu.`), 
        created : new Date(),
        deadline : null,
        completed : null,
        layout : layout as any,     
        attachedTags : [] 
    };
};        



export const introListIds : string[] = [
    "Intro List",
    "Learn the basics",
    "Click this task",
    "Create a new task",
    "Plan this task for later",
    "Create new heading",
    "Create a project",
    "You're done",
    "Tune your setup",
    "Show your calendar events",
    "Enable the today widget",
    "Sync your devices",
    "Boost your productivity",
    "Add task from anywhere",
    "Link to emails, files, and web pages",
    "Search and navigate with Quick Find",
    "Tag your task",
    "Go step by step with checklists",
    "Add a reminder so you won't forget",
    "Plan your evening",
    "Hide the sidebar to focus on your work",
    "Open multiple windows",
    "Convert a task into a project",
    "Make your task repeat",          
    "Before you go...",
    "Any questions ? We're here to help!"
];



export const introListLayout : (Todo | Heading)[] = [
    {
        type : "heading", 
        priority:1,
        title : "Learn the basics", 
        _id : "Learn the basics", 
        key : "Learn the basics"
    }, 
    {
        type:"todo",
        category:"project",
        title:"Click this task",
        priority:2,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Click this task"
    },
    {
        type:"todo",
        category:"project",
        title:"Create a new task",
        priority:3,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Create a new task"
    },
    {
        type:"todo",
        category:"project",
        title:"Plan this task for later",
        priority:4,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Plan this task for later"
    },
    {
        type:"todo",
        category:"project",
        title:"Create new heading",
        priority:5,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Create new heading"
    },
    {
        type:"todo",
        category:"project",
        title:"Create a project",
        priority:6,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Create a project"
    },
    {
        type:"todo",
        category:"project",
        title:"You're done",
        priority:7,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"You're done"
    },
    {
        type : "heading", 
        priority:8,
        title : "Tune your setup", 
        _id : "Tune your setup", 
        key : "Tune your setup"
    }, 
    {
        type:"todo",
        category:"project",
        title:"Show your calendar events",
        priority:9,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Show your calendar events"
    },
    {
        type:"todo",
        category:"project",
        title:"Enable the today widget",
        priority:10,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Enable the today widget"
    },
    {
        type:"todo",
        category:"project",
        title:"Sync your devices",
        priority:11,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Sync your devices"
    },
    {
        type : "heading", 
        priority:12,
        title : "Boost your productivity", 
        _id : "Boost your productivity", 
        key : "Boost your productivity"
    },
    {
        type:"todo",
        category:"project",
        title:"Add task from anywhere",
        priority:13,
        note:noteFromText(""),
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
        note:noteFromText(""),
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
        title:"Search and navigate with Quick Find",
        priority:15,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Search and navigate with Quick Find"
    },
    {
        type:"todo",
        category:"project",
        title:"Tag your task",
        priority:16,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Tag your task"
    },
    {
        type:"todo",
        category:"project",
        title:"Go step by step with checklists",
        priority:17,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Go step by step with checklists"
    },
    {
        type:"todo",
        category:"project",
        title:"Add a reminder so you won't forget",
        priority:18,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Add a reminder so you won't forget"
    },
    {
        type:"todo",
        category:"project",
        title:"Plan your evening",
        priority:19,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Plan your evening"
    },
    {
        type:"todo",
        category:"project",
        title:"Hide the sidebar to focus on your work",
        priority:20,
        note:noteFromText(""),
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completedSet:null,
        completedWhen:null,
        _id:"Hide the sidebar to focus on your work"
    },
    {
        type:"todo",
        category:"project",
        title:"Open multiple windows",
        priority:21,
        note:noteFromText(""),
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
        note:noteFromText(""),
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
        note:noteFromText(""),
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
        note:noteFromText(""),
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