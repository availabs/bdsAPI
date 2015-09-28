'use strict';
/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 */

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/AppConstants'),
    EventEmitter = require('events').EventEmitter,
    assign = require('object-assign'),

    ActionTypes = Constants.ActionTypes,
    CHANGE_EVENT = 'change';

var _zipcodeList = [],
    _totals = {
      "annual_payroll":{},
      "q1_payroll":{},
      "employees":{},
      "establishments":{}
    },
    _variable = "annual_payroll",
    _details = {},
    _zip = "",
    _naics = "",
    _naicsList = [],
    _chosenVariable = "annual_payroll",
    _geoJSON = {},
    _fips = {
      "metro": "63217",
      "county": "36061",
      "state": "36"
    };

function _addUsers(rawData) {
  //console.log('stores/zbpStore/_addUsers',rawData);
  rawData.forEach(function(user) {
    
      _users[user.id] = user;
    
  });
};


var zbpStore = assign({}, EventEmitter.prototype, {

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  
  /**
   * @param {function} callback
   */

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  get: function(id) {
    return _users[id];
  },

  getAll: function() {
    return _users;
  },

  getZipList: function() {
    return _zipcodeList;
  },
  getNaicsList: function() {
    return _naicsList;
  },
  getZip: function() {
    return _zip;
  },
  getFips: function(type) {
    return _fips[type]; //error checking?
  },
  getTotals: function(varName) { 
    return _totals;
  },
  getVariable: function() {
    return _variable;
  },
  getDetails: function() {
    // if(Object.keys(_details).length !== 0)
    // console.log("ZBPstore getting details" , _details);
    
    return _details;
  },
  getNaics: function() {
    return _naics;
  },
  getChosenVariable: function() {
    return _chosenVariable;
  },
  getGeoJSON: function() {
    return _geoJSON;
  }
});

zbpStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case ActionTypes.RECEIVE_ZIPCODES:
      _zipcodeList = action.zipcodes.data;
      zbpStore.emitChange();
    break;
    
    case ActionTypes.RECEIVE_TOTALS:
      _totals[action.variable] = action.totals.data; //sets it based on whichever variable it is.
      _variable = action.variable; //still necessary?
      if(typeof action.codes === "string") {
        _zip = [action.codes];
      }
      else if(Array.isArray(action.codes)) {
        _zip = action.codes;
      }
      zbpStore.emitChange();
    break;
    
    case ActionTypes.RECEIVE_DETAILS:
      // if(action)
      //   console.log("receiving details", action);
      _details = action.details.data;
      if(typeof action.codes === "string") {
        _zip = action.codes;
      }
      else if(Array.isArray(action.codes)) {
        _zip = action.codes[0];
      }
      _naics = action.naics;
      zbpStore.emitChange();
    break;

    case ActionTypes.RECEIVE_NAICS:
      _naicsList = action.naics.data;
      zbpStore.emitChange();
    break;

    case ActionTypes.RECEIVE_GEOJSON:
      _geoJSON = action.geoJSON;
      zbpStore.emitChange();
    break;  

    case ActionTypes.SET_CURRENT_VAR:
      _chosenVariable = action.variable;
      zbpStore.emitChange();
    break;

    case ActionTypes.SET_CURRENT_ZIPCODE:
      //console.log(action);
      _zip = [action.zipcode]; // bc zipcode is wanted as an array at some point
      zbpStore.emitChange();
    break;

    case ActionTypes.SET_CURRENT_NAICS:
      _naics = action.naics;
      zbpStore.emitChange();
    break;

    case ActionTypes.SET_CURRENT_FIPS:
      _fips[action.fipsType] = action.code;
      zbpStore.emitChange();
    break;

    default:
      // do nothing
  }

});

module.exports = zbpStore;
