const spawn = require("child_process").spawn;

function Svn(option) {
    const defaultOpt = {
        shell: true,
        ecoding: "utf8"
    };
    this.option = Object.assign(option, defaultOpt);
}

Svn.prototype.cmd = function(argArr, success, error) {
    let proc;
    try {
        proc = spawn("svn", argArr, this.option);
    } catch (e) {
        error(e);
    }
    proc.stdout.setEncoding("utf8");
    proc.stderr.setEncoding("utf8");
    proc.stdout.on("data", data => {
        console.log(data);
    });
    proc.stdout.on("end", () => {
        success && success();
    });
    proc.stderr.on("data", err => {
        console.log(err);
        error && error(err);
        process.exit();
    });
};

Svn.prototype.add = function(str, success, error) {
    let opt = ["add"];
    opt = opt.concat(str.split(" "));
    this.cmd(opt, success, error);
};

Svn.prototype.del = function(str, success, error) {
    let opt = ["delete"];
    opt = opt.concat(str.split(" "));
    this.cmd(opt, success, error);
};

Svn.prototype.commit = function(str, success, error) {
    let opt = ["commit", "-m"];
    opt = opt.concat(str.split(" "));
    this.cmd(opt, success, error);
};

Svn.prototype.update = function(str, success, error) {
    let opt = ["update"];
    opt = opt.concat(str.split(" "));
    this.cmd(opt, success, error);
};

module.exports = Svn;
