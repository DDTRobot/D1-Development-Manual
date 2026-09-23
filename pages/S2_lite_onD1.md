# 朗毅导航塔（S2 Lite）在 D1 上的部署指南

本页介绍源码构建和 deb 包安装两种部署方式，以及服务状态查询和卸载方法。请选择其中一种方式进行部署。

## 方式一：源码构建

### 获取源码并编译

将仓库克隆至 `D1_langyi_sdk_demo` 目录，然后进入该目录构建：

```bash
git clone https://github.com/DDTRobot/d1_langyi_sdk_demo.git D1_langyi_sdk_demo
cd D1_langyi_sdk_demo
colcon build
```

### 启动

构建完成后，在项目根目录执行：

```bash
bash start_D1.sh
```

## 方式二：deb 包安装

### 下载并安装

从仓库根目录下载 `d1-langyi-sdk_1.0.0_arm64.deb`，然后在机器人上执行：

```bash
sudo dpkg -i d1-langyi-sdk_1.0.0_arm64.deb
```

安装完成后，项目文件部署至 `/opt/d1_langyi_sdk_demo/`，服务可手动启动。

### 查看服务状态

```bash
systemctl status d1_langyi.service
```

### 卸载

```bash
sudo dpkg -r d1-langyi-sdk
```
