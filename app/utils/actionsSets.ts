
export const actionsSets = {
    todos:{ 
        add: {withOne:"addTodo", withMany:"addTodos"}, 
        remove: {withOne:"removeTodo", withMany:"removeTodos"}, 
        update: {withOne:"updateTodo", withMany:"updateTodos"}
    },

    projects:{ 
        add: {withOne:"addProject", withMany:"addProjects"}, 
        remove: {withOne:"removeProject", withMany:"removeProjects"},
        update: {withOne:"updateProject", withMany:"updateProjects"}
    },

    areas:{ 
        add: {withOne:"addArea", withMany:"addAreas"}, 
        remove: {withOne:"removeArea", withMany:"removeAreas"},
        update: {withOne:"updateArea", withMany:"updateAreas"} 
    },

    calendars:{ 
        add: {withOne:"addCalendar", withMany:"addCalendars"}, 
        remove: {withOne:"removeCalendar", withMany:"removeCalendars"}, 
        update: {withOne:"updateCalendar", withMany:"updateCalendars"} 
    }
};