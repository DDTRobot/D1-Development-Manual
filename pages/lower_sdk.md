# 下层控制示例 
```{toctree}
:maxdepth: 1
:glob:
```
------

一、应用示例

这是一个关于如何使用 tita_robot 包来控制机器人关节并获取电池信息等示例。仅在真机上使用。


创建lower_sdk_example.cpp文件

`根据您的要求，我将为代码块添加背景色。以下是修改后的代码块：

```cpp{.hljs language-cpp background-color=#f0f0f0}
#include <time.h>

#include <algorithm>
#include <chrono>
#include <iostream>
#include <map>
#include <memory>
#include <string>
#include <thread>

#include "tita_robot/tita_robot.hpp"

tita_robot robot(8, 2, "can0");

void test_read()
{
  while (1) 
  {
    std::cout << "=================================" << std::endl;
    auto q = robot.get_joint_q();
    auto v = robot.get_joint_v();
    auto t = robot.get_joint_t();
    auto status = robot.get_joint_status();
    auto quat = robot.get_imu_quaternion();
    auto accl = robot.get_imu_acceleration();
    auto gyro = robot.get_imu_angular_velocity();
    for (size_t i = 0; i < q.size(); i++) {
      std::cout << "q[" << i << "] = " << q[i] << "\tv[" << i << "] = " << v[i] << "\tt[" << i
                << "] = " << t[i] << std::endl;
    }
    for (size_t i = 0; i < status.size(); i++) {
      std::cout << "status[" << i << "] = " << status[i] << " ";
    }
    std::cout << std::endl;
    std::cout << "quat = " << quat[0] << " " << quat[1] << " " << quat[2] << " " << quat[3]
              << std::endl;
    std::cout << "accl = " << accl[0] << " " << accl[1] << " " << accl[2] << std::endl;
    std::cout << "gyro = " << gyro[0] << " " << gyro[1] << " " << gyro[2] << std::endl;
    sleep(1);
  
  }
}

void test_write()
{
  while (1) {
    std::cout << "=================================" << std::endl;
    std::vector<double> t = {0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.5};
    robot.set_target_joint_t(t);
    sleep(1);
  }
}

int main(int argc, char * argv[])
{
  (void)argc;
  (void)argv;
  test_read();
  // test_write();

  return 0;
}

```

创建CMakeLists.txt文件

```

cmake_minimum_required(VERSION 3.10)
project(lower_sdk_example)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_compile_options(-Wall -Wextra -Wpedantic)
set(LOWER_SDK "/opt/d1_ros2/")   #tita_robot 安装路径

include_directories(
    ${LOWER_SDK}/include
)

link_directories(
    ${LOWER_SDK}/lib  
)

add_executable(lower_sdk_example lower_sdk_example.cpp)

target_link_libraries(lower_sdk_example
    tita_robot  
    pthread     
)

```

编译与测试

```
mkdir build  && cd build
cmake .. 
make -j8
./lower_sdk_example 

```

二、运动控制接口

（1） 设置电机力矩
```bash
 /**
     * @brief Set the target joint feed-forward torques.
     * @param t the target joint feed-forward torques.
     * @return return true if the target is set successfully.
     */
  bool set_target_joint_t(const std::vector<double> & t);
```

（2）设置电机PD控制
```bash
  /**
     * @brief MIT control method. Set the target joint positions, velocities, kp, kd and feed-forward torques of the
     motors.
     * @param q the target joint positions in radians.
     * @param v the target joint velocities in radians per second.
     * @param kp the target joint proportional gains.
     * @param kd the target joint derivative gains.
     * @param t the target joint feed-forward torques.
     *
     * @return return true if the target is set successfully
     */
  bool set_target_joint_mit(
    const std::vector<double> & q, const std::vector<double> & v, const std::vector<double> & kp,
    const std::vector<double> & kd, const std::vector<double> & t);
```


更多详情请参考[tita_robot](Robot-API.md)