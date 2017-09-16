/*global global*/
(function markdown_init() {
    "use strict";
    const framework: parseFramework = global.parseFramework,
        markdown = function lexer_markdown(source : string): data {
            let a   : number  = 0,
                b   : number  = 0,
                bc  : number  = 0;
            const parse: parse    = framework.parse,
                data   : data     = parse.data,
                lines  : string[] = source.replace(/\u0000/g, "\ufffd").split(parse.crlf),
                hr = function lexer_markdown_hr():void {
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "<hr/>",
                        types: "singleton"
                    }, "");
                },
                text     = function lexer_markdown_text(item:string, tag:string, listrecurse:boolean):void {
                    let tagend:string = tag.replace("<", "</"),
                        struct:string = tag.replace("<", "").replace(/(\/?>)$/, "");
                    
                    // line containing strong, em, or inline code
                    if (item.indexOf("*") > -1 || item.indexOf("`") > -1 || (item.indexOf("[") > -1 && item.indexOf("](") > -1)) {
                        const esctest = function lexer_markdown_text_esctest():boolean {
                                let bb = aa - 1;
                                if (str[bb] === "\\") {
                                    do {
                                        bb = bb - 1;
                                    } while (str[bb] === "\\");
                                    if ((aa - bb) % 2 === 1) {
                                        return true;
                                    }
                                    return false;
                                }
                                return false;
                            },
                            gencontent = function lexer_markdown_text_gencontent():string {
                                return itemx.join("").replace(/\s+/g, " ").replace(/^\s/, "").replace(/\s$/, "").replace(/\\(?!(\\))/g, "").replace(/\\{2}/g, "\\");
                            };
                        let quote = "",
                            str:string[] = item.split(""),
                            content:string = "",
                            stack:string[] = [],
                            itemx:string[] = [],
                            square:number = 0,
                            aa:number = 0,
                            bb:number = str.length,
                            cc:number = 0;
                        if (tag !== "multiline") {
                            parse.push(data, {
                                begin: parse.structure[parse.structure.length - 1][1],
                                lexer: "markdown",
                                lines: 0,
                                presv: false,
                                stack: parse.structure[parse.structure.length - 1][0],
                                token: tag,
                                types: "start"
                            }, struct);
                        }
                        do {
                            if (str[aa] === "[" && esctest() === false) {
                                cc = aa;
                                square = 0;
                                do {
                                    if (str[cc] === "[") {
                                        square = square + 1;
                                    } else if (str[cc] === "]") {
                                        square = square - 1;
                                        if (square < 1 && str[cc + 1] === "(") {
                                            content = itemx.join("").replace(/\s+/g, " ").replace(/^\s/, "").replace(/\s$/, "");
                                            if (content !== "") {
                                                parse.push(data, {
                                                    begin: parse.structure[parse.structure.length - 1][1],
                                                    lexer: "markdown",
                                                    lines: 0,
                                                    presv: false,
                                                    stack: parse.structure[parse.structure.length - 1][0],
                                                    token: content,
                                                    types: "content"
                                                }, "");
                                            }
                                            itemx = [];
                                            stack.push("[");
                                            if (str[aa - 1] === "!") {
                                                content = "img";
                                            } else {
                                                content = "a";
                                            }
                                            if (content === "img") {
                                                if (data.token[parse.count] === "!") {
                                                    parse.pop(data);
                                                } else if (data.types[parse.count] === "content") {
                                                    data.token[parse.count] = data.token[parse.count].slice(0, data.token[parse.count].length - 1).replace(/(\s)$/, "");
                                                }
                                                parse.push(data, {
                                                    begin: parse.structure[parse.structure.length - 1][1],
                                                    lexer: "markdown",
                                                    lines: 1,
                                                    presv: false,
                                                    stack: parse.structure[parse.structure.length - 1][0],
                                                    token: "<img/>",
                                                    types: "singleton"
                                                }, "");
                                                content = str.slice(aa + 1, cc).join("").replace(/\s+/g, " ").replace(/^\s/, "").replace(/\s$/, "")
                                                if (content !== "") {
                                                    parse.push(data, {
                                                        begin: parse.structure[parse.structure.length - 1][1],
                                                        lexer: "markdown",
                                                        lines: 0,
                                                        presv: false,
                                                        stack: parse.structure[parse.structure.length - 1][0],
                                                        token: "alt=\"" + content + "\"",
                                                        types: "attribute"
                                                    }, "");
                                                }
                                                parse.push(data, {
                                                    begin: parse.structure[parse.structure.length - 1][1],
                                                    lexer: "markdown",
                                                    lines: 1,
                                                    presv: false,
                                                    stack: parse.structure[parse.structure.length - 1][0],
                                                    token: "src=\"",
                                                    types: "attribute"
                                                }, "");
                                                aa = cc - 1;
                                            } else {
                                                parse.push(data, {
                                                    begin: parse.structure[parse.structure.length - 1][1],
                                                    lexer: "markdown",
                                                    lines: 1,
                                                    presv: false,
                                                    stack: parse.structure[parse.structure.length - 1][0],
                                                    token: "<a>",
                                                    types: "start"
                                                }, "a");
                                                parse.push(data, {
                                                    begin: parse.structure[parse.structure.length - 1][1],
                                                    lexer: "markdown",
                                                    lines: 0,
                                                    presv: false,
                                                    stack: parse.structure[parse.structure.length - 1][0],
                                                    token: "href=\"",
                                                    types: "attribute"
                                                }, "");
                                            }
                                            break;
                                        }
                                    }
                                    cc = cc + 1;
                                } while (cc < bb);
                            } else if (str[aa] === "]" && str[aa + 1] === "(" && esctest() === false && stack[stack.length - 1] === "[") {
                                content = gencontent();
                                if (content !== "" && content.length > 1 && parse.structure[parse.structure.length - 1][0] !== "img") {
                                    parse.push(data, {
                                        begin: parse.structure[parse.structure.length - 1][1],
                                        lexer: "markdown",
                                        lines: 0,
                                        presv: false,
                                        stack: parse.structure[parse.structure.length - 1][0],
                                        token: content,
                                        types: "content"
                                    }, "");
                                }
                                cc = aa + 1;
                                square = 0;
                                do {
                                    if (str[cc] === "(") {
                                        square = square + 1;
                                    } else if (str[cc] === ")") {
                                        square = square - 1;
                                        if (square === 0) {
                                            content = str.slice(aa + 2, cc).join("").replace(/\s+/g, " ").replace(/^\s/, "").replace(/\s$/, "");
                                            aa = cc + 1;
                                            itemx = [];
                                            cc = (parse.structure[parse.structure.length - 1][0] === "a")
                                                ? parse.structure[parse.structure.length - 1][1] + 1
                                                : parse.count;
                                            if (content === "") {
                                                data.token[cc] = data.token[cc] + "\"";
                                            } else {
                                                data.token[cc] = data.token[cc] + content + "\"";
                                            }
                                            break;
                                        }
                                    }
                                    cc = cc + 1;
                                } while (cc < bb);
                                stack.pop();
                                if (parse.structure[parse.structure.length - 1][0] === "a") {
                                    parse.push(data, {
                                        begin: parse.structure[parse.structure.length - 1][1],
                                        lexer: "markdown",
                                        lines: 0,
                                        presv: false,
                                        stack: parse.structure[parse.structure.length - 1][0],
                                        token: "</a>",
                                        types: "end"
                                    }, "");
                                }
                            } else if ((str[aa] === "*" || str[aa] === "~") && esctest() === false && ((quote === "" && (((/\s/).test(str[aa - 1]) === true) || aa === 0)) || (quote !== "" && (((/\s/).test(str[aa + 1]) === true) || aa === bb - 1))) && stack[stack.length - 1] !== "`") {
                                str[aa] = "";
                                if (str[aa] === "~") {
                                    quote = "~";
                                    do {
                                        str[aa] = "";
                                        aa = aa + 1;
                                    } while (str[aa] === "~");
                                } else if (str[aa + 1] === "*") {
                                    quote = "**";
                                    str[aa + 1] = "";
                                } else {
                                    quote = "*";
                                }
                                if (quote === stack[stack.length - 1]) {
                                    let midtag = "</em>";
                                    content = gencontent();
                                    if (content !== "") {
                                        parse.push(data, {
                                            begin: parse.structure[parse.structure.length - 1][1],
                                            lexer: "markdown",
                                            lines: 0,
                                            presv: false,
                                            stack: parse.structure[parse.structure.length - 1][0],
                                            token: content,
                                            types: "content"
                                        }, "");
                                    }
                                    itemx = [];
                                    if (quote === "~") {
                                        midtag = "</strike>";
                                    } else if (quote === "**") {
                                        midtag = "</strong>";
                                    }
                                    stack.pop();
                                    parse.push(data, {
                                        begin: parse.structure[parse.structure.length - 1][1],
                                        lexer: "markdown",
                                        lines: 0,
                                        presv: false,
                                        stack: parse.structure[parse.structure.length - 1][0],
                                        token: midtag,
                                        types: "end"
                                    }, "");
                                    quote   = "";
                                } else {
                                    let midtag = "em";
                                    content = gencontent();
                                    if (content !== "") {
                                        parse.push(data, {
                                            begin: parse.structure[parse.structure.length - 1][1],
                                            lexer: "markdown",
                                            lines: 0,
                                            presv: false,
                                            stack: parse.structure[parse.structure.length - 1][0],
                                            token: content,
                                            types: "content"
                                        }, "");
                                    }
                                    itemx = [];
                                    if (quote === "~") {
                                        midtag = "strike";
                                    } else if (quote === "**") {
                                        midtag = "strong";
                                    }
                                    stack.push(quote);
                                    parse.push(data, {
                                        begin: parse.structure[parse.structure.length - 1][1],
                                        lexer: "markdown",
                                        lines: 1,
                                        presv: false,
                                        stack: parse.structure[parse.structure.length - 1][0],
                                        token: "<" + midtag + ">",
                                        types: "start"
                                    }, midtag);
                                }
                            } else if (str[a] === "`" && esctest() === false) {
                                content = itemx.join("").replace(/\s+/g, " ").replace(/^\s/, "").replace(/\s$/, "");
                                if (content !== "") {
                                    parse.push(data, {
                                        begin: parse.structure[parse.structure.length - 1][1],
                                        lexer: "markdown",
                                        lines: 0,
                                        presv: false,
                                        stack: parse.structure[parse.structure.length - 1][0],
                                        token: content,
                                        types: "content"
                                    }, "");
                                }
                                itemx = [];
                                if (stack[stack.length - 1] === "`") {
                                    stack.pop();
                                    parse.push(data, {
                                        begin: parse.structure[parse.structure.length - 1][1],
                                        lexer: "markdown",
                                        lines: 0,
                                        presv: false,
                                        stack: parse.structure[parse.structure.length - 1][0],
                                        token: "</code>",
                                        types: "end"
                                    }, "");
                                } else {
                                    stack.push("`");
                                    parse.push(data, {
                                        begin: parse.structure[parse.structure.length - 1][1],
                                        lexer: "markdown",
                                        lines: 1,
                                        presv: false,
                                        stack: parse.structure[parse.structure.length - 1][0],
                                        token: "<code>",
                                        types: "start"
                                    }, "code");
                                }
                            }
                            if (str[aa] !== stack[stack.length - 1] && str[aa - 1] + str[aa] !== stack[stack.length - 1]) {
                                itemx.push(str[aa]);
                            }
                            aa = aa + 1;
                        } while (aa < bb);
                        content = gencontent();
                        if (content !== "") {
                            parse.push(data, {
                                begin: parse.structure[parse.structure.length - 1][1],
                                lexer: "markdown",
                                lines: 1,
                                presv: false,
                                stack: parse.structure[parse.structure.length - 1][0],
                                token: content,
                                types: "content"
                            }, "");
                        }
                        if (listrecurse === true) {
                            list(true);
                        }
                        if (tag !== "multiline") {
                            parse.push(data, {
                                begin: parse.structure[parse.structure.length - 1][1],
                                lexer: "markdown",
                                lines: 0,
                                presv: false,
                                stack: parse.structure[parse.structure.length - 1][0],
                                token: tagend,
                                types: "end"
                            }, "");
                        }
                        return;
                    }
                    if (struct.indexOf(" ") > 0) {
                        struct = struct.slice(0, struct.indexOf(" "));
                    }
                    if (tag !== "multiline") {
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: tag,
                            types: "start"
                        }, struct);
                    }
                    if (listrecurse === true) {
                        list(true);
                    } else {
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: item.replace(/^(\s+)/, "").replace(/(\s+)$/, ""),
                            types: "content"
                        }, "");
                    }
                    if (tag !== "multiline") {
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: tagend,
                            types: "end"
                        }, "");
                    }
                },
                hrtest = function lexer_markdown_hrtest(index:number):boolean {
                    return (/^(\s*((-\s*){3,}|(_\s*){3,}|(\*\s*){3,})\s*)$/).test(lines[index]);
                },
                codetest = function lexer_markdown_codetest(index:number):boolean {
                    return ((/^(\u0020{4,}\s*\S)/).test(lines[index]) === true || (/^(\s*\t\s*\S)/).test(lines[index]) === true);
                },
                listtest = function lexer_markdown_listtest(index:number):boolean {
                    return (/^(\s*(\*|-|((\d+|[a-zA-Z]+)\.))\s)/).test(lines[index]);
                },
                code     = function lexer_markdown_code(codetext:string, language:string):void {
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "<p>",
                        types: "start"
                    }, "p");
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "<code>",
                        types: "start"
                    }, "code");
                    if (language !== "") {
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: "class=\"language-" + language + "\"",
                            types: "attribute"
                        }, "");
                    }
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: codetext,
                        types: "content"
                    }, "");
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "</code>",
                        types: "end"
                    }, "");
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "</p>",
                        types: "end"
                    }, "");
                },
                codeblock = function lexer_markdown_codeblock(ticks:boolean):void {
                    const language:string = (ticks === true)
                            ? lines[a].replace(/\s*((`+)|(~+))\s*/, "").replace(/\s*/g, "")
                            : "",
                        tilde:boolean = (/^(\s*`)/).test(lines[a]) === false,
                        codes:string[] = [];
                    if (ticks === true) {
                        a = a + 1;
                        if (tilde === true && (/^(\s*~{3})/).test(lines[a]) === true) {
                            return;
                        }
                        if (tilde === false && (/^(\s*`{3})/).test(lines[a]) === true) {
                            return;
                        }
                    }
                    do {
                        if (lines[a] !== "") {
                            if (ticks === true) {
                                if (tilde === true && (/^(\s*~{3})/).test(lines[a]) === true) {
                                    break;
                                }
                                if (tilde === false && (/^(\s*`{3})/).test(lines[a]) === true) {
                                    break;
                                }
                                codes.push(lines[a]);
                            } else {
                                codes.push(lines[a].replace(/^(\u0020{4})/, "").replace(/^(\s*\t)/, ""));
                                if (codetest(a + 1) === false) {
                                    break;
                                }
                            }
                        }
                        a = a + 1;
                    } while (a < b);
                    code(codes.join(parse.crlf), language);
                },
                blockquote = function lexer_markdown_blockquote():void {
                    let x:number = a,
                        item:string = "",
                        block:RegExp,
                        block1:RegExp;
                    bc = bc + 1;
                    block = new RegExp("^((\\s*>\\s*){1," + bc + "})");
                    block1 = new RegExp("^((\\s*>\\s*){" + (bc + 1) + "})");
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "<blockquote>",
                        types: "start"
                    }, "blockquote");
                    lines[a] = lines[a].replace(block, "");
                    do {
                        if ((block1).test(lines[x]) === true) {
                            a = x;
                            if (item !== "") {
                                parse.push(data, {
                                    begin: parse.structure[parse.structure.length - 1][1],
                                    lexer: "markdown",
                                    lines: 0,
                                    presv: false,
                                    stack: parse.structure[parse.structure.length - 1][0],
                                    token: item.replace(parse.crlf, ""),
                                    types: "content"
                                }, "");
                            }
                            lexer_markdown_blockquote();
                            parse.push(data, {
                                begin: parse.structure[parse.structure.length - 1][1],
                                lexer: "markdown",
                                lines: 0,
                                presv: false,
                                stack: parse.structure[parse.structure.length - 1][0],
                                token: "</blockquote>",
                                types: "end"
                            }, "");
                            return;
                        }
                        item = item + parse.crlf + lines[x].replace(block, "");
                        x = x + 1;
                    } while (x < b && lines[x] !== "" && hrtest(x) === false);
                    a = x;
                    if (item !== "") {
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: item.replace(parse.crlf, ""),
                            types: "content"
                        }, "");
                    }
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "</blockquote>",
                        types: "end"
                    }, "");
                },
                parabuild = function lexer_markdown_parabuild():void {
                    let x:number = a,
                        tag: string = "<p>",
                        test = function lexer_markdown_text_test(index:number): boolean {
                        if ((/^\s{0,3}={3,}\s*/).test(lines[index]) === true) {
                            tag = "<h1>";
                            return false;
                        }
                        if ((/^\s{0,3}-{3,}\s*/).test(lines[index]) === true) {
                            tag = "<h2>";
                            return false;
                        }
                        if (hrtest(index) === true) {
                            return false;
                        }
                        if ((/^(\s*>)/).test(lines[index]) === true) {
                            return false;
                        }
                        if ((/^(\s*#{1,6}\s)/).test(lines[index]) === true) {
                            return false;
                        }
                        if ((/^(\s{0,3}(\*|-|((\d+|[a-zA-Z]+)\.))\s)/).test(lines[index]) === true) {
                            return false;
                        }
                        return true;
                    };
                    if (test(a + 1) === true) {
                        do {
                            x = x + 1;
                        } while (x < b && test(x) === true);
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: tag,
                            types: "start"
                        }, tag.replace("<", "").replace(">", ""));
                        do {
                            text(lines[a], "multiline", false);
                            parse.push(data, {
                                begin: parse.structure[parse.structure.length - 1][1],
                                lexer: "markdown",
                                lines: 0,
                                presv: false,
                                stack: parse.structure[parse.structure.length - 1][0],
                                token: "<br/>",
                                types: "singleton"
                            }, "");
                            a = a + 1;
                        } while (a < x);
                        parse.pop(data);
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: tag.replace("<", "</"),
                            types: "end"
                        }, "");
                    } else {
                        text(lines[a], "<p>", false);
                    }
                },
                list     = function lexer_markdown_list(recursed:boolean):void {
                    const tabs = function lexer_markdown_list(spaces:string):string {
                        let output:string[] = spaces.split(""),
                            uu:number = 0;
                        const tt:number = output.length;
                        do {
                            if (output[uu] === "\t") {
                                output[uu] = "    ";
                            }
                            uu = uu + 1;
                        } while (uu < tt);
                        return output.join("");
                    };
                    let ind:number = ((/^(\s+)/).test(lines[a]) === true)
                            ? (/^(\s+)/).exec(lines[a].replace(/^(\s+)/, tabs))[0].length
                            : 0,
                        sym:string = lines[a].replace(/^(\s+)/, "").charAt(0),
                        record:record = {
                            begin: -1,
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: "",
                            token: "",
                            types: ""
                        },
                        lasttext:string = "",
                        space = function lexer_markdown_list_space(index:number):number {
                            let xind:number = ((/^(\s+)/).test(lines[index]) === true)
                                    ? (/^(\s+)/).exec(lines[index].replace(/^(\s+)/, tabs))[0].length
                                    : 0,
                                xsym:string = lines[index].replace(/^(\s+)/, "").charAt(0);
                            if (xsym !== sym) {
                                return 10;
                            }
                            return xind;
                        },
                        y:number = 0,
                        z:number = 0,
                        order:boolean = false,
                        end:record;
                    if ((/^(\s*(\d+|[a-zA-Z]+)\.\s)/).test(list[a]) === true) {
                        order = true;
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: "<ol>",
                            types: "start"
                        }, "ol");
                    } else {
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: "<ul>",
                            types: "start"
                        }, "ul");
                    }

                    do {
                        if (lines[a] === "") {
                            if (codetest(a + 1) === false) {
                                break;
                            }
                        } else {
                            y = space(a) - ind;
                            if (y < -1 || y > 9 || hrtest(a) === true) {
                                z = (lines[a + 1] === "")
                                    ? a + 2
                                    : a + 1;
                                if (z !== b && codetest(z) === false && listtest(z) === false) {
                                    a = a - 1;
                                    break;
                                }
                            }
                            if (y > 1) {
                                if (codetest(a) === true && listtest(a) === false) {
                                    end = parse.pop(data);
                                    if (lines[a - 1] === "" && data.token[parse.count] !== "</p>") {
                                        lasttext = data.token[parse.count];
                                        parse.pop(data);
                                        record.begin = parse.structure[parse.structure.length - 1][1];
                                        record.stack = parse.structure[parse.structure.length - 1][0];
                                        record.token = "<p>";
                                        record.types = "start";
                                        parse.push(data, record, "p");
                                        record.begin = parse.structure[parse.structure.length - 1][1];
                                        record.stack = parse.structure[parse.structure.length - 1][0];
                                        record.token = lasttext;
                                        record.types = "content";
                                        parse.push(data, record, "");
                                        record.token = "</p>";
                                        record.types = "end";
                                        parse.push(data, record, "");
                                    }
                                    lines[a] = lines[a].replace(/^(\u0020{4})/, "").replace(/^(\s*\t)/, "");
                                    if (codetest(a) === true) {
                                        code(lines[a], "");
                                    } else {
                                        text(lines[a], "<p>", false);
                                    }
                                    parse.push(data, end, "");
                                } else {
                                    if (recursed === true) {
                                        text(lines[a].replace(/^(\s*(\*|-|((\d+|[a-zA-Z]+)\.))\s+)/, ""), "multiline", true);
                                    } else {
                                        text(lines[a], "multiline", true);
                                    }
                                    record.begin = parse.structure[parse.structure.length - 1][1];
                                    record.stack = parse.structure[parse.structure.length - 1][0];
                                    record.token = "</li>";
                                    record.types = "end";
                                    parse.push(data, record, "");
                                }
                            } else if (listtest(a + 1) === true && space(a + 1) - space(a) > 1) {
                                record.begin = parse.structure[parse.structure.length - 1][1];
                                record.stack = parse.structure[parse.structure.length - 1][0];
                                record.token = "<li>";
                                record.types = "start";
                                parse.push(data, record, "li");
                                text(lines[a].replace(/^(\s*(\*|-|((\d+|[a-zA-Z]+)\.))\s+)/, ""), "multiline", false);
                            } else {
                                text(lines[a].replace(/^(\s*(\*|-|((\d+|[a-zA-Z]+)\.))\s+)/, ""), "<li>", false);
                            }
                        }
                        a = a + 1;
                    } while (a < b);
                    if (order === true) {
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: "</ol>",
                            types: "end"
                        }, "");
                    } else {
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: "</ul>",
                            types: "end"
                        }, "");
                    }
                },
                table     = function lexer_markdown_table():void {
                    let c:number    = 0,
                        d:number    = 0,
                        line:string[] = [];
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "<table>",
                        types: "start"
                    }, "table");
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "<thead>",
                        types: "start"
                    }, "thead");
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "<tr>",
                        types: "start"
                    }, "tr");
                    line = lines[a]
                        .replace(/^\|/, "")
                        .replace(/\|$/, "")
                        .split("|");
                    d = line.length;
                    do {
                        text(line[c], "<th>", false);
                        c = c + 1;
                    } while (c < d);
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "</tr>",
                        types: "end"
                    }, "");
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "</thead>",
                        types: "end"
                    }, "");
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "<tbody>",
                        types: "start"
                    }, "thead");
                    a = a + 2;
                    do {
                        line = lines[a]
                            .replace(/^\|/, "")
                            .replace(/\|$/, "")
                            .split("|");
                        if (line.length < 2) {
                            break;
                        }
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: "<tr>",
                            types: "start"
                        }, "tr");
                        c = 0;
                        d = line.length;
                        do {
                            text(line[c], "<td>", false);
                            c = c + 1;
                        } while (c < d);
                        parse.push(data, {
                            begin: parse.structure[parse.structure.length - 1][1],
                            lexer: "markdown",
                            lines: 0,
                            presv: false,
                            stack: parse.structure[parse.structure.length - 1][0],
                            token: "</tr>",
                            types: "end"
                        }, "");
                        a = a + 1;
                    } while (a < b);
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "</tbody>",
                        types: "end"
                    }, "");
                    parse.push(data, {
                        begin: parse.structure[parse.structure.length - 1][1],
                        lexer: "markdown",
                        lines: 0,
                        presv: false,
                        stack: parse.structure[parse.structure.length - 1][0],
                        token: "</table>",
                        types: "end"
                    }, "");
                };
            b = lines.length;
            parse.push(data, {
                begin: parse.structure[parse.structure.length - 1][1],
                lexer: "markdown",
                lines: 0,
                presv: false,
                stack: parse.structure[parse.structure.length - 1][0],
                token: "<body>",
                types: "start"
            }, "body");
            do {
                if ((/^(\s*)$/).test(lines[a]) === true) {
                    if (lines[a - 1] === "") {
                        lines.splice(a, 1);
                        b = b - 1;
                        a = a - 1;
                    } else {
                        lines[a] = "";
                    }
                }
                a = a + 1;
            } while (a < b);
            a = 0;
            do {
                if (codetest(a) === true) {
                    if (codetest(a + 1) === true) {
                        codeblock(false);
                    } else {
                        code(lines[a], "");
                    }
                } else if (hrtest(a) === true) {
                    hr();
                } else if ((/^(\s*>)/).test(lines[a]) === true) {
                    bc = 0;
                    blockquote();
                } else if ((/-{3,}\s*\|\s*-{3,}/).test(lines[a + 1]) === true) {
                    table();
                } else if ((/^(\s*((`{3,})|(~{3,}))+)/).test(lines[a]) === true) {
                    codeblock(true);
                } else if ((/^(\s*#{6,6}\s)/).test(lines[a]) === true) {
                    text(lines[a].replace(/^(\s*#+\s+)/, "").replace(/(\s*#+\s*)$/, ""), "<h6>", false);
                } else if ((/^(\s*#{5,5}\s)/).test(lines[a]) === true) {
                    text(lines[a].replace(/^(\s*#+\s+)/, "").replace(/(\s*#+\s*)$/, ""), "<h5>", false);
                } else if ((/^(\s*#{4,4}\s)/).test(lines[a]) === true) {
                    text(lines[a].replace(/^(\s*#+\s+)/, "").replace(/(\s*#+\s*)$/, ""), "<h4>", false);
                } else if ((/^(\s*#{3,3}\s)/).test(lines[a]) === true) {
                    text(lines[a].replace(/^(\s*#+\s+)/, "").replace(/(\s*#+\s*)$/, ""), "<h3>", false);
                } else if ((/^(\s*#{2,2}\s)/).test(lines[a]) === true) {
                    text(lines[a].replace(/^(\s*#+\s+)/, "").replace(/(\s*#+\s*)$/, ""), "<h2>", false);
                } else if ((/^(\s*#\s)/).test(lines[a]) === true) {
                    text(lines[a].replace(/^(\s*#\s+)/, "").replace(/(\s*#+\s*)$/, ""), "<h1>", false);
                } else if (listtest(a) === true) {
                    list(false);
                } else if (lines[a] !== "" && (/^(\s+)$/).test(lines[a]) === false) {
                    parabuild();
                }
                a = a + 1;
            } while (a < b);
            parse.push(data, {
                begin: parse.structure[parse.structure.length - 1][1],
                lexer: "markdown",
                lines: 0,
                presv: false,
                stack: parse.structure[parse.structure.length - 1][0],
                token: "</body>",
                types: "end"
            }, "");
            return data;
        }
    framework.lexer.markdown = markdown;
}());