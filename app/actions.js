export const ADD_ITEM = 'ADD_ITEM';
export const DELETE_ITEM = 'DELETE_ITEM';
export const MOVE_ITEM = 'MOVE_ITEM';
export const INPUT_VALUE = 'INPUT_VALUE';
export const ADD_VALUE = 'ADD_VALUE';
export const LOAD = 'LOAD';

export const addItem = (node) => ({
	type: ADD_ITEM,
	node: node
});
export const deleteItem = (node, index) => ({
	type: DELETE_ITEM,
	node,
	index
});
export const moveItem = (node, source, target) => ({
	type: MOVE_ITEM,
	node,
	source,
	target
});
export const load = (model, data, message) => ({
	type: LOAD,
	model,
	data,
	message
});
export const inputValue = (node, field, event) => ({
	type: INPUT_VALUE,
	node,
	field,
	event
});
export const addValue = (node, field, value) => ({
	type: ADD_VALUE,
	node,
	field,
	value
});

