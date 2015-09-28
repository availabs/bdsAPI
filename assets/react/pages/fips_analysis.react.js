'use strict';
var React = require('react'),
    //--Stores
    ZBPStore = require('../stores/ZBPStore'),

    ClientActionsCreator = require('../actions/ClientActionsCreator'),

    //-- Components
    TotalsGraph  = require('../components/graphs/TotalsGraph.react'),
    DetailsGraph  = require('../components/graphs/DetailsGraph.react'),
    FipsSearch = require('../components/utils/FipsSearch.react'),
    NaicsSearch = require('../components/utils/NaicsSearch.react'),
    VariableSelect = require('../components/utils/VariableSelect.react'),
    FipsAnalysis = require('./fips_analysis.react'),
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
    // console.log(naicsList);
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

var fixTypeName = function(type) {
    switch(type) {
        case "metro": return "Urban Area"; break;
        case "county": return "County"; break;
        case "state": return "State"; break;
        default: return "Urban Area";
    }
}

var FipsAnalysis = React.createClass({
    getInitialState: function() {
        return {
            type: this.props.type,
            code: ZBPStore.getFips(this.props.type),
            naicsList: ZBPStore.getNaicsList(),
            totals:ZBPStore.getTotals(),
            variable:ZBPStore.getVariable(),
            details:ZBPStore.getDetails(),
            naics:ZBPStore.getNaics(), 
            chosenVariable: ZBPStore.getChosenVariable(),
            geo: ZBPStore.getGeoJSON()
        };
    },
    componentDidMount: function() {
        ClientActionsCreator.initFips(this.state.type);
        ZBPStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        ZBPStore.removeChangeListener(this._onChange);
    },
    _onChange: function() {
        this.setState({
            type: this.props.type,
            code: ZBPStore.getFips(this.props.type),
            naicsList: ZBPStore.getNaicsList(),
            totals:ZBPStore.getTotals(),
            variable:ZBPStore.getVariable(),
            details:ZBPStore.getDetails(),
            naics:ZBPStore.getNaics(), 
            chosenVariable: ZBPStore.getChosenVariable(),
            geo: ZBPStore.getGeoJSON()
        });
    },
    render: function() {
        // console.log("fips analysis state", this.state);
        return (
            <div>
                <div className="row"> {/*Fips Search*/}
                    <div className="col-lg-8">
                        <section className="widget">
                            <FipsSearch currentFips={this.state.code} type={this.state.type} />
                        </section>
                    </div>
                    <div className="col-lg-4">
                        <section className="widget">
                            <VariableSelect currentVariable={this.state.chosenVariable} />
                        </section>
                    </div>
                </div>{/*End Fips Search*/}
                <div className="row">{/*TotalsGraph*/}
                    <div className="col-lg-12">
                        <section className="widget">
                            <header><h4>{fixVarName(this.state.chosenVariable)}&nbsp;<small>By Year for {fixTypeName(this.state.type)} FIPS {this.state.code}</small></h4></header>
                            <div className="body no-margin">
                                <TotalsGraph 
                                    totalData={this.state.totals[this.state.chosenVariable]}
                                    variable={this.state.chosenVariable}
                                    height="500"
                                />
                            </div>
                        </section>
                    </div>{/*End totalsgraph*/}

                    <div className="col-lg-12"> {/*naics search*/}
                        <section className="widget">
                            <NaicsSearch naicsList={this.state.naicsList} currentNaics={this.state.naics} />
                        </section>
                    </div> {/*end naics search*/}

                    <div className="col-lg-12">{/*naics graph*/}
                        <section className="widget">
                            <header><h4>{naicsGraphText(this.state.naics)}&nbsp;<small>By Year for {fixTypeName(this.state.type)} FIPS {this.state.code}</small></h4></header>
                            <div className="body no-margin">
                                <DetailsGraph
                                    detailsData={this.state.details}
                                    height="500"
                                />
                            </div>
                        </section>
                    </div>{/*end naics graph*/}
                    <div className="col-lg-12">{/*map*/}
                        <section className="widget">
                            <header><h4>Map of {fixTypeName(this.state.type)} FIPS Code {this.state.code} &nbsp;</h4></header>
                            <div className="body no-margin">
                                <ZipCodeMap
                                    geo={this.state.geo}
                                />
                            </div>
                        </section>
                    </div>{/*end map*/}
                </div>
            </div>
        )
    }
});

module.exports = FipsAnalysis;
