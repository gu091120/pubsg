# svn 发布工具

### 安装

*   windows: `npm install pubsg -g`
*   mac: `sudo npm install pubsg -g`

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

### 发布

`pubsg start`

### 参数

*   `--ftype/-t [js,html,png]`:本次需要更新文件类型，默认是 `js,html,css`
*   `--message/-m [commit message]`:svn 提交的 msg，默认是 `defaultMessage` 注意：不要有空格
