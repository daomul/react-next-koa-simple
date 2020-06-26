const axios = require("axios")

const github_base_url = "https://api.github.com"

// 服务端的请求没有做代理，而是固定的URL请求路劲
async function reqGithub(method, url, data, headers) {
    return await axios({
        method,
        url: `${github_base_url}${url}`,
        data,
        headers
    })
}


async function request({ method = "GET", url, data = {} }, req, res) {
    if (!url) {
        throw Error("url must provider")
    }

    const isServer = typeof window === "undefined"
    // 封装服务端的请求
    if (isServer) {
        var session = req.session
        var githubAuth = session.githubAuth || {}
        var headers = {}
        if (githubAuth && githubAuth.access_token) {
            headers['Authorization'] = `${githubAuth.token_type} ${githubAuth.access_token}`
        }
        var resp = await reqGithub(method, url, data, headers)
        return resp
    } else {
        // 封装客户端的请求
        return await axios({
            method,
            url: `/github${url}`,
            data
        })
    }
}

module.exports = {
    request,
    reqGithub
}
