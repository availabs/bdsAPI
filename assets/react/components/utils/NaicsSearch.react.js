var React = require('react'),
	
	//-- Actions
	ClientActionsCreator = require('../../actions/ClientActionsCreator'),
	//-- Components
	Select2Component = require('./Select2.react'),
	NaicsKey = require('./NaicsKey');

var NaicsSearch = React.createClass({
	 getInitialState: function() {
      return {
      	currentNaics: this.props.currentNaics
      };
    },
    handleChange: function(e) {
      
      ClientActionsCreator.setCurrentNaics(e.target.value);
    },

	
	//{'11': "Agriculture, forestry, fishing and hunting", "21": "Mining, quarrying, and oil and gas extraction", "22": "Utilities", "23": "Construction", "42": "Wholesale trade", "51": "Information", "52": "Finance and insurance", "53": "Real estate and rental and leasing", "54": "Professional, scientific, and technical services", "55": "Management of companies and enterprises", "56": "Administrative and support and waste management and remediation services", "61": "Educational services", "62": "Health care and social assistance", "71": "Arts, entertainment, and recreation", "72": "Accommodation and food services", "81": "Other services (except public administration)", "99": "Industries not classified", "--": "Total for all sectors"}
  	render: function() {
		
		var naicsList = this.props.naicsList.map(function(naics) {
			return {
				"id": naics,
				"text": naics +""+ (NaicsKey[naics] != null && NaicsKey[naics] != undefined && NaicsKey[naics].title ? ": " + NaicsKey[naics].title : "")
			}
		});
  		var style = {marginBottom:0};

    	return (
    		<Select2Component
    			id="naicsSearch" 
    			dataSet={naicsList} 
    			multiple={true} 
    			styleWidth="100%"
    			ref="naicsSearch"
    			val={[this.state.currentNaics]}
    			onSelection={this.handleChange}
    			placeholder="Select Naics" />

	    );
  	}
});

module.exports = NaicsSearch;
