import Document, { Html, Head, Main, NextScript } from "next/document"
// import { ServerStyleSheet } from "styled-components"

class MyDocument extends Document {
    static async getInitialProps(ctx) {

        // 初始化时，自定义一些高级的功能
        // nextjs 中集成 styled-components
        // const sheet = new ServerStyleSheet()

        try {
            // ctx.renderPage = () => origin({
            //     enhanceApp: App => ( props ) => sheet.collectStyles( <App {...props} /> ) ,
            //     // enhanceComponent: Component => withLog(Component)
            // })

            // 如果自定义了 getInitialProps 需要返回默认的 Document 的基本信息
            const props = await Document.getInitialProps(ctx)

            return {
                ...props,
                // styles: (
                //     <>
                //         {props.styles}
                //         {sheet.getStyleElement()}
                //     </>
                // )
            }

        } finally {
            // sheet.seal()
        }

    }

    render() {
        return (
            <Html>
                <Head>
                    <link rel="shortcut icon" href="./favicon.ico" type="image/x-icon" />
                </Head>
                <body>
                    <Main></Main>
                    <NextScript />
                </body>
            </Html>
        )
    }
}


export default MyDocument
