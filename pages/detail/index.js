import WithRepoBasic from "../../components/with-repo-basic"
import api from "../../lib/api"
import dynamic from "next/dynamic"

// 动态组件
const MDRender = dynamic(
    () => import("../../components/MarkDownRender"),
    {
        loading: () => <p>Loading......</p>
    }
)

function Detail({ readme }) {

    return (
        <MDRender content={readme.content} isBase64={true} />
    )
}

Detail.getInitialProps = async ({ ctx: { query: { owner, name }, req, res } }) => {

    // 获取readme，这里使用客户端请求
    const readmeRes = await api.request({
        url: `/repos/${owner}/${name}/readme`
    }, req, res)

    return {
        readme: readmeRes.data
    }
}

export default WithRepoBasic(Detail, "index")
