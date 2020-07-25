module.exports = {
	logRes: (req, res, ctx, ee, next) => {
		console.log('*** Found:');
		console.log(res.toJSON().body);
		next();
	}
};