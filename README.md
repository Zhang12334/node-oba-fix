# BMCLAPI
BMCLAPI是@bangbang93开发的BMCL的一部分，用于解决国内线路对Forge和Minecraft官方使用的Amazon S3 速度缓慢的问题。BMCLAPI是对外开放的，所有需要Minecraft资源的启动器均可调用。

# Node-OpenBMCLAPI-Fix
本项目为OpenBMCLAPI官方Node端的Fork版本，修改了部分内容
（支持更好的压榨节点）

## 配置

新增了一些变量，方便更好的压榨节点

| 环境变量                | 必填 | 默认值          | 说明                                                                                                     |
|---------------------|----|--------------|--------------------------------------------------------------------------------------------------------|
| CLUSTER_ID          | 是  | -            | 集群 ID                                                                                                  |
| CLUSTER_SECRET      | 是  | -            | 集群密钥                                                                                                   |
| CLUSTER_IP          | 否  | 自动获取公网出口IP   | 用户访问时使用的 IP 或域名                                                                                        |
| CLUSTER_PORT        | 否  | 4000         | 监听端口                                                                                                   |
| CLUSTER_PUBLIC_PORT | 否  | CLUSTER_PORT | 对外端口                                                                                                   |
| CLUSTER_BYOC        | 否  | false        | 是否使用自定义域名, (BYOC=Bring you own certificate),当使用国内服务器需要备案时, 需要启用这个参数来使用你自己的域名, 并且你需要自己提供ssl termination |
| DISABLE_ACCESS_LOG  | 否  | false        | 禁用访问日志输出                                                                                               |
| ENABLE_UPNP         | 否  | false        | 启用 UPNP 端口映射                                                                                           |
| CLUSTER_SKIP_SYNC         | 否  | false        | 跳过同步    |