var React = require('react'),
	
	//-- Actions
	ClientActionsCreator = require('../../actions/ClientActionsCreator'),
	//-- Components
	Select2 = require('./Select2.react');

var ZipSearch = React.createClass({
	 getInitialState: function() {
      return {
      	currentZip: this.props.currentZip
      };
    },

    handleChange: function(e) {
      this.setState({currentZip: e.target.value});
    },

	_newZip:function(e){
		if(this.props.zips && this.props.zips.indexOf(this.state.currentZip) >= 0) {
			//console.log('Legit Zip Code, sending to dispatch');
			//console.log(this.state.currentZip);
			ClientActionsCreator.setCurrentZipcode([this.state.currentZip]); //send as array bc that's how everything, including the API, wants it.
		}
		else {
			//console.log('Sorry Not a Zip Code')
			swal({
				title: "Invalid Zip Code!",
				text: "Please try again.",
				type: "warning",
				showCancelButton: false,
				allowOutsideClick: true
			});
		}
	
	},
	//{'11': "Agriculture, forestry, fishing and hunting", "21": "Mining, quarrying, and oil and gas extraction", "22": "Utilities", "23": "Construction", "42": "Wholesale trade", "51": "Information", "52": "Finance and insurance", "53": "Real estate and rental and leasing", "54": "Professional, scientific, and technical services", "55": "Management of companies and enterprises", "56": "Administrative and support and waste management and remediation services", "61": "Educational services", "62": "Health care and social assistance", "71": "Arts, entertainment, and recreation", "72": "Accommodation and food services", "81": "Other services (except public administration)", "99": "Industries not classified", "--": "Total for all sectors"}
  	render: function() {
  		// var zipList = this.props.zips.map(function(zip){
  		// 	return {
  		// 		"id":zip,
  		// 		"text":zip
  		// 	}
  		// });
  		var style = {marginBottom:0};

    	return (
	    	<div className="form-group" style={style}>
                <div className="input-group input-group">
		        	<input
		                  id="zipSearch"
		                  className="form-control"
		                  type="text"
		                  ref="zipInput"
		                  value={this.state.currentZip} 
		                  onChange={this.handleChange} 
		                  placeholder="Search by zip..."/>

		   			<div className="input-group-btn">
                        <button type="button" className="btn btn-primary" onClick={this._newZip}><i className="fa fa-search"></i></button>
                    </div>
                </div>
            </div>
	    );
  	}
});

module.exports = ZipSearch;