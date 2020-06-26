import { connect } from 'react-redux'
import getConfig from 'next/config'
import { Button, Tabs } from 'antd'
import { MailOutlined } from '@ant-design/icons';
import Router, { withRouter } from "next/router"
import Lru from 'lru-cache'
import { useEffect } from 'react'

import { cacheArray } from '../lib/repo-basic-cache'
const { TabPane } = Tabs
const api = require('../lib/api')

const { publicRuntimeConfig } = getConfig()

// 导入子组件
import Repo from '../components/Repo'

const isServer = typeof window === 'undefined'
const cache = new Lru({
  maxAge: 1000 * 60 * 60
})

const Index = ({ userRepos, userStaredRepos, user, router }) => {

  // 切换 tab
  const tabKey = router.query.key || "1"
  const handleTabChange = (activeKey) => {
    Router.push(`/?key=${activeKey}`)
  }

  useEffect(() => {
    if (!isServer) {
      if (userRepos) {
        cache.set("userRepos", userRepos)
      }
      if (userStaredRepos) {
        cache.set("userStaredRepos", userStaredRepos)
      }
    }
  }, [userRepos, userStaredRepos])

  useEffect(() => {
    if (!isServer) {
      cacheArray(userRepos)
      cacheArray(userStaredRepos)
    }
  })

  // 判断是否登录，如果没有登录，则登录
  if (!user || !user.id) {
    return <div className="root">
      <p>亲，您还没有登录哦~</p>
      <Button type="primary" href={publicRuntimeConfig.OAUTH_URL}>点击登录</Button>
      <style jsx>{`
                .root{
                    height:400px;
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content: center;
                }
            `}</style>
    </div>
  }

  return <div className="root">
    {/* 用户信息部分 */}
    <div className="user-info">
      <img src={user.avatar_url} className="avatar" />
      <span className="login">{user.login}</span>
      <span className="name">{user.name}</span>
      <span className="bio">{user.bio}</span>
      <p className="email">
        <MailOutlined style={{ marginRight: 10 }} />
        <a href={`mailto:${user.email}`}>{user.email}</a>
      </p>
    </div>
    {/* 仓库部分 */}
    <div className="user-repos">
      <Tabs defaultActiveKey={tabKey} onChange={handleTabChange} animated={false}>
        <TabPane tab="你的仓库" key="1">
          {userRepos.map(item => {
            return <Repo key={item.id} repo={item} />
          })}
        </TabPane>
        <TabPane tab="你关注的仓库" key="2">
          {userStaredRepos.map(item => {
            return <Repo key={item.id} repo={item} />
          })}
        </TabPane>
      </Tabs>
    </div>
    <style jsx>{`
            .root {
                display: flex;
                align-items: flex-start;
                padding: 20px 0;
            }   
            .user-info {
                width: 200px;
                margin-right: 40px;
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
            }
            .login {
                font-weight: 800;
                font-size: 20px;
                margin-top: 20px;
            }
            .name {
                font-size: 16px;
                color: #777;
            }
            .bio {
                margin-top: 20px;
                color: #333;
            }
            .avatar {
                width: 100%;
                border-radius: 5px;
            }
            .user-repos{
                flex-grow: 1;
            }
        `}</style>
  </div>
}

// 服务端先渲染【nodejs环境】
// 客户端如果发现服务端已经渲染了就不会再加载了
Index.getInitialProps = async ({ ctx, reduxStore }) => {

  // 来自 withRedux 中的 reduxStore
  // 确定已经登录再请求数据
  const user = reduxStore.getState().user


  // 先从缓存中去取
  // 缓存是在客户端使用的
  if (!isServer) {
    if (cache.get('userRepos') && cache.get('userStaredRepos')) {
      return {
        userRepos: cache.get('userRepos'),
        userStaredRepos: cache.get('userStaredRepos')
      }
    }
  }

  if (user || user.id) {
    // 获取用户自己的仓库
    // req\res 只有在服务端渲染才有
    try {
      const userRepos = await api.request({
        url: '/user/repos'
      }, ctx.req, ctx.res)
  
      // 获取用户关注的仓库
      const userStaredRepos = await api.request({
        url: '/user/starred'
      }, ctx.req, ctx.res)
      return {
        userRepos: userRepos.data,
        userStaredRepos: userStaredRepos.data
      }
    } catch (error) {
      console.log(error)
      return {
        userRepos: [],
        userStaredRepos: []
      }
    }
  }
  return {}
}

export default withRouter(connect(state => {
  return {
    user: state.user
  }
})(Index))