const Mock = require('mockjs')
const _ = require('lodash')
const {PlainModel} = require('../template/swagger2.json').definitions
const resDataAlias = require('../word2swagger.config').schema.res.alias.data
const { Random } = Mock
const isTypeKey = (type, text) => text.includes(type) && text.lastIndexOf(type) + type.length === text.length
const typeMap = {
    // string
    "字符": (propCode) => {
        const res = { type: 'string', example: Random.word(10, 50), default: Random.word(1, 10) };
        if (propCode === 'EMPLOYEE_NUMBER') {
            res.example = res.default = 'P6888888'
            return res
        }
        if (propCode.startsWith('IS_')) {
            res.example = res.default = 'Y'
            return res
        }
        if (isTypeKey('NAME', propCode)) {
            res.example = res.default = Random.cname();
            return res
        }
        if (isTypeKey('ADDRESS', propCode)) {
            res.example = res.default = Random.county(true);
            return res
        }
        if (isTypeKey('EMAIL', propCode)) {
            res.example = res.default = Random.email(true);
            return res
        }
        if (isTypeKey('ID', propCode) || isTypeKey('NO', propCode) || isTypeKey('NUMBER', propCode)) {
            res.example = res.default = Random.cword('123456789', 8, 16);
            return res
        }
        return res
    },
    // integer|long
    "整数": {
        type: 'integer',
        format: 'int64', // int32
        example: Random.integer(10),
        default: Random.integer(10)
    },
    // double | float
    '浮点': {
        type: 'number',
        format: 'double', // float
        example: Random.float(10, 1000000000),
        default: Random.float(10, 1000000000)
    },
    // boolean
    "布尔": {
        type: 'boolean',
        example: Random.boolean(),
        default: Random.boolean()
    },
    '日期': {
        type: 'string',
        format: 'date',
        example: Random.date('yyyy-MM-dd'),
        default: Random.date('yyyy-MM-dd')
    },
    '时间': {
        type: 'string',
        format: 'date-time',
        example: Random.date('yyyy-MM-dd HH:mm:ss'),
        default: Random.date('yyyy-MM-dd HH:mm:ss')
    },
    'LIST': (propCode, parentCode) => ({
        type: 'array',
        items: {
            "$ref": `#/definitions/${parentCode}«${propCode}»`
        }
    }),
    'LIST<STRING>': {
        type: 'array',
        items: {
            type: 'string'
        }
    },
    '二进制': {
        type: 'string',
        format: 'binary' // binary || byte
    },
    // 未知
    '': {
        type: 'string'
    }
}
const transformPropType = (type/*string*/, prop, parentCode) => {
    return typeof typeMap[type] === 'function' ? typeMap[type](prop, parentCode) : typeMap[type]
}
/**
 * @description 将字段名中的空格替换为_
 * @param {string} prop
 * @return {*} 
 */
const transformPropName = (prop/*string*/) => {
    if (prop == null) {
        return ''
    }
    const res = prop.replace(/\s+/g, '_')
    return res === 'FINISH' ? 'STATUS' : res

}

/**
 * @description 构建包装后响应数据
 * @param {*} modelCode 数据模型
 * @param {*} definitions swagger的definitions
 */
const generatePlainResult = (modelCode, definitions, { reqAllowBatch = false, resAllowBatch = false }) => {
    const PlainModelClone = _.cloneDeep(PlainModel)
    PlainModelClone.properties[resDataAlias] = resAllowBatch ? {
        "description": "返回结果对象",
        "type": "array",
        "items": {
            "$ref": `#/definitions/${modelCode}`,
        }
    } : {
        "description": "返回结果对象",
        "$ref": `#/definitions/${modelCode}`
    }
    definitions[`PlainResult«${modelCode}»`] = PlainModelClone
}

/**
 * @description 构建swagger的Definitions
 * @param {Array} modelList
 * @return {*} 
 */
const generateDefinitions = (modelList/*[{reqTable,resTable,reqAllowBatch,resAllowBatch}]*/) => {
    const definitions = {
        PlainResult: PlainModel
    }
    const defineModel = (tb/*{trData,code,[children]}*/) => {
        // 排除第一行的表头信息
        const fieldList = tb.trData.slice(1)
        const modelCode = tb.code
        definitions[modelCode] = {
            type: "object",
            properties: {}
        }
        const def = definitions[modelCode]
        const requiredSet = new Set()
        fieldList.forEach(field => {
            // 字段名
            let prop = transformPropName(field[1])
            // 类型和格式
            const types = transformPropType(field[2] && field[2].toUpperCase(), prop, tb.code)
            // 是否必填
            const required = field[3] === 'Y'
            // 描述
            const description = field[0]
            if (required) { requiredSet.add(prop) }
            def['properties'][prop] = {
                description,
                ...types,
            }
        })
        if (requiredSet.size > 0) def['required'] = [...requiredSet]
        tb.children && tb.children.forEach(tbc => {
            defineModel(tbc, tb.code)
        })
        return modelCode

    }
    modelList.forEach(model => {
        // 入参模型定义
        defineModel(model.reqTable)
        // 出参模型定义
        if (model.hasResTable) {
            const resModelCode = defineModel(model.resTable)
            generatePlainResult(resModelCode, definitions, {
                reqAllowBatch: model.reqAllowBatch,
                resAllowBatch: model.resAllowBatch
            })
        }
    })
    return definitions
}

module.exports = generateDefinitions