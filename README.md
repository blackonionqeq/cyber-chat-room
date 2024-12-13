# 赛博聊天室

## 定位

一个实时聊天应用

## 技术栈

前端：Vue3 + Vite + TypeScript + unocss

后端：Nest.js ( + express ) + TypeScript + redis

数据库：MySQL + MongoDB + Prisma

通信框架：socket.io ( + socket.io-client )

部署和转发：docker （ + docker-compose ) + nginx

## 主要功能

用户注册（邮箱注册）、登录、通信部分。

通信部分细分为联系人管理（新增、邀请联系人、接受邀请）、聊天（暂时只支持单聊）、聊天内容收藏和取消收藏。

聊天支持发送文本、颜文字、图片，聊天列表顺序按时间倒序排列、有未读消息时显示红点、聊天记录缓存（以减轻服务器查询压力）。


## TODOLIST

- 群聊
- 聊天消息支持文件格式
- 第三方注册和登录
- 后端微服务化
- 搜索用ElasticSearch

## 页面详情

- 注册页面，详情见[注册页文档](./docs/register.md)
- 登录页面，详情见[登录页文档](./docs/login.md)
- 主页，详情见[主页文档](./docs/home.md)