import gql from 'nanographql';

/**
 * Pretty print
 * @param {Object} obj 
 */
export function prettyPrint(obj) {
	return JSON.stringify(obj, null, 2);
}

export function showError(error, verbose) {
	try {
		const err_o = JSON.parse(error.message);
		return verbose ? prettyPrint(err_o) : err_o.errors.reduce((out, er)=> out+=er.message +'\n', '');
	}
	catch (er) {
		return error;
	}
}

/**
 * Use GET for queries and POST for mutations
 * 
 * @param {*} url 
 * @param {*} query 
 * @param {*} variables 
 */
export async function callGql(url, query, variables, options={fetch}) {
	const fetchFn = options.fetch;
	
	let method = 'GET';
	let headers;
	let _url = url;
	let body;

	if (/^[\s]*query/i.test(query)) {
		const params = new URLSearchParams();
		params.append('query', query);
		params.append('variables', JSON.stringify(variables));
		_url = `${url}?${params.toString()}`;
	}
	else {
		method = 'POST';
		headers = {
			'Content-Type': 'application/json'
		};
		body = gql(query)(variables);
	}

	const fetchInit = { method, headers, body };
	const res = await fetchFn(_url, fetchInit);
	const result = await getResult(res);

	if (res.ok && result.data && !result.errors) {
		return result;
	}
	else {
		let err = (typeof result === 'string') ? { error: result } : result;
		let errorResult = {
			...err,
			status: res.status,
		}
		throw new Error( JSON.stringify(errorResult) );
	}

	async function getResult(response) {
		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.startsWith('application/json')) {
		  return response.json()
		} else {
		  return response.text()
		}
	  }
}
