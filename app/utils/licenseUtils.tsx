import { actionLoadLicense, License, LicenseStatus, actionSaveLicense, actionDeleteLicense } from '../types'
import { pouchWorker } from '../app'
import { isNil, prop } from 'ramda'

export let loadLicenseFromDB = () => {
  let action : actionLoadLicense = { type:"loadLicense", load:({} as License)};
  let action_json = JSON.parse(JSON.stringify(action));
  pouchWorker.postMessage(action_json);
}

export let getLicenseStatus = (license:License) : {status:LicenseStatus, errorMessage?:string} => {
  let status:LicenseStatus = { lisenceDueDate:null, active:false }
  if (isNil(prop('data')(license))) return { status, errorMessage:'There is no valid license' }
  if (isNil(prop('success')(license.data))) return { status, errorMessage:'License data does not match API' }
  if (license.data.success === false) return { status, errorMessage:license.data.message }
  if (prop('purchase')(license.data)) {
    // let lisenceDueDate:Date = new Date('2018-09-17T19:59:02Z'); // expired date for testing
    status.lisenceDueDate = new Date(license.data.purchase.sale_timestamp);
    status.lisenceDueDate.setFullYear(status.lisenceDueDate.getFullYear() + 1);
    status.active = status.lisenceDueDate.getTime() - (new Date()).getTime() > 0
    let errorMessage = ''
    if (!status.active) errorMessage = 'Your license is expired.'
    return { status, errorMessage }
  } else return { status, errorMessage:'There is no purchase data in license' }
}

export let checkNewLicense = (license:License, dispatch:Function) => {
  if (isNil(license)) license = {data:null}
  let tmp = getLicenseStatus(license)
  license.status = tmp.status
  if (!isNil(tmp.errorMessage)) dispatch({type:"setLicenseErrorMessage", load:tmp.errorMessage})
  if (license.status.active) {
    dispatch({type:"setLicense", load:license}) // set to redux store (StateReducer.tsx)
    let action:actionSaveLicense = { type:"saveLicense", load:license }
    let action_json = JSON.parse(JSON.stringify(action));
    //todo: if it was load from DB it will save it again to DB
    pouchWorker.postMessage(action_json); // save new valid license to DB
  }  
}

export let deleteLicense = () => {
  let action : actionDeleteLicense = { type:"deleteLicense", load:({} as License)};
  let action_json = JSON.parse(JSON.stringify(action));
  pouchWorker.postMessage(action_json);
  // loadLicenseFromDB()
}