const WebSocket = require('ws')
const path = require('path')
const fileUtils = require('../utils/file_utils')

// 创建websocket服务端对象，绑定端口号
const wss = new WebSocket.Server({
    port: 9998
})

// 定义该模块要导出的内容。其他模块可以通过 require 函数引入并使用这些导出的内容。
module.exports.listen = () => {
    // 对客户端的连接事件进行监听
    // client代表的是客户端连接的socket对象
    wss.on('connection', client => {
        console.log('有客户端连接成功了...')
        // 对客户端的连接对象进行message事件的监听
        // msg：由客户端发给服务端的数据
        client.on('message', async msg => {
            console.log('客户端发送数据给服务器了：' + msg)
            // buffer对象转换成string
            console.log(msg.toString())
            // 把msg转换成json格式
            let payload = JSON.parse(msg)
            console.log(payload)
            const action = payload.action
            if (action === 'getData') {
                // chartName: hot stock map and son on
                let filePath = '../data/' + payload.chartName + '.json'
                filePath = path.join(__dirname, filePath)
                // 在服务器获取到数据的基础之上，增加一个data字段，表示某个json文件的内容
                payload.data = await fileUtils.getFileJsonData(filePath)
                client.send(JSON.stringify(payload.data))
            } else {
                // 将所接收到的数据转发给每一个处于连接状态的客户端
                console.log('客户端数量：', wss.clients.size)
                wss.clients.forEach(client => {
                    // 这里的msg是Buffer对象，主要应用于Node.js环境，用于处理网络协议、文件系统操作、加密等需要处理二进制数据的场景，比如在服务器端读取或写入文件、处理网络套接字数据等。
                    console.log(msg)
                    let mm = msg.toString()
                    console.log(typeof mm)
                    console.log(mm)
                    if (client.readyState === WebSocket.OPEN) {
                        // client.send(mm)
                        try {
                            client.send(mm);
                        } catch (error) {
                            console.error('向客户端发送消息时出错:', error);
                        }
                    }
                })
            }

            // // 由服务器往客户端发送数据
            // client.send('hello socket from backend')
        })
    })
}