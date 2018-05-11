import { fixIncomingData } from '../../../app/utils/fixIncomingData';
import { moveReminderFromPast, assureCorrectCompletedTypeTodo, assureCorrectNoteTypeTodo } from '../../../app/utils/getData';
import { convertTodoDates, removeRev } from '../../../app/utils/utils';
import { setDefaultsTodo } from '../../../app/utils/setDefaults';


describe(
    'fixIncomingData', 
    () => {  
     
        it(    
            ``,
            function(){ 
                this.timeout(0);
                fixIncomingData

                moveReminderFromPast
                convertTodoDates
                assureCorrectCompletedTypeTodo
                assureCorrectNoteTypeTodo
                setDefaultsTodo
                removeRev
            } 
        );
    }
); 
