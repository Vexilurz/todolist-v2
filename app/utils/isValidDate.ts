export let isValidDate = (date) => {
    try{
       let result = date.toISOString();
       return true;
    }catch(e){
       return false;
    }
};