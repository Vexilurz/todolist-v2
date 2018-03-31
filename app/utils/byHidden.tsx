import { contains } from 'ramda';
import { Todo, Project, Area, Category } from './../types';
import { isNotArray, isString } from './isSomething';

export let byHidden = (selectedCategory:Category) => 
                      (project:Project) => isNotArray(project.hide) ? false : contains(selectedCategory,project.hide);

                     