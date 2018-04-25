import { BrowserWindow } from "electron";
import { isNil, contains, equals, not } from 'ramda';

export let getClonedWindows = (mainWindow:BrowserWindow) : BrowserWindow[] =>  
    BrowserWindow
    .getAllWindows()
    .filter(
        (window:BrowserWindow) => {
            let mainWindowId = isNil(mainWindow) ? 1 : mainWindow.id;
            let title = window.getTitle();
            let id = window.id;

            let isDefaultWindow = contains(title)(['Add task','Notification']);
            let isMainWindow = equals(id,mainWindowId);

            return not(isDefaultWindow) && not(isMainWindow);
        }
    );  