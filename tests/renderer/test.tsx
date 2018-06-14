const getQuickFindSuggestions = require('./utils/getQuickFindSuggestions'); 
const repeat = require('./utils/repeat'); 
const limitGroups = require('./utils/limitGroups'); 
const locateItem = require('./utils/locateItem'); 
const applicationReducer = require('./utils/applicationReducer'); 
const changesToActions = require('./utils/changesToActions'); 
const crypt = require('./utils/crypto'); 
const database = require('./utils/database'); 
const detectChanges = require('./utils/detectChanges'); 
const fixIncomingData = require('./utils/fixIncomingData'); 
const generateIndicatorsWorker = require('./utils/generateIndicatorsWorker'); 
const pouchWorker = require('./utils/pouchWorker'); 
const toStoreChanges = require('./utils/toStoreChanges'); 
const generateUpcomingSequence = require('./utils/generateUpcomingSequence'); 
const updateConfigFromStore = require('./utils/updateConfigFromStore'); 
const MainContainer = require('./Components/MainContainer'); 
const updateDatabase = require('./utils/updateDatabase'); 