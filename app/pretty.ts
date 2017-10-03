import { RootSchemaElement, SchemaElement, Type } from "./schema";

export const prettyPrintData = (schema: RootSchemaElement, data: object, selection: any): string => {
	const out = new PrintWriter();
	printData(schema, data, out, 0, selection);
	return out.toString();
};

export const prettyPrintSchema = (schema: RootSchemaElement, selection: SchemaElement): string => {
	const out = new PrintWriter();
	printObject(schema, out, 0, selection);
	return out.toString();
};

export const prettyPrint = (object: object, selection: object): string => {
	const out = new PrintWriter();
	if (Array.isArray(object)) {
		printArray(object, out, 0, selection);
	} else {
		printObject(object, out, 0, selection);
	}
	return out.toString();
};

const printData = (schema: SchemaElement, data: any, out: PrintWriter, idt: number, selection): void => {
	switch (schema.type) {
		case Type.TObject:
			out.print('{');
			out.newLine();
			let keys = Object.keys(data);
			let getSchema = (key) => {
				if (schema.properties) {
					return schema.properties[key];
				} else {
					return schema.patternProperties!['.+'];
				}
			};
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i];
				if (selection === data[key]) {
					out.printSelectionStart();
				}
				out.indent(idt + 1);
				out.printKey(key);
				out.print(':');
				out.space();
				printData(getSchema(key), data[key], out, idt + 1, selection);
				if (i < keys.length - 1) {
					out.print(',');
				}
				out.newLine();
			}
			out.indent(idt);
			out.print('}');
			break;
		case Type.TArray:
			out.print('[');
			out.newLine();
			if (schema.items) {
				for (let i = 0; i < data.length; i++) {
					if (selection === data[i]) {
						out.printSelectionStart();
					}
					out.indent(idt + 1);
					printData(schema.items, data[i], out, idt + 1, selection);
					if (i < data.length - 1) {
						out.print(',');
					}
					out.newLine();
				}
			}
			out.indent(idt);
			out.print(']');
			break;
		case Type.TString:
			out.printString(data as string);
			break;
		case Type.TBoolean:
			out.printBoolean(data as boolean);
			break;
	}
	if (selection === data) {
		out.printSelectionEndAtNewLine = true;
	}
};

const printObject = (object: any, out: PrintWriter, idt: number, selection): void => {
	out.print('{');
	out.newLine();
	let keys = Object.keys(object);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const value = object[key];
		if (selection === value) {
			out.printSelectionStart();
		}
		out.indent(idt + 1);
		out.printKey(key);
		out.print(':');
		out.space();
		switch (typeof value) {
			case 'number':
				out.printNumber(value);
				break;
			case 'boolean':
				out.printBoolean(value);
				break;
			case 'string':
				out.printString(value);
				break;
			case 'object':
				if (Array.isArray(value)) {
					printArray(value as any[], out, idt + 1, selection);
				} else {
					printObject(value as object, out, idt + 1, selection);
				}
				break;
		}
		if (i < keys.length - 1) {
			out.print(',');
		}
		out.newLine();
	}
	out.indent(idt);
	out.print('}');
	if (selection === object) {
		out.printSelectionEndAtNewLine = true;
	}
};

const printArray = (array: any[], out: PrintWriter, idt: number, selection): void => {
	out.print('[');
	out.newLine();
	for (let i = 0; i < array.length; i++) {
		const value = array[i];
		if (selection === value) {
			out.printSelectionStart();
		}
		out.indent(idt + 1);
		switch (typeof value) {
			case 'number':
				out.printNumber(value);
				break;
			case 'boolean':
				out.printBoolean(value);
				break;
			case 'string':
				out.printString(value);
				break;
			case 'object':
				printObject(value as object, out, idt + 1, selection);
				break;
		}
		if (i < array.length - 1) {
			out.print(',');
		}
		out.newLine();
	}
	out.indent(idt);
	out.print(']');
	if (selection === array) {
		out.printSelectionEndAtNewLine = true;
	}
};

class PrintWriter {
	buffer: string[];
	printSelectionEndAtNewLine: boolean;

	constructor() {
		this.buffer = [];
	}

	print(str) {
		this.buffer.push(str);
	}

	newLine() {
		if (this.printSelectionEndAtNewLine) {
			this.printSelectionEnd();
			this.printSelectionEndAtNewLine = false;
		} else {
			this.buffer.push('<br>');
		}
	}

	space() {
		this.buffer.push('&nbsp;');
	}

	indent(len: number) {
		if (len > 0) {
			let res = '';
			for (let i = 0; i < len; i++) {
				res += '&nbsp;&nbsp;';
			}
			this.buffer.push(res);
		}
	}

	printKey(key: string) {
		this.buffer.push('\"');
		this.buffer.push(`<span class="json-key">${key}</span>`);
		this.buffer.push('\"');
	}

	printString(value: string) {
		this.buffer.push('\"');
		this.buffer.push(`<span class="json-string">${value}</span>`);
		this.buffer.push('\"');
	}

	printBoolean(value: boolean) {
		this.buffer.push(`<span class="json-boolean">${value}</span>`);
	}
	printNumber(value: number) {
		this.buffer.push(`<span class="json-number">${value}</span>`);
	}

	printSelectionStart() {
		this.buffer.push(`<div class="selected">`);
	}

	printSelectionEnd() {
		this.buffer.push(`</div>`);
	}

	toString() {
		return this.buffer.join('');
	}
}