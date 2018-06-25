#!/usr/bin/env node
"use strict";

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _svn = require("./svn");

var _svn2 = _interopRequireDefault(_svn);

var _child_process = require("child_process");

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require("../package.json"),
    version = _require.version;

var dir = process.cwd();
var pgj = require(dir + "/package.json");
var publishSet = pgj.publishSet;
var pVersion = pgj.version;

var svn_path = void 0,
    dist_path = void 0,
    shClearSvn = void 0,
    sh_cp_dist = void 0,
    sh_build = void 0,
    st = void 0,
    file_type = void 0,
    pv = void 0,
    svn = void 0;

var defaultFileType = "*.js *.html *.css";

var addVersion = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(callback) {
        var arr, type;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        arr = pVersion.split(".");
                        type = "patch";

                        if (!(arr[2] === "999")) {
                            _context.next = 7;
                            break;
                        }

                        if (!(arr[1] === "999")) {
                            _context.next = 6;
                            break;
                        }

                        type = "major";
                        return _context.abrupt("return");

                    case 6:
                        type = "minor";

                    case 7:
                        return _context.abrupt("return", new Promise(function (resolve, reject) {
                            (0, _child_process.exec)("npm version " + type, { cwd: dir }, function (err, stdout) {
                                if (err) {
                                    reject("版本修改失败 🚨---" + err);
                                }
                                pv = stdout;
                                console.log(_chalk2.default.green("addVersion ✅"));
                                resolve();
                            });
                        }));

                    case 8:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    function addVersion(_x) {
        return _ref.apply(this, arguments);
    }

    return addVersion;
}();

var runPublish = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        init();
                        _context2.prev = 1;
                        _context2.next = 4;
                        return buildStatic();

                    case 4:
                        _context2.next = 6;
                        return addVersion();

                    case 6:
                        _context2.next = 8;
                        return addDateFile();

                    case 8:
                        _context2.next = 10;
                        return svnUpdate();

                    case 10:
                        _context2.next = 12;
                        return svnDel();

                    case 12:
                        _context2.next = 14;
                        return cpDist();

                    case 14:
                        _context2.next = 16;
                        return svnAdd();

                    case 16:
                        _context2.next = 18;
                        return svnCommit();

                    case 18:
                        _context2.next = 23;
                        break;

                    case 20:
                        _context2.prev = 20;
                        _context2.t0 = _context2["catch"](1);

                        console.log(_context2.t0);
                        //console.log(chalk.red(type), msg);

                    case 23:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[1, 20]]);
    }));

    return function runPublish() {
        return _ref2.apply(this, arguments);
    };
}();
function init() {
    var _getPath = getPath(),
        svnPath = _getPath.svnPath,
        distPath = _getPath.distPath;

    svn_path = _path2.default.resolve(dir, svnPath);
    dist_path = _path2.default.resolve(dir, distPath);
    sh_build = publishSet.builShell;
    if (!svn_path || !dist_path) {
        console.log(_chalk2.default.red("发布失败 🚨"));
        return;
    }
    sh_cp_dist = "cp -rf " + dist_path + "/* " + svn_path + " && cd  " + svn_path;
    if (_commander2.default.ftype) {
        file_type = _commander2.default.ftype.split(",").map(function (val) {
            return "*." + val;
        }).join(" ");
    } else {
        file_type = defaultFileType;
    }

    if (_commander2.default.first) {}
    svn = new _svn2.default({
        cwd: svn_path
    });
}

function svnCommit() {
    return new Promise(function (resolve, reject) {
        var ENV = void 0;
        var message = _commander2.default.message || "defaultMessage";
        ENV = _commander2.default.env || "dev";
        message = message.replace(/\s/g, "--");
        svn.commit(message, function () {
            var et = new Date();
            console.log(_chalk2.default.green(ENV + "\u73AF\u5883\u53D1\u5E03\u6210\u529F \u2705 \n\u5F53\u524D\u9879\u76EE\u7248\u672C\uFF1A" + pv));
            console.log("⏰：" + (et - st) / 1000 + "s");
            resolve && resolve();
        }, function (err) {
            reject("error:svnCommit 🚨---" + err);
        });
    });
}

function addDateFile() {
    return new Promise(function (resolve, reject) {
        (0, _child_process.exec)("mkfile -nv 1kb \u7248\u672C\u53F7-" + pv.replace(/\n/g, "") + ".txt", { cwd: dist_path, encoding: "utf8" }, function (err) {
            if (err) {
                reject("添加发布版本号文件失败 🚨---" + err);
                return;
            }
            console.log(_chalk2.default.green("addDateFile ✅"));
            resolve();
        });
    });
}

function buildStatic() {
    return new Promise(function (reslove, reject) {
        arr = sh_build.split(" ");
        var strem = (0, _child_process.spawn)(arr.splice(0, 1)[0], arr, {
            cwd: dir,
            encoding: "utf8"
        });
        strem.stdout.on("data", function (data) {
            console.log(data + " ");
        });
        strem.stderr.on("data", function (data) {
            var st = process.stderr;
            st.cursorTo(0);
            st.write("\uD83D\uDCE6 " + _chalk2.default.magenta(data) + " ");
            st.clearLine(1);
        });
        strem.stdout.on("end", function () {
            console.log(_chalk2.default.green("buildStatic ✅"));
            reslove();
        });
        strem.stdout.on("error", function (err) {
            reject("error:buildStatic 🚨---" + err);
            process.exit();
        });
    });
}

function svnDel() {
    return new Promise(function (reslove, reject) {
        if (!_commander2.default.delete) {
            reslove();
            return;
        }
        svn.del(file_type, function () {
            console.log(_chalk2.default.green("clearSvn ✅"));
            reslove();
        }, function (err) {
            reject("error:clearSvn 🚨---" + err);
        });
    });
}

function svnUpdate() {
    return new Promise(function (reslove, reject) {
        try {
            svn.update(" ", function () {
                console.log(_chalk2.default.green("svnUpdate ✅"));
                reslove();
            }, function (err) {
                reject("error:svnUpdate 🚨 ---" + err);
            });
        } catch (err) {
            console.log(err);
        }
    });
}

function svnAdd() {
    return new Promise(function (resolve, reject) {
        svn.add(". --force", function () {
            console.log(_chalk2.default.green("addSvn ✅"));
            resolve();
        }, function (err) {
            reject("error:addSvn 🚨---" + err);
        });
    });
}

function getPath() {
    try {
        return require(_path2.default.resolve(dir, publishSet.mySet));
    } catch (e) {
        try {
            return publishSet ? publishSet : new Error("publishSet:" + publishSet);
        } catch (e) {
            console.log(_chalk2.default.red("请检查webpack中publishSet设置是否正确"));
        }
    }
}

function cpDist() {
    return new Promise(function (resolve, reject) {
        (0, _child_process.exec)(sh_cp_dist, { cwd: dir, encoding: "utf8" }, function (err) {
            if (err) {
                reject("添加发布版本号文件失败 🚨---" + err);
                return;
            }
            console.log(_chalk2.default.green("cpDist ✅"));
            resolve();
        });
    });
}

_commander2.default.version("v" + version).usage("[options] <file ...>").option("-m, --message <msg>", "commit message ").option("-e, --env <environment>", "set environment").option("-t, --ftype <file_type>", "publish file type").option("--delete", "before add delete file");
_commander2.default.command("start").description("启动发布打包发布工具").action(function () {
    console.log(_chalk2.default.green("启动发布🚀🚀🚀"));
    st = new Date();
    runPublish();
    //test();
});

_commander2.default.parse(process.argv);