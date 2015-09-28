'use strict';
var React = require('react'),
    //--Stores
    ZBPStore = require('../stores/ZBPStore'),

    ClientActionsCreator = require('../actions/ClientActionsCreator'),

    //-- Components
    TotalsGraph  = require('../components/graphs/TotalsGraph.react'),
    DetailsGraph  = require('../components/graphs/DetailsGraph.react'),
    ZipSearch = require('../components/utils/ZipSearch.react'),
    NaicsSearch = require('../components/utils/NaicsSearch.react'),
    VariableSelect = require('../components/utils/VariableSelect.react'),

    ZipCodeMap = require('../components/maps/ZipCodeMap.react');

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
}

var naicsGraphText = function(naicsList) {
    if(naicsList == "")
        return "Top Ten Naics Codes by Employment";
    var toRet = "Employees for Naics Code";
    if(naicsList.length > 1) {
        toRet += "s: " + naicsList.toString();
    }
    else {
        toRet += ": " + naicsList;
    }
    return toRet;
}

var ZipAnalysis = React.createClass({

    getInitialState: function() {
        return {
            zipList: ZBPStore.getZipList(),
            naicsList: ZBPStore.getNaicsList(),
            totals:ZBPStore.getTotals(),
            variable:ZBPStore.getVariable(),
            details:ZBPStore.getDetails(),
            zip:ZBPStore.getZip(),
            naics:ZBPStore.getNaics(), //Is this needed for anything beyond displaying to the user?,
            chosenVariable: ZBPStore.getChosenVariable(),
            zipGeo: ZBPStore.getGeoJSON()
        };
               
    },
    componentDidMount: function() {
        ClientActionsCreator.initZip();
        ZBPStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ZBPStore.removeChangeListener(this._onChange);
    },
    _onChange:function(){
        this.setState({
            zipList: ZBPStore.getZipList(),
            naicsList: ZBPStore.getNaicsList(),
            totals:ZBPStore.getTotals(),
            variable:ZBPStore.getVariable(), 
            details: ZBPStore.getDetails(),
            zip:ZBPStore.getZip(),
            naics:ZBPStore.getNaics(),
            chosenVariable: ZBPStore.getChosenVariable(),
            zipGeo: ZBPStore.getGeoJSON()
        });
        // console.log("onchange called zip analysis", this.state.details)
       
    },
    render: function() {
    // console.log(this.state);
        return (
        	<div className="content container">
            	<h2 className="page-title">Zip Analysis <small>Business Statistics, Analyzed by Zip Code</small></h2>
                <div className="row">
                    <div className="col-lg-8">
                        <section className="widget">
                          <ZipSearch zips={this.state.zipList} currentZip={this.state.zip} />
                        </section>
                    </div>
                    <div className="col-lg-4">
                        <section className="widget">
                          <VariableSelect currentVariable={this.state.chosenVariable} />
                        </section>
                    </div>
                </div>
                <div className="row">
                	<div className="col-lg-12">
                        <section className="widget">
                            <header>
                            <h4>
                                {fixVarName(this.state.chosenVariable)}&nbsp;
                                <small>
                                    By Year for zipcode {this.state.zip}
                                </small>
                            </h4>
                        </header>
                            <div className="body no-margin">
                                <TotalsGraph 
                                    totalData={this.state.totals[this.state.chosenVariable]} 
                                    variable={this.state.chosenVariable} 
                                    zip={this.state.zip}
                                    height="500" />
                            </div>
                        </section>
                    </div>
                    
                    <div className="col-lg-12">
                        <section className="widget">
                            <NaicsSearch naicsList={this.state.naicsList} currentNaics={this.state.naics} />
                        </section>
                    </div>
                
                    <div className="col-lg-12">
                        <section className="widget">
                            <header>
                            <h4>
                                {naicsGraphText(this.state.naics)}&nbsp; 
                                <small>
                                    By Year for zipcode {this.state.zip}
                                </small>
                            </h4>
                        </header>
                            <div className="body no-margin">
                                <DetailsGraph
                                    detailsData={this.state.details}
                                    zip={this.state.zip}
                                    height="500" />
                            </div>
                        </section>
                    </div>


                     <div className="col-lg-12">
                        <section className="widget">
                            <header>
                            <h4>
                                Map of Zip Code {this.state.zip}&nbsp;
                            </h4>
                        </header>
                            <div className="body no-margin">
                                <ZipCodeMap 
                                geo={this.state.zipGeo}/>
                            </div>
                        </section>
                    </div>
                </div>
        	</div>
        );
    }
});

module.exports = ZipAnalysis;
