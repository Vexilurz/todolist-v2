import {not,cond} from "ramda";
import { timeOfTheDay, inTimeRange } from './time';
import { CalendarEvent } from "../Components/Calendar";
import { timeIsMidnight } from "./utils";
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 

export let getSameDayEventElement : (event:CalendarEvent, showDescription:boolean) => JSX.Element =
           (event,showDescription) => cond([
                [ 
                    //end
                    (event) => {
                        let {sequenceEnd,sequenceStart} = event;
                        return not(sequenceStart) && sequenceEnd; 
                    },
                    (event) => <div style={{
                        display:"flex",
                        height:"20px",
                        alignItems:"center"
                    }}>
                        <div style={{
                            fontSize:"14px",
                            userSelect:"none",
                            cursor:"default",
                            fontWeight:500, 
                            paddingRight:"5px",
                            overflowX:"hidden"
                        }}>   
                            {event.name}   
                        </div>
                        {
                            timeOfTheDay(event.end)==='23:59' ? null :
                            <div style={{fontSize:"14px",fontWeight:500}}>
                                {`(ending ${timeOfTheDay(event.end)})`} 
                            </div>
                        }
                    </div>
                ],
                [
                    (event) => {
                        let {sequenceStart} = event;
                        return sequenceStart && timeIsMidnight(event.start); 
                    },
                    (event) => <div style={{
                        display:"flex",
                        height:"20px",
                        alignItems:"center"
                    }}>
                        <div style={{
                            fontSize:"14px",
                            userSelect:"none",
                            cursor:"default",
                            fontWeight:500,
                            overflowX:"hidden"
                        }}>   
                            {event.name}   
                        </div>
                    </div>
                ],
                [
                    (event) => true,
                    (event) => <div style={{
                        display:"flex",
                        height:"20px",
                        alignItems:"center"
                    }}>
                        <div style={{fontSize:"14px",fontWeight:500}}>
                            {timeOfTheDay(event.start)} 
                        </div>
                        <div style={{
                            fontSize:"14px",
                            userSelect:"none",
                            cursor:"default",
                            fontWeight:500,
                            paddingLeft:"5px",
                            overflowX:"hidden"
                        }}>   
                            {event.name}   
                        </div>
                    </div>
                ]
            ])(event);
