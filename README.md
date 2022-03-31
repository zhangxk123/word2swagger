## 使用说明
### 1. 拉取代码
`git clone`
### 2. 安装依赖
`npm i`
### 3. 在目录source中创建api.docx文件
文档格式要求:
1. 每个api模块里需要接口地址,入参说明,出参说明三个标题.,标题下紧跟内容.
2. 入参说明和出参说明,通过table表格配置,格式如下:

|描述|字段名|类型|是否必填|
|----|----|----|----|
|入职id|offerId|字符|Y|

> 目前类型有以下定义(字符,整数,浮点,布尔,日期,LIST,二进制)
> 
> LIST是代表当前字段是个list结构体,并且需要把当前结构体按顺序跟在主表后面,方便识别
### 4. 更改word2swagger.config.js配置
### 5. 启动swagger和mock服务
`npm run mock`

## 引用
### swagger V2 定义
https://swagger.io/specification/v2/

### 预览和编辑swagger
https://editor.swagger.io/