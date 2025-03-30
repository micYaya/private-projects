// 创建koa对象
const Koa = require('koa');  // 导入包
const app = new Koa()  // 创建Koa对象
// 编写响应函数（中间件）
// ctx：上下文，web容器，cytx.request  ctx.response
// next:下一个中间件，下一层中间件是否能够得到执行，取决于next这个函数有没有被调用，调用next函数得到的是promise对象
app.use((ctx, next) => {
    // console.log(ctx.request.url);
    console.log('第一层中间件...1')
    ctx.response.body = 'hello world';
    next();
    console.log('第一层中间件...2')
});
// 第二层中间件
// await 关键字只能在 async 函数内部使用。next() 虽然返回的是一个 Promise 对象，
// 但如果不将中间件函数定义为 async 函数，就无法使用 await 来暂停函数执行，
// 等待 next() 返回的 Promise 被解决。
app.use(async (ctx, next) =>{
    console.log('第二层中间件...1');
    const ret = await next();
    console.log(ret);
    console.log('第二层中间件...2');
});
// 第三层中间件
app.use((ctx, next) =>{
    console.log('第三层中间件');
    return 'You konw me.';
});
// 绑定端口号3000
app.listen(3000, (err) => {
    if (err) {
        console.error('Failed to start server:', err);
    } else {
        console.log('Server is running on port 3000');
    }
});