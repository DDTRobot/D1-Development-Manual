# sim2sim/sim2real

```{toctree}
:maxdepth: 1
:glob:
```

------
D1’s robot control system is built on ROS 2 Humble and supports reinforcement learning control, hardware control, and multiple simulation environments, providing a complete sim2sim and sim2real workflow.
This chapter introduces system features, runtime environment, build methods, and simulation/hardware execution.
This chapter is based on [this repository](https://github.com/DDTRobot/ddt_ros2_control)。

## Overview
The D1 control framework mainly includes the following modules:

- Reinforcement learning controller (supports ONNX inference), organized via finite state machine
- ros2_control hardware bridge, connected to the real robot driver library
- Simulation bridges and sample worlds for Mujoco / Gazebo / Webots
- Keyboard and remote (ELRS) teleoperation modules
- Multiple robot models and descriptions (tita, d1, d1h)

## System Dependencies
### Basic Environment
- Ubuntu 22.04
- ROS 2 Humble
- Webots R2025a
- Gazebo Classic
- colcon build tool

Install ROS 2 control dependencies:
```bash
sudo apt install ros-humble-ros2-control ros-humble-ros2-controllers
```
### ONNX Runtime (for RL inference)
```bash
wget https://github.com/microsoft/onnxruntime/releases/download/v1.10.0/onnxruntime-linux-x64-1.10.0.tgz
tar xvf onnxruntime-linux-x64-1.10.0.tgz
sudo cp -a onnxruntime-linux-x64-1.10.0/include/* /usr/include
sudo cp -a onnxruntime-linux-x64-1.10.0/lib/* /usr/lib
```
### Simulation Dependencies (Install as needed)
Webots
```bash
sudo apt install ros-humble-webots-ros2 ros-humble-webots-ros2-control
```
Gazebo
```bash
sudo apt install ros-humble-gazebo-ros ros-humble-gazebo-ros2-control
```
Mujoco

Requires additional DeepMind Mujoco installation (refer to [this repository](https://github.com/DDTRobot/ddt_ros2_control)).



## Building the Control System

The following steps apply to all simulation and hardware execution scenarios.

### Create Workspace
```bash
mkdir -p ~/d1_ws/src
```
Place the code into `src`, then run:

## Simulation Execution
### webots
Supported terrains:
- empty_world
- stairs
- uneven
Launch example:
```bash
ros2 launch rl_controller sim_webots.launch.py robot:=d1 terrain:=empty_world
```
### Gazebo
```bash
ros2 launch rl_controller sim_gazebo.launch.py robot:=d1h
```
### Mujoco

To simulate the D1:

- Copy D1H mesh into the D1 model
- Enable mesh building in `d1_description`

Rebuild the model description packages, then run:
```bash
ros2 launch rl_controller sim_mujoco.launch.py robot:=d1
```

## Hardware Execution

### Install Dependencies & Build
```bash
sudo apt install python3-colcon-common-extensions
colcon build --symlink-install --packages-up-to rl_controller hardware_bridge
```
### Stop default system services
```bash
sudo systemctl stop joy_controller.service
sudo systemctl stop rl8_controller.service
sudo systemctl stop rl16_controller.service
```
### Start hardware controller
```bash
ros2 launch rl_controller hw.launch.py robot:=d1
```
## Interaction Control

### Keyboard Control
```bash
ros2 run keyboard_controller keyboard_controller_node
```
### Remote Control (ELRS)
```bash
ros2 launch teleop_command teleop_command.launch.py
```
## Controller Configuration

Controller configuration file:
```bash
controller/rl_controller/config/<robot>/controllers.yaml
```
Example ONNX models:

- D1：```bash flat.onnx ```, ```bash stairs.onnx```
- TITA：```bash stand.onnx```

When updating control strategies, remember to update:

- controllers.yaml
- model path

## Finite State Machine Structure

The RL controller's FSM implementation is located in:
```bash
rl_controller/fsm/
```
This folder contains state definitions, transition logic, and action generation.

## FAQ

- **Webots not found**: Ensure installation path is in the environment variables, e.g.
```bash export WEBOTS_HOME=/usr/lib/webots```
- **Mujoco not found**: Ensure `mujoco` is installed and `MUJOCO_DIR` is correctly set.
- **Controller cannot load**: Check `controller_manager` logs and `controllers.yaml`.
- **Model description load failure**: Ensure
  - `robot:=<name>` is correct
  - corresponding `*_description` packages exist and are accessible.