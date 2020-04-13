class DataNotFoundError extends Error {
	constructor ( { input }, ...other) {
		super(...other);
		!!Error.captureStackTrace ? Error.captureStackTrace(this, DataNotFoundError) :'';
	  
		this.name = 'DataNotFoundError';
		this.input = input;
	}
}

module.exports = {
	DataNotFoundError,
}
