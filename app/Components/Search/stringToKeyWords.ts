import { isNotEmpty } from "../../utils/utils";

export let stringToKeywords = (s:string) : string[] => s.trim().toLowerCase().split(' ').filter(isNotEmpty); 

