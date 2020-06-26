/**
 * 授权回调界面
*/
const axios = require("axios")
const config = require("../config")

const { client_id, client_secret, reqUrl } = config.github

module.exports = (server) => {
    server.use(async (ctx, next) => {
        if (ctx.path === "/auth") {
            const code = ctx.query.code
            if (!code) {
                ctx.body = "code not exist!"
                return
            }
            // 1. 获取 access_token 接口
            const result = await axios({
                method: "post",
                url: reqUrl,
                data: {
                    client_id,
                    client_secret,
                    code
                },
                headers: {
                    Accept: "application/json"
                }
            })
            if (result.status === 200 && (result.data && !result.data.error)) {
                ctx.session.githubAuth = result.data

                const { access_token, token_type } = result.data

                // 2. 获取用户信息接口
                const userInfo = await axios({
                    method: "GET",
                    url: "https://api.github.com/user",
                    headers: {
                        "Authorization": `${token_type} ${access_token}`
                    }
                })
                ctx.session.userInfo = userInfo.data

                ctx.redirect((ctx.session && ctx.session.urlBeforeOauth) || "/")
                ctx.session.urlBeforeOauth = ""

            } else {
                const err = result.data && result.data.error
                console.log("------ get access_token error ------", err)
                ctx.body = `request tokeb faild ${err}`
            }
        } else {
            await next()
        }
    })

    // 处理登录 server 路由
    server.use(async (ctx, next) => {
        const path = ctx.path
        const method = ctx.method
        if (path === "/logout" && method === "POST") {
            ctx.session = null
            ctx.body = `logout Success`
        } else {
            await next()
        }
    })

    // 处理登录 prepare-auth 授权跳转 路由
    server.use(async (ctx, next) => {
        const path = ctx.path
        const method = ctx.method
        if (path === "/prepare-auth" && method === "GET") {
            const { url } = ctx.query
            // 记住跳转前的 URL 地址
            ctx.session.urlBeforeOauth = url
            ctx.redirect(config.OAUTH_URL)
        } else {
            await next()
        }
    })

}
