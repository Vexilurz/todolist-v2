import { getFinalNotificationPosition } from './getFinalNotificationPosition';
import {isNil} from 'ramda';

export let move = (window) : Promise<void> => new Promise(
    resolve => {
        if(isNil(window)){ resolve(); }

        let {finalX,finalY} = getFinalNotificationPosition(window);
        let currentPosition = window.getPosition();
        let [x,y] = currentPosition;
        let delta = 20;

        if(y<=finalY){ 
            window.setPosition(finalX, finalY);
            resolve();
        }else{
            window.setPosition(x, y-delta);
            setTimeout(() => move(window), 30);   
        }
    }
);
