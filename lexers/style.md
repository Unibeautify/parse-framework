# Lexer - style
A lexer for scanning CSS and related code formats.

## types values
* **colon** - Desribes a `:` character. This types value exists to uniquely set colon characters apart from other types values.
* **comment** - Describes standard CSS block comments as well as line comments that exist in languages like LESS and SCSS.
* **end** - Describes the characters `}` and `)` if the parenthesis closes a structure described as *map*.
* **item** - This is an internally used value that should not be exposed outside the lexer unless the lexer receives an incomplete code sample.
* **pseudo** - Describes a `{` immediately following a `:` character thereby representing a pseudo structure from some CSS pre-processors.
* **selector** - Describes a CSS selector.
* **semi** - Describes a `;` character. This types value exists to uniquely set semicolon characters apart from other types values.
* **start** -  Describes `{` and `(` if the parenthesis is part of a map structure.
* **template** - Describes a token comprising an external template language that is not of start or end types.
* **template_else** - Various templating langauges commonly offer conditions with else branches.  Else tokens do not behave the same way as a templates start or end types.
* **template_end** - Describes the opening sequece for a third party language template tag.
* **template_start** - Describes the closing sequence for a third party language template tag.
* **value** - Describes CSS property values, which is generally anything that follows a colon, even if not a known property, but does not immediately preceed some sort of structure opening.
* **variable** - Languages like LESS and SCSS allow defining and referencing from variables.

## stack values
The style lexer takes the identifier, typically a selector, preceeding the start types value of the current stack as the value.

## style options
* **objectSort** - Sorts the named properties (keys) of object literals alphabetically.
* **quote_convert** - Values: *none*, *double*, *single*.  Whether quotes should be converted to double quote or single quote characters.  The *none* value disables this option.

## Escaping code from the parser
The parser is capable of selectively ignoring blocks of code.  This occurs when a comment is present starting with `parse-ignore-start` until a later comment is encountered starting with `parse-ignore-end`.  It does not matter whether the comments are JavaScript-like line comments or standard block comments.

Example:

```css
a {
    color: red;
}
/* parse-ignore-start */
div {
    background: blue;
}
/* parse-ignore-end */
td {
    text-align: right;
}
```

Code from the opening comment to the closing comment is parsed as a single token of types value *ignore*.