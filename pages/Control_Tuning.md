# 策略与参数调优

本页整理原快速开始中的策略替换、LQR 参数和姿态控制配置，供已经完成基础连接的开发者查阅。

```{admonition} 修改前先确认
:class: warning
参数与策略取决于机器人构型及交付版本。修改前备份现有配置，按产品安全说明开展实机验证。下方保留原手册示例，不代表适用于所有设备。
```

(policy-replacement)=
## 策略替换

1. 将你的policy拷贝在对应的文件夹下，例如test.onnx放在
  - 双足/opt/d1_ros2/share/rl_controller/config/d1h
  - 四足/opt/d1_ros2/share/rl_controller/config/d1
2. 修改配置文件
以双轮足为例，vim /opt/d1_ros2/share/rl_controller/config/d1h/controller.yaml如下，在rl_policy_names中插入你的策略，例如test_policy，然后在rl_policy_names最下面新增字段如下所示。或者直接修改原有的策略，例如双轮足下的rl_climb字段

```bash
 ...     
      rl_policy_names:
        ...
        - "test_policy"
 ...
      test_policy:
        policy_path: config/d1h/test.onnx
        output_name: "nn_output"

        # env
        num_obs: 31
        num_actions: 8
        history_len: 10
        observations_name: ["ang_vel", "gravity", "commands", "dof_pos_nwp", "dof_vel", "last_actions"]
        commands_name: ["lin_vel_x", "lin_vel_y", "ang_vel_z"]
        commands_scale: [2.0, 2.0, 0.25] # lin_vel_scale, lin_vel_scale, ang_vel_scale
        max_commands: [1.0, 0.7, 1.0]
        min_commands: [-0.5, -0.7, -1.0]
        commands_comp: [0.0, 0.0, 0.0] # direct add offset to command
        # control parameters
        time_interval: 0.02 # forward thread seconds
        default_joint_angles: [0.0, 0.8, -1.5, 0.0, 0.0, 0.8, -1.5, 0.0]
        joint_kp: [40.0, 40.0, 40.0, 10.0, 40.0, 40.0, 40.0, 10.0]
        joint_kd: [1.2, 1.2, 1.2, 0.6, 1.2, 1.2, 1.2, 0.6]

        action_scales: [ 0.25, 0.5, 0.5, 0.5, 0.25, 0.5, 0.5, 0.5 ]

        lin_vel_scale: 2.0
        ang_vel_scale: 0.25
        dof_pos_scale: 1.0
        dof_vel_scale: 0.05

        # Compensation items
        output_torque_scale: 1.0

```

修改后重启service，systemctl restart d1_bringup后，查看journal中是否有正确加载在对应按键上journalctl -u d1_bringup

```bash 
[×××_d1-5] [INFO] [2026-01-30 18:27:10] [d1h_rl_controller]: Get policy: /opt/d1_ros2/share/rl_controller/config/d1h/test.onnx in "rl_1" fsm
```
3. 四足换策略
vim /opt/d1_ros2/share/rl_controller/config/d1/controller.yaml如下，在rl_policy_names中插入你的策略，例如rl_flat_lab2，然后在rl_policy_names最下面新增字段如下所示。
```bash
      rl_policy_names:
        ...
        - "rl_flat_lab2"

      rl_flat_lab2:
        policy_path: config/d1/flat_lab18.onnx
        output_name: "nn_output"
        control_type: "P_V"
        # env
        num_obs: 57
        num_actions: 16
        history_len: 10
        decimation: 8
        observations_name: ["ang_vel", "gravity", "commands", "dof_pos", "dof_vel", "last_actions"]
        commands_name: ["lin_vel_x", "lin_vel_y", "ang_vel_z"]
        max_commands: [1.0, 1.0, 1.0]
        min_commands: [-1.0, -1.0, -1.0]
        # commands_gain: [1.0, 0.0, 1.0]
        # max_commands_rate: [5.0, .inf, .inf]
        # min_commands_rate: [-5.0, -.inf, -.inf]
        # control parameters
        default_joint_angles: [0.0, 0.8, -1.5, 0.0, -0.0, 0.8, -1.5, 0.0, 0.0, 0.8, -1.5, 0.0, -0.0, 0.8, -1.5, 0.0]
        joint_kp: [96.0, 96.0, 96.0, 0.0, 96.0, 96.0, 96.0, 0.0, 96.0, 96.0, 96.0, 0.0, 96.0, 96.0, 96.0, 0.0]
        joint_kd: [3.2, 3.2, 3.2, 0.5, 3.2, 3.2, 3.2, 0.5, 3.2, 3.2, 3.2, 0.5, 3.2, 3.2, 3.2, 0.5]
        action_scales: [ 0.25, 0.25, 0.25, 5.0, 0.25, 0.25, 0.25, 5.0, 0.25, 0.25, 0.25, 5.0, 0.25, 0.25, 0.25, 5.0 ]
        # zero_cmd_brake_thresholds: [0.01, 0.5]  # [cmd_magnitude, actual_vel(m/s)]
        # zero_cmd_brake_gains: [0.00, 0.05]  # [P(integral), D(velocity)]
        # zero_cmd_brake_integral_clamp: 20.0
```
如果修改原有的策略，对应字段下框选出来的位置
```bash
    loco:
        policy_name: "rl_flat_lab2"
```
修改后重启service，systemctl restart d1_bringup后，查看journal中是否有正确加载在对应按键上journalctl -u d1_bringup

```{note}
注意以下事项：
1. 对于四足，出厂默认平地模式使用强化控制，因此policy_loco_name字段必须不为空且对应的字段必须在rl_policy_names中出现。其他policy_jump_name，policy_recovery_name也是使用强化学习实现的，如果使用则需要在rl_policy_names中注册对应名字的policy并且在policy_jump_name，policy_recovery_name中声明，不声明则使用内置默认值（如果有）
2. 已经在policy_jump_name，policy_recovery_name和policy_recovery_name注册过的rl_policy_names在rl_*按键中不会被映射上，剩下的策略则按照先后顺序映射在对应的rl_*中。
3. 双足policy_loco_name默认使用lqr为非强化学习控制器。
```
```bash 
...     
      policy_jump_name: "rl_forward_jump" 
      policy_loco_name: "rl_flat_np3o_still"
      policy_recovery_name: "rl_recovery_np3o" 
      rl_policy_names:
        - "rl_flat_np3o_still"
        ...
...
```

<!-- (lqr-tuning)=
## LQR参数修改
在双轮足模式下，通过vim /opt/d1_ros2/share/rl_controller/config/d1h/controllers.yaml中的lqr_controller可以修改LQR参数
目前提供了以下几种LQR参数可供修改
| 配置项 | 参数名 | 默认值 |
|-----|------|-----|
| 最大前进速度 | forward_velocity_max |2.1|
| 最大旋转速度 | otate_velocity_max |3.0|
| 最大前进加速度 | forward_acceleration_max |3.0|
| 最大旋转加速度 | rotate_acceleration_max |6.0|
| 最大变形速度 | transform_velocity_max |0.2|
| 质心相关参数 | x_mass1(x_mass2)<br>z_mass(z_mass2) |-0.002<br>0.0|

**质心参数说明**
x_mass1为前机
x_mass2为后机
x_mass是base_frame下x方向的值，单位m
z_mass是base_frame下z方向的值，单位m
例子：x_mass1: -0.01，大致基座中心X方向偏后，-0.01
**Q:装上负载之后，机器人站立时，自动会后退？**
**A:说明机器人的质心是靠后，则需要调整x_mass,往正向调整，数值改大**
根据机器前后机对质心参数进行手动修改
后机使用默认参数即可
前机将参数修改如下
```bash 
x_mass1: -0.01
z_mass1: 0.0
x_mass2: -0.01
z_mass2: 0.0
```
修改后重启生效 -->


(controller-tuning)=
## 控制器参数修改

以四轮足模式为例子，/opt/d1_ros2/share/rl_controller/config/d1/controllers.yaml 
- transform_up：从折叠姿态 → 先 fold_jpos 过渡姿态 → 再 stand_jpos 站立姿态
- transform_down：从站立 → 直接运动到 fold_jpos 折叠收拢姿态
```
transform_up:
  policy_name: "" # 为空使用PD位置控制；填名字则加载RL策略
  fold_jpos: [-0.05, 1.0, -2.4, 0.0, 0.05, 1.0, -2.4, 0.0, -0.05, 1.4, -2.4, 0.0, 0.05, 1.4, -2.4, 0.0]
  stand_jpos: [-0.05, 0.8, -1.4, 0.0, 0.05, 0.8, -1.4, 0.0, -0.05, 0.8, -1.5, 0.0, 0.05, 0.8, -1.5, 0.0]
  fold_timer: 0.5    # 折叠→过渡姿态耗时(s)
  stand_timer: 1.0   # 过渡姿态→最终站立耗时(s)
  ff_torque: [-0.0, 0.0, 5.0, 0.0, 0.0, 0.0, 5.0, 0.0, -0.0, 0.0, 5.0, 0.0, 0.0, 0.0, 5.0, 0.0] #前馈力矩
  joint_kp: [400.0, 150.0, 300.0, 5.0, 400.0, 150.0, 300.0, 5.0, 400.0, 150.0, 300.0, 5.0, 400.0, 150.0, 300.0, 5.0]
  joint_kd: [8.0, 8.0, 8.0, 0.5, 8.0, 8.0, 8.0, 0.5, 8.0, 8.0, 8.0, 0.5, 8.0, 8.0, 8.0, 0.5]

transform_down:
  fold_jpos: [0.3, 1.30, -2.7, 0.0, -0.3, 1.3, -2.7, 0.0, 0.3, 1.3, -2.7, 0.0, -0.3, 1.3, -2.7, 0.0]
  fold_timer: 1.5    # 站立→完全折叠耗时(s)
  joint_kp: [300.0, 150.0, 300.0, 5.0, 300.0, 150.0, 300.0, 5.0, 300.0, 150.0, 300.0, 5.0, 300.0, 150.0, 300.0, 5.0]
  joint_kd: [4.0, 8.0, 8.0, 0.2, 4.0, 8.0, 8.0, 0.2, 4.0, 8.0, 8.0, 0.2, 4.0, 8.0, 8.0, 0.2]
```
**字段详解**
transform_up 起立流程（两段式运动）
1、fold_jpos：起立中间过渡姿态（rad）
- leg0：[-0.05, 1.0, -2.4, 0.0]
- leg1：[0.05, 1.0, -2.4, 0.0]
- leg2：[-0.05, 1.4, -2.4, 0.0]
- leg[-0.05, 1.4, -2.4, 0.0]`
- leg3：[0.05, 1.4, -2.4, 0.0]
    注意后腿 (leg2/3) 第二个关节角度 1.4，比前腿 1.0 更大，后腿抬得更高，防止起立刮地。
2、stand_jpos：最终稳定站立关节角
- leg0：[-0.05, 0.8, -1.4, 0.0]
- leg1：[0.05, 0.8, -1.4, 0.0]
- leg2：[-0.05, 0.8, -1.5, 0.0]
- leg3：[0.05, 0.8, -1.5, 0.0]
    后腿第三关节 - 1.5，前腿 - 1.4，前后腿微小差异，匹配机身重心。
3、fold_timer:0.5s：折叠姿态运动到中间过渡姿态耗时
4、stand_timer:1.0s：过渡姿态运动到最终站立姿态耗时
完整起立总时间：0.5 + 1.0 = 1.5 s
5、ff_torque 前馈力矩：每个腿第 3 关节施加+5 N·m前馈力矩。
    第三关节一般是膝关节，用来抵消机身重力，减轻 PD 负担，防止起立下垂。其余关节前馈为 0。
6、joint_kp / joint_kd：起立阶段 PD 增益
- kp 最高 400，刚度比趴下阶段更高；kd 也更大，抑制起立冲击抖动。
- 第 4 关节（足）kp=5、kd=0.5，保持柔性。
