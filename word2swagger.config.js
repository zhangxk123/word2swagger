module.exports = {
    // 源文件地址
    sourcePath: "./source/api.docx",
    // swagger版本,目前只支持2.0
    swaggerVersion: '2',
    // 解析api的关键词
    schema: {
        // 公共path 根据这个识别功能模块
        baseUrl: '/api/v1',
        req: {
            // 入参识别标识
            keywords: '入参说明',
            // 是否数组形式
            allowBatch: true,
        },
        res: {
            // 入参识别标识
            keywords: '出参说明',
            // 是否数组形式
            allowBatch: false,
            // 响应体字段别名
            alias: {
                // 此配置效果:{code,DATA,msg}
                'data': 'DATA',
                // 其他的在template/swagger2.json配置公共响应体,修改definitions/PlainModel即可
            }
        }
    }
}