# 硬件配对与连接



## 遥控器配对方法一

```{note}
对于较旧的系统版本，使用 `sudo apt install crsf-app` 安装遥控器配对软件
```

1. 使用`sudo dpkg -i crsf-app`（如果已经包含或已安装，请跳过此步骤。）
```bash
#如果没有安装 `crsf-app` 可以通过以下指令
sudo apt update
sudo apt-get install crsf-app
```
2. 执行指令`crsf-app -bind`，可以观察到返回：
![f9](../_static/flash9.jpg) 
<br> 
3. 遥控器开机后 右边按键向左推进入界面后 按键依次进入Tools ->ExpressLRS-> bind模式，进行配对接收机.
 ![controller2](../_static/controller2.JPEG)
  ![controller3](../_static/controller3.JPEG) 
  <br>
4. 配对完成返回pair success
![controller4](../_static/controller4.jpg) 
---
 <br> <br>  


## 遥控器配对方法二
1. 机器人保持开机状态，将数据线连接到原理网口的type-c口以及遥控器（如下图所示）
![remote_switch1](../_static/typec_connect.png)
遥控器和机器人连接后，遥控器会出现`Select mode`的界面，并选择第三个选项`USB Serial`
![remote_switch1](../_static/usb_serial.png)
2. 等待遥控器的蓝灯慢闪或常亮后，即完成配对
## 远程急停开关配对

1. 打开机器人遥控器页面一，选择04 Key Pair按下

<img src="../_static/menu1.png"/>

2. 听到蜂鸣器响后，按下远程开关的3键即可（可重复按）

![remote_switch4](../_static/remote_switch5.png)

