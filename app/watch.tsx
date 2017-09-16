import {get} from 'object-path';

function watch<T>(getState: () => any, objectPath: string, compare?: (x, y) => boolean) {
	let comp = compare || ((a, b) => (a === b));
	let currentValue = get(getState(), objectPath);
	return (fn) => (() => {
			const newValue = get(getState(), objectPath);
			if (!comp(currentValue, newValue)) {
				const oldValue = currentValue;
				currentValue = newValue;
				fn(newValue, oldValue, objectPath);
			}
		}
	)
};
export default watch;
