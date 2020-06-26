/**
 * 每个页面都会执行这个文件
 * 可以在这里面获取数据  顶层app组件
*/

import App from "next/app"
import { Provider } from "react-redux"
import Router from "next/router"

import 'antd/dist/antd.css'

import Layout from "../components/Layout"
import withReduxApp from "../lib/with_redux"
import PageLoading from "../components/PageLoading"



class MyApp extends App {

    constructor(props) {
        super(props)
    }

    state = {
        loading: false
    }

    // 处理路由切换请求时的 loading 加载
    startLoading = () => {
        this.setState({
            loading: true
        })
    }

    stopLoading = () => {
        this.setState({
            loading: false
        })
    }

    componentDidMount() {
        Router.events.on("routeChangeStart", this.startLoading)
        Router.events.on("routeChangeComplete", this.stopLoading)
        Router.events.on("routeChangeError", this.stopLoading)
    }

    componentWillUnmount() {
        Router.events.off("routeChangeStart", this.startLoading)
        Router.events.off("routeChangeComplete", this.stopLoading)
        Router.events.off("routeChangeError", this.stopLoading)
    }

    static async getInitialProps(ctx) {
        const { Component } = ctx
        let pageProps = {}
        // 需要调用默认的，注意这里的 ctx
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }
        return {
            pageProps
        }
    }

    render() {
        const { Component, pageProps, reduxStore } = this.props

        return (
            <Provider store={reduxStore} >
                {this.state.loading ? <PageLoading /> : null}
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </Provider>
        )
    }
}

export default withReduxApp(MyApp)

