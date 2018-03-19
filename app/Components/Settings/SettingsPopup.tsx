import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { section } from './section';
import { Calendar, Area, Project, Todo } from '../../database';
import { SimplePopup } from '../SimplePopup';
import { Settings, SettingsProps } from './settings';


interface SettingsPopupProps extends SettingsProps{
    openSettings:boolean
}


interface SettingsPopupState{}


export class SettingsPopup extends Component<SettingsPopupProps,SettingsPopupState>{
    constructor(props){ super(props) }
    render(){ 
        return <SimplePopup
           show={this.props.openSettings} 
           onOutsideClick={() => this.props.dispatch({type:"openSettings",load:false})}
        >
            <Settings 
                selectedSettingsSection={this.props.selectedSettingsSection}

                enableShortcutForQuickEntry={this.props.enableShortcutForQuickEntry}
                quickEntrySavesTo={this.props.quickEntrySavesTo}

                hideHint={this.props.hideHint}
                calendars={this.props.calendars}
                showCalendarEvents={this.props.showCalendarEvents}
                limit={this.props.limit}

                shouldSendStatistics={this.props.shouldSendStatistics}
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                groupTodos={this.props.groupTodos}
                disableReminder={this.props.disableReminder}

                todos={this.props.todos}
                defaultTags={this.props.defaultTags}

                dispatch={this.props.dispatch}
            /> 
        </SimplePopup>    
    }  
};  