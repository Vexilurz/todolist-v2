import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { SimplePopup } from '../SimplePopup';
import { Settings, SettingsProps } from './settings';
import { isActive } from '../../utils/licenseUtils'
import { isNil } from 'ramda';


interface SettingsPopupProps extends SettingsProps{
    openSettings:boolean
}



interface SettingsPopupState{}
 


export class SettingsPopup extends Component<SettingsPopupProps,SettingsPopupState>{
    constructor(props){ super(props) }

    onOutsideClick = () => {
        if (!isNil(this.props.license))
        if (isActive(this.props.license.dueDate)) {
          this.props.dispatch({type:"openSettings",load:false})
          this.props.dispatch({type:"setLicenseErrorMessage", load:''})      
        }
    }

    render(){ 
        return <SimplePopup
            show={this.props.openSettings} 
            onOutsideClick={this.onOutsideClick}
        > 
            <Settings 
                email={this.props.email} 
                sync={this.props.sync} 
                lastSync={this.props.lastSync} 
                secretKey={this.props.secretKey} 
                import={this.props.import}
                lastImport={this.props.lastImport}
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

                license={this.props.license}
                licenseErrorMessage={this.props.licenseErrorMessage}
                dispatch={this.props.dispatch}
            /> 
        </SimplePopup>    
    }  
};   