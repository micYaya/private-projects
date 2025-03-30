export default class SocketService {
    /**
     * 单例
     */
    static instance = null
    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService()
        }
        return this.instance
    }

    // 和服务端连接的socket对象
    ws = null

    selfData = null

    // 存储回调函数
    callBackMapping = {}

    // 标识是否连接成功
    connected = false

    // 重试的次数
    retryCount = 0
    // 重新连接的次数
    connectRetryCount = 0

    // 定义连接服务器的方法
    connect() {
        // 连接服务器
        if (!window.WebSocket) {
            return console.log('该浏览器不支持WebSocket')
        }
        this.ws = new WebSocket('ws://localhost:9998')

        // 连接事件
        this.ws.onopen = () => {
            console.log('连接服务端成功')
            this.connected = true
            this.connectRetryCount = 0
        }
        // 1.连接失败；2.连接成功之后，服务器关闭
        this.ws.onclose = () => {
            console.log('连接服务端失败')
            this.connected = false
            setTimeout(() => {
                this.connectRetryCount++
                this.connect()
            }, this.connectRetryCount*500)
        }
        this.ws.onmessage = msg => {
            console.log('从服务端获取到了数据')
            try {
                console.log('msg.data内容', this.selfData)
                const recvData = this.selfData
                const realData = JSON.parse(msg.data)
                console.log('this.selfData内容', this.selfData)
                console.log('msg内容', msg)
                console.log('recvData内容', recvData)
                // console.log('recvData.action:', recvData.action)
                // console.log('recvData类型', typeof recvData)
                console.log('realData内容', realData)
                // console.log(msg.data)
                // console.log(JSON.parse(msg.data))
                // string
                // console.log(typeof JSON.parse(msg.data))
                // string
                // console.log(typeof msg.data)
                const socketType = recvData.socketType
                console.log('socketType:', socketType)
                console.log('realData.action:', realData.action)
                if (socketType) {
                    // console.log('00')
                    // 判断回调函数是否存在
                    if (this.callBackMapping[socketType]) {
                        // console.log('1')
                        const action = recvData.action
                        console.log('action:', action)
                        // console.log('11')
                        if (realData.action === 'fullScreen') {
                            console.log('执行 fullScreen 回调')
                            this.callBackMapping['fullScreen'].call(this, realData)
                        } else if (realData.action === 'themeChange') {
                            console.log('执行 themeChange 回调')
                            this.callBackMapping['themeChange'].call(this, realData)
                        } else if (action === 'getData') {
                            // console.log('111')
                            // string
                            // console.log(typeof realData)
                            this.callBackMapping[socketType].call(this, realData)
                        } else {
                            console.log('4')
                        }
                    } else {
                        console.log(`回调函数未注册，socketType: ${socketType}`)
                    }
                } else {
                    console.log('recvData 中不存在 socketType 属性')
                }
            } catch (error) {
                console.error('解析JSON数据时出错:', error)
            }
        }
    }

    // 回调函数的注册
    registerCallBack(socketType, callBack) {
        this.callBackMapping[socketType] = callBack
    }

    // 回调函数的取消
    unRegisterCallBack(socketType) {
        this.callBackMapping[socketType] = null
    }

    // 发送数据的方法
    // 多个窗口共享WebSocket连接，​不会重复发送请求，但共享状态和回调。
    send(data) {
        if (this.connected === true) {
            this.retryCount = 0
            // console.log('yes')
            // console.log(typeof data)
            console.log('data:', data)
            // 将传入的数据转换为JSON字符串
            this.selfData = data
            // console.log('typeof this.selfData:', typeof this.selfData)
            this.ws.send(JSON.stringify(data))
        } else {
            console.log('未连接')
            this.retryCount++
            setTimeout(() => {
                this.send(data)
            }, this.retryCount * 500)
        }
    }
}