(ros-2)=
(quick-start)=

# 快速开始

从连接 D1 到读取第一条状态信息。本页通过 SSH 在机器人内置电脑上运行 ROS 2 命令，**不发送运动指令**。

```{note}

本页面向 ROS 2 应用开发。如果你需要 C++ 关节控制或 CAN FD 通信，请阅读[底层 SDK](SDK_Development.md)。
```

(start-environment)=

## 开始前

- **机器人环境：推荐在Ubuntu 22.04 系统，ros2 humble 版本 下进行开发调试**。
- **连接方式：** 开发电脑通过 USB Type-C 连接机器人，随后使用 SSH。
- **安全要求：** 先阅读产品使用说明，确认急停方式。首次验证只读取状态。

```{warning}

使用靠近网口的 USB Type-C 接口。不要使用刷机线调试，以免误进入刷机模式。Windows 无法识别 USB 网卡时，请先参考[环境与网络](Environment.md)处理驱动问题。
```

(connect-robot)=

## 连接机器人

在**开发电脑终端**中执行：

```bash
ssh robot@192.168.42.1
```

原手册记录的初始密码为 `ddt`，如交付时已修改，请使用实际密码。登录成功后，以下命令均在这个 **SSH 会话内**执行。

```{tip}

需要 Wi-Fi 或以太网连接？查看[环境与网络](Environment.md)。本页先使用 USB 网络完成最小验证，不需要修改现有网络配置。
```

(load-environment)=

## 加载 ROS 2 环境

在**机器人终端**中执行：

```bash
source /opt/ros/humble/setup.bash
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
export ROS_LOCALHOST_ONLY=1
export ROS_DOMAIN_ID=42
```

这里沿用原手册的本机通信配置，**不适用于开发电脑直接跨网络发现 ROS 2 节点的场景**。

检查机器人的命名空间：

```bash
printf '%s\n' "$ROBOT_NS"
```

应返回设备对应的命名空间，而不是空行。后续命令使用 `$ROBOT_NS`，不要照搬其他机器的序列号。

(read-status)=

## 读取状态

先查看当前可见的话题：

```bash
ros2 topic list
```

在列表中查找 `/<你的命名空间>/joint_states`，然后读取关节反馈：

```bash
ros2 topic echo /$ROBOT_NS/joint_states
```

当终端持续返回关节状态消息，说明这条状态读取路径已连通。按 **Ctrl+C** 结束读取，不会下发运动命令。

(query-controller)=

## 查询控制器构型

以下服务只查询状态，不切换控制器：

```bash
ros2 service call /$ROBOT_NS/command/get_controller_status std_srvs/srv/Trigger
```

原手册中的返回值用 `biped` 表示双轮足、`quadruped` 表示四轮足。请以设备实际返回为准。

```{tip}

你已经完成连接、环境加载与只读状态查询。接下来按任务选择接口文档，不必先阅读全部控制参数。
```

(start-troubleshooting)=

## 没有看到预期结果？


| 现象              | 先检查什么                                         |
| ----------------- | -------------------------------------------------- |
| SSH 无法连接      | Type-C 端口、网卡驱动与 USB 网络是否正常           |
| `ros2` 命令不存在 | 是否在机器人 SSH 会话内，是否加载 ROS 2 环境       |
| 命名空间为空      | 交付系统是否提供`namespace.sh`，该文件是否正确加载 |
| 没有话题或消息    | 当前环境变量、设备服务状态与交付镜像版本           |

更多连接配置见[环境与网络](Environment.md)，硬件问题见[常见问题](FAQ.md)。

(next-steps)=

## 下一步

- [ROS 2 接口参考](ROS2_Reference.md)：控制器查询、状态切换、速度与关节控制示例。
- [仿真与实机部署](sim2sim_sim2real.md)：先了解仿真路径，再开展实机开发。
- [策略与参数调优](Control_Tuning.md)：策略替换、LQR 参数和控制器配置。
- [底层 SDK（C++ / CAN FD）](SDK_Development.md)：另一条开发入口，按交付 SDK 版本查阅。
