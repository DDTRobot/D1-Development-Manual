# 硬件配对与连接

## 遥控器配对方法一

```{note}
对于较旧的系统版本，使用 `sudo apt install crsf-app` 安装遥控器配对软件。
```

1. 使用 `sudo dpkg -i crsf-app` 安装配对软件（如果系统已包含或已安装，请跳过此步骤）。

   如果尚未安装 `crsf-app`，也可以通过以下指令安装：

   ```bash
   sudo apt update
   sudo apt-get install crsf-app
   ```

2. 执行配对指令，观察返回信息：

   ```bash
   crsf-app -bind
   ```

   ![执行配对指令后的返回信息](../_static/flash9.jpg)

3. 遥控器开机后，将右边按键向左推进入界面，再依次选择 `Tools` → `ExpressLRS` → `bind`，配对接收机。

   ![遥控器 Tools 菜单](../_static/controller2.JPEG)

   ![ExpressLRS 配对界面](../_static/controller3.JPEG)

4. 配对完成后，返回 `pair success`。

   ![遥控器配对成功提示](../_static/controller4.jpg)

## 遥控器配对方法二

1. 保持机器人开机，将数据线连接到图示 USB-C 接口和遥控器。

   ![机器人与遥控器的 USB-C 连接位置](../_static/typec_connect.png)

   连接后，遥控器会出现 `Select mode` 界面，选择第三个选项 `USB Serial`。

   ![遥控器 USB Serial 选项](../_static/usb_serial.png)

2. 等待遥控器的蓝灯慢闪或常亮后，即完成配对。

## 远程急停开关配对

1. 打开机器人遥控器页面一，选择 `04 Key Pair` 并按下。

   <img src="../_static/menu1.png" alt="遥控器页面一中的 Key Pair 选项" width="448">

2. 听到蜂鸣器响后，按下远程开关的 `3` 键即可（可重复按）。

   ![远程急停开关按键说明](../_static/remote_switch5.png)
