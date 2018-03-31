import { isEmpty, isNil, contains, intersection, flatten, all, compose, map } from 'ramda';
import { filter } from 'lodash';
import { byHidden } from './byHidden';
import { isString } from './isSomething';
import { Todo, Project, Area, Category } from './../types';

export let projectsToHiddenTodosIDs = (selectedCategory:Category) => compose(
    flatten, 
    map( (p:Project) => p.layout.filter(isString) ),
    projects => filter(projects, byHidden(selectedCategory))
);   