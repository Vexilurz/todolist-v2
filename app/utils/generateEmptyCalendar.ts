import { generateId } from "./generateId";
import { Calendar } from "../types";

export let generateEmptyCalendar = () : Calendar => ({
        url:'', 
        active:false,
        _id:generateId(),
        name:'', 
        description:'',
        timezone:'',
        events:[],
        type:"calendar"
});