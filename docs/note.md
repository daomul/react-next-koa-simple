汇总来自众人以及视频学习的笔记，仅做记录

### 一、nextjs应用中嵌套koa服务：

##### 1. 配置server.js
```js
const Koa = require( "koa" )
const next = require( "next" )

const dev = process.env.NODE_ENV !== 'production'
const app = next( {dev} )
const handle = app.getRequestHandler()

app.prepare().then( () => {
    const server = new Koa()

    server.use( router.routes() )   // 自定义koa路由相关的处理

    // handle处理函数一定要定义在最后，避免不过api数据请求
    server.use( async ( ctx, next ) => {
        await handle( ctx.req, ctx.res )
        ctx.respond = false       // 对于不是返回数据接口的接口要返回false
    } )

    server.listen( 3000, () => {
        console.log( "localhost:3000" )
    } )

} )

```
##### 2. 配置好后，即可在package.json中添加script："node server.js"来启动项目


### 二、next.js 集成antd：
---
##### 1. 配置@zeit/next-css使项目能够引用css文件

- 安装  yarn add @zeit/next-css
- 在项目根目录创建项目配置文件：next.config.js并配置：
```js
const withCss = require( "@zeit/next-css" )
if( typeof require !== "undefined" ){
    require.extensions['.css'] = file => {}
}
module.exports = withCss({})
```
即可完成css文件的引入

##### 2. 配置antd
- 安装 babel-plugin-import 和 antd
- 在项目根目录添加.bebalrc配置文件
```js
{
    "presets": ["next/babel"],
    "plugins": [
        [
            "import",
            {
                "libraryName": "antd"
                // "style": "css"     // 可以配置按需引入
            }
        ]
    ]
}
```

- 在pages页面下_app.js文件下全局引入css文件
```js
import 'antd/dist/antd.css'
```
为什么要全局引入？
如果不全局引入，会报bundle引入警告，并在search页面跳转的时候，第一次页面渲染的时候会不引入样式，再次刷新才会引入样式。

### 三、配置动态路由与路由映射

```
声明式导航
	Link ===> import Link from 'next/link'
	Link里面包含的必须是唯一的子节点
	
编程式导航
	Router ===> import Router from 'next/link'
	Router.push('路径')
	
动态路由
	只能通过query
	path?id=xxx
	
	新页面如何获取参数
		withRouter包裹组件导出，那么在组件的props中就可以拿到router对象，通过router对象的query属
		可以获取到值 router.query.xxx
		import {withRouter} from 'next/router'
```

##### 1. 页面书写：
```js
function gotoB(){
    Router.push( {
        pathname: "/tan/b",
        query: {
            id: 2
        }
    }, '/tan/b/2' )
}
<Link href="/a?id=1" as="/a/1" >     // as就是路由映射
    <a title="A页面">
        <Button>我是主页{ counter }</Button>
    </a>
</Link>
```
##### 2. 服务端配置：
server.js 中路由中的配置：
```js
router.get( "/a/:id", async ( ctx ) => {
    var id = ctx.params.id
    await handle( ctx.req, ctx.res, {
        pathname: "/a",
        query: { id }
    })
    ctx.respond = false
})
```
这样做当输入网址是动态路由时，也能渲染。

### 3、路由变化时的钩子函数：
```js
import Router from "next/router"
const event = [
    "routeChangeStart",
    "routeChangeComplate",
    "routeChangeError",
    "beforeHistoryChange",
    "hashChangeStart",
    "hashChangeComplate"
]
function makeEvent( type ){
    return ( ...args ) => {
        console.log( type, ...args )
    }
}
event.forEach( event => {    // 可以监听路由的变化
    Router.events.on( event, makeEvent( event ) )
}) 
```
作用：当路由跳转数据正在加载时，可以使用Loading组件提示加载中【_app.js文件全局配置中】


### 四、异步模块和组件的加载:
```js
import dynamic from "next/dynamic"
const MDRender = dynamic( 
    () => import( "../../components/markDownRender" ),
    {
        loading: () => <p>Loading......</p>
    }
    )
```
作用：当加载的组件较大且不会更改时，可以使用：
这样使用还有一个好处，因为单独打包，打包出来的是静态hash文件，所以浏览器会缓存下这个js文件，第二次请求的时候，就可以读取缓存文件再次利用。

### 五、getInitialProps函数相关说明：

```
挂在`页面`上面的静态方法，nextjs的数据获取规范

作用：【完成客户端与服务端数据的同步】
	在页面中获取数据
	在App中获取全局数据
	
注意：
	只有pages目录下面的才起作用，其它文件夹下的不起作用
	
页面中的 getInitialProps 说明
	1、一进入页面，比如 Index 会执行Index.getInitialProps 但是此时走的是服务端渲染
	
	2、通过路由切换进入到Index页面，走的浏览器端渲染
```

当第一次进入页面时，服务端会执行页面的 getInitialProps 函数，然后返回Props数据给页面组件，这个函数在浏览器第一次进入页面时，浏览器不会执行，只有当用户进行操作使页面进行跳转时会执行这个函数，这个函数是跳转页面的 getInitialProps。

在写 getInitialProps 函数时，要注意分清何时是服务端何时是客户端，可以使用 typeof window === "undefined"来判定是否是服务端，当知道何时是客户端时，可以做优化.

### 六、自定义App

```
相当于nuxt中的模板

作用：
	固定Layout
	保持一些公用的状态
		redux
		
	给页面传入一些自定义数据
	自定义错误处理
	
步骤：
	1、在pages目录下，创建一个_app.js的文件
	2、在 _app.js 中写了getInitialProps一定要注意，要获取页面的数据，并且在render中传递给页面
```

### 七、自定义Document

```
要点：
	1、只有在服务端渲染的时候才会被调用
	2、用来修改服务端渲染的文档内容
	3、一般用来配合第三方css-in-js方案使用
	
步骤：
	1、在 pages 目录下创建 _document.js
	2、导入相应的模块，重写Document的render 和 getInitialProps 方法
```
### 八、next.config.js

```
配置的内容：
    env
        环境变量

    serverRuntimeConfig
        服务端渲染配置，只有在服务端渲染才能获取到的配置

    publicRuntimeConfig
        服务端和客户端渲染都可以获取的配置
	
获取 next.config.js 中配置的内容
	import getConfig from 'next/config'

	const {publicRuntimeConfig} = getConfig()
```

### Hooks优化

```
作用：
	让函数组件具有类组件的能力
	
用法：
	useState 给模型赋初始值
		// 赋初始值 count = 0
		const [count,setCount] = useState(0)
		
	useEffect 页面渲染完毕之后(类似于mounted)，会执行它的回调函数【只执行一次】
		
		// 组件渲染完毕之后，调用该回调函数
		useEffect(() => {
            const interval = setInterval(() => {
                setCount(c => c + 2)
            },1000)
			
			// 组件销毁时候执行
            return () => clearInterval(interval)
        },[])
        
    useReducer 使用跟redux很像
    	见代码
    	const [count,dispatchCount] = useReducer(countReducer,0)
    	<button onClick={() => {dispatchCount({type:'add'})}}>{count}</button>
    
    useContext Context的hooks
    	见代码
    
    useRef ref的hooks
    	避免闭包陷阱
    	const inputRef = useRef()
    	<input ref={inputRef}/>
```

```
1、使用mome 把子组件包裹起来

2、把父组件中要传递给子组件的模型，使用useMemo包裹起来

3、在父组件中将传递给子组件的函数，使用useCallback包裹起来
```

### Hoc 以及 Hoc 之后的代码执行顺序及注意事项

```
NextJS 通过Hoc 实现给组件添加额外的功能

定义：
	接收组件作为参数并返回新的组件

原理：
	传入一个组件，经过处理之后返回一个新的组件，该组件除了有之前组件的所有props还可以有额外的props
	例如 router-router-dom 的 withRouter  
    	react-redux 的 connect
```


```
1、浏览器输入 http://localhost:3000/

2、会来到服务端的 server.js 中
	记得在服务端的处理中，加上 ctx.req.session = ctx.session 这样后面在渲染的时候才能拿到ctx.req.session做处理
	
3、会来到 Hoc 的 getInitialProps 中，在这里可以根据session数据创建store，并且将来把store传递到_app中

4、会来到 _app 的 getInitialProps 中，在这里可以做处理

5、如果页面实现了getInitialProps，接下来就会执行页面的getInitialProps方法了
```
