const { readFile, writeFile } = require('fs/promises')
const { html2json, writeTargetJson } = require('./utils/index')
const mammoth = require("mammoth")
const _ = require("lodash")
const { logSuccess } = require('./utils/log')
const config = require('./word2swagger.config')

main(config)

async function main({
    sourcePath,
    swaggerVersion,
    schema
}) {
    console.time(logSuccess(`解析docx`))
    let { value: htmlRaw } = await mammoth.convertToHtml({ path: sourcePath })
    console.timeEnd(logSuccess(`解析docx`))
    // 替换不标准的标识
    htmlRaw = htmlRaw.replace(/入参模型|入参字段/g, schema.req.keywords).replace(/出参模型|出参字段|模型字段/g, schema.res.keywords)
    // 将解析后的html文件落到本地
    writeFile(`./source/auto.html`, htmlRaw)
    // 提取有效json
    console.time(logSuccess(`提取有效json`))
    // 自主定义tag
    const tempData = require(`./template/swagger${swaggerVersion}.json`)
    const { tags } = tempData
    const jsonData = html2json(htmlRaw, schema, {
        // swagger的tag分配规则
        generateTagsByTitle(title/*当前path的序号*/) {
            const getNo = text => (text.match(/\d|\./g) || []).join('')
            const titleNo = getNo(title)
            return tags.map(tag => tag.name).filter(tagName => titleNo.startsWith(getNo(tagName)))
        },
    }
    )
    console.timeEnd(logSuccess(`提取有效json`))
    const result = _.merge({}, tempData, jsonData)
    console.time(logSuccess(`写入swagger.json文件`))
    const filePath = 'target/swagger.json';
    await writeTargetJson({ data: result, fileName: filePath })
    console.timeEnd(logSuccess(`写入swagger.json文件`))
    console.log(logSuccess(`生成swagger文件成功!请打开${filePath}查看`))
}