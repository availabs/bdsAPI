

var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    
    //-------------------------------------------------------
    //View actions 
    //-------------------------------------------------------
    SELECT_USER: null,
    CREATE_USER:null,
    SET_CURRENT_ZIPCODE:null,
    SET_CURRENT_NAICS: null,
    SET_CURRENT_VAR: null,
    SET_CURRENT_FIPS: null,
    //-------------------------------------------------------
    //Server actions 
    //-------------------------------------------------------
    SET_APP_SECTION:null,
    RECEIVE_ZIPCODES:null,
    RECEIVE_TOTALS:null,
    RECEIVE_DETAILS:null,
    RECEIVE_NAICS:null,
    RECEIVE_GEOJSON:null,
    RECEIVE_FIPS_TABLE: null,
    //-------User--------------------------------------------
    RECEIVE_USERS: null,
    SET_SESSION_USER:null,


  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })

};
