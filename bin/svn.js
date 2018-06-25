"use strict";

var spawn = require("child_process").spawn;

function Svn(option) {
    var defaultOpt = {
        shell: true,
        ecoding: "utf8"
    };
    this.option = Object.assign(option, defaultOpt);
}

Svn.prototype.cmd = function (argArr, success, error) {
    var proc = void 0;
    try {
        proc = spawn("svn", argArr, this.option);
    } catch (e) {
        error(e);
    }
    proc.stdout.setEncoding("utf8");
    proc.stderr.setEncoding("utf8");
    proc.stdout.on("data", function (data) {
        console.log(data);
    });
    proc.stdout.on("end", function () {
        success && success();
    });
    proc.stderr.on("data", function (err) {
        console.log(err);
        error && error(err);
        process.exit();
    });
};

Svn.prototype.add = function (str, success, error) {
    var opt = ["add"];
    opt = opt.concat(str.split(" "));
    this.cmd(opt, success, error);
};

Svn.prototype.del = function (str, success, error) {
    var opt = ["delete"];
    opt = opt.concat(str.split(" "));
    this.cmd(opt, success, error);
};

Svn.prototype.commit = function (str, success, error) {
    var opt = ["commit", "-m"];
    opt = opt.concat(str.split(" "));
    this.cmd(opt, success, error);
};

Svn.prototype.update = function (str, success, error) {
    var opt = ["update"];
    opt = opt.concat(str.split(" "));
    this.cmd(opt, success, error);
};

module.exports = Svn;