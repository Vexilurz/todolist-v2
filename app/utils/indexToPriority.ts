export let indexToPriority = (items:any[]) : any[] => items.map(
    (item,index:number) => ({...item,priority:index})
); 