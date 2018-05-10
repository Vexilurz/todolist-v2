import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react";  
import { Todo, Project, Heading, LayoutItem, Area, RawDraftContentState, Category } from '../../types'; 
import { debounce } from 'lodash';
import { byNotCompleted, byTags, byNotSomeday, byScheduled, removeHeading, isNotEmpty, byCompleted } from '../../utils/utils'; 
import { ProjectHeader } from './ProjectHeader';
import { ProjectBody } from './ProjectBody';
import { 
    adjust, allPass, uniq, isEmpty, not, isNil, map, prop, takeWhile, splitAt, groupBy, complement,
    compose, defaultTo, ifElse, all, contains, findIndex, equals, last, reject, when, identity, anyPass 
} from 'ramda';
import { filter } from 'lodash';
import { bySomeday, isProject, isTodo, isString, isDate, isNotNil, isHeading } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { daysRemaining } from '../../utils/daysRemaining';
import { isDev } from '../../utils/isDev';
import { noteFromState } from '../../utils/draftUtils';
import { TodoInput } from '../TodoInput/TodoInput';
import { ToggleScheduledButton } from './ToggleScheduledButton';
import { ToggleCompletedButton } from './ToggleCompletedButton';
import { TodosList } from '../TodosList';


let byNotFuture = (t:Todo) => isNotNil(t.attachedDate) ? daysRemaining(t.attachedDate)<=0 : true;

let byFuture = complement(byNotFuture);


interface ProjectComponentProps{ 
    project:Project,  
    moveCompletedItemsToLogbook:string,
    indicator:{
        active:number,
        completed:number,
        deleted:number
    },
    filters:{
        inbox:((todo:Todo) => boolean)[],
        today:((todo:Todo) => boolean)[],
        hot:((todo:Todo) => boolean)[],
        next:((todo:Todo) => boolean)[],
        someday:((todo:Todo) => boolean)[],
        upcoming:((todo:Todo) => boolean)[],
        logbook:((todo:Todo) => boolean)[],
        trash:((todo:Todo) => boolean)[] 
    },
    todos:Todo[],
    groupTodos:boolean, 
    selectedTodo:Todo,
    projects:Project[], 
    selectedTags:string[], 
    dragged:string, 
    areas:Area[], 
    scrolledTodo:Todo,
    selectedCategory:string, 
    selectedProjectId:string, 
    selectedAreaId:string,  
    rootRef:HTMLElement,
    dispatch:Function
}
  


interface ProjectComponentState{}   
 

 
export class ProjectComponent extends Component<ProjectComponentProps,ProjectComponentState>{

    constructor(props){
        super(props); 
    }   



    updateProjectName = debounce(
        (value:string) : void => this.props.dispatch({
            type:"updateProject", 
            load:{...this.props.project, name:value}
        }),
        250
    );
 
 
     
    updateProjectDescription = debounce(
        (editorState:any) : void => this.props.dispatch({
            type:"updateProject", 
            load:{...this.props.project, description:noteFromState(editorState)}
        }),
        250
    );
 
 
    
    updateHeading = debounce(
        (headingId:string, newValue:string) => { 
            let {project} = this.props;
            let layout = project.layout;
            let idx = layout.findIndex((i:any) => isString(i) ? false : i._id===headingId);
            
            if(isDev()){
               assert(idx!==-1, `Item does not exist. ${headingId} updateHeading. ${layout}`); 
            }

            let updatedLayout = adjust(() => ({...layout[idx] as Heading, title:newValue}), idx, layout);
            
            this.props.dispatch({
                type:"updateProject", 
                load:{...this.props.project, layout:updatedLayout}
            });
        },
        250
    ); 
    

     
    updateLayoutOrder = (layout:LayoutItem[]) => {
        let { project } = this.props;

        if(isDev()){
            assert(
               layout.length===project.layout.length,
               `incorrect length. 
                was : ${project.layout.length}; 
                now : ${layout.length}; 
                updateLayoutOrder.`
            ); 
        }
          
        this.props.dispatch({type:"updateProject", load:{...this.props.project, layout}});
    };
     


    removeHeading = (heading_id:string) => {
        let {project} = this.props;
        let next = removeHeading(heading_id,project);
        this.props.dispatch({type:"updateProject", load:{...this.props.project, ...next}});
    };



    getLayout = () => 
    isNil(this.props.project) ? [] : 
    this.props
        .project
        .layout
        .map((item:LayoutItem) => isString(item) ? this.props.todos.find(todo => todo._id===item) : item)
        .filter(isNotNil);  



    onToggleCompleted = (e) => {
        this.props.dispatch({ type:"toggleCompleted", load:prop('_id',this.props.project) });
    };

 
     
    onToggleScheduled = (e) => {
        this.props.dispatch({ type:"toggleScheduled", load:prop('_id',this.props.project) });
    };



    removeHeadingWithTasks = (heading_id:string) => {
        let {project} = this.props;
        let {layout} = this.getData();
        let idx = layout.findIndex(item => item._id===heading_id);
        let actions = [];

        let todosToRemove : Todo[] = ifElse(
            equals(-1),
            () => [],
            (idx) => compose(
                takeWhile(isTodo),
                last,
                splitAt(idx+1),
            )(layout)
        )(idx);

        if(isNotEmpty(todosToRemove)){
            actions.push({
              type:"updateTodos",   
              load:todosToRemove.map(t => ({...t,reminder:null,deleted:new Date()}))
            });
        }

        let next = removeHeading(heading_id,project);
        
        actions.push({type:"updateProject", load:{...this.props.project, ...next}});

        this.props.dispatch({type:"multiple", load:actions});
    };



    updateProjectDeadline = (deadline:Date) =>  this.props.dispatch({
        type:"updateProject", 
        load:{...this.props.project, deadline}
    });
    
    

    attachTagToProject = (tag:string) => {
        let project = this.props.projects.find((p:Project) => this.props.selectedProjectId===p._id);
        let attachedTags = uniq([tag, ...project.attachedTags]);   
        
        this.props.dispatch({type:"updateProject",load:{...this.props.project, attachedTags}});
    }; 



    getData = () => {

        let {showCompleted, showScheduled} = this.props.project;

        let layout = this.getLayout();

        let scheduledFilter = anyPass([bySomeday,byFuture]);

        return layout.reduce(
            (acc,item:any) => {
                if(isHeading(item)){ acc.layout.push(item); return acc; }

                if( scheduledFilter(item) ){ 
                    acc.scheduledEmpty = false; 
                    if(!showScheduled){ return acc; }
                }

                if( byCompleted(item) ){ 
                    acc.completedEmpty = false; 
                    if(!showCompleted){ 
                        acc.completed.push(item);
                        return acc; 
                    }
                }

                acc.header.push(item);
              
                if(byTags(this.props.selectedTags)(item) && byNotCompleted(item)){
                   acc.layout.push(item);
                }

                if(byTags(this.props.selectedTags)(item) && byCompleted(item)){
                   acc.completed.push(item);
                }

                return acc;
            }, 
            {
                completedEmpty:true,
                scheduledEmpty:true,
                header:[],
                layout:[],
                completed:[]
            }
        );
    };

    

    render(){   
        if(isNil(this.props.project)){ return null } 


        let {showCompleted, showScheduled} = this.props.project;


        let {
            completedEmpty,
            scheduledEmpty,
            header,
            layout,
            completed
        } = this.getData();


        return <div id={`${this.props.selectedCategory}-list`}>      
            <div className="unselectable">     
                <ProjectHeader 
                    project={this.props.project} 
                    onToggleScheduled={this.onToggleScheduled}
                    onToggleCompleted={this.onToggleCompleted}
                    indicator={this.props.indicator}
                    rootRef={this.props.rootRef}
                    attachTagToProject={this.attachTagToProject}
                    selectedTags={this.props.selectedTags}    
                    updateProjectDeadline={this.updateProjectDeadline}
                    updateProjectName={this.updateProjectName}
                    updateProjectDescription={this.updateProjectDescription} 
                    todos={header} 
                    dispatch={this.props.dispatch}   
                />           
            </div>    
            <ProjectBody    
                items={layout}
                project={this.props.project}
                dragged={this.props.dragged}
                groupTodos={this.props.groupTodos}
                filters={this.props.filters}
                selectedCategory={this.props.selectedCategory}
                scrolledTodo={this.props.scrolledTodo}
                selectedTodo={this.props.selectedTodo}
                showCompleted={showCompleted}
                updateLayoutOrder={this.updateLayoutOrder}
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                removeHeading={this.removeHeading}
                updateHeading={this.updateHeading}
                removeHeadingWithTasks={this.removeHeadingWithTasks}
                selectedTags={this.props.selectedTags}    
                areas={this.props.areas}      
                selectedProjectId={this.props.selectedProjectId}
                selectedAreaId={this.props.selectedAreaId}  
                projects={this.props.projects} 
                rootRef={this.props.rootRef}
                dispatch={this.props.dispatch} 
            /> 
            <div style={{
                display:"flex", 
                flexDirection:"column", 
                alignItems:"flex-start",
                paddingTop:"10px",
                paddingBottom:"10px"
            }}>
                {
                    completedEmpty ? null :
                    <ToggleCompletedButton
                        onToggle={this.onToggleCompleted}
                        showCompleted={showCompleted}
                    />
                }
                {
                    scheduledEmpty ? null :
                    <ToggleScheduledButton
                        onToggle={this.onToggleScheduled}
                        showScheduled={showScheduled}
                    />
                }
            </div>
            {
                completedEmpty ? null :
                !showCompleted ? null :
                <div style={{
                    display:"flex", 
                    flexDirection:"column", 
                    width:"100%"
                }}>      
                    <TodosList    
                        dispatch={this.props.dispatch}  
                        filters={this.props.filters}
                        groupTodos={this.props.groupTodos}
                        sortBy={(a:Todo,b:Todo) => a.priority-b.priority}
                        selectedCategory={this.props.selectedCategory as Category}
                        scrolledTodo={this.props.scrolledTodo} 
                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                        selectedAreaId={this.props.selectedAreaId}
                        selectedProjectId={this.props.selectedProjectId}
                        areas={this.props.areas}
                        projects={this.props.projects}
                        rootRef={this.props.rootRef}
                        todos={completed}   
                    />  
                </div> 
            }
        </div> 
    }
}; 
  