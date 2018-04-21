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
