# 运行流程
1. 在项目文件夹下执行 `npm install`
2. 在db/config/config.json中配置mysql数据库。
3. 执行持久化命令 在终端中db文件夹下执行 `npx sequelize db:migrate`。
4. 运行命令 `npm start` 
> 使用默认端口 http://127.0.0.1:3000 即可访问