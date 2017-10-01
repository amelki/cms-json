import * as Cms from './cms';
import {
	Field,
	FieldType,
	ListModel,
	Model,
	Node,
	NodeType, normalizeModel,
	ObjectMapModel,
	Path,
	StringMapModel,
	TreeModel
} from './model';
import {
	Format, RootSchemaElement, SchemaElement, SchemaPatternProperty, SchemaProperties, schemaVersion,
	Type
} from "./schema";

const prettyPrint = (schema: RootSchemaElement, data: object, selection: any): string => {
	const out = new PrintWriter();
	prettyPrintElement(schema, data, out, 0, selection);
	return out.toString();
};

export default prettyPrint;

const prettyPrintElement = (schema: SchemaElement, data: any, out: PrintWriter, idt: number, selection): void => {
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
				prettyPrintElement(getSchema(key), data[key], out, idt + 1, selection);
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
					prettyPrintElement(schema.items, data[i], out, idt + 1, selection);
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