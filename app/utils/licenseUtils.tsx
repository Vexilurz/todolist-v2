import { actionLoadLicense, License, actionSaveLicense, actionDeleteLicense } from '../types'
import { pouchWorker } from '../app'
import { isNil, prop } from 'ramda'

let calcNewDemoDueDate = ():Date => {
  let date = new Date();
  date.setDate(date.getDate() + 7);
  return date
}

let calcDueDate = (fromDate:Date):Date => {
  let dueDate = new Date(fromDate);
  dueDate.setFullYear(dueDate.getFullYear() + 1);
  return dueDate
}

export let calcDaysRemaining = (dueDate:Date):number => {
  return ((new Date(dueDate)).getTime() - (new Date()).getTime()) / (1000 * 3600 * 24)
}

export let isActive = (dueDate:Date):boolean => {
  return calcDaysRemaining(dueDate) > 0
}

export let getNewDemoLicense = ():License => {
  return {
    data:null,
    key:'DEMO',
    dueDate:calcNewDemoDueDate(),
    demo:true
  }
}

export let createLicense = (data:any):License => {
  // if (isNil(data)) return null;//getNewDemoLicense();
  // let dueDate = new Date();
  // dueDate.setDate(dueDate.getDate() + 1);
  if (prop('purchase')(data)) {
    return {
      data,
      key : data.purchase.license_key,
      // dueDate, // expired date for testing
      // dueDate : new Date('2018-09-17T19:59:02Z'), // expired date for testing
      // dueDate : calcDueDate(data.purchase.sale_timestamp),
      dueDate : calcDueDate(new Date()),
      demo : false
    }
  } else throw new Error("There is no 'purchase' field in responce.")
}

export let checkLicense = (license:License, dispatch:Function, isNewLicense?:boolean) => {  
  // console.log("checkLicense", license)
  let err = ''  
  if (!isNil(license)) {
    if (isActive(license.dueDate)) { // comment this if you want to test expired data
      dispatch({type:"setLicense", load:license}) // set to redux store (StateReducer.tsx)   

      let action:actionSaveLicense = { type:"saveLicense", load:license }
      let action_json = JSON.parse(JSON.stringify(action));
      //todo: if it was load from DB it will save it again to DB...
      // but if it was new demo license - it's ok
      pouchWorker.postMessage(action_json); // save new valid license to DB    
      if (isNewLicense) err = 'License has successfully updated.'
    } else err = "Your license expired."
  } else err = "You don't have any active license."
  dispatch({type:"setLicenseErrorMessage", load:err})
  setBannerText(license, dispatch) 
}

let setBannerText = (license:License, dispatch:Function) => {
  if (isNil(license))
    dispatch({type:'setBannerText', load:{
      text:"You don't have any active license. ",
      hrefText:'Please enter your license key here.'}
    })
  else if (license.demo) 
    dispatch({type:'setBannerText', load:{
      text:isActive(license.dueDate) ?
        'You are using the demo version. ' :
        'Demo version is expired. ',
      hrefText:'Please enter your license key here.'}
    })
  else {
    let daysDemaining = Math.round(calcDaysRemaining(license.dueDate))
    dispatch({type:'setBannerText', load:{
      text:isActive(license.dueDate) ? 
        `Your license expires in ${daysDemaining} days. ` : 
        'Your license expired. ',
      hrefText:'Please renew your license key here.'}
    })
  }
}

export let loadLicenseFromDB = () => {
  let action : actionLoadLicense = { type:"loadLicense", load:({} as License)};
  let action_json = JSON.parse(JSON.stringify(action));
  pouchWorker.postMessage(action_json);
}

export let deleteLicense = () => {
  let action : actionDeleteLicense = { type:"deleteLicense", load:({} as License)};
  let action_json = JSON.parse(JSON.stringify(action));
  pouchWorker.postMessage(action_json);
  // loadLicenseFromDB()
}