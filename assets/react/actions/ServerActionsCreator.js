/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/AppConstants');

var ActionTypes = Constants.ActionTypes;

module.exports = {
  //------------------------------------
  // App
  //------------------------------------
  setAppSection: function(data){
    //console.log('set app section action',data)
    AppDispatcher.handleServerAction({
      type: ActionTypes.SET_APP_SECTION,
      section: data
    })
  },

  //------------------------------------
  // User
  //------------------------------------
  setSessionUser:function(data){
    AppDispatcher.handleServerAction({
      type: ActionTypes.SET_SESSION_USER,
      user:data
    })
  },
  
  //------------------------------------
  // CRUD Handlers
  //------------------------------------

  receiveData: function(type,data) {
    //handles Create,Read & Update
    var actiontype = 'RECEIVE_'+type.toUpperCase()+'S';
    AppDispatcher.handleServerAction({
      type: ActionTypes[actiontype],
      data: data
    });
  },
  
  deleteData:function(id){
    AppDispatcher.handleServerAction({
      type: ActionTypes.DELETE_USER,
      Id: id
    });
  },
  //------------------------------------
  // Zip Codes
  //------------------------------------
  receiveZipList: function(data) {
    AppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_ZIPCODES,
      zipcodes: data
    });
  },
  receiveNaicsList: function(data) {
    AppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_NAICS,
      naics: data
    });
  },
  receiveTotals: function(varName, data, codes) {
    AppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_TOTALS,
      variable: varName,
      codes: codes,
      totals: data
    });
  },
  receiveDetails: function(data, codes, naics) {
    //console.log("Receiving details", data, codes, naics);
    AppDispatcher.handleServerAction({
      type:ActionTypes.RECEIVE_DETAILS,
      details: data,
      codes: codes,
      naics: naics
    });
  },
  receiveGeoJSON: function(geoJSON) {
    AppDispatcher.handleServerAction({
      type:ActionTypes.RECEIVE_GEOJSON,
      geoJSON: geoJSON
    });
  }

};
