/*jslint node:true*/
// The order array determines which tests run in which order (from last to first
// index)
module.exports = (function taskrunner() {
    "use strict";
    var order      = [
            "lint", //       - run jslint on all unexcluded JS files in the repo
            "framework", //  - test the framework
            "codeunits" //   - test the lexers
        ],
        startTime  = process.hrtime(),
        node       = {
            child: require("child_process").exec,
            fs   : require("fs"),
            path : require("path")
        },
        orderlen   = order.length,
        relative   = __dirname.replace(/((\/|\\)test)$/, ""),
        humantime  = function taskrunner_humantime(finished) {
            var minuteString = "",
                hourString   = "",
                secondString = "",
                finalTime    = "",
                finalMem     = "",
                strSplit     = [],
                minutes      = 0,
                hours        = 0,
                elapsed      = (function taskrunner_humantime_elapsed() {
                    var endtime = process.hrtime(),
                        dtime = [endtime[0] - startTime[0], endtime[1] - startTime[1]];
                    if (dtime[1] === 0) {
                        return dtime[0];
                    }
                    if (dtime[1] < 0) {
                        dtime[1] = ((1000000000 + endtime[1]) - startTime[1]);
                    }
                    return dtime[0] + (dtime[1] / 1000000000);
                }()),
                memory       = {},
                prettybytes  = function taskrunner_humantime_prettybytes(an_integer) {
                    //find the string length of input and divide into triplets
                    var length  = an_integer
                            .toString()
                            .length,
                        triples = (function taskrunner_humantime_prettybytes_triples() {
                            if (length < 22) {
                                return Math.floor((length - 1) / 3);
                            }
                            //it seems the maximum supported length of integer is 22
                            return 8;
                        }()),
                        //each triplet is worth an exponent of 1024 (2 ^ 10)
                        power   = (function taskrunner_humantime_prettybytes_power() {
                            var a = triples - 1,
                                b = 1024;
                            if (triples === 0) {
                                return 0;
                            }
                            if (triples === 1) {
                                return 1024;
                            }
                            do {
                                b = b * 1024;
                                a = a - 1;
                            } while (a > 0);
                            return b;
                        }()),
                        //kilobytes, megabytes, and so forth...
                        unit    = [
                            "",
                            "KB",
                            "MB",
                            "GB",
                            "TB",
                            "PB",
                            "EB",
                            "ZB",
                            "YB"
                        ],
                        output  = "";

                    if (typeof an_integer !== "number" || isNaN(an_integer) === true || an_integer < 0 || an_integer % 1 > 0) {
                        //input not a positive integer
                        output = "0.00B";
                    } else if (triples === 0) {
                        //input less than 1000
                        output = an_integer + "B";
                    } else {
                        //for input greater than 999
                        length = Math.floor((an_integer / power) * 100) / 100;
                        output = length.toFixed(2) + unit[triples];
                    }
                    return output;
                },
                plural       = function core__proctime_plural(x, y) {
                    var a = "";
                    if (x !== 1) {
                        a = x + y + "s ";
                    } else {
                        a = x + y + " ";
                    }
                    return a;
                },
                minute       = function core__proctime_minute() {
                    minutes      = parseInt((elapsed / 60), 10);
                    minuteString = (finished === true)
                        ? plural(minutes, " minute")
                        : (minutes < 10)
                            ? "0" + minutes
                            : "" + minutes;
                    minutes      = elapsed - (minutes * 60);
                    secondString = (finished === true)
                        ? (minutes === 1)
                            ? " 1 second "
                            : minutes.toFixed(3) + " seconds "
                        : minutes.toFixed(3);
                };
            memory       = process.memoryUsage();
            finalMem     = prettybytes(memory.rss);

            //last line for additional instructions without bias to the timer
            secondString = elapsed + "";
            strSplit     = secondString.split(".");
            if (strSplit[1].length < 9) {
                do {
                    strSplit[1]  = strSplit[1] + 0;
                } while (strSplit[1].length < 9);
                secondString = strSplit[0] + "." + strSplit[1];
            } else if (strSplit[1].length > 9) {
                secondString = strSplit[0] + "." + strSplit[1].slice(0, 9);
            }
            if (elapsed >= 60 && elapsed < 3600) {
                minute();
            } else if (elapsed >= 3600) {
                hours      = parseInt((elapsed / 3600), 10);
                elapsed    = elapsed - (hours * 3600);
                hourString = (finished === true)
                    ? plural(hours, " hour")
                    : (hours < 10)
                        ? "0" + hours
                        : "" + hours;
                minute();
            } else {
                secondString = (finished === true)
                    ? plural(secondString, " second")
                    : secondString;
            }
            if (finished === true) {
                finalTime = hourString + minuteString + secondString;
                console.log(finalMem + " of memory consumed");
                console.log(finalTime + "total time");
                console.log("");
            } else {
                if (hourString === "") {
                    hourString = "00";
                }
                if (minuteString === "") {
                    minuteString = "00";
                }
                if ((/^([0-9]\.)/).test(secondString) === true) {
                    secondString = "0" + secondString;
                }
                return "\u001b[36m[" + hourString + ":" + minuteString + ":" +
                        secondString + "]\u001b[39m ";
            }
        },
        prettydiff = require("." + node.path.sep + "prettydiff" + node.path.sep + "prettydiff.js"),
        options    = {},
        parse      = {},
        errout     = function taskrunner_errout(errtext) {
            console.log("");
            console.error(errtext);
            humantime(true);
            process.exit(1);
        },
        next       = function taskrunner_nextInit() {
            return;
        },
        diffFiles  = function taskrunner_diffFiles(sampleName, sampleSource, sampleDiff) {
            var aa     = 0,
                pdlen  = 0,
                plus   = "",
                plural = "",
                report = [],
                total  = 0,
                diffview = require("." + node.path.sep + "prettydiff" + node.path.sep + "lib" + node.path.sep + "diffview.js"),
                record = function taskrunner_diffFiles_record(data) {
                    var len = data.token.length,
                        x   = 0,
                        rec = [],
                        dn  = function taskrunner_diffFiles_record_datanames(value) {
                            rec[x][value] = data[value][x];
                        };
                    do {
                        rec.push({});
                        parse.datanames.forEach(dn);
                        rec[x] = JSON.stringify(rec[x]);
                        x = x + 1;
                    } while (x < len);
                    return rec;
                };
            options.mode    = "diff";
            options.source  = (typeof sampleSource === "string")
                ? record(JSON.parse(sampleSource))
                : record(sampleSource);
            options.diff    = (typeof sampleDiff === "string")
                ? record(JSON.parse(sampleDiff))
                : record(sampleSource);
            options.diffcli = true;
            options.context = 2;
            options.lang    = "text";
            report          = diffview(options);
            pdlen           = report[0].length;
            total           = report[1];
            if (total > 50) {
                plus = "+";
            }
            if (total !== 1) {
                plural = "s";
            }
            // report indexes from diffcli feature of diffview.js 0 - source line number 1 -
            // source code line 2 - diff line number 3 - diff code line 4 - change 5 - index
            // of options.context (not parallel) 6 - total count of differences
            do {
                if (report[0][aa].indexOf("\u001b[36m") === 0) {
                    console.log("\u001b[36m" + sampleName + "\u001b[39m");
                }
                if (report[0][aa].indexOf("\u001b[36mLine: ") !== 0) {
                    if (report[0][aa].indexOf("\u001b[31m") === 0) {
                        report[0][aa] = report[0][aa].replace(/\{/, "{\u001b[39m").replace(/(\}\u001b\[39m)$/, "\u001b[31m}\u001b[39m");
                        report[0][aa] = report[0][aa].replace(/\u001b\[1m/g, "\u001b[31m").replace(/\u001b\[22m/g, "\u001b[39m");
                    } else if (report[0][aa].indexOf("\u001b[32m") === 0) {
                        report[0][aa] = report[0][aa].replace(/\{/, "{\u001b[39m").replace(/(\}\u001b\[39m)$/, "\u001b[32m}\u001b[39m");
                        report[0][aa] = report[0][aa].replace(/\u001b\[1m/g, "\u001b[32m").replace(/\u001b\[22m/g, "\u001b[39m");
                    }
                    console.log(report[0][aa]);
                }
                aa = aa + 1;
            } while (aa < pdlen);
            console.log("");
            console.log(
                total + plus + " \u001b[32mdifference" + plural + " counted.\u001b[39m"
            );
            errout(
                "Pretty Diff \u001b[31mfailed\u001b[39m on file: \u001b[36m" + sampleName + "" +
                "\u001b[39m"
            );
        },
        phases     = {
            codeunits: function taskrunner_coreunits() {
                var files  = {
                        code  : [],
                        parsed: []
                    },
                    count  = {
                        code  : 0,
                        parsed: 0
                    },
                    total  = {
                        code  : 0,
                        parsed: 0
                    },
                    lexers = Object.keys(parse.lexer),
                    compare = function taskrunner_coreunits_compare() {
                        var len       = (files.code.length > files.parsed.length)
                                ? files.code.length
                                : files.parsed.length,
                            lang      = [],
                            a         = 0,
                            str       = "",
                            output    = {},
                            filecount = 0,
                            currentlex = "",
                            lexer     = function taskrunner_coreunits_compare_lexer() {
                                var lex = files.code[a][0].slice(0, files.code[a][0].indexOf(node.path.sep));
                                console.log("");
                                console.log("Tests for lexer - \u001b[36m" + lex + "\u001b[39m");
                                currentlex = lex;
                            };
                        files.code   = parse.safeSort(files.code);
                        files.parsed = parse.safeSort(files.parsed);
                        lexer();
                        do {
                            if (files.code[a][0].indexOf(currentlex) !== 0) {
                                lexer();
                            }
                            if (files.code[a] === undefined || files.parsed[a] === undefined) {
                                if (files.code[a] === undefined) {
                                    console.log(
                                        "\u001b[33msamples_code directory is missing file:\u001b[39m " + files.parsed[a][0]
                                    );
                                    files.parsed.splice(a, 1);
                                } else {
                                    console.log(
                                        "\u001b[33msamples_parse directory is missing file:\u001b[39m " + files.parsedcode[a][0]
                                    );
                                    files.code.splice(a, 1);
                                }
                                len = (files.code.length > files.parsed.length)
                                    ? files.code.length
                                    : files.codeparsed.length;
                                a   = a - 1;
                            } else if (files.code[a][0] === files.parsed[a][0]) {
                                if (files.parsed[a][1] === "") {
                                    console.log("\u001b[33mParsed file is empty:\u001b[39m " + files.parsed[a][0]);
                                } else if (files.code[a][1] === "") {
                                    console.log("\u001b[33mCode file is empty:\u001b[39m " + files.code[a][0]);
                                } else {
                                    if ((/_correct(\.|_)/).test(files.code[a][0]) === true) {
                                        options.correct = true;
                                    } else {
                                        options.correct = false;
                                    }
                                    if ((/_objectSort(\.|_)/).test(files.code[a][0]) === true) {
                                        options.objectSort = true;
                                    } else {
                                        options.objectSort = false;
                                    }
                                    if ((/_tagSort(\.|_)/).test(files.code[a][0]) === true) {
                                        options.tagSort = true;
                                    } else {
                                        options.tagSort = false;
                                    }
                                    options.source = files.code[a][1];
                                    lang           = global.language.auto(files.code[a][1], "javascript");
                                    options.lexer  = lang[1];
                                    options.lang   = lang[0];
                                    output         = global.parser(options);
                                    str            = JSON.stringify(output);
                                    if (global.parseerror === "") {
                                        if (str === files.parsed[a][1]) {
                                            filecount = filecount + 1;
                                            console.log(
                                                humantime(false) + "\u001b[32mPass " + filecount + ":\u001b[39m " + files.parsed[a][0].replace(currentlex + node.path.sep, "")
                                            );
                                            if (a === len - 1) {
                                                console.log("\u001b[32mCore unit testing complete!\u001b[39m");
                                                return next();
                                            }
                                        } else {
                                            diffFiles(files.parsed[a][0], output, files.parsed[a][1]);
                                        }
                                    } else {
                                        console.log("");
                                        console.log("Quitting due to error:");
                                        console.log(global.parseerror);
                                        process.exit(1);
                                    }
                                }
                            } else {
                                if (files.code[a][0] < files.parsed[a][0]) {
                                    console.log(
                                        "\u001b[33mParsed samples directory is missing file:\u001b[39m " + files.code[a][0]
                                    );
                                    files.code.splice(a, 1);
                                } else {
                                    console.log(
                                        "\u001b[33mCode samples directory is missing file:\u001b[39m " + files.parsed[a][0]
                                    );
                                    files.parsed.splice(a, 1);
                                }
                                len = (files.code.length > files.parsed.length)
                                    ? files.code.length
                                    : files.parsed.length;
                                a   = a - 1;
                                if (a === len - 1) {
                                    console.log("\u001b[32mCore unit testing complete!\u001b[39m");
                                    return next();
                                }
                            }
                            a = a + 1;
                        } while (a < len);
                        console.log("\u001b[32mCore unit testing complete!\u001b[39m");
                        return next();
                    },
                    readDir = function taskrunner_coreunits_readDir(type, lexer, final_lexer) {
                        var dirpath = relative + node.path.sep + "test" + node.path.sep + "samples_" + type + node.path.sep + lexer + node.path.sep;
                        node.fs.readdir(dirpath, function taskrunner_coreunits_readDir_callback(err, list) {
                            var pusher = function taskrunner_coreunits_readDir_callback_pusher(val) {
                                node.fs.readFile(
                                    dirpath + val,
                                    "utf8",
                                    function taskrunner_coreunits_readDir_callback_pusher_readFile(erra, fileData) {
                                        count[type] = count[type] + 1;
                                        if (erra !== null && erra !== undefined) {
                                            errout("Error reading file: " + relative + node.path.sep + "samples_" + type + node.path.sep + lexer + node.path.sep + val);
                                        } else {
                                            files[type].push([lexer + node.path.sep + val, fileData]);
                                        }
                                        if (final_lexer === true && count.code === total.code && count.parsed === total.parsed) {
                                            compare("");
                                        }
                                    }
                                );
                            };
                            total[type] = total[type] + list.length;
                            if (err !== null) {
                                errout("Error reading from directory: " + dirpath);
                            }
                            list.forEach(pusher);
                        });
                    };
                console.log("\u001b[36mCore Unit Testing\u001b[39m");
                lexers.forEach(function taskrunner_coreunits_lexers(value, index, array) {
                    if (index === array.length - 1) {
                        readDir("code", value, true);
                        readDir("parsed", value, true);
                    } else {
                        readDir("code", value, false);
                        readDir("parsed", value, false);
                    }
                });
            },
            framework: function taskrunner_framework() {
                var keys    = [],
                    keylist = "concat,count,data,datanames,lexer,lf,lineNumber,linesSpace,objectSort,options,pop,push,safeSort,spacer,splice,structure",
                    keysort = "";
                console.log("\u001b[36mFramework Testing\u001b[39m");
                
                global.parser({
                    lang  : "html",
                    lexer : "markup",
                    source: ""
                });
                keys = Object.keys(parse);
                keysort = parse.safeSort(keys).join();
                if (keysort !== keylist) {
                    return errout("\u001b[31mParse framework failure:\u001b[39m The \"parse\" object does not match the known list of required properties.");
                }
                console.log(humantime(false) + "\u001b[32mObject parse contains only the standard properties.\u001b[39m");
                
                if (typeof parse.concat !== "function" || parse.concat.name !== "parse_concat") {
                    return errout("\u001b[31mParse framework failure:\u001b[39m parse.concat does not point to the function named parse_concat.");
                }
                console.log(humantime(false) + "\u001b[32mparse.concat points to function parse_concat.\u001b[39m");
                
                if (parse.count !== -1) {
                    return errout("\u001b[31mParse framework failure:\u001b[39m The default for parse.count isn't -1 or type number.");
                }
                console.log(humantime(false) + "\u001b[32mparse.count has default value of -1 and type number.\u001b[39m");
                
                if (
                    typeof parse.data !== "object" || JSON.stringify(parse.data) !== "{\"begin\":[],\"lexer\":[],\"lines\":[],\"presv\":[],\"stack\":[],\"token\":[],\"types\":[]}"
                ) {
                    return errout("\u001b[31mParse framework failure: parse.data does not contain the properties as defined by parse.datanames or their values aren't empty arrays.\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.data contains properties as defined by parse.datanames and each is an empty array.\u001b[39m");
                
                if (JSON.stringify(parse.datanames) !== "[\"begin\",\"lexer\",\"lines\",\"presv\",\"stack\",\"token\",\"types\"]") {
                    return errout("\u001b[31mParse framework failure: parse.datanames does not contain the values: 'begin', 'lexer', 'lines', 'presv', 'stack', 'token', or 'types'.\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.datanames contains only the data field names.\u001b[39m");
                
                if (parse.lexer !== global.lexer) {
                    return errout("\u001b[31mParse framework failure: parse.lexer is not assigned to global.lexer.\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.lexer is assigned to global.lexer.\u001b[39m");
                
                if (parse.lf !== "\n" && parse.lf !== "\r\n") {
                    return errout("\u001b[31mParse framework failure: parse.lf does have a value of \"\\n\" or \"\\r\\n\".\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.lf has a value of \"\\n\" or \"\\r\\n\".\u001b[39m");
                
                if (parse.lineNumber !== 1) {
                    return errout("\u001b[31mParse framework failure: parse.lineNumber does not have a default value of 1 and type number.\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.lineNumber has a default value of 1 and type number.\u001b[39m");
                
                // The correct default for linesSpace is 0
                // but the default is changed by the source of empty string.
                if (parse.linesSpace !== 1) {
                    return errout("\u001b[31mParse framework failure: parse.linesSpace does not have a default value of 0 and type number.\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.linesSpace has a default value of 0 and type number.\u001b[39m");
                
                if (typeof parse.objectSort !== "function" || parse.objectSort.name !== "parse_objectSort") {
                    return errout("\u001b[31mParse framework failure: parse.objectSort is not assigned to named function parse_objectSort\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.objectSort is assigned to named function parse_objectSort\u001b[39m");
                
                if (typeof parse.pop !== "function" || parse.pop.name !== "parse_pop") {
                    return errout("\u001b[31mParse framework failure: parse.pop is not assigned to named function parse_pop\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.pop is assigned to named function parse_pop\u001b[39m");
                
                if (typeof parse.push !== "function" || parse.push.name !== "parse_push") {
                    return errout("\u001b[31mParse framework failure: parse.push is not assigned to named function parse_push\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.push is assigned to named function parse_push\u001b[39m");
                
                if (parse.push.toString().indexOf("parse.structure.push([structure, parse.count])") < 0 || parse.push.toString().indexOf("parse.structure.pop") < 0) {
                    return errout("\u001b[31mParse framework failure: parse.push does not regulate parse.structure\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.push contains references to push and pop parse.structure\u001b[39m");

                if (typeof parse.safeSort !== "function" || parse.safeSort.name !== "parse_safeSort") {
                    return errout("\u001b[31mParse framework failure: parse.safeSort is not assigned to named function parse_safeSort\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.safeSort is assigned to named function parse_safeSort\u001b[39m");
                
                if (typeof parse.spacer !== "function" || parse.spacer.name !== "parse_spacer") {
                    return errout("\u001b[31mParse framework failure: parse.spacer is not assigned to named function parse_spacer\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.spacer is assigned to named function parse_spacer\u001b[39m");
                
                if (typeof parse.splice !== "function" || parse.splice.name !== "parse_splice") {
                    return errout("\u001b[31mParse framework failure: parse.splice is not assigned to named function parse_splice\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.splice is assigned to named function parse_splice\u001b[39m");

                if (Array.isArray(parse.structure) === false || parse.structure.length !== 1 || Array.isArray(parse.structure[0]) === false || parse.structure[0][0] !== "global" || parse.structure[0][1] !== -1) {
                    return errout("\u001b[31mParse framework failure: parse.structure is not assigned the default [[\"global\", -1]]\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.structure is assigned the default of [[\"global\", -1]]\u001b[39m");

                if (parse.structure.pop.name !== "parse_structure_pop") {
                    return errout("\u001b[31mParse framework failure: parse.structure does not have a custom 'pop' method.\u001b[39m ");
                }
                console.log(humantime(false) + "\u001b[32mparse.structure does have a custom 'pop' method.\u001b[39m");
                
                console.log("\u001b[32mFramework testing complete!\u001b[39m");
                return next();
            },
            lint     : function taskrunner_lint() {
                var ignoreDirectory = [
                        ".git",
                        ".vscode",
                        "ace",
                        "biddle",
                        "bin",
                        "coverage",
                        "guide",
                        "ignore",
                        "node_modules",
                        "test/jslint",
                        "test/prettydiff",
                        "test/samples_parsed",
                        "test/samples_code"
                    ],
                    flag            = {
                        files: false,
                        items: false
                    },
                    files           = [],
                    jslint          = require("." + node.path.sep + "jslint" + node.path.sep + "jslint.js"),
                    lintrun         = function taskrunner_lint_lintrun() {
                        var lintit = function taskrunner_lint_lintrun_lintit(val, ind, arr) {
                            var result = {},
                                failed = false,
                                ecount = 0,
                                report = function taskrunner_lint_lintrun_lintit_lintOn_report(warning) {
                                    //start with an exclusion list.  There are some warnings that I don't care about
                                    if (warning === null) {
                                        return;
                                    }
                                    if (warning.message.indexOf("Unexpected dangling '_'") === 0) {
                                        return;
                                    }
                                    if ((/Bad\u0020property\u0020name\u0020'\w+_'\./).test(warning.message) === true) {
                                        return;
                                    }
                                    if (warning.message.indexOf("/*global*/ requires") === 0) {
                                        return;
                                    }
                                    failed = true;
                                    if (ecount === 0) {
                                        console.log("\u001b[31mJSLint errors on\u001b[39m " + val[0]);
                                        console.log("");
                                    }
                                    ecount = ecount + 1;
                                    console.log("On line " + warning.line + " at column: " + warning.column);
                                    console.log(warning.message);
                                    console.log("");
                                };
                            options.source = val[1];
                            options.wrap   = 90000;
                            result         = jslint(prettydiff(options), {"for": true});
                            if (result.ok === true) {
                                console.log(
                                    humantime(false) + "\u001b[32mLint is good for file " + (
                                        ind + 1
                                    ) + ":\u001b[39m " + val[0]
                                );
                                if (ind === arr.length - 1) {
                                    console.log("\u001b[32mLint operation complete!\u001b[39m");
                                    return next();
                                }
                            } else {
                                result
                                    .warnings
                                    .forEach(report);
                                if (failed === true) {
                                    errout("\u001b[31mLint fail\u001b[39m :(");
                                } else {
                                    console.log(
                                        humantime(false) + "\u001b[32mLint is good for file " + (
                                            ind + 1
                                        ) + ":\u001b[39m " + val[0]
                                    );
                                    if (ind === arr.length - 1) {
                                        console.log("\u001b[32mLint operation complete!\u001b[39m");
                                        return next();
                                    }
                                }
                            }
                        };
                        options = {
                            correct     : false,
                            crlf        : false,
                            html        : true,
                            inchar      : " ",
                            insize      : 4,
                            lang        : "javascript",
                            methodchain : "indent",
                            mode        : "beautify",
                            nocaseindent: false,
                            objsort     : "all",
                            preserve    : 2,
                            styleguide  : "jslint",
                            wrap        : 80
                        };
                        files.forEach(lintit);
                    };
                console.log("\u001b[36mBeautifying and Linting\u001b[39m");
                console.log(
                    "** Note that line numbers of error messaging reflects beautified code line."
                );
                console.log("");
                (function taskrunner_lint_getFiles() {
                    var fc       = 0,
                        ft       = 0,
                        total    = 0,
                        count    = 0,
                        idLen    = ignoreDirectory.length,
                        readFile = function taskrunner_lint_getFiles_readFile(filePath) {
                            node.fs.readFile(
                                filePath,
                                "utf8",
                                function taskrunner_lint_getFiles_readFile_callback(err, data) {
                                    if (err !== null && err !== undefined) {
                                        errout(err);
                                    }
                                    fc = fc + 1;
                                    if (ft === fc) {
                                        flag.files = true;
                                    }
                                    files.push([
                                        filePath.slice(filePath.indexOf(node.path.sep + "parse-framework" + node.path.sep) + 17),
                                        data
                                    ]);
                                    if (flag.files === true && flag.items === true) {
                                        lintrun();
                                    }
                                }
                            );
                        },
                        readDir  = function taskrunner_lint_getFiles_readDir(filepath) {
                            node.fs.readdir(
                                filepath,
                                function taskrunner_lint_getFiles_readDir_callback(erra, list) {
                                    var fileEval = function taskrunner_lint_getFiles_readDir_callback_fileEval(val) {
                                        var filename = filepath + node.path.sep + val;
                                        node.fs.stat(
                                            filename,
                                            function taskrunner_lint_getFiles_readDir_callback_fileEval_stat(errb, stat) {
                                                var a         = 0,
                                                    ignoreDir = false,
                                                    dirtest   = filepath.replace(/\\/g, "/") + "/" + val;
                                                if (errb !== null) {
                                                    return errout(errb);
                                                }
                                                count = count + 1;
                                                if (count === total) {
                                                    flag.items = true;
                                                }
                                                if (stat.isFile() === true && (/(\.js)$/).test(val) === true) {
                                                    ft = ft + 1;
                                                    readFile(filename);
                                                }
                                                if (stat.isDirectory() === true) {
                                                    do {
                                                        if (dirtest.indexOf(ignoreDirectory[a]) === dirtest.length - ignoreDirectory[a].length) {
                                                            ignoreDir = true;
                                                            break;
                                                        }
                                                        a = a + 1;
                                                    } while (a < idLen);
                                                    if (ignoreDir === true) {
                                                        if (flag.files === true && flag.items === true) {
                                                            lintrun();
                                                        }
                                                    } else {
                                                        taskrunner_lint_getFiles_readDir(filename);
                                                    }
                                                }
                                            }
                                        );
                                    };
                                    if (erra !== null) {
                                        return errout("Error reading path: " + filepath + "\n" + erra);
                                    }
                                    total = total + list.length;
                                    list.forEach(fileEval);
                                }
                            );
                        };
                    readDir(relative);
                }());
            }
        };

    require(".." + node.path.sep + "parse.js");
    require(".." + node.path.sep + "language.js");
    global.lexer      = {};
    global.parseerror = "";
    parse             = global.parse;

    node.fs.readdir(relative + node.path.sep + "lexers", function taskrunner_lexers(err, files) {
        if (err !== null) {
            console.log(err);
            process.exit(1);
        } else {
            files.forEach(function taskrunner_lexers_each(value) {
                if ((/(\.js)$/).test(value) === true) {
                    require(relative + node.path.sep + "lexers" + node.path.sep + value);
                }
            });
        }
    });

    next = function taskrunner_next() {
        var complete = function taskrunner_complete() {
                console.log("");
                console.log("All tasks complete... Exiting clean!");
                humantime(true);
                process.exit(0);
            },
            phase = order[0];
        if (order.length < 1) {
            return complete();
        }
        if (order.length < orderlen) {
            console.log("________________________________________________________________________");
            console.log("");
        }
        order.splice(0, 1);
        phases[phase]();
    };
    console.log("");
    next();
    return "";
}());