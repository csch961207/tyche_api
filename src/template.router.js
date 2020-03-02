const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(express.json());

router.use(express.urlencoded());

router.use(bodyParser.urlencoded({ extended: true }));

const models = require('../db/models');

function vlaid_login(req, res, next) {
    let { id } = req.user;
    if (!req.user || !id) {
        res.status(401).json({
            message: '请登录'
        })
    } else {
        next()
    }
}

// 查询列表
router.get('/list/:page', [vlaid_login], async (req, res, next) => {
    let { page } = req.params;
    let limit = 10;
    let offset = (page - 1) * limit;
    let list = await models.template.findAndCountAll({
        where: {
            creatorId: req.user.id,
        },
        offset,
        limit
    })
    res.json({
        data: {
            list,
        },
        message: '列表查询成功'
    })
})

// 创建一个template
router.post('/create', [vlaid_login], async (req, res, next) => {
    try {
        let { templateName, name, isPublic, isActive, desc, type, fields } = req.body;
        if (typeof fields !== "string") {
            fields = JSON.stringify(fields)
        }
        // 数据持久化到数据库
        let template = await models.template.create({
            templateName,
            name,
            creatorId: req.user.id,
            isPublic,
            isActive,
            desc,
            type,
            fields
        })
        res.json({
            data: {
                template,
            },
            message: '创建成功'
        })
    } catch (error) {
        next(error)
    }
})

// 编辑一个template
router.post('/update', [vlaid_login], async (req, res, next) => {
    try {
        let { id, templateName, name, isPublic, isActive, desc, type, fields } = req.body;
        let template = await models.template.findOne({
            where: {
                id
            }
        })
        if (typeof fields !== "string") {
            fields = JSON.stringify(fields)
        }
        if (template) {
            // 执行更新
            template = await template.update({
                templateName,
                name,
                isPublic,
                isActive,
                desc,
                type,
                fields
            })
            res.json({
                data: {
                    template,
                },
                message: '更新成功'
            })
        }
        res.json({
            message: '实体不存在'
        })
    } catch (error) {
        next(error)
    }

})

// 删除一个template
router.post('/delete', [vlaid_login], async (req, res, next) => {
    try {
        let { id } = req.body;
        let template = await models.template.findOne({
            where: {
                id
            }
        })
        if (template.isPublic) {
            res.json({
                message: '此模板是公开的，不可删除'
            })
        } else {
            await models.template.destroy({
                where: {
                    id
                }
            })
            res.json({
                message: '删除成功'
            })
        }

    } catch (error) {
        next(error)
    }
})

module.exports = router;