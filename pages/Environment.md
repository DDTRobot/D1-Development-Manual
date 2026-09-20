# 环境与网络

本页保留网络配置与编译环境说明。首次连接建议先完成[快速开始](Quick_Start.md)，按需进行本页配置。

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
