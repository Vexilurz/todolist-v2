
import '../../assets/styles.css';  
import { typeEquals } from '../../utils/utils'; 
import { 
    values, allPass, isNil, cond, always 
} from 'ramda';
import { isArray, isString, isDate, isNotDate, isCategory } from '../../utils/isSomething';

export let getSearchItemType = 
cond([
    [isNil, always(null)],
    [typeEquals("todo"), always("todo")],
    [typeEquals("project"), always("project")],
    [typeEquals("area"), always("area")],
    [isCategory, always("category")],
    [isString, always("tag")],
    [always(true), always(null)]
]); 

