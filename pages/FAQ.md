<!--
 * @Author: blank1 448913821@qq.com
 * @Date: 2026-01-07 10:20:05
 * @LastEditors: blank1 448913821@qq.com
 * @LastEditTime: 2026-01-07 10:26:31
 * @FilePath: \D1-Development-Manual\pages\FAQ.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# 常见问题

```{toctree}
:maxdepth: 1
:glob:
```

------

## 机器人连接处异响

若听见机器人连接处有异响，可能是由于连接机构螺丝松动导致,为了方便对接机构快速拆装/替换,因此连接处螺丝并未使用防松措施,用户可以在使用中定期检查连接处螺丝的紧固情况,如有松动请使用内六角扳手进行紧固.
![faq1](../_static/faq1.png) 



## 腿部零位校准

```bash 
robot@d1:~$ ros2 run canfd_api leg_zero_calibration -h
Usage: leg_zero_calibration [options]
Options:
  -c, --can-interface  CAN interface name (default: can0)
  -r, --read           Read joint status 
  -l, --leg            Leg name (left/right) (default: left)
  -h, --help           Show this help message

```

- 校准零位
先分开主从机，依次校准，终端输入：
```bash 
ros2 run canfd_api leg_zero_calibration -l left
Please place the left leg at the zero position, then press Enter...

```
先将对应腿摆到机械零位上，然后回车...

另一条腿将left换成right即可，重复上述步骤。然后重启机器

- - 打印当前位置与机械零位的差值，可以查验下校准是否ok

```bash 

ros2 run canfd_api leg_zero_calibration -r
# Read joint imu status...
# motor[0] Kinematics Position: 0.229697  Mechanical Position: -0.555701
# motor[1] Kinematics Position: 1.29583   Mechanical Position: -2.10756
# motor[2] Kinematics Position: -2.75634  Mechanical Position: -1.88839
# motor[3] Kinematics Position: -2.69203  Mechanical Position: -2.69203
# motor[4] Kinematics Position: -0.237942         Mechanical Position: 0.547456
# motor[5] Kinematics Position: 1.29602   Mechanical Position: -2.10737
# motor[6] Kinematics Position: -2.75768  Mechanical Position: -1.88973
# motor[7] Kinematics Position: -2.32942  Mechanical Position: -2.32942

```
