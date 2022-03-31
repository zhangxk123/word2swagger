const { writeFile } = require('fs/promises');
const cheerio = require('cheerio');
const { logWarning } = require('./log');
const generatePaths = require('./generatePaths')
const generateDefinitions = require('./generateDefinitions');

/**
 * @description 从html中提取有效数据:paths和definitions
 * @param {string} htmlRaw
 * @return {object} 
 */
const html2json = (htmlRaw, { baseUrl, req, res }, { generateTagsByTitle }) => {
    const reqAllowBatch = req.allowBatch, resAllowBatch = res.allowBatch;
    const $ = cheerio.load(htmlRaw);
    const json = { paths: {}, definitions: {} }
    // 已定义接口地址的p元素
    const apiList = $('p').filter((i, el) => $(el).text().trim().startsWith(baseUrl))
    // 根据path元素向前查找最近的title
    const getTitleByPathElement = (pathEl) =>
        $(pathEl).prevAll()
            .filter((i, el) => /^\d/.test($(el).text().trim()))
            .first().text().trim()
    let prevTitle = ''
    const getPathList = (el, { hasResTable = false, reqAllowBatch = false, resAllowBatch = false }) => {
        const path = $(el).text().trim().replace(baseUrl, '')
        // 判断就近的描述p元素是第几个
        let title = getTitleByPathElement(el)
        if (title === prevTitle) {
            console.log(logWarning(`[warning!] ${title},此接口的下一个接口标题有列表样式, 请修改word`))
        } else {
            prevTitle = title
        }
        // 取path中除了baseUrl以外的字符串,并将/替换_
        const code = path.substring(1).replace(/\//g, '_')
        pathList.push({
            path, title, code, hasResTable, reqAllowBatch, resAllowBatch
        })
    }
    const mapChildrenTable = (el, key, dataRef, pathRef, childrenTableList) => {
        const childrenTable = el.nextAll('table').slice(0, childrenTableList.length)
        // 子表遍历
        childrenTable.each((i, cTable) => {
            const trData = []
            const trList = $(cTable).find('tr')
            trList.each((j, tr) => {
                const tds = $(tr).find('td')
                const tdData = []
                tds.each((k, td) => {
                    tdData.push($(td).find('p').text().trim())
                })
                trData.push(tdData)
            })
            childrenTableList[i].trData = trData
        })
        childrenTableList.length && (dataRef[key].children = childrenTableList)
    }
    const getTableData = (el, key, dataRef, pathRef) => {
        const code = key === 'reqTable' ? pathRef.code : `Res_${pathRef.code}`
        const childrenTableList = []
        const trData = []
        const trList = $(el).find('tr')
        trList.each((j, tr) => {
            const tds = $(tr).find('td')
            const tdData = []
            tds.each((k, td) => tdData.push($(td).find('p').text().trim()))
            trData.push(tdData)
            const childCode = tds.eq(1).text().trim()
            const type = tds.eq(2).text().trim()
            if (type.toUpperCase() === 'LIST') {
                childrenTableList.push({
                    code: `${code}«${childCode}»`,
                    trData: []
                })
            }
        })
        dataRef[key] = { trData, code }
        // 特殊情况 关联子表 暂时只支持req
        key === 'reqTable' && mapChildrenTable(el, 'reqTable', dataRef, pathRef, childrenTableList)
    }
    // 遍历数据
    const pathList = []
    const tableList = []
    apiList.each((i, el) => {
        const reqTableElement = $(el).nextAll()
            .filter((i, el) => $(el).text().includes(req.keywords))
            .first().next()
        // 判断出参是否有字段定义
        const resTableElement = $(el).nextAll()
            .filter((i, el) => $(el).text().includes(res.keywords))
            .first().next()
        // 是否有出参定义
        const hasResTable = resTableElement.is('table')
        // 获取path定义
        getPathList(el, { hasResTable, reqAllowBatch, resAllowBatch })
        // 初始化tableItem
        tableList[i] = { reqTable: null,  resTable: null, reqAllowBatch, resAllowBatch, hasResTable }
        // 入参字段表
        getTableData(reqTableElement, 'reqTable', tableList[i], pathList[i])
        // 出参字段表
        hasResTable && getTableData(resTableElement, 'resTable', tableList[i], pathList[i])

    })
    json.paths = generatePaths(pathList, generateTagsByTitle)
    // writeFile('./source/auto.tableList.json', JSON.stringify(tableList, null, 2))
    json.definitions = generateDefinitions(tableList)
    return json
}
/**
 * @description 写入目标json文件
 * @param {*} {
 *     fileName = './target.json',
 *     data
 * }
 */
const writeTargetJson = async ({
    fileName = './target/swagger.json',
    data
}) => {
    writeFile(fileName, JSON.stringify(data, null, 2))
}

module.exports = {
    html2json,
    writeTargetJson
}