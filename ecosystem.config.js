/**
 * PM2 配置文件
 * app:启动哪些应用
 * script： 启动脚本
 * max_memory_restart：最大内存重新启动
*/
module.exports = {
    apps: [
        {
            name: "nextGo",
            script: "./server.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "80M",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
}
