import Repo from ".//Repo"
import Link from "next/link"
import { useEffect } from "react"

import api from "../lib/api"
import { withRouter } from "next/router"
import { get, setRepo } from "../lib/repo-basic-cache"


const isServer = typeof window === "undefined"

// 拼接 query 跳转链接
function makeQuery(queryObject) {
    // 遍历 queryObject
    const query = Object.entries(queryObject)
        .reduce((result, entry) => {
            result.push(entry.join('='))
            return result
        }, [])
        .join('&')
    return `?${query}`
}


export default function (Comp, type = "index") {
    function WithDetail({ repoBasic, router, ...rest }) {

        const query = makeQuery(router.query)

        // 客户端缓存
        useEffect(() => {
            if (!isServer) {
                setRepo(repoBasic)
            }
        })

        return (
            <div className="root">
                <div className="repo-basic">
                    <Repo repo={repoBasic} />
                    <div className="tabs">
                        {
                            type === "index" ? <span className="tab">Readme</span> :
                                <Link href={`/detail${query}`} >
                                    <a className="tab index">Readme</a>
                                </Link>
                        }
                        {
                            type === "issues" ? <span className="tab">Issues</span> :
                                <Link href={`/detail/issues${query}`} >
                                    <a className="tab issues">Issues</a>
                                </Link>
                        }
                    </div>
                </div>
                <div>
                    <Comp {...rest} />
                </div>
                <style jsx >{`
                    .root{
                        padding-top: 20px;
                    }
                    .repo-basic{
                        padding: 20px;
                        border: 1px solid #eee;
                        margin-bottom: 20px;
                        border-radius: 5px;
                    }
                    .tab + .tab{
                        margin-left: 20px;
                    }
                `}</style>
            </div>
        )
    }

    WithDetail.getInitialProps = async (context) => {

        // ctx.query 是实时保持最新的 query
        const { router, ctx } = context
        const { owner, name } = ctx.query
        const full_name = `${owner}/${name}`

        // 执行具体组件的 getInitialProps
        // 例如 detial 组件进来就调用它的 getInitialProps
        var pageData = {}
        if (Comp.getInitialProps) {
            pageData = await Comp.getInitialProps(context)
        }

        // 从缓存中取
        if (get(full_name)) {
            return {
                repoBasic: get(full_name),
                ...pageData
            }
        }

        // 发送网络请求
        const repoBasic = await api.request({
            url: `/repos/${owner}/${name}`
        }, ctx.req, ctx.res)

        return {
            repoBasic: repoBasic.data,
            ...pageData
        }
    }
    return withRouter(WithDetail)
}
