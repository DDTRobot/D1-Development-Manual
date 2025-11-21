<!--
 * @Author: blank1 448913821@qq.com
 * @Date: 2025-11-21 11:07:34
 * @LastEditors: blank1 448913821@qq.com
 * @LastEditTime: 2025-11-21 14:11:23
 * @FilePath: \D1-Development-Manual\pages\Quick_Start.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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

需将用户自备一根USB type-c 线束，插入距离网口最近的type-c口，（详细说明请查看产品使用说明书）。用户电脑与D1机器人通讯的网卡在192.168.42.xxx网段下，自动分配ip,无需配置。

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
robot@tita:~$ ros2 topic list 
/d13043495/battery_info_broadcaster/battery/battery1 # 主机电池信息
/d13043495/battery_info_broadcaster/battery/battery2 # 从机电池信息
/d13043495/battery_info_broadcaster/transition_event
/d13043495/body/fsm_mode # 本体状态机
/d13043495/body/motors_status # 电机状态
/d13043495/command/cmd_key # 控制指令，状态机切换
/d13043495/command/cmd_pose # 控制指令，位姿
/d13043495/command/cmd_twist # 控制指令，速度
/d13043495/dynamic_joint_states
/d13043495/imu_sensor_broadcaster/imu # imu状态
/d13043495/imu_sensor_broadcaster/transition_event
/d13043495/joint_state_broadcaster/transition_event
/d13043495/joint_states # 关节信息 位置速度力据
/d13043495/joy # 遥控器stick值相关
/d13043495/robot_description 
/d13043495/y1v0h_rl_controller/transition_event
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

```
### 上层command_sdk 接口
`08 SDK Mode` 带 `*`后遥控器不发送command话题，可由用户发送话题来控制机器，目前话题名称如下：
1. `command/cmd_key`
2. Topic type: `std_msgs/msg/String`
<br>机器人状态机切换：状态机包含以下：`transform_up` `idle` `transforn_down` `loco` `joint_pd` `car`
`rl_1` `rl_2` `rl_3`

示例：
```bash
source /opt/d1_ros2/namespace.sh

# 站立     
ros2 topic pub -1 /$ROBOT_NS/command/manager/cmd_key std_msgs/msg/String "data: 'transform_up'"     

# 趴下     
ros2 topic pub -1 /$ROBOT_NS/command/manager/cmd_key std_msgs/msg/String "data: 'transform_down'"    
 
# 平地   
ros2 topic pub -1 /$ROBOT_NS/command/manager/cmd_key std_msgs/msg/String "data: 'loco'"
       
# 策略1
ros2 topic pub -1 /$ROBOT_NS/command/manager/cmd_key std_msgs/msg/String "data: 'rl_1'"          

...     

```


3. `command/cmd_pose` 
Topic type: geometry_msgs/msg/PoseStamped
机器人头部位置姿态控制指令，目前仅仅为pitch（双轮足loco状态下）

```bash 
source /opt/d1_ros2/namespace.sh
ros2 topic pub -1 /$ROBOT_NS/command/manager/cmd_pose geometry_msgs/msg/PoseStamped "{         
    header: {             
        stamp: {                 
            sec: 0,   
            nanosec: 0}, 
        frame_id: 'world'
        },          
    pose: {             
        position: {x: 0.0, y: 0.0, z: 0.0}, # only valid in z，range in 0.1 to 0.3    
        orientation: {x: 0.0, y: 0.171, z: 0.0, w: 0.985}
        }
}"   

```
说明：通过四元数控制机器人头部姿态，目前仅双轮足loco状态下有效。



4. `command/cmd_twist` 

Topic type: `geometry_msgs/msg/Twist`

机器人速度控制指令,包括linear, angular等, 仅和angular.z有效
```bash
source /opt/d1_ros2/namespace.sh
ros2 topic pub -1 /$ROBOT_NS/command/manager/cmd_twist geometry_msgs/msg/Twist "{         linear: {x: 0.2, y: 0.0, z: 0.0},          
    angular: {x: 0.0, y: 0.0, z: 0.0}}"    

```
说明：取值范围`linear.x`：-3.0 to 3.0、`angular.z`：-0.5 to 0.5



