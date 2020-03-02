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

// 查询项目列表
router.get('/list/:page', [vlaid_login], async (req, res, next) => {
    try {
        let { page } = req.params;
        let limit = 10;
        let offset = (page - 1) * limit;
        let list = await models.project.findAndCountAll({
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
    } catch (error) {
        next(error)
    }
})

// 创建一个project
router.post('/create', [vlaid_login], async (req, res, next) => {
    try {
        let { projectName, name, isPublic, isActive, desc, templateIds } = req.body;
        if (typeof templateIds !== "string") {
            templateIds = JSON.stringify(templateIds)
        }
        // 数据持久化到数据库
        let project = await models.project.create({
            projectName,
            name,
            creatorId: req.user.id,
            isPublic,
            isActive,
            desc,
            templateIds
        })
        res.json({
            data: {
                project,
            },
            message: '创建成功'
        })
    } catch (error) {
        next(error)
    }
})

// 编辑一个project
router.post('/update', [vlaid_login], async (req, res, next) => {
    try {
        let { id, projectName, name, isPublic, isActive, desc, templateIds } = req.body;
        let project = await models.project.findOne({
            where: {
                id
            }
        })
        if (typeof templateIds !== "string") {
            templateIds = JSON.stringify(templateIds)
        }
        if (project) {
            // 执行更新
            project = await project.update({
                projectName,
                name,
                isPublic,
                isActive,
                desc,
                templateIds
            })
            res.json({
                data: {
                    project,
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

// 删除一个project
router.post('/delete', [vlaid_login], async (req, res, next) => {
    try {
        let { id } = req.body;
        let project = await models.project.findOne({
            where: {
                id
            }
        })
        if (project.isPublic) {
            res.json({
                message: '此项目为公开项目，不可删除。'
            })
        } else {
            await models.project.destroy({
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