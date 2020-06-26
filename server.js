const Koa = require("koa")
const Router = require("koa-router")
const next = require("next")
const session = require("koa-session")
const Redis = require("ioredis")
const atob = require("atob")

const RedisSessionStore = require("./server/session-store")

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const auth = require("./server/auth")
const api = require("./server/server-api")

// 创建redis服务
const redis = new Redis()

// 设置nodejs全局增加一个atob方法
global.atob = atob

app.prepare().then(() => {
    const server = new Koa()
    const router = new Router()

    // 配置 session 
    // koa-session 配置加密字符串
    server.keys = ['some secret hurr']
    const SESSION_CONFIG = {
        key: "tid",
        store: new RedisSessionStore(redis),
        // maxAge: // 设置redis过期时间
    }
    server.use(session(SESSION_CONFIG, server))

    // 处理 github auth 中间件
    auth(server)
    api(server)

    // router.get("/api/user/info", async ctx => {
    //     console.log('ctx.session.userInfo: ')
    //     const user = ctx.session.userInfo
    //     if (!user) {
    //         ctx.status = 401
    //     } else {
    //         ctx.body = user
    //         ctx.set("Content-Type", "application/json")
    //     }
    // })

    // router.get("/a/:id", async (ctx) => {
    //     var id = ctx.params.id
    //     await handle(ctx.req, ctx.res, {
    //         pathname: "/a",
    //         query: { id }
    //     })
    //     ctx.respond = false
    // })

    // router.get("/tan/b/:id", async (ctx) => {
    //     var id = ctx.params.id
    //     await handle(ctx.req, ctx.res, {
    //         pathname: "/tan/b",
    //         query: { id }
    //     })
    //     ctx.respond = false
    // })

    server.use(router.routes())

    server.use(async (ctx, next) => {
        ctx.req.session = ctx.session
        await handle(ctx.req, ctx.res)
        ctx.respond = false
    })

    server.listen(3000, () => {
        console.log(" ---- localhost:3000 port starting ----")
    })

})

