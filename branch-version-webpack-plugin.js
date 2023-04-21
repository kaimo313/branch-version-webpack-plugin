// 同步子进程
const execSync = require("child_process").execSync;

// 创建分支版本类
class BranchVersionWebpackPlugin {
    constructor(options) {
        // options 为调用时传的参数
        console.log("凯小默 BranchVersionWebpackPlugin 被调用！", options);
    }
    /**
     * compiler: webpack 的实例 所有的内容
     * compilation: 本次打包的内容
     * https://v4.webpack.js.org/api/compiler-hooks/#emit
     * emit：
     *    AsyncSeriesHook
     *    Executed right before emitting assets to output dir.
     *    Callback Parameters: compilation
     * */ 
    // 时间格式生成
    dateFormat(date) {
        let y = date.getFullYear();
        let M = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
        let d = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
        let h = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
        let m = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        let s = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
        return `${y}-${M}-${d} ${h}:${m}:${s}`;
    }

    /**
     * 利用同步子进程获取分支信息
     * 获取 git 指定信息方法（https://git-scm.com/docs/pretty-formats）
     * git name-rev --name-only HEAD 这个命令会在终端输出你当前的版本或标签信息。
     *  - 当前分支名：master
     * git show -s --format=%d 这个命令会在终端输出你当前的 ref名称。
     *  - 当前分支名：(HEAD -> master, origin/master, origin/HEAD)
     * */ 
    getBranchVersionInfo() {
        // 当前分支名
        let vName = execSync("git name-rev --name-only HEAD").toString().trim();
        // 提交的commit hash
        let commitHash = execSync("git show -s --format=%H").toString().trim();
        // 提交人姓名
        let name = execSync("git show -s --format=%cn").toString().trim();
        // 提交日期
        let date = this.dateFormat(new Date(execSync("git show -s --format=%cd").toString()));
        // 提交描述
        let message = execSync("git show -s --format=%s").toString().trim();
        return `
            当前分支名：${vName}\n
            提交的hash：${commitHash}\n
            提交人姓名：${name}\n
            提交日期：${date}\n
            提交描述：${message}
        `;
    }

    apply(compiler) {
        // 异步方法，生成打包目录时：生成文件
        compiler.hooks.emit.tapAsync("BranchVersionWebpackPlugin", (compilation, cb) => {
            // 添加分支版本信息文件
            let branchVersionInfo = this.getBranchVersionInfo();
            compilation.assets["version.txt"] = {
                source: () => branchVersionInfo,
                size: () => branchVersionInfo.length
            };
            cb();
        });
    }
}

module.exports = BranchVersionWebpackPlugin;
