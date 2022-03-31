/**
 * @description 将pathList转换成swagger的paths
 * @param {Array} pathList
 * @param {Function} generateTagsByTitle
 * @return {Object} 
 */
const generatePaths = (pathList/*[{title,path,code,hasResTable,reqAllowBatch,resAllowBatch}]*/, generateTagsByTitle) => {
    const paths = {}
    pathList.forEach(x => {
        paths[x.path] = {
            'post': {
                "tags": generateTagsByTitle(x.title),
                "summary": x.title,
                "description": x.title,
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "parameters": [
                    {
                        "in": "body",
                        "name": "req",
                        "description": "入参",
                        "required": true,
                        "schema": x.reqAllowBatch ? {
                            "type": "array",
                            "items": {
                                "$ref": `#/definitions/${x.code}`
                            }
                        } : {
                            "$ref": `#/definitions/${x.code}`
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": x.hasResTable ? `#/definitions/PlainResult«Res_${x.code}»` : `#/definitions/PlainResult`
                        }
                    },
                    "401": {
                        "description": "Unauthorized"
                    },
                    "403": {
                        "description": "Forbidden"
                    },
                    "404": {
                        "description": "Not Found"
                    },
                }

            }
        }
    })
    return paths
}

module.exports = generatePaths