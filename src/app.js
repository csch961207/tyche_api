const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const app = express();

app.set('secret', 'I_LOVE_NODEJS')
const jwt = require("jsonwebtoken");

app.use(express.json());

app.use(express.urlencoded());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('static',{
    extensions: ['index.html']
}))

const models = require('../db/models');

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        if (req.headers.authorization) {
            const token = String(req.headers.authorization).split(" ").pop();
            const userId = jwt.verify(token, app.get("secret"));
            if (userId) {
                req.user = {
                    id: userId.id
                }
            } else {
                next();
            }
        }
        next();
    }
});

const userRouter = require('./user.router');
const projectRouter = require('./project.router');
const templateRouter = require('./template.router');

app.use('/user', userRouter);
app.use('/project', projectRouter);
app.use('/template', templateRouter);

async function vlaid_route(req, res, next) {
    let { projectName, templateName } = req.params;
    let project = await models.project.findOne({
        where: {
            name: projectName
        }
    });
    let template = await models.template.findOne({
        where: {
            name: templateName
        }
    });
    if(!project){
        res.status(422).json({
            message: "项目不存在"
        })
    }
    if(!template){
        res.status(422).json({
            message: "api模板未找到"
        })
    }
    if(!project.isPublic && req.user.id != project.creatorId){
        res.status(422).json({
            message: "项目存在，但未公开仅限创建者"
        })
    }
    if(!template.isPublic && req.user.id != template.creatorId){
        res.status(422).json({
            message: "api模板找到，但未公开仅限创建者"
        })
    }
    if(!project.isActive){
        res.status(422).json({
            message: "项目存在，但已停用"
        })
    }
    if(!template.isActive){
        res.status(422).json({
            message: "api模板找到，但已停用"
        })
    }
    const templateIds = JSON.parse(project.templateIds);
    const findIndex = templateIds.findIndex(n => n === template.id);
    if (findIndex === -1) {
        res.json({
            message: `‘${project.projectName}’项目中未引用‘${template.templateName}’api模板`
        })
    }
    req.route = {
        project,
        template
    }
    next()
}

app.get('/:projectName/:templateName', [vlaid_route], async (req, res, next) => {
    let { id } = req.params;
    let { page, limit } = req.body;
    let offset = (page - 1) * limit;
    if (!req.route.template.type) {
        let response = await models.response.findOne({
            where: {
                projectId: req.route.project.id,
                templateId: req.route.template.id
            }
        });
        res.json({
            response,
            message: '查询成功'
        })
    } else {
        let list = await models.response.findAndCountAll({
            where: {
                projectId: req.route.project.id,
                templateId: req.route.template.id
            },
            // offset,
            // limit
        })
        res.json({
            list,
            message: '列表查询成功'
        })
    }
});

app.get('/:projectName/:templateName/:id', [vlaid_route], async (req, res, next) => {
    let { id } = req.params;
    let response = await models.response.findOne({
        where: {
            id
        }
    });
    res.json({
        response,
        message: '查询成功'
    })
});

app.post('/:projectName/:templateName', [vlaid_route], async (req, res, next) => {
    try {
        let { data, msg, code, isPublic } = req.body;
        let { project, template } = req.route;
        const fileds = JSON.parse(template.fields);
        const newData = {}
        for (const filedKey in fileds) {
            for (const dataKey in data) {
                if (data.hasOwnProperty(filedKey)) {
                    if (filedKey === dataKey) {
                        if (fileds[filedKey] == "string" || fileds[filedKey] == "number" || fileds[filedKey] == "boolean" || fileds[filedKey] == "object" || fileds[filedKey] == "Array" || fileds[filedKey] == "any" || fileds[filedKey] == "function") {
                            if (typeof data[dataKey] == fileds[filedKey]) {
                                newData[filedKey] = data[dataKey];
                            } else {
                                res.json({
                                    message: `‘${dataKey}’该字段为‘${fileds[filedKey]}’`
                                })
                            }
                        } else {
                            if (typeof data[dataKey] == typeof fileds[filedKey]) {
                                newData[filedKey] = data[dataKey];
                            } else {
                                res.json({
                                    message: `‘${dataKey}’该字段为‘${typeof fileds[filedKey]}’`
                                })
                            }
                        }
                    }
                } else {
                    if (fileds[filedKey] == "string" || fileds[filedKey] == "number" || fileds[filedKey] == "boolean" || fileds[filedKey] == "object" || fileds[filedKey] == "Array" || fileds[filedKey] == "any" || fileds[filedKey] == "function") {
                        newData[filedKey] = null
                    } else {
                        res.json({
                            message: `‘${filedKey}’该字段是必填项`
                        })
                    }
                }
            }
        }
        data = JSON.stringify(newData);
        count = await models.response.count({
            where: {
                projectId: project.id,
                templateId: template.id
            }
        })

        if (!template.type && !count) {
            res.json({
                message: "模板类型为实体，不可重复添加"
            })
        } else {
            // 数据持久化到数据库
            let response = await models.response.create({
                data,
                msg,
                code,
                projectId: project.id,
                templateId: template.id,
                creatorId: req.user ? req.user.id : null,
                isPublic
            })
            res.json({
                message: '创建成功',
                response,
            })
        }

    } catch (error) {
        next(error)
    }
});
app.put('/:projectName/:templateName/:id', [vlaid_route], async (req, res, next) => {
    try {
        let { id } = req.params;
        let { data, msg, code, isPublic } = req.body;
        let { project, template } = req.route;
        let response = await models.response.findOne({
            where: {
                id
            }
        })
        if (response) {
            const fileds = JSON.parse(template.fields);
            const newData = {}
            for (const filedKey in fileds) {
                for (const dataKey in data) {
                    if (data.hasOwnProperty(filedKey)) {
                        if (filedKey === dataKey) {
                            if (fileds[filedKey] == "string" || fileds[filedKey] == "number" || fileds[filedKey] == "boolean" || fileds[filedKey] == "object" || fileds[filedKey] == "Array" || fileds[filedKey] == "any" || fileds[filedKey] == "function") {
                                if (typeof data[dataKey] == fileds[filedKey]) {
                                    newData[filedKey] = data[dataKey];
                                } else {
                                    res.json({
                                        message: `‘${dataKey}’该字段为‘${fileds[filedKey]}’`
                                    })
                                }
                            } else {
                                if (typeof data[dataKey] == typeof fileds[filedKey]) {
                                    newData[filedKey] = data[dataKey];
                                } else {
                                    res.json({
                                        message: `‘${dataKey}’该字段为‘${typeof fileds[filedKey]}’`
                                    })
                                }
                            }
                        }
                    } else {
                        if (fileds[filedKey] == "string" || fileds[filedKey] == "number" || fileds[filedKey] == "boolean" || fileds[filedKey] == "object" || fileds[filedKey] == "Array" || fileds[filedKey] == "any" || fileds[filedKey] == "function") {
                            newData[filedKey] = null
                        } else {
                            res.json({
                                message: `‘${filedKey}’该字段是必填项`
                            })
                        }
                    }
                }
            }
            data = JSON.stringify(newData);
            response = await response.update({
                data,
                msg,
                code,
                creatorId: req.user ? req.user.id : null,
                isPublic
            })
            res.json({
                response,
                message: '修改成功'
            })
        } else {
            res.json({
                message: '实体不存在'
            })
        }
    } catch (error) {
        next(error)
    }
});
app.delete('/:projectName/:templateName/:id', [vlaid_route], async (req, res, next) => {
    try {
        let { id } = req.params;
        await models.response.destroy({
            where: {
                id
            }
        })
        res.json({
            message: '删除成功'
        })
    } catch (error) {
        next(error)
    }

});

app.use((err, req, res, next) => {
    if (err) {
        res.status(500).json({
            message: err.message
        })
    }
})

app.listen(3000, () => {
    console.log('服务启动成功')
})