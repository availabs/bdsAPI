var React = require('react'),
	
	//-- Actions
	ClientActionsCreator = require('../../actions/ClientActionsCreator'),

	//-- Components
	Select2Component = require('./Select2.react'),
	//-- Data
	fipsTable = {
		"state": require('./states.json'),
		"county": require('./counties.json'),
		"metro": {}
	};

var FipsSearch = React.createClass({
	 getInitialState: function() {
      return {
      	currentFips: this.props.currentFips,
      	// fipsTable: this.props.fipsTable,
      	type: this.props.type
      };
    },
    _newFips: function(e) {
    	if(this.state.type === "metro") {
			if(this.state.currentFips && this.state.currentFips.length == 5) {
				ClientActionsCreator.setCurrentFips(this.state.type, this.state.currentFips);
				this.setState({
					currentFips: e.target.value,
					// fipsTable: this.props.fipsTable,
					type: this.props.type
				});
			}
			else {
				swal({
					title: "Invalid FIPS Code!",
					text: "Please try again.",
					type: "warning",
					showCancelButton: false,
					allowOutsideClick: true
				});
			}
		}
    },
    handleChange: function(e) {
		this.setState({
			currentFips: e.target.value,
			// fipsTable: this.props.fipsTable,
			type: this.props.type
		});
		if(this.state.type === "metro") {
			/*if(this.state.currentFips && this.state.currentFips.length == 5) {
				ClientActionsCreator.setCurrentFips(this.state.type, this.state.currentFips);
			}
			else {
				swal({
					title: "Invalid FIPS Code!",
					text: "Please try again.",
					type: "warning",
					showCancelButton: false,
					allowOutsideClick: true
				});
			}*/
		}
		else {
		  ClientActionsCreator.setCurrentFips(this.state.type, e.target.value);
		}
    },
	//{'11': "Agriculture, forestry, fishing and hunting", "21": "Mining, quarrying, and oil and gas extraction", "22": "Utilities", "23": "Construction", "42": "Wholesale trade", "51": "Information", "52": "Finance and insurance", "53": "Real estate and rental and leasing", "54": "Professional, scientific, and technical services", "55": "Management of companies and enterprises", "56": "Administrative and support and waste management and remediation services", "61": "Educational services", "62": "Health care and social assistance", "71": "Arts, entertainment, and recreation", "72": "Accommodation and food services", "81": "Other services (except public administration)", "99": "Industries not classified", "--": "Total for all sectors"}
  	render: function() {
  		var style = {marginBottom:0};

  // 		var fipsData = this.props.fipsTable.map(function(fips) {
		// 	return {
		// 		"id": fips,
		// 		"text": naics +""+ (NaicsKey[naics] != null && NaicsKey[naics] != undefined && NaicsKey[naics].title ? ": " + NaicsKey[naics].title : "")
		// 	}
		// });
  		// console.log(this.state);
  		if(this.state.type !== "metro") {
  			var t = this.state.type; // b/c scope?
	  		var fipsData = Object.keys(fipsTable[this.state.type]).map(function(code) {
	  			return {
	  				"id": code,
	  				"text": code + ": " + fipsTable[t][code]
	  			}
	  		});

	  		return (
	    		<Select2Component
	    			id="fipsSearch" 
	    			dataSet={fipsData} 
	    			multiple={false} 
	    			styleWidth="100%"
	    			ref="fipsSearch"
	    			val={[this.state.currentFips]}
	    			onSelection={this.handleChange}
	    			placeholder="Select Fips" />
			);
		}
		else {
	    	return (
		    	<div className="form-group" style={style}>
	                <div className="input-group input-group">
			        	<input
			                  id="fipsSearch"
			                  className="form-control"
			                  type="text"
			                  ref="fipsInput"
			                  value={this.state.currentFips} 
			                  onChange={this.handleChange} 
			                  placeholder="Search by FIPS..."/>

			   			<div className="input-group-btn">
	                        <button type="button" onClick={this._newFips} className="btn btn-primary" ><i className="fa fa-search"></i></button>
	                    </div>
	                </div>
	            </div>
		    );
    	}
  	}
});

module.exports = FipsSearch;
