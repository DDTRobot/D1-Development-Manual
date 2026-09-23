(ros-2)=
(quick-start)=

# Quick Start

Connect to D1 and read your first status message. This page runs ROS 2 commands on the robot's onboard computer over SSH and **does not send motion commands**.

```{note}
This page is for ROS 2 application development. For C++ joint control or CAN FD communication, see the [low-level SDK](SDK_Development.md).
```

(start-environment)=

## Before you start

- **Robot environment:** Ubuntu 22.04 and ROS 2 Humble are recommended for development and debugging.
- **Connection:** Connect your development computer to the robot via USB Type-C, then use SSH.
- **Safety:** Read the product instructions and confirm how to perform an emergency stop. Keep the first verification read-only.

```{warning}
Use the USB Type-C port closest to the Ethernet port. Do not use the flashing cable for debugging, as this may put the system into flashing mode. If Windows does not recognize the USB network adapter, see [Environment & network](Environment.md) for driver setup.
```

(connect-robot)=

## Connect to the robot

Run this in a terminal on your **development computer**:

```bash
ssh robot@192.168.42.1
```

The original manual lists `ddt` as the initial password. If it was changed before delivery, use the actual password. After logging in, run all subsequent commands in **this SSH session**.

```{tip}
Need Wi-Fi or Ethernet? See [Environment & network](Environment.md). This page uses USB networking for a minimal check without changing the existing network configuration.
```

(load-environment)=

## Load the ROS 2 environment

Run this in the **robot's terminal**:

```bash
source /opt/ros/humble/setup.bash
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
export ROS_LOCALHOST_ONLY=1
export ROS_DOMAIN_ID=42
```

These settings retain the original manual's local-only communication configuration. **They are not suitable for discovering ROS 2 nodes directly across the network from your development computer.**

Check the robot's namespace:

```bash
printf '%s\n' "$ROBOT_NS"
```

The output should be the device's namespace, not a blank line. Subsequent commands use `$ROBOT_NS`; do not copy another robot's serial number.

(read-status)=

## Read status

List the currently visible topics:

```bash
ros2 topic list
```

Find `/<your_namespace>/joint_states` in the list, then read the joint feedback:

```bash
ros2 topic echo /$ROBOT_NS/joint_states
```

A continuous stream of joint-state messages confirms that this status-reading path is working. Press **Ctrl+C** to stop reading; this does not send motion commands.

(query-controller)=

## Query the controller configuration

This service only queries the state; it does not switch controllers:

```bash
ros2 service call /$ROBOT_NS/command/get_controller_status std_srvs/srv/Trigger
```

In the original manual, `biped` indicates the biped-wheeled configuration and `quadruped` indicates the quadruped configuration. Refer to the actual response from your device.

```{tip}
You have completed connection, environment setup, and read-only status checks. Next, choose the interface documentation for your task; there is no need to read every control parameter first.
```

(start-troubleshooting)=

## Not seeing the expected results?

| Symptom | Check first |
| --- | --- |
| SSH cannot connect | Type-C port, network-adapter driver, and USB network connection |
| `ros2` command not found | Whether you are in the robot's SSH session and have loaded the ROS 2 environment |
| Empty namespace | Whether the delivered system provides `namespace.sh` and whether it was sourced correctly |
| No topics or messages | Environment variables, device service status, and the delivered system image version |

For more connection settings, see [Environment & network](Environment.md). For hardware issues, see the [FAQ](FAQ.md).

(next-steps)=

## Next steps

- [ROS 2 interface reference](ROS2_Reference.md): Controller queries, state switching, and velocity and joint control examples.
- [Simulation & deployment](sim2sim_sim2real.md): Understand the simulation workflow before developing on hardware.
- [Policy & parameter tuning](Control_Tuning.md): Policy replacement, LQR parameters, and controller configuration.
- [Low-level SDK (C++ / CAN FD)](SDK_Development.md): An alternative development path; refer to the SDK version delivered with your robot.
