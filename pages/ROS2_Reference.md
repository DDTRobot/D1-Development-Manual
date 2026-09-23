# ROS 2 interface reference

Use ROS 2 topics, services, and parameters to access D1's control functions. First-time users should complete [connection and status checks](Quick_Start.md). This page does not document the low-level CAN FD SDK.

```{admonition} Hardware control
:class: warning
This page includes examples that move the robot. Before running them, verify the robot configuration, namespace, and delivered software version, and follow the operating conditions in the product safety instructions. Motion examples are not required for read-only verification.
```

## ROS2 SDK

`D1_sdk_ros2` packages high-level logic into ROS 2 nodes and exposes ROS 2 APIs. Users send commands through ROS 2 topics to control the robot.

List ROS topics:

```bash
robot@d1:~$ ros2 topic list
/d13007137/command/cmd_key # Control commands and state-machine switching
/d13007137/command/cmd_pose # Pose commands
/d13007137/command/cmd_twist # Velocity commands
/d13007137/command/joint_command # Velocity commands
/d13007137/d1_rl_controller/transition_event
/d13007137/d1h_rl_controller/transition_event
/d13007137/dynamic_joint_states
/d13007137/imu_sensor_broadcaster/imu # IMU state
/d13007137/imu_sensor_broadcaster/transition_event
/d13007137/joint_state_broadcaster/transition_event
/d13007137/joint_states # Joint position, velocity, and torque
/d13007137/joy # Remote controller stick values
/d13007137/rl_controller/fsm # RL controller state machine
/d13007137/rl_controller/joint_command # Actual RL controller output: kp kd p v t
/d13007137/robot_description
/d13007137/system_status_broadcaster/battery1 # Main-unit battery information
/d13007137/system_status_broadcaster/battery2 # Secondary-unit battery information
/d13007137/system_status_broadcaster/dock # Docking mechanism status
/d13007137/system_status_broadcaster/motors_status # Motor status
/d13007137/system_status_broadcaster/transition_event
/parameter_events
/rosout
/tf
/tf_static
```

If these topics are missing, append the following to `~/.bashrc`, run `source ~/.bashrc`, and list the topics again:

```bash
export ROS_LOCALHOST_ONLY=1
export ROS_DOMAIN_ID=42
source /opt/ros/humble/setup.bash
source /opt/d1_ros2/setup.bash
```

(api-controller-state)=
### Get the quadruped / biped controller status

1. Query the current configuration:

   ```bash
   source /opt/d1_ros2/namespace.sh
   ros2 service call /$ROBOT_NS/command/get_controller_status std_srvs/srv/Trigger
   # requester: making request: std_srvs.srv.Trigger_Request()

   # response:
   # std_srvs.srv.Trigger_Response(success=True, message='biped') # 'quadruped' indicates quadruped mode
   ```

2. Set the configuration:

   ```bash
   source /opt/d1_ros2/namespace.sh
   ros2 service call /$ROBOT_NS/command/set_controller_status std_srvs/srv/SetBool data:\ false # true: quadruped; false: biped
   # requester: making request: std_srvs.srv.SetBool_Request(data=False)

   # response:
   # std_srvs.srv.SetBool_Response(success=True, message='biped')
   ```

(api-command)=
### Upper-level command_sdk interface

When `08 SDK Mode` is marked with an asterisk, the remote controller stops publishing command topics. You can then publish topics to switch the robot's state machine and control its velocity.

**Example repository:** [D1-ROS2-SDK-Demo](https://github.com/DDTRobot/D1-ROS2-SDK-Demo.git)

**1. Switch SDK mode**

```bash
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
# Enable SDK mode
ros2 param set /$ROBOT_NS/teleop_command use_sdk true
# Disable SDK mode
ros2 param set /$ROBOT_NS/teleop_command use_sdk false
```

**2. `command/user_command`**

This topic combines state-machine switching, velocity control, and pose control.

**State-machine switching:** Available states include `transform_up`, `transform_down`, `loco`, `joint_pd`, `car`, `rl_1`, `rl_2`, `rl_3`, and `jump`.

- In biped-wheeled mode, the basic transitions include `transform_up`, `transform_down`, `car`, and `loco`. After `transform_down`, the robot automatically enters `idle`.
- In quadruped mode, the basic transitions include `transform_up`, `transform_down`, and `loco`. After `transform_down`, the robot automatically enters `idle`.

Examples:

```bash
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
# Stand up
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{
    fsm_mode : 'transform_up'
}"
# Lie down
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{
    fsm_mode : 'transform_down'
}"
# Flat-ground locomotion
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{
    fsm_mode : 'loco'
}"
# Policy 1
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{
    fsm_mode : 'rl_1'
}"
```

**Velocity control**

```bash
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{
    header: 'auto',
    twist: { linear: { x: 0.0, y: 0.0, z: 0.0 }, angular: { x: 0.0, y: 0.0, z: 0.5 } }
}"
```

The robot rotates in place at a constant speed. Actual maximum speed is determined by the internal controller; the values here are command-input limits. For quadruped mode, `lin_vel_x` is limited to 3.0 m/s and `max_twist_angular` to 6.0 rad/s.

**Pose control**

```bash
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{
    header: 'auto',
    pose: {
        position: {x: 0.0, y: 0.0, z: 0.0}, # Not currently controllable
        orientation: {x: 0.0, y: 0.171, z: 0.0, w: 0.985}
        }
}"
```

The robot's head should pitch down. The command-input limits are:

```yaml
max_roll: 0.2
max_pitch: 0.4
```

**Controller state feedback**

```bash
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
ros2 topic echo /$ROBOT_NS/rl_controller/fsm
---
data: idle
---
```

This feedback reports the robot's current controller state.

**Joint control**

To use the joint-control interface, first put the controller into the `debug` state:

```bash
source /opt/d1_ros2/namespace.sh
source /opt/d1_ros2/setup.bash
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{
    fsm_mode : 'debug'
}"
```

![Joint control in debug mode](../_static/joint_contrl_topic.png)

```bash
source /opt/d1_ros2/namespace.sh
source /opt/d1_ros2/setup.bash
ros2 topic pub /$ROBOT_NS/command/joint_command ddt_msgs/msg/JointControlCommand   "{
    header: 'auto',
    name: ['FL_foot_joint'],
    kp: [0.0],
    kd: [0.5],
    position: [0.0],
    velocity: [1.0],
    effort: [0.0]
  }" --rate 10
```

The left-leg wheel should rotate. Press `Ctrl+C` to stop it.
