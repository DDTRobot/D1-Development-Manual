# sim2sim/sim2real

```{toctree}
:maxdepth: 1
:glob:
```

------
D1 机器人控制系统基于 ROS 2 Humble 构建，支持强化学习控制、硬件控制、以及多种仿真环境，提供完整的 sim2sim 与 sim2real 工作流。本章节介绍系统功能、运行环境、构建方式以及仿真与硬件运行方法。本章节基于[此仓库](https://github.com/DDTRobot/ddt_ros2_control)。

## 概述
D1 控制框架主要包含以下模块：
- 强化学习控制器（支持 ONNX 推理），基于有限状态机组织控制逻辑
- ros2_control 硬件桥接，连接真实机器人驱动库
- Mujoco / Gazebo / Webots 三种仿真环境桥接与示例世界
- 键盘控制与遥控（ELRS）交互模块
- 多机器人模型与描述（tita、d1、d1h）

## 系统依赖
### 基础环境
- Ubuntu 22.04
- ROS 2 Humble
- Webots R2025a
- Gazebo Classic
- colcon 构建工具

ROS 2 控制相关依赖：
```bash
sudo apt install ros-humble-ros2-control ros-humble-ros2-controllers
```
### ONNX Runtime（用于 RL 推理）
```bash
wget https://github.com/microsoft/onnxruntime/releases/download/v1.10.0/onnxruntime-linux-x64-1.10.0.tgz
tar xvf onnxruntime-linux-x64-1.10.0.tgz
sudo cp -a onnxruntime-linux-x64-1.10.0/include/* /usr/include
sudo cp -a onnxruntime-linux-x64-1.10.0/lib/* /usr/lib
```
### 仿真环境依赖（按需安装）
Webots
```bash
sudo apt install ros-humble-webots-ros2 ros-humble-webots-ros2-control
```
Gazebo
```bash
sudo apt install ros-humble-gazebo-ros ros-humble-gazebo-ros2-control
```
Mujoco
需额外安装 DeepMind Mujoco（详情可参考[此仓库](https://github.com/DDTRobot/ddt_ros2_control)）

## 构建控制系统
以下流程适用于所有仿真/硬件运行场景。
### 创建工作空间
```bash
mkdir -p ~/d1_ws/src
```
将代码放入src，然后执行：
```bash
cd ~/d1_ws
colcon build --symlink-install
source install/setup.bash
```

## 仿真运行
### webots
地形可选：
- empty_world
- stairs
- uneven
启动示例：
```bash
ros2 launch rl_controller sim_webots.launch.py robot:=d1 terrain:=empty_world
```
### Gazebo
```bash
ros2 launch rl_controller sim_gazebo.launch.py robot:=d1h
```
### Mujoco

- 若仿真 D1，需要：
- 复制 D1H 的 mesh 到 D1 模型中
- 在 d1_description 中启用 mesh 构建

重新编译模型描述包
运行仿真：
```bash
ros2 launch rl_controller sim_mujoco.launch.py robot:=d1
```


## 实机运行
### 安装依赖与构建
```bash
sudo apt install python3-colcon-common-extensions
colcon build --symlink-install --packages-up-to rl_controller hardware_bridge
```
### 停止默认的系统服务
```bash
sudo systemctl stop joy_controller.service
sudo systemctl stop rl8_controller.service
sudo systemctl stop rl16_controller.service
```
### 启动硬件控制器
```bash
ros2 launch rl_controller hw.launch.py robot:=d1
```
## 交互控制
### 键盘控制
```bash
ros2 run keyboard_controller keyboard_controller_node
```
### 遥控（ELRS）
```bash
ros2 launch teleop_command teleop_command.launch.py
```
## 控制器配置

控制器配置文件：
```bash
controller/rl_controller/config/<robot>/controllers.yaml
```
示例 ONNX 模型：
- D1：```bash flat.onnx ```, ```bash stairs.onnx```
- TITA：```bash stand.onnx```

修改控制策略时，需要同步更新：
- controllers.yaml
- 模型路径

## 状态机结构

强化学习控制器的有限状态机实现位于：
```bash
rl_controller/fsm/
```
包含状态定义、状态切换逻辑与动作生成。

## 常见问题

- Webots未找到： 的安装路径要在环境变量中，例如：
```bash export WEBOTS_HOME=/usr/lib/webots```
- Mujoco 未找到：确认```bash mujoco```已安装并设置```bash MUJOCO_DIR```
- 控制器未加载：检查```bash controller_manager```日志与```bash controllers.yaml```配置。
- 模型描述加载失败：确认```bash robot:=<name>```与对应```bash *_description```包存在且可用