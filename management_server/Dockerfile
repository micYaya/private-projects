FROM docker.io/node  

#在镜像容器中创建目录  

RUN mkdir -p /home/app_node 

#将此目录设为工作目录    
WORKDIR /home/app_node 

#将该目录下的所有文件拷贝到镜像容器中
COPY . /home/app_node

#重新安装依赖            
RUN npm install    

#保持和启动node服务的端口号一致                       

EXPOSE 3000


CMD [ "node", "./app.js" ]