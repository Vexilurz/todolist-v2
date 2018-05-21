export let cutBy = (by:String) => (words:string[]) => words.map(word => word.substring(0,by.length));
