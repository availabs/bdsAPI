/**
* Fields.js
*/

var ld = sails.util._;

module.exports = {
    groupByMulti: function (obj, values, context) {
	if (!values.length)
	    return obj;
	var byFirst = ld.groupBy(obj, values[0], context),
	    rest = values.slice(1);
	for (var prop in byFirst) {
	    var tmp = this.groupByMulti(byFirst[prop], rest, context);
	    byFirst[prop] = tmp.length == 1 ? tmp[0] : tmp;
	}
	return byFirst;
    },

    path_groupby_accessors: function(fields){
	return ld.map(fields, function(field){
	    return function(element){
		return element[field];
	    };
	});
    }

    
};
