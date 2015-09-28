'use strict';

var React = require('react'),
	//-- Actions
	ClientActionsCreator = require('../../actions/ClientActionsCreator'),

	//Components
	LeafletMap = require('../utils/LeafletMap.react');

var zipID = 0;

//https://github.com/availabs/transitModeler/blob/master/assets/react/components/modeling/ModelMap.react.js
var ZipCodeMap = React.createClass({
	getDefaultProps: function() {
		return {
			currentZip: '10001'
		}
	},
	processLayers:function() {
		var t = ++zipID; // do not know why zipID++; doesn't just work, but this does.
		if(Object.keys(this.props.geo).length == 0) {
			//console.log("not done loading.")
			return {
				zipLayer: {
					id: t,
					geo: { "type": "FeatureCollection",
	    					"features": []
	     				},
	 				options: {
	 					zoomOnLoad:true,
	 					style: function(feature) {
								return {
									fillColor: "#0099FF",
									color: "#0000CC",
									weight: 0.5,
									opacity: 0.3,
									fillOpacity: 0.4	
								};
							}
	 				}
 				}
			}
		}
		else {
			return {
					zipLayer: {
						id: t,
						geo: this.props.geo, //our geoJSON, from server,
						options: {
							zoomOnLoad:true,
							style: function(feature) {
								return {
									fillColor: "#0099FF",
									color: "#0000CC",
									weight: 0.5,
									opacity: 0.3,
									fillOpacity: 0.4,
									className:'zipcode'
								};
							}
						}
				}
			}
		}
	},
	render: function() {
		//console.log("geoR", this.props.geo);
		return (
			<div>
				<LeafletMap layers={this.processLayers()} height="400px" />
			</div>
		);
	}
});

module.exports = ZipCodeMap;
