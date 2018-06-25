# svn 发布工具

### 安装/更新

-   windows: `npm install pubsg -g`
-   mac: `sudo npm install pubsg -g`

### install

`npm install`

### 配置 package.json

```
"publishSet": {
        "builShell": "npm build", //webpack 打包命令
        "svnPath": "../svn", //svn地址
        "distPath": "./dist/", //打包后资源的地址
        "mySet": "./publishSet.json" //可以自定义配置
    }
```

### 配置 .gitignore

#### 添加 自定义配置文件的  名称 [publishSet.json]

#### npm 设置 (每次发布不添加 tag 标签)

`npm config set git-tag-version false`

### 发布

`pubsg start`

### 参数

-   `--ftype/-t [js,html,png]`:本次需要更新文件类型，默认是 `js,html,css` `-t all`:为[js,png,svg,gif,css,html]
-   `--message/-m [commit message]`:svn 提交的 msg，默认是 `defaultMessage`
-   `--delete`:先删除不需要的文件，再添加文件

### 发布日志

-   2018-05-02 : 添加项目版本控制
-   2018-06-05 : 移除默认删除文件，需要加 --delete
-   2018-06-25 : 1、使用 ES7 async 处理异步 2、babel 打包 3、添加自动发布版本/测试脚本
