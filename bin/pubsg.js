#!/usr/bin/env node
"use strict";

let runPublish = (() => {
    var _ref = _asyncToGenerator(function* () {
        init();
        try {
            yield buildStatic();
            yield addVersion();
            yield addDateFile();
            yield svnUpdate();
            yield svnDel();
            yield cpDist();
            yield svnAdd();
            yield svnCommit();
        } catch (e) {
            console.log(e);
            //console.log(chalk.red(type), msg);
        }
    });

    return function runPublish() {
        return _ref.apply(this, arguments);
    };
})();

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

const { version } = require(_path2.default.join(__dirname + "./../package.json"));
const dir = process.cwd();

let svn_path, dist_path, shClearSvn, sh_cp_dist, sh_build, st, file_type, pv, pgj, publishSet, pVersion, svn;

const defaultFileType = `*.js *.html *.css`;

function addVersion(callback) {
    let arr = pVersion.split(".");
    let type = "patch";
    if (arr[2] === "999") {
        if (arr[1] === "999") {
            type = "major";
            return;
        }
        type = "minor";
    }
    return new Promise((resolve, reject) => {
        (0, _child_process.exec)(`npm version ${type}`, { cwd: dir }, (err, stdout) => {
            if (err) {
                reject("版本修改失败 🚨---" + err);
            }
            pv = stdout;
            console.log(_chalk2.default.green("addVersion ✅"));
            resolve();
        });
    });
}

function init() {
    pgj = require(_path2.default.join(dir, "/package.json"));
    publishSet = pgj.publishSet;
    pVersion = pgj.version;
    let { svnPath, distPath } = getPath();

    svn_path = _path2.default.join(dir, svnPath);
    dist_path = _path2.default.join(dir, distPath);
    sh_build = publishSet.builShell;
    if (!svn_path || !dist_path) {
        console.log(_chalk2.default.red("发布失败 🚨"));
        return;
    }
    sh_cp_dist = `cp -rf ${dist_path}/* ${svn_path} && cd  ${svn_path}`;
    if (_commander2.default.ftype) {
        file_type = _commander2.default.ftype.split(",").map(val => {
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
    return new Promise((resolve, reject) => {
        let ENV;
        let message = _commander2.default.message || "defaultMessage";
        ENV = _commander2.default.env || "dev";
        message = message.replace(/\s/g, "--");
        svn.commit(message, () => {
            const et = new Date();
            console.log(_chalk2.default.green(`${ENV}环境发布成功 ✅ \n当前项目版本：${pv}`));
            console.log("⏰：" + (et - st) / 1000 + "s");
            resolve && resolve();
        }, err => {
            reject("error:svnCommit 🚨---" + err);
        });
    });
}

function addDateFile() {
    return new Promise((resolve, reject) => {
        (0, _child_process.exec)(`mkfile -nv 1kb 版本号-${pv.replace(/\n/g, "")}.txt`, { cwd: dist_path, encoding: "utf8" }, err => {
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
    return new Promise((reslove, reject) => {
        let arr = sh_build.split(" ");
        const strem = (0, _child_process.spawn)(arr.splice(0, 1)[0], arr, {
            cwd: dir,
            encoding: "utf8"
        });
        strem.stdout.on("data", data => {
            console.log(data + " ");
        });
        strem.stderr.on("data", data => {
            const st = process.stderr;
            st.cursorTo(0);
            st.write(`${_chalk2.default.magenta(data)} `);
            st.clearLine(1);
        });
        strem.stdout.on("end", () => {
            console.log(_chalk2.default.green("buildStatic ✅"));
            reslove();
        });
        strem.stdout.on("error", err => {
            reject("error:buildStatic 🚨---" + err);
            process.exit();
        });
    });
}

function svnDel() {
    return new Promise((reslove, reject) => {
        if (!_commander2.default.delete) {
            reslove();
            return;
        }
        svn.del(file_type, () => {
            console.log(_chalk2.default.green("clearSvn ✅"));
            reslove();
        }, err => {
            reject("error:clearSvn 🚨---" + err);
        });
    });
}

function svnUpdate() {
    return new Promise((reslove, reject) => {
        try {
            svn.update(" ", () => {
                console.log(_chalk2.default.green("svnUpdate ✅"));
                reslove();
            }, err => {
                reject("error:svnUpdate 🚨 ---" + err);
            });
        } catch (err) {
            console.log(err);
        }
    });
}

function svnAdd() {
    return new Promise((resolve, reject) => {
        svn.add(`. --force`, () => {
            console.log(_chalk2.default.green("addSvn ✅"));
            resolve();
        }, err => {
            reject("error:addSvn 🚨---" + err);
        });
    });
}

function getPath() {
    try {
        return require(_path2.default.join(dir, publishSet.mySet));
    } catch (e) {
        try {
            return publishSet ? publishSet : new Error(`publishSet:${publishSet}`);
        } catch (e) {
            console.log(_chalk2.default.red("请检查webpack中publishSet设置是否正确"));
        }
    }
}

function cpDist() {
    return new Promise((resolve, reject) => {
        (0, _child_process.exec)(sh_cp_dist, { cwd: dir, encoding: "utf8" }, err => {
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
_commander2.default.command("start").description("启动发布打包发布工具").action(() => {
    console.log(_chalk2.default.green("启动发布🚀🚀🚀"));
    st = new Date();
    runPublish();
    //test();
});

_commander2.default.parse(process.argv);