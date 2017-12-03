import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, compose, contains, and, find, 
    defaultTo,addIndex, split, filter, clone, take, drop, reject, isNil, equals, assocPath } from 'ramda';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import {
  cyan500, cyan700,   
  pinkA200,
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors'; 
import {fade} from 'material-ui/utils/colorManipulator';
import FlatButton from 'material-ui/FlatButton';
import spacing from 'material-ui/styles/spacing'; 
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ActionFavorite from 'material-ui/svg-icons/action/favorite';
import ActionFavoriteBorder from 'material-ui/svg-icons/action/favorite-border';
import AutoComplete from 'material-ui/AutoComplete';
import './assets/styles.css';  
import { ipcRenderer } from 'electron';
import Dialog from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentClear from 'material-ui/svg-icons/content/clear';
import Divider from 'material-ui/Divider';
import AppBar from 'material-ui/AppBar'; 
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu'; 
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import Play from 'material-ui/svg-icons/av/play-circle-outline';
import Delete from 'material-ui/svg-icons/action/delete'; 
import Pause from 'material-ui/svg-icons/av/pause-circle-outline';
import Clear from 'material-ui/svg-icons/content/clear';  
import Menu from 'material-ui/svg-icons/navigation/menu';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Face from 'material-ui/svg-icons/social/sentiment-very-satisfied';  
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { Component } from "react"; 
import Paper from 'material-ui/Paper';
import { DraggableCore, DraggableEventHandler, DraggableData } from 'react-draggable';
import { wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps } from "./utils";
let uniqid = require('uniqid'); 
import { SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import { createStore, combineReducers } from "redux";
import { Provider, connect } from "react-redux";
import FullScreen from 'material-ui/svg-icons/image/crop-square';
import SmallScreen from 'material-ui/svg-icons/image/filter-none';
import ContentAdd from 'material-ui/svg-icons/content/add';

    
 
export let reducer = (state, action) => {

    let newState = clone(state); 
          
    return cond([   
            [       
                equals(""),   
                () => assocPath([""], action.load, newState) 
            ],
            [ () => true, () => newState]
    ])(action.type);  
 
};    
  