import { actionLoadLicense, License, LicenseStatus, actionSaveLicense, actionDeleteLicense } from '../types'
import { pouchWorker } from '../app'
import { isNil, prop } from 'ramda'

let calcNewDemoSaleDate = ():Date => {
  let date = new Date();
  date.setDate(date.getDate() + 7);
  date.setFullYear(date.getFullYear() - 1);
  return date
}

let calcDueDate = (fromDate:Date):Date => {
  let dueDate = new Date(fromDate);
  dueDate.setFullYear(dueDate.getFullYear() + 1);
  return dueDate
}

let calcDaysRemaining = (dueDate:Date):number => {
  return Math.round((dueDate.getTime() - (new Date()).getTime()) / (1000 * 3600 * 24))
}

let getNewDemoLicense = ():License => {
  return {
    data:{
      success:true,
      purchase:{
        license_key:'DEMO',
        sale_timestamp:calcNewDemoSaleDate()
      }
    },
    status:{ demo:true, dueDate:null, daysRemaining:0, active:false }
  }
}

let getLicenseStatus = (license:License) : {status:LicenseStatus, errorMessage?:string} => {
  let status:LicenseStatus = { dueDate:null, daysRemaining:0, active:false }
  if (prop('demo')(prop('status')(license))) status.demo = true;

  if (license.data.success === false) return { status, errorMessage:license.data.message }

  if (prop('purchase')(license.data)) {
    // status.dueDate = new Date('2018-09-17T19:59:02Z'); // expired date for testing
    status.dueDate = calcDueDate(license.data.purchase.sale_timestamp) 
    status.daysRemaining = calcDaysRemaining(status.dueDate) 
    status.active = status.daysRemaining > 0
    let errorMessage = ''
    if (!status.active) errorMessage = 'Your license is expired.'
    return { status, errorMessage }
  } else return { status, errorMessage:'There is no purchase data in license' }
}

export let checkLicense = (license:License, dispatch:Function) => {
  // if license is undefined - this is first app launch. Run demo mode.
  if (isNil(license)) license = getNewDemoLicense()  

  let tmp = getLicenseStatus(license) 
  license.status = tmp.status   

  dispatch({type:"setLicenseErrorMessage", load:tmp.errorMessage})

  if (license.status.active) {
    dispatch({type:"setLicense", load:license}) // set to redux store (StateReducer.tsx)   
     
    let action:actionSaveLicense = { type:"saveLicense", load:license }
    let action_json = JSON.parse(JSON.stringify(action));
    //todo: if it was load from DB it will save it again to DB
    pouchWorker.postMessage(action_json); // save new valid license to DB

    if (prop('demo')(license.status)) 
      dispatch({type:'setBannerText', load:{
        text:'You are using the demo version. ',
        hrefText:'Please enter your license key here.'}
      })
    else
      dispatch({type:'setBannerText', load:{
        text:`Your license expires in ${license.status.daysRemaining} days. `,
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