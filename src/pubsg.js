#!/usr/bin/env node
import program from "commander";
import Svn from "./svn";
import { exec, spawn } from "child_process";
import chalk from "chalk";
import path from "path";
const { version } = require(path.join(__dirname + "./../package.json"));
const dir = process.cwd();

let svn_path,
    dist_path,
    shClearSvn,
    sh_cp_dist,
    sh_build,
    st,
    file_type,
    pv,
    pgj,
    publishSet,
    pVersion,
    svn;

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
        exec(`npm version ${type}`, { cwd: dir }, (err, stdout) => {
            if (err) {
                reject("版本修改失败 🚨---" + err);
            }
            pv = stdout;
            console.log(chalk.green("addVersion ✅"));
            resolve();
        });
    });
}

async function runPublish() {
    init();
    try {
        await buildStatic();
        await addVersion();
        await addDateFile();
        await svnUpdate();
        await svnDel();
        await cpDist();
        await svnAdd();
        await svnCommit();
    } catch (e) {
        console.log(e);
        //console.log(chalk.red(type), msg);
    }
}
function init() {
    pgj = require(path.join(dir, "/package.json"));
    publishSet = pgj.publishSet;
    pVersion = pgj.version;
    let { svnPath, distPath } = getPath();

    svn_path = path.join(dir, svnPath);
    dist_path = path.join(dir, distPath);
    sh_build = publishSet.builShell;
    if (!svn_path || !dist_path) {
        console.log(chalk.red("发布失败 🚨"));
        return;
    }
    sh_cp_dist = `cp -rf ${dist_path}/* ${svn_path} && cd  ${svn_path}`;
    if (program.ftype) {
        file_type = program.ftype
            .split(",")
            .map(val => {
                return "*." + val;
            })
            .join(" ");
    } else {
        file_type = defaultFileType;
    }

    if (program.first) {
    }
    svn = new Svn({
        cwd: svn_path
    });
}

function svnCommit() {
    return new Promise((resolve, reject) => {
        let ENV;
        let message = program.message || "defaultMessage";
        ENV = program.env || "dev";
        message = message.replace(/\s/g, "--");
        svn.commit(
            message,
            () => {
                const et = new Date();
                console.log(
                    chalk.green(`${ENV}环境发布成功 ✅ \n当前项目版本：${pv}`)
                );
                console.log("⏰：" + (et - st) / 1000 + "s");
                resolve && resolve();
            },
            err => {
                reject("error:svnCommit 🚨---" + err);
            }
        );
    });
}

function addDateFile() {
    return new Promise((resolve, reject) => {
        exec(
            `mkfile -nv 1kb 版本号-${pv.replace(/\n/g, "")}.txt`,
            { cwd: dist_path, encoding: "utf8" },
            err => {
                if (err) {
                    reject("添加发布版本号文件失败 🚨---" + err);
                    return;
                }
                console.log(chalk.green("addDateFile ✅"));
                resolve();
            }
        );
    });
}

function buildStatic() {
    return new Promise((reslove, reject) => {
        let arr = sh_build.split(" ");
        const strem = spawn(arr.splice(0, 1)[0], arr, {
            cwd: dir,
            encoding: "utf8"
        });
        strem.stdout.on("data", data => {
            console.log(data + " ");
        });
        strem.stderr.on("data", data => {
            const st = process.stderr;
            st.cursorTo(0);
            st.write(`${chalk.magenta(data)} `);
            st.clearLine(1);
        });
        strem.stdout.on("end", () => {
            console.log(chalk.green("buildStatic ✅"));
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
        if (!program.delete) {
            reslove();
            return;
        }
        svn.del(
            file_type,
            () => {
                console.log(chalk.green("clearSvn ✅"));
                reslove();
            },
            err => {
                reject("error:clearSvn 🚨---" + err);
            }
        );
    });
}

function svnUpdate() {
    return new Promise((reslove, reject) => {
        try {
            svn.update(
                " ",
                () => {
                    console.log(chalk.green("svnUpdate ✅"));
                    reslove();
                },
                err => {
                    reject("error:svnUpdate 🚨 ---" + err);
                }
            );
        } catch (err) {
            console.log(err);
        }
    });
}

function svnAdd() {
    return new Promise((resolve, reject) => {
        svn.add(
            `. --force`,
            () => {
                console.log(chalk.green("addSvn ✅"));
                resolve();
            },
            err => {
                reject("error:addSvn 🚨---" + err);
            }
        );
    });
}

function getPath() {
    try {
        return require(path.join(dir, publishSet.mySet));
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

function cpDist() {
    return new Promise((resolve, reject) => {
        exec(sh_cp_dist, { cwd: dir, encoding: "utf8" }, err => {
            if (err) {
                reject("添加发布版本号文件失败 🚨---" + err);
                return;
            }
            console.log(chalk.green("cpDist ✅"));
            resolve();
        });
    });
}

program
    .version("v" + version)
    .usage("[options] <file ...>")
    .option("-m, --message <msg>", "commit message ")
    .option("-e, --env <environment>", "set environment")
    .option("-t, --ftype <file_type>", "publish file type")
    .option("--delete", "before add delete file");
program
    .command("start")
    .description("启动发布打包发布工具")
    .action(() => {
        console.log(chalk.green("启动发布🚀🚀🚀"));
        st = new Date();
        runPublish();
        //test();
    });

program.parse(process.argv);
