import { actionLoadLicense, License } from '../types'
import { pouchWorker } from '../app'

export let loadLicenseFromDB = () => {
  let actionLoadLicense : actionLoadLicense = { type:"loadLicense", load:({} as License)};
  let actionLoadLicense_json = JSON.parse(JSON.stringify(actionLoadLicense));
  pouchWorker.postMessage(actionLoadLicense_json);
}