import { performance, PerformanceObserver } from 'perf_hooks';

/**
 * Compares the own properties of two Objects
 * @param {Object} ob1
 * @param {Object} ob2
 * @returns {Boolean}
 */
export function hasSameProps(ob1, ob2) {
	return Object.keys(ob1).sort().join('') === Object.keys(ob2).sort().join('');
}

/**
 * Gets the response times for running a function
 * 
 * @param iterations The number of iterations to run the function
 * @param fn A function that returns a Promise
 */
export function getFuncPerf(iterations:number, fn:Function) {
	return new Promise<{ avg:number, durations:number[], response }>(async resolve => {
		const durations = [];
		let response;
		const perfObs = new PerformanceObserver((list, obs) => {
			durations.push(list.getEntries()[0].duration);

			if (durations.length === iterations) {
				let avg = durations.reduce((acc, v) => { return acc + v }, 0) / durations.length;
				performance.clearMarks();
				obs.disconnect();
				resolve({ avg, durations, response });
			}
		});

		perfObs.observe({ entryTypes: ['measure'], buffered: true });

		for (let i = 0; i < iterations; i++) {
			performance.mark(`${i}:A`);
			response = await fn();
			performance.mark(`${i}:B`);
			performance.measure('userList query', `${i}:A`, `${i}:B`);
		}
	})
}