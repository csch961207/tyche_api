const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(express.json());

router.use(express.urlencoded());

router.use(bodyParser.urlencoded({ extended: true }));

const jwt = require("jsonwebtoken");
const models = require('../db/models');

router.post('/register', async (req, res, next) => {
    try {
        let { userName, password, email } = req.body;
        // 校验用户名是否存在
        let user = await models.user.findOne({
            where: {
                userName
            }
        })
        if (user) {
            res.json({
                message: '该用户名已存在'
            })
        } else {
            // 数据持久化到数据库
            let user = await models.user.create({
                userName,
                password,
                email
            })
            res.json({
                data: {
                    user
                },
                message: '用户创建成功'
            })
        }
    } catch (error) {
        next(error)
    }
})

router.post('/logoin', async (req, res, next) => {
    try {
        let { userName, password } = req.body;
        // 校验用户名是否存在
        let user = await models.user.findOne({
            where: {
                userName
            }
        })

        if (user) {
            if (user.password == password) {
                const token = jwt.sign({ id: user.id }, "I_LOVE_NODEJS",{expiresIn:60*60*24*7});
                res.json({
                    message: '登陆成功',
                    data: {
                        token
                    },
                })
            } else {
                res.json({
                    message: '密码错误'
                })
            }
        } else {
            res.json({
                message: '用户不存在'
            })
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router;