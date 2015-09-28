'use strict';
/*
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 *.
 */

var io = require('./sails.io.js')();
var ServerActionCreators = require('../../actions/ServerActionsCreator');

var defaults = {
  zip: ["10001"],
  year: "",
  naics: [""],
  fipsNaics: ["722511"], //this is b/c can't query empty naics with fips
  metroFips: "63217",
  countyFips: "36061",
  stateFips: "36"
}

var currZip = defaults.zip,
    currNaics = defaults.naics,
    currFipsNaics = defaults.fipsNaics,
    currFips = {"metro": defaults.metroFips, "county": defaults.countyFips, "state": defaults.stateFips};

module.exports = {
  init: function() {
    ServerActionCreators.setAppSection('admin');
    this.read('user');
    this.zipList();
    this.naicsList();
  },
  initZip: function() {
    //console.log("\n\n\ninitZip called\n\n\n");
    currNaics = defaults.naics;
    currZip = defaults.zip;
    this.zpbTotals(currZip, "annual_payroll", defaults.year);
    this.zpbTotals(currZip, "q1_payroll", defaults.year);
    this.zpbTotals(currZip, "employees", defaults.year);
    this.zpbTotals(currZip, "establishments", defaults.year);

    this.zbpDetails(currZip, defaults.year, currNaics); //as optional params

    this.zbpGeo(currZip);
  },
  initFips: function(type) {
    //console.log("\n\n\ninitFips called\n\n\n");
    if(type != "metro" && type != "county" && type != "state") {
      console.error("Incorrect type of fips in initFips: ", type);
    }
    else {

      this.zpbTotals({"type": type, "code": currFips[type]}, "annual_payroll", defaults.year);
      this.zpbTotals({"type": type, "code": currFips[type]}, "q1_payroll", defaults.year);
      this.zpbTotals({"type": type, "code": currFips[type]}, "employees", defaults.year);
      this.zpbTotals({"type": type, "code": currFips[type]}, "establishments", defaults.year);

      this.zbpDetails({"type": type, "code": currFips[type]}, defaults.year, currFipsNaics);

      this.zbpGeo({"type": type, "code": currFips[type]});

      // this.fipsTable("state");
      // this.fipsTable("county");
    }
  },

  //---------------------------------------------------
  // Sails Rest Route
  //---------------------------------------------------
  create: function(type,data){
    io.socket.post('/'+type,data,function(resData){
      //ToDo Check for Errors and Throw Error Case
      console.log('utils/sailsWebApi/createUser',resData);

      //add new user back to store through 
      ServerActionCreators.receiveData(type,[resData]);
    });
  },
  
  read: function(type) {
    io.socket.get('/'+type,function(data){     
      //console.log('utils/sailsWebApi/getUsers',data);
      ServerActionCreators.receiveData(type,data);
    });
  },


  update: function(type,data){
    io.socket.put('/'+type+'/'+data.id,data,function(resData){
      //ToDo Check for Errors and Throw Error Case
      console.log('utils/sailsWebApi/updateData',resData);

      //add new user back to store through 
      ServerActionCreators.receiveData(type,[resData]);
    });
  },

  delete: function(type,id){
    io.socket.delete('/'+type+'/'+id,function(resData){
      //ToDo Check for Errors and Throw Error Case
      console.log('utils/sailsWebApi/delete',resData,id);

      //Delete 
      ServerActionCreators.deleteData(type,id);
    });
  },

  updateZip: function(zip) {
    //console.log("Updating zip with new zip", zip);
    //add error checking of zip later?
    if(!Array.isArray(zip)) {
      console.error("Non array passed to update Zip!");
    }
    else {
      // console.log("update zips called with ", zip);
      currZip = zip;
      this.zpbTotals(currZip, "annual_payroll", defaults.year);
      this.zpbTotals(currZip, "q1_payroll", defaults.year);
      this.zpbTotals(currZip, "employees", defaults.year);
      this.zpbTotals(currZip, "establishments", defaults.year);

      this.zbpDetails(currZip, defaults.year, currNaics); //as optional params
      this.zbpGeo(currZip);
    }
  },

  updateNaics: function(naics) {
    
    if(typeof naics == "string") {
      naics = naics.split(",")
    }
    else if(!Array.isArray(naics)) { // no definite way to do this, bc js sucks
      console.error("Non array passed to updateNaics", naics);
    }
    currNaics = naics;
    this.zbpDetails(currZip, defaults.year, currNaics);
  },

  updateFips: function(type, code) {
    if(type != "metro" && type != "county" && type != "state") {
      console.error("Incorrect type of fips in updateFips: ", type);
    }
    else if(typeof type != "string" || typeof code != "string"){
      console.error("Incorrect type or code provided to updateFips: ", type, code);
    }
    else {
      // console.log("updateFips called with" , type, code);
      currFips[type] = code;
      this.zpbTotals({"type": type, "code": code}, "annual_payroll", defaults.year);
      this.zpbTotals({"type": type, "code": code}, "q1_payroll", defaults.year);
      this.zpbTotals({"type": type, "code": code}, "employees", defaults.year);
      this.zpbTotals({"type": type, "code": code}, "establishments", defaults.year);

      this.zbpDetails({"type": type, "code": code}, defaults.year, currNaics);
      this.zbpGeo({"type": type, "code": code});
    }
  },

  //---------------------------------------------------
  // Voters
  //---------------------------------------------------
  zpbTotals: function(codes, type, year){ //type is the variable name!
    var yearPath = year || '';
    var post = {};
    // console.log("zbpTotals called with ", codes, type, year)
    if(Array.isArray(codes)) { 
      post = {'zips':codes};
      //this.zbpGeo(codes); 
    }
    else if(codes.constructor.toString().indexOf("Object") != -1) {
      post = {'fips': codes};
    }
    else {
      console.log("Invalid codes passed to zbpTotals: ", codes)
    }
    io.socket.post('/totals/'+type+'/'+yearPath, post, function(resData){
      ServerActionCreators.receiveTotals(type,resData, codes);
    });
  },
  //both year and zip should be passed as arrays?!?! maybe
  zbpDetails: function(codes, year, naics) {
    var post = {};
    var yearPath = year || '';
    //console.log("zbpDetails called with ", codes, year, naics)
    if(Array.isArray(codes)) {
      post = {'zips':codes, 'naics':naics};
    }
    else if(codes.constructor.toString().indexOf("Object") != -1) {
      post = {'fips': codes, 'naics': naics};
    }
    else {
      console.log("Invalid codes passed to zbpDetails: ", codes)
    }
    io.socket.post('/details/' + yearPath, post, function(resData) {
      ServerActionCreators.receiveDetails(resData, codes, naics);
    });
  },
  zbpGeo: function(codes) { 
    //console.log("zbpGeo called with codes");
    //console.log(codes);
    var post = {};
    if(Array.isArray(codes)) { 
      post = {'zips':codes};
    }
    else if(codes.constructor.toString().indexOf("Object") != -1) {
      post = {'fips': codes};
    }
    else {
      console.log("Invalid codes passed to zbpGeo: ", codes)
    }
    io.socket.post('/geozipcodes', post, function(resData) {
      ServerActionCreators.receiveGeoJSON(resData);
    });
  },
  naicsList: function() {    
    io.socket.get('/naics', function(resData) {
      ServerActionCreators.receiveNaicsList(resData);
    });       
  },
  zipList: function() {
    io.socket.get('/zipcodes',function(resData){
      ServerActionCreators.receiveZipList(resData);
    });
  },
  fipsTable: function(fipsType) {
    if(fipsType === "metro") {
      ServerActionCreators.receiveFips(fipsType, {});
    }
    else {
      io.socket.get('/' + fipsType + 'fips', function(resData) {
        ServerActionCreators.receiveFipsTable(fipsType, resData);
      });
    }
  }

};
