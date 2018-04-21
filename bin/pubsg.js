#!/usr/bin/env node

const program = require("commander");
const exce = require("child_process").exec;
const chalk = require("chalk");
const path = require("path");
const dir = process.cwd();
const { publishSet, builShell } = require(dir + "/package.json");
const { version } = require("../package.json");

let SVNPATH, DISTPATH, SH_CLEARSVN, SH_ADDSVN, SH_BUILD, st;

let filetype = ["js", "html", "css"];

const execOpt = {
    cwd: dir,
    maxBuffer: 2000 * 1024
};

function runPublish() {
    const { svnPath, distPath } = getPath();
    SVNPATH = path.resolve(dir, svnPath);
    DISTPATH = path.resolve(dir, distPath);
    SH_CLEARSVN = `cd ${SVNPATH} && svn up`;
    SH_ADDSVN = `cp -rf ${DISTPATH}/* ${SVNPATH} && cd  ${SVNPATH}`;
    SH_BUILD = publishSet.builShell;
    if (!SVNPATH || !DISTPATH) {
        console.log(chalk.red("发布失败 ⛔"));
        return;
    }
    checkFileType();
    buildStatic();
}

function svnCommit() {
    let ENV;
    const message = program.message || "defaultMessage";
    ENV = program.env || "dev";
    if (!message) {
        console.log(chalk.red("提交必须输入 message"));
        return;
    }
    let shell = `cd ${SVNPATH} && svn commit -m `;
    if (ENV == "pro") {
        shell = "cd ../trunk && svn commit -m  ";
    }

    let t = getTip("svnCommit");

    exce(shell + message, (err, stdout, stderr) => {
        clearInterval(t);
        const et = new Date();
        if (err) {
            console.log(`⛔ ${chalk.red(err)}`);
            return;
        }
        console.log(chalk.cyan(stdout));
        console.log(chalk.green(`${ENV}环境发布成功！`) + "✅");
        console.log("⏰：" + (et - st) / 1000 + "s");
    });
}

function buildStatic(cb) {
    let t = getTip("buildStatic");
    exce(SH_BUILD, execOpt, err => {
        clearInterval(t);
        if (err) {
            console.log(err, "error:buildStatic ⛔");
            return;
        }
        console.log(chalk.green("success:buildStatic ✅"));
        clearSvn();
    });
}

function clearSvn() {
    let t = getTip("clearSvn");
    exce(SH_CLEARSVN, execOpt, err => {
        clearInterval(t);
        if (err) {
            console.log(err, "error:clearSvn ⛔");
            return;
        }
        console.log(chalk.green("success:clearSvn ✅"));
        addSvn();
    });
}

function addSvn() {
    let t = getTip("addSvn");
    exce(SH_ADDSVN, execOpt, err => {
        clearInterval(t);
        if (err) {
            console.log(err, "error:addSvn ⛔");
            return;
        }
        console.log(chalk.green("success:addSvn ✅"));
        svnCommit();
    });
}

function checkFileType() {
    if (program.ftype) {
        try {
            filetype = program.ftype.split(",");
        } catch (e) {
            console.log(chalk.red(`ftype:错误！⛔ info:${e} `));
            return;
        }
    }
    filetype.map(val => {
        SH_CLEARSVN += ` && svn delete *.${val}  --force`;
        SH_ADDSVN += ` && svn add *.${val}  --force`;
    });
}

function getTip(step) {
    var t = setInterval(function() {
        console.log(chalk.blue(`正在${step},请稍等...⌛`));
    }, 1000);
    return t;
}

function getPath() {
    try {
        return require(`${publishSet.mySet}`);
    } catch (e) {
        try {
            return publishSet
                ? publishSet
                : new Error(`publishSet:${publishSet}`);
        } catch (e) {
            console.log(chalk.red("请检查webpack中publishSet设置是否正确"));
        }
    }
}

program
    .version("v" + version)
    .usage("[options] <file ...>")
    .option("-m, --message <msg>", "commit message ")
    .option("-e, --env <environment>", "set environment")
    .option("-t, --ftype <filetype>", "publish file type");
program
    .command("start")
    .description("启动发布")
    .action(() => {
        console.log(chalk.green("启动发布"));
        st = new Date();
        runPublish();
    });
program.parse(process.argv);
