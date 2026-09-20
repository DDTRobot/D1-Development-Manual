# ROS 2 接口参考

通过 ROS 2 话题、服务与参数调用 D1 的控制能力。第一次使用请先完成[连接与状态读取](Quick_Start.md)。本页不是底层 CAN FD SDK 的接口说明。

```{admonition} 实机控制
:class: warning
本页包含会使机器人运动的示例。执行前请核对机器人构型、命名空间和交付版本，并按产品安全说明确认操作条件。只读验证不需要执行运动示例。
```

## ROS2 SDK

D1_sdk_ros2 是基于ROS2开发，将高层逻辑封装成ROS2节点，提供ROS2 API给用户使用，用户通过ROS2 topic 发送指令给机器人，完成机器人控制。

查看ros话题
```bash 
robot@d1:~$ ros2 topic list 
/d13007137/command/cmd_key # 控制指令，状态机切换
/d13007137/command/cmd_pose # 控制指令，位姿
/d13007137/command/cmd_twist # 控制指令，速度
/d13007137/command/joint_command # 控制指令，速度
/d13007137/d1_rl_controller/transition_event
/d13007137/d1h_rl_controller/transition_event
/d13007137/dynamic_joint_states
/d13007137/imu_sensor_broadcaster/imu # imu状态
/d13007137/imu_sensor_broadcaster/transition_event
/d13007137/joint_state_broadcaster/transition_event
/d13007137/joint_states # 关节信息 位置速度力据
/d13007137/joy # 遥控器stick值相关
/d13007137/rl_controller/fsm # rl控制器状态机
/d13007137/rl_controller/joint_command # rl控制器实际输出：kp kd p v t 
/d13007137/robot_description
/d13007137/system_status_broadcaster/battery1 # 主机电池信息
/d13007137/system_status_broadcaster/battery2 # 从机电池信息
/d13007137/system_status_broadcaster/dock # 拼接机构状态
/d13007137/system_status_broadcaster/motors_status # 电机状态
/d13007137/system_status_broadcaster/transition_event
/parameter_events
/rosout
/tf
/tf_static
```
如果没有，将下文添加在~/.bashrc结尾后执行source ~/.bashrc再输入查看ros话题命令
```bash 
export ROS_LOCALHOST_ONLY=1
export ROS_DOMAIN_ID=42
source /opt/ros/humble/setup.bash
source /opt/d1_ros2/setup.bash

```

(api-controller-state)=
### 获取四足控制器/双足控制器状态
1. 获取状态
```bash
source /opt/d1_ros2/namespace.sh
ros2 service call /$ROBOT_NS/command/get_controller_status std_srvs/srv/Trigger 
# requester: making request: std_srvs.srv.Trigger_Request()

# response:
# std_srvs.srv.Trigger_Response(success=True, message='biped') # quadruped代表四足
```
2. 设置状态

```bash
source /opt/d1_ros2/namespace.sh
ros2 service call /$ROBOT_NS/command/set_controller_status std_srvs/srv/SetBool data:\ false # true 代表四足， false 代表双足
# requester: making request: std_srvs.srv.SetBool_Request(data=False)

# response:
# std_srvs.srv.SetBool_Response(success=True, message='biped')
```

(api-command)=
### 上层command_sdk 接口
`08 SDK Mode`带*后遥控不发送command话题，可由用户发送话题来控制机器状态机切换，速度控制。

**例程参考:** `https://github.com/DDTRobot/D1-ROS2-SDK-Demo.git`

1. 切换sdk模式
```bash
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
# 开启sdk模式
ros2 param set /$ROBOT_NS/teleop_command use_sdk true
# 关闭sdk模式
ros2 param set /$ROBOT_NS/teleop_command use_sdk false
```
2. `command/user_command`
使用一个话题来进行机器人状态机切换，速度控制，位姿控制
- 机器人状态机切换：状态机包含以下: `transform_up`,`transform_down`,`loco`,`joint_pd`,`car`,`rl_1`,`rl_2`,`rl_3`,`jump`

**说明：**
1、双轮足的状态切换，包含以下：`transform_up` `transform_down`、`car`、` loco`,而`idle`是空闲状态，`transform_down`之后，自动转入`idle`状态。
2、四轮足的状态切换，包含以下：`transform_up`、`transform_down`、` loco`,而`idle`是空闲状态，`transform_down`之后，自动转入`idle`状态。

示例：
```bash
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
# 站立      
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{         
    fsm_mode : 'transform_up'
}" 
# 趴下      
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{         
    fsm_mode : 'transform_down'
}"   
# 平地   
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{         
    fsm_mode : 'loco'
}"    
# 策略1
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{         
    fsm_mode : 'rl_1'
}"   
  
```

- 速度控制
```
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{
    header: 'auto',      
    twist: { linear: { x: 0.0, y: 0.0, z: 0.0 }, angular: { x: 0.0, y: 0.0, z: 0.5 } }
}"

```
此时机器以一定的恒速自转。
实际最大速度由内部控制器决定,此处为指令输入最大限制。以四足为例:lin_vel_x为3.0(m/s)、max_twist_angular: 6.0(rad/s)


- 位姿控制
```
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{ 
    header: 'auto',            
    pose: {             
        position: {x: 0.0, y: 0.0, z: 0.0}, # 暂时不可控   
        orientation: {x: 0.0, y: 0.171, z: 0.0, w: 0.985}
        }
}" 
```   
此时头部应该低下一定角度。
此处指令输入最大限制：
```bash 
max_roll: 0.2
max_pitch: 0.4
```

- 控制器状态反馈
```
source /opt/d1_ros2/setup.bash
source /opt/d1_ros2/namespace.sh
ros2 topic echo /$ROBOT_NS/rl_controller/fsm 
---
data: idle
---

```
说明：控制器状态反馈主要用于反馈机器人当前状态

5. 关节控制

新增关节控制接口，控制器进入到`debug`状态，先发送
```bash
source /opt/d1_ros2/namespace.sh
source /opt/d1_ros2/setup.bash
ros2 topic pub /$ROBOT_NS/command/user_command ddt_msgs/msg/UserCommand "{         
    fsm_mode : 'debug'
}"   
```
此时:
![joint_control_topic](.././_static/joint_contrl_topic.png)

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
此时可以发现左腿轮子在旋转，Ctrl+c后停止旋转
