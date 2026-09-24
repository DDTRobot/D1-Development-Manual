# D1 ROS 2 开机服务与跨主机发现配置

 D1 机器人 ROS 2 开机自启动、Cyclone DDS 网络发现，以及开发主机连接机器人的配置方法。

## 配置目标

- 机器人开机后自动启动 ROS 2 服务。
- 机器人统一使用 ROS Domain ID `69`（例子） 和 Cyclone DDS。
- 开发主机通过有线网络发现机器人 ROS 2 节点。
- 避免 ROS 2 daemon 使用错误的 RMW 实现。
- 避免开机时 `eth0` 尚未就绪导致节点启动失败。

## 网络参数

| 设备 | 网卡 | IPv4 地址 | ROS Domain ID | RMW 实现 |
| --- | --- | --- | --- | --- |
| D1 机器人 | `eth0` | `192.168.19.90/24` | `69` | `rmw_cyclonedds_cpp` |
| 开发主机 | `eno1` | `192.168.19.93/24` | `69` | `rmw_fastrtps_cpp` |

开始配置前确认主机可以访问机器人：

```bash
ping -c 3 192.168.19.90
```

## 机器人 ROS 2 环境

机器人登录 shell 使用 `/opt/d1_ros2/env.sh` 统一加载 ROS 2 环境。在 `/home/robot/.bashrc` 末尾添加：

```bash
# D1 ROS 2 environment
source /opt/d1_ros2/env.sh
```

不要再单独配置 `/opt/ros/humble/setup.bash` 和 `ROS_DOMAIN_ID`，避免登录 shell 与 systemd 服务使用不同的 RMW 配置。

`/opt/d1_ros2/ros2.env` 的关键配置如下：

```bash
ROS_DOMAIN_ID=69
ROS_LOCALHOST_ONLY=0
ROS_LOG_LEVEL=DEBUG
RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
CYCLONEDDS_URI=file:///opt/d1_ros2/cyclonedds.xml
```

## Cyclone DDS 网络配置

编辑机器人 `/opt/d1_ros2/cyclonedds.xml`：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<CycloneDDS xmlns="https://cdds.io/config"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="https://cdds.io/config https://raw.githubusercontent.com/eclipse-cyclonedds/cyclonedds/master/etc/cyclonedds.xsd">
  <Domain>
    <General>
      <Interfaces>
        <NetworkInterface name="eth0" priority="default" multicast="true" />
      </Interfaces>
      <AllowMulticast>true</AllowMulticast>
    </General>
    <Discovery>
      <ParticipantIndex>auto</ParticipantIndex>
      <MaxAutoParticipantIndex>99</MaxAutoParticipantIndex>
    </Discovery>
  </Domain>
</CycloneDDS>
```

如果配置为 `lo`，ROS 2 节点只能在机器人本机发现，外部开发主机无法发现机器人 topic。

## systemd 开机服务

机器人使用以下三个服务：

| 服务 | 启动内容 |
| --- | --- |
| `d1_system.service` | 系统状态与基础设备节点 |
| `d1_bringup.service` | 主控制器与机器人状态发布节点 |
| `d1_command.service` | 指令网关与遥控相关节点 |

服务启动顺序为：

```text
d1_system.service
        ↓
d1_bringup.service
        ↓
d1_command.service
```

### 等待 eth0 就绪

Cyclone DDS 指定 `eth0` 后，服务必须等待网卡获得 IPv4 地址。分别创建：

```text
/etc/systemd/system/d1_system.service.d/wait-for-eth0.conf
/etc/systemd/system/d1_bringup.service.d/wait-for-eth0.conf
/etc/systemd/system/d1_command.service.d/wait-for-eth0.conf
```

三个文件内容相同：

```ini
[Unit]
Wants=network-online.target
After=network-online.target NetworkManager-wait-online.service

[Service]
ExecStartPre=/usr/bin/timeout 60 /bin/bash -c 'until /usr/sbin/ip -4 -o address show dev eth0 scope global | /usr/bin/grep -q "inet "; do /usr/bin/sleep 1; done'
```

应用配置：

```bash
sudo systemctl daemon-reload
sudo systemctl enable d1_system.service
sudo systemctl enable d1_bringup.service
sudo systemctl enable d1_command.service
```

按依赖顺序重启：

```bash
sudo systemctl stop d1_command.service d1_bringup.service d1_system.service
sudo systemctl start d1_system.service
sudo systemctl start d1_bringup.service
sudo systemctl start d1_command.service
```

## 开发主机配置

在开发主机 `/home/example/.bashrc` 末尾添加：

```bash
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=69
export ROS_LOCALHOST_ONLY=0
export RMW_IMPLEMENTATION=rmw_fastrtps_cpp
```

应用并确认配置：

```bash
source ~/.bashrc
echo "$ROS_DOMAIN_ID"
echo "$ROS_LOCALHOST_ONLY"
echo "$RMW_IMPLEMENTATION"
```

预期输出：

```text
69
0
rmw_fastrtps_cpp
```

## ROS 2 daemon 刷新

如果修改环境后仍看不到机器人 topic，停止旧 daemon 并重新启动：

```bash
ros2 daemon stop
ros2 daemon start
ros2 topic list
```

也可以绕过 daemon 直接检查 DDS 发现结果：

```bash
ros2 topic list --no-daemon
```

正常情况下可以看到带机器人命名空间的 topic，例如：

```text
/d15039751/joint_states
/d15039751/robot_description
/d15039751/command/cmd_twist
/d15039751/system_status_broadcaster/diagnostic
/tf
/tf_static
```

## 状态检查

在机器人上检查服务：

```bash
systemctl is-enabled d1_system.service d1_bringup.service d1_command.service
systemctl is-active d1_system.service d1_bringup.service d1_command.service
```

查看本次开机日志：

```bash
journalctl -b -u d1_system.service \
  -u d1_bringup.service \
  -u d1_command.service --no-pager
```

检查网卡和控制器：

```bash
ip -4 -br address show dev eth0
source /opt/d1_ros2/env.sh
ros2 control list_controllers -c /d15039751/controller_manager
ros2 control list_controllers -c /d15039751/command_manager
```

## 常见问题

### 只能看到 `/parameter_events` 和 `/rosout`

通常是 ROS 2 daemon 使用了错误的 RMW 实现。检查 daemon：

```bash
pgrep -af ros2-daemon
```

机器人应显示：

```text
--ros-domain-id 69 --rmw-implementation rmw_cyclonedds_cpp
```

重新加载环境并刷新 daemon：

```bash
source /opt/d1_ros2/env.sh
ros2 daemon stop
ros2 daemon start
```

### 当前主机看不到机器人 topic

首先检查当前终端，而不是只检查 `.bashrc` 文件：

```bash
echo "$ROS_DOMAIN_ID"
```

如果输出为 `42`，说明当前终端仍然保留旧环境。执行：

```bash
source ~/.bashrc
ros2 daemon stop
ros2 daemon start
```

### `eth0: does not match an available interface`

该错误表示服务启动时 `eth0` 尚未创建或尚未获得 IPv4 地址。确认三个 systemd drop-in 文件已经安装，然后执行：

```bash
sudo systemctl daemon-reload
sudo systemctl restart d1_system.service
sudo systemctl restart d1_bringup.service
sudo systemctl restart d1_command.service
```

## 配置备份

本次配置对应的备份文件：

```text
/home/robot/.bashrc.bak.20260924_ros2
/opt/d1_ros2/cyclonedds.xml.bak.20260924-cross-host
/home/luo/.bashrc.bak.20260924-d1-ros2
```

回滚 Cyclone DDS 配置后，需要重新加载 systemd 并重启三个 ROS 2 服务。
