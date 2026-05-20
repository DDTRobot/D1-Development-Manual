# 快速开始
```{toctree}
:maxdepth: 1
:glob:
```
------


## 环境依赖 

### 系统环境

推荐在Ubuntu 22.04 系统，ros2 humble 版本 下进行开发调试，支持在D1 内置电脑上进行开发，也可以在D1 外接电脑进行开发。

### 网络环境

需将用户自备一根USB type-c 线束，插入距离网口最近的type-c口，输入以下信息，即可进入机器人系统

```Bash
ssh robot@192.168.42.1
#密码 ： ddt
```

详细说明请查看产品使用说明书，用户电脑与D1机器人通讯的网卡在192.168.42.xxx网段下，自动分配ip，无需配置。

```{warning}
1、 使用windows系统的用户在USB type-c 线束后，无法识别 usb 网卡，因为缺少相关驱动，请自行安装:https://milkv.io/zh/docs/duo/getting-started/setup#
2、 禁止使用使用刷机线进行调试，以免误操作，使系统进入刷机模式，系统无法正常启动。
```
#### wifi热点连接
在下载ros 包和其他依赖时，需要将机器人连接网络，能正常联网，操作如下：
```bash
1.首先 `sudo vim /etc/wpa_supplicant/wpa_supplicant-nl80211-wlan0.conf`
2.修改图中，ssid= "WIFI name"; psk="PassWord"
3.修改完后 重启系统
```
例子如图：
![wifi_connect](../_static/flash8.jpeg)

#### wifi ap热点模式
详细参见[wifi热点模式](TITA-wifi_app.md)


### 网口配置
此配置针对想通过网口网线外接电脑与D1机器人进行数据交互。
```bash
sudo apt update
sudo apt install network-manager
```
下载配置文件：
```bash
sudo apt-get install git  #如果没有安装git，请先安装
git clone https://github.com/DDTRobot/TowerNetworkManager.git
```
安装：
```bash
cd TowerNetworkManager/
chmod 777 install.sh
sudo ./install.sh
sudo rm -rf /etc/wpa_supplicant/wpa_supplicant-nl80211-wlan0.conf #删除原有wifi配置文件,以免影响网络连接,后续联网使用 sudo nmcli device wifi connect "example" password "1111111" 方式连接
```
完成以上步骤后，通过ifconfig能看到eth0自动分配IP 192.168.19.97，外部设备会被自动分配 192.168.19.xx 网段的ip。


### 安装编译工具

在D1内置系统开发编译工具`colcon build `安装：
```bash 
sudo apt update
sudo apt-get install python3-colcon-common-extensions
```
遇到无法安装`python3-colcon-common-extensions`需要配置以下内容

``````
创建或编辑一个配置文件：
```
sudo vim /etc/apt/apt.conf.d/99insecure
```
添加以下内容：
```
Acquire::AllowInsecureRepositories "true";
Acquire::AllowDowngradeToInsecureRepositories "true";
```
然后再次运行`sudo apt update`。
``````

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