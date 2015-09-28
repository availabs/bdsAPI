//---------------------------------------
// App Controller View 
// One Per Server Side Route
//---------------------------------------

//  --- Libraries
var React = require('react'),
    Router = require('react-router'),
    Route = Router.Route,
    Routes = Router.Routes,
    Redirect = Router.Redirect,
    DefaultRoute = Router.DefaultRoute,
    
//  --- Layout File
    App = require('./pages/layout.react'),

//  --- Pages
    ZipAnalysis = require('./pages/zip_analysis.react'),
    MetroAnalysis = require('./pages/metro_analysis.react'),
    CountyAnalysis = require('./pages/county_analysis.react'),
    StateAnalysis = require('./pages/state_analysis.react'),

// --- Server API
    sailsWebApi = require('./utils/api/SailsWebApi.js');

// --- Initialize the API 
sailsWebApi.init();

//  --- Routes 
var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="zips" path='/zips' handler={ZipAnalysis}/>
    <Route name="metro" path='/metro' handler={MetroAnalysis}/>
    <Route name="county" path='/county' handler={CountyAnalysis}/>
    <Route name="state" path='/state' handler={StateAnalysis}/>
    <DefaultRoute handler={ZipAnalysis}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.getElementById("route-wrapper"));
});
