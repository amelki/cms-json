export const schemaVersion : string = "http://json-schema.org/draft-06/schema#";

export enum Type {
	TObject = "object",
	TString = "string",
	TArray = "array",
	TNumber = "number",
	TBoolean = "boolean"
}

export enum Format {
	Html = "html", Markdown = "markdown", TextArea = "textarea"
}

export type SchemaProperties = { [s: string]: SchemaElement; };
export type SchemaPatternProperties = { [s: string]: SchemaPatternProperty; };

export interface SchemaElement {
	type: Type,
	title?: string,
	properties?: SchemaProperties,
	patternProperties?: SchemaPatternProperties,
	description?: string,
	minimum?: number,
	required?: string[],
	items?: SchemaElement,
	format?: Format,
	className?: string // custom extension
}

export interface SchemaPatternProperty extends SchemaElement{
	keyTitle?: string, // custom extension
	valueTitle?: string // custom extension
}

export interface RootSchemaElement extends SchemaElement {
	$schema: string
}