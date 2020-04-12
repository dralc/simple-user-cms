export interface ValidationError extends Error {
	response: {
		errors: Array<Object>
	}
}