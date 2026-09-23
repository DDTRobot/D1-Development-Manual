# Low-level SDK (C++ / CAN FD)

## SDK Overview

This chapter covers low-level C++ development: joint control and interfaces for reading battery, IMU, and joint state. Hardware communication uses CAN FD. This is a separate development path from applications built with ROS 2 topics and services.

To use the robot's high-level control functions, start with [Quick Start](Quick_Start.md) and the [ROS 2 interface reference](ROS2_Reference.md).

```{admonition} Check the SDK version
:class: important
The C++ function signatures below are retained from the original manual. The linked `compress_v1` examples use `canfd_api` / `CanfdApi`, which differ from some interface names on this page. Refer to the headers and examples delivered with your SDK, and do not mix APIs from different versions or wrapper layers.
```

### System Architecture Diagram

```{raw} html
<details class="architecture-details">
  <summary>View the ROS 2 control layer and CAN FD communication path</summary>
  <a class="image-reference" href="../_static/D1_Uint.png"><img src="../_static/D1_Uint.png" alt="D1 architecture: command management, ROS 2 control, CAN message bridging, and MCU" width="768" height="843" loading="lazy"></a>
</details>
```

------


## Lower-Level Control Example

### Application Example

This example shows how to use the `tita_robot` package to control robot joints and read information such as battery state. It is intended for physical hardware only. Read `readme.md` carefully before use.

Reference: [CAN FD low-level interface examples (compress_v1)](https://github.com/DDTRobot/ddt_ros2_control/tree/compress_v1/hardware/examples). Refer to that version's README for operating requirements and precautions.

### Motion Control Interfaces
(1) Set motor torque
```cpp
 /**
     * @brief Set the target joint feed-forward torques.
     * @param t the target joint feed-forward torques.
     * @return return true if the target is set successfully.
     */
  bool set_target_joint_t(const std::vector<double> & t);
```

(2) Set MIT PD control
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

## Data Reading Interfaces

### Battery Status Query Interfaces
Used to obtain real-time battery parameters for power management and low-battery warnings.

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

### Robot Core State Interfaces
These interfaces provide essential data for motion control and state estimation, covering IMU, motor, and joint modules.

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
