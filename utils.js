/**
 * Compares the own properties of two Objects
 * @param {Object} ob1
 * @param {Object} ob2
 * @returns {Boolean}
 */
exports.hasSameProps = (ob1, ob2) => {
	return Object.keys(ob1).sort().join('') === Object.keys(ob2).sort().join('');
}