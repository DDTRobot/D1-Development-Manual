
# 求之airbot 机械臂在d1 上的控制指南

```{toctree}
:maxdepth: 1
:glob:
```

## 环境部署

```bash
git clone https://github.com/DDTRobot/airbot-environment-deployment.git
cd airbot-environment-deployment
bash install.sh
```

## 运行

打开机械臂服务(首次需要联网登录)
```bash
sudo airbot_server -i can1 -p 50000
```

键盘控制机械臂
```bash
python3 -m airbot_examples.task_kbd_ctrl -p 50000
```
手柄控制机械臂(注意修改--namespace参数，参考ros2 topic list的namespace)
```bash
cd airbot-environment-deployment
python3 airbot_joy_D1.py --namespace d13042528 --port 50000
```

<img src="../_static/1.png" alt="演示" width="400">




Channel 1:右侧摇杆左右

Channel 2:右侧摇杆前后

Channel 3:左侧摇杆前后

Channel 4:左侧摇杆左右

Channel 5:左侧按键

Channel 6:左侧三级按键

Channel 7:右侧按键

Channel 8:右侧三级按键


按钮：

左侧按键：

按键按下控制进入笛卡尔速度模式

按键弹起控制进入关节控制模式

左侧三级按键：

笛卡尔速度模式下，与chanel 4组合控制为绕x轴、绕y轴或者绕z轴旋转；

关节控制模式下，与chanel 1和chanel 2 组合控制为1-2关节、3-4关节或者5-6关节运动

右侧按键：短按控制夹爪开关，长按回到规划位置（注意安全距离）

右侧三级按键：三挡速度控制（打到最上面为最高速度，请注意安全）

摇杆：

右侧摇杆左右： 

笛卡尔速度模式下：沿 Y 轴直线运动

关节控制模式下，与Chanel 6协调控制关节运动

右侧摇杆前后： 

笛卡尔速度模式下：沿 X轴直线运动

关节控制模式下，与Chanel 6协调控制

左侧摇杆前后： 

笛卡尔速度模式下：沿 Z轴直线运动

关节控制模式下，无控制

左侧摇杆左右： 

笛卡尔速度模式下：与Chanel 6协调控制，绕x轴、绕y轴或者绕z轴旋转。

关节控制模式下：无控制

开发文档：参考https://docs.airbots.online/airbot-play-python-sdk/latest/Python%20SDK/examples.html