# 底层 SDK（C++ / CAN FD）

## SDK 概述

本章面向底层 C++ 开发，介绍关节控制与电池、IMU、关节状态读取接口。硬件通信链路采用 CAN FD，这与通过 ROS 2 话题、服务进行应用开发是不同的入口。

如果你希望调用机器人的上层控制能力，请先阅读[快速开始](Quick_Start.md)与[ROS 2 接口参考](ROS2_Reference.md)。

```{admonition} 核对 SDK 版本
:class: important
以下保留原手册中的 C++ 函数签名。链接的 `compress_v1` 示例仓库使用 `canfd_api` / `CanfdApi`，与本文部分接口命名不同。请以交付 SDK 的头文件及对应示例为准，不要混用不同版本或封装层的 API。
```

### 系统架构图

```{raw} html
<details class="architecture-details">
  <summary>查看 ROS 2 控制层与 CAN FD 通信链路</summary>
  <a class="image-reference" href="../_static/D1_Uint.png"><img src="../_static/D1_Uint.png" alt="D1 系统架构：指令管理、ROS 2 控制、CAN 消息桥接与 MCU" width="768" height="843" loading="lazy"></a>
</details>
```

------


## 下层控制示例

### 应用示例

这是一个关于如何使用 tita_robot 包来控制机器人关节并获取电池信息等示例。仅在真机上使用，同时请认真读readme.md 文档。
参考示例：[CAN FD 底层接口示例（compress_v1）](https://github.com/DDTRobot/ddt_ros2_control/tree/compress_v1/hardware/examples)。运行条件与注意事项请以该版本 README 为准。
### 运动控制接口
（1） 设置电机力矩
```cpp
 /**
     * @brief Set the target joint feed-forward torques.
     * @param t the target joint feed-forward torques.
     * @return return true if the target is set successfully.
     */
  bool set_target_joint_t(const std::vector<double> & t);
```

（2）设置电机PD控制
```cpp
  /**
     * @brief MIT control method. Set the target joint positions, velocities, kp, kd and feed-forward torques of the
     motors.
     * @param q the target joint positions in radians.
     * @param v the target joint velocities in radians per second.
     * @param kp the target joint proportional gains.
     * @param kd the target joint derivative gains.
     * @param t the target joint feed-forward torques.
     *
     * @return return true if the target is set successfully
     */
  bool set_target_joint_mit(
    const std::vector<double> & q, const std::vector<double> & v, const std::vector<double> & kp,
    const std::vector<double> & kd, const std::vector<double> & t);
```

------

## 数据读取接口


### 电池状态查询接口
用于实时获取机器人电池的各项关键参数，支撑电量管理、低电量预警等功能。

```cpp
  /**
     * @brief Get the current battery is connected.
     * @param index: the index of battery.
     * @return bool: if battery is connected, return true.
     */
  bool get_battery_is_connected(int index) const;
  /**
     * @brief Get the current battery voltage.
     * @param index: the index of battery.
     * @return float: current battery voltage in volts.
     */
  float get_battery_voltage(int index) const;
  /**
     * @brief Get the current battery temperature.
     * @param index: the index of battery.
     * @return float: current battery temperature in degrees Celsius.
     */
  float get_battery_temperature(int index) const;
  /**
     * @brief Get the current battery current.
     * @param index: the index of battery.
     * @return float: current battery current in amperes.
     */
  float get_battery_current(int index) const;
  /**
     * @brief Get the current battery percentage.
     * @param index: the index of battery.
     * @return float: current battery percentage in percent.
     */
  float get_battery_percentage(int index) const;
  /**
     * @brief Get the current battery cell voltage.
     * @param index: the index of battery.
     * @return std::vector<float>: current battery cell voltage in volts.
     */
  std::vector<float> get_battery_cell_voltage(int index) const;
```

### 机器人核心状态获取接口
用于获取机器人运动控制、姿态感知的关键数据，为运动规划、姿态调整提供基础，涵盖 IMU（惯性测量单元）、电机、关节三大模块：

```cpp
/**
     * @brief Get the current states update timeout.
     * @return bool: if current states not update, return true.
     */
  bool imu_data_timeout() const;
  /**
     * @brief Get the current states update timeout.
     * @return bool: if current states not update, return true.
     */
  bool motors_data_timeout() const;
  /**
     * @brief Get the current joint positions in joint space.
     * @return std::vector<double>: current joint positions in radians.
     */
  std::vector<double> get_joint_q() const;

  /**
     * @brief Get the current joint velocities in joint space.
     * @return std::vector<double>: current joint velocities in radians per second.
     */
  std::vector<double> get_joint_v() const;

  /**
     * @brief Get the current joint torques in joint space.
     * @return std::vector<double>: current joint torques in Newton meters.
     */
  std::vector<double> get_joint_t() const;

  /**
     * @brief Get the current joint status.
     * @note Joints status now is in bool value, true means the joint is online(TODO).
     * @return std::vector<uint16_t>: current joint status.
     */
  std::vector<uint16_t> get_joint_status() const;
  /**
     * @brief Get the current imu quaternion of mcu.
     * @note Quaternion sequence is x y z w.
     * @return std::array<double, 4>: current quaternion.
     */
  std::array<double, 4> get_imu_quaternion() const;  // x y z w

  /**
     * @brief Get the current imu acceleration of mcu.
     * @return std::array<double, 3>: current acceleration.
     */
  std::array<double, 3> get_imu_acceleration() const;

  /**
     * @brief Get the current imu angular velocity of mcu.
     * @return std::array<double, 3>: current angular velocity.
     */
  std::array<double, 3> get_imu_angular_velocity() const;

  /**
     * @brief Set the target joint feed-forward torques.
     * @param t the target joint feed-forward torques.
     * @return return true if the target is set successfully.
     */
  bool set_target_joint_t(const std::vector<double> & t);

  /**
     * @brief MIT control method. Set the target joint positions, velocities, kp, kd and feed-forward torques of the
     motors.
     * @param q the target joint positions in radians.
     * @param v the target joint velocities in radians per second.
     * @param kp the target joint proportional gains.
     * @param kd the target joint derivative gains.
     * @param t the target joint feed-forward torques.
     *
     * @return return true if the target is set successfully
     */
  bool set_target_joint_mit(
    const std::vector<double> & q, const std::vector<double> & v, const std::vector<double> & kp,
    const std::vector<double> & kd, const std::vector<double> & t);
    
```
