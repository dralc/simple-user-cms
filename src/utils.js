import gql from 'nanographql';

/**
 * Pretty print
 * @param {Object} obj 
 */
export function prettyPrint(obj) {
	return JSON.stringify(obj, null, 2);
}

/**
 * Use GET for queries and POST for mutations
 * 
 * @param {*} url 
 * @param {*} query 
 * @param {*} variables 
 */
export async function callGql(url, query, variables) {
	let method = 'GET';
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
		body = gql(query)(variables);
	}

	const res = await fetch(_url, {
		method,
		body,
	});

	const ret = await res.json();

	if (ret.errors) {
		throw new Error( JSON.stringify(ret) );
	}
	
	return ret;
}
