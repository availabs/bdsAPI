/**
* Fields.js
*/

var ld = sails.util._;

module.exports = {

    /**
     * groupByMulti is like lodash.groupBy,  but it accepts a list 
     * of keys/functions to group by rather than a single function and
     * recursively groups each of the keys/functions 
     * 
     * @param {Array} obj - list of objects to group
     * @param {Array} values - list of functions to apply to each object
     *                         in 'obj' to determine what group it belongs
     *                         too. Each function in the list must take an
     *                         object and return a string (the group).
     * @param {Object} context - passed through to lodash.groupBy
     * @return {Object} the objects in 'obj'  grouped into a hierarchical
     *                  object based on the return values of each of the
     *                  functions in values.
     */
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

    /**
     * Given a field value (such as 'size', 'age4', etc)  return a function
     * that is suitable to pass to groupByMulti. Keep in mind that we want
     * to group by the VALUE of the 'size' or 'age4' attribute in each row.
     * To do this we need a function that accesses each this attribute given
     * an element.  This function takes an array of fields,  and returns an 
     * array of functions that each take an element,  and return the value of
     * that field.
     *
     * @param {Array} fields - array of fields such as ['size', 'age4', ...]
     * @return {Array} - array of accessor functions based on 'fields'
     */
    path_groupby_accessors: function(fields){
	return ld.map(fields, function(field){
	    return function(element){
		return element[field];
	    };
	});
    }

    
};
