var React = require('react'),
	
	//-- Actions
	ClientActionsCreator = require('../../actions/ClientActionsCreator'),
	//-- Components
	Select2 = require('./Select2.react');

var fixVarName = function(varName) {
    switch(varName) {
        case 'annual_payroll':
            return 'Total Annual Payroll (thousands of dollars)'; break;
        case 'q1_payroll':
            return 'Total First Quarter Payroll (thousands of dollars)'; break;
        case 'employees':
            return 'Total Mid-March Employees'; break;
        case 'establishments': 
            return 'Total Number of Establishments'; break;
    }
};

var VariableSelect = React.createClass({
	 getInitialState: function() {
      return {
      	currentVariable: this.props.currentVariable
      };
    },

    handleChange: function(e) {
		ClientActionsCreator.setCurrentVariable(e.target.value);
    },

	_newVariable:function(e){

		console.log(e);
		/*if(this.props.naicsList.indexOf(this.state.currentNaics) >= 0) {
			ClientActionsCreator.setCurrentNaics(this.state.currentNaics);
		}
		else if(this.props.naicsList.indexOf(this.state.currentNaics + "----") >= 0) {
			ClientActionsCreator.setCurrentNaics(this.state.currentNaics + "----"); //if the naics is 2 digit
		}
		else {
			swal({
				title: "Invalid NAICS Code!",
				text: "Please try again.",
				type: "warning",
				showCancelButton: false,
				allowOutsideClick: true
			});
		}*/
		
	
	},
	//{'11': "Agriculture, forestry, fishing and hunting", "21": "Mining, quarrying, and oil and gas extraction", "22": "Utilities", "23": "Construction", "42": "Wholesale trade", "51": "Information", "52": "Finance and insurance", "53": "Real estate and rental and leasing", "54": "Professional, scientific, and technical services", "55": "Management of companies and enterprises", "56": "Administrative and support and waste management and remediation services", "61": "Educational services", "62": "Health care and social assistance", "71": "Arts, entertainment, and recreation", "72": "Accommodation and food services", "81": "Other services (except public administration)", "99": "Industries not classified", "--": "Total for all sectors"}
  	render: function() {
  		var style = {marginBottom:0};

    	return (
    		<div className="form-group" style={style}>
    			<select className="form-control" id="var-select" onChange={this.handleChange}>
    				<option value="annual_payroll">{fixVarName("annual_payroll")}</option>
    				<option value="q1_payroll">{fixVarName("q1_payroll")}</option>
    				<option value="employees">{fixVarName("employees")}</option>
    				<option value="establishments">{fixVarName("establishments")}</option>
    			</select>
    		</div>
	    	
	    );
  	}
});

module.exports = VariableSelect;
