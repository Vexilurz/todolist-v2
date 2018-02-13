

export let generateEmptyTodo = (
    _id:string,
    selectedCategory,
    priority:number
) => ({    
    _id,
    type:"todo", 
    category : selectedCategory,  
    title : '', 
    priority, 
    reminder : null, 
    note : '',
    checklist : [],   
    attachedTags : [],
    attachedDate : null,
    deadline : null,
    created : new Date(),  
    deleted : null, 
    completedWhen : null,
    completedSet : null
});

