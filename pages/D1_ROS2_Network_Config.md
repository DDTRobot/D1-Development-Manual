# D1 ROS 2 Startup Services and Cross-Host Discovery

This page explains how to start D1's ROS 2 services automatically at boot, configure Cyclone DDS network discovery, and connect a development computer to the robot.

## Configuration Goals

- Start the robot's ROS 2 services automatically at boot.
- Configure the robot to use ROS Domain ID `69` (an example value) and Cyclone DDS.
- Discover the robot's ROS 2 nodes from a development computer over a wired network.
- Prevent the ROS 2 daemon from using the wrong RMW implementation.
- Prevent node startup failures when `eth0` is not yet ready at boot.

## Network Parameters

| Device | Network Interface | IPv4 Address | ROS Domain ID | RMW Implementation |
| ------ | ----------------- | ------------ | ------------- | ------------------ |
| D1 robot | `eth0` | `192.168.19.90/24` | `69` | `rmw_cyclonedds_cpp` |
| Development computer | `eno1` | `192.168.19.93/24` | `69` | `rmw_fastrtps_cpp` |

Before configuring the system, confirm that the development computer can reach the robot:

```bash
ping -c 3 192.168.19.90
```

## Robot ROS 2 Environment

The robot's login shell loads the ROS 2 environment through `/opt/d1_ros2/env.sh`. Add the following to the end of `/home/robot/.bashrc`:

```bash
# D1 ROS 2 environment
source /opt/d1_ros2/env.sh
```

Do not configure `/opt/ros/humble/setup.bash` and `ROS_DOMAIN_ID` separately, as this can cause the login shell and systemd services to use different RMW configurations.

The key settings in `/opt/d1_ros2/ros2.env` are:

```bash
ROS_DOMAIN_ID=69
ROS_LOCALHOST_ONLY=0
ROS_LOG_LEVEL=DEBUG
RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
CYCLONEDDS_URI=file:///opt/d1_ros2/cyclonedds.xml
```

## Cyclone DDS Network Configuration

Edit `/opt/d1_ros2/cyclonedds.xml` on the robot:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<CycloneDDS xmlns="https://cdds.io/config"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="https://cdds.io/config https://raw.githubusercontent.com/eclipse-cyclonedds/cyclonedds/master/etc/cyclonedds.xsd">
  <Domain>
    <General>
      <Interfaces>
        <NetworkInterface name="eth0" priority="default" multicast="true" />
      </Interfaces>
      <AllowMulticast>true</AllowMulticast>
    </General>
    <Discovery>
      <ParticipantIndex>auto</ParticipantIndex>
      <MaxAutoParticipantIndex>99</MaxAutoParticipantIndex>
    </Discovery>
  </Domain>
</CycloneDDS>
```

If the interface is set to `lo`, ROS 2 nodes can only be discovered locally on the robot. An external development computer cannot discover the robot's topics.

## systemd Startup Services

The robot uses the following three services:

| Service | Components Started |
| ------- | ------------------ |
| `d1_system.service` | System status and basic device nodes |
| `d1_bringup.service` | Main controller and robot state publisher nodes |
| `d1_command.service` | Command gateway and remote controller nodes |

The services start in this order:

```text
d1_system.service
        ↓
d1_bringup.service
        ↓
d1_command.service
```

### Wait for eth0 to Be Ready

When Cyclone DDS is configured to use `eth0`, the services must wait for that interface to obtain an IPv4 address. Create the following files:

```text
/etc/systemd/system/d1_system.service.d/wait-for-eth0.conf
/etc/systemd/system/d1_bringup.service.d/wait-for-eth0.conf
/etc/systemd/system/d1_command.service.d/wait-for-eth0.conf
```

Use the same content in all three files:

```ini
[Unit]
Wants=network-online.target
After=network-online.target NetworkManager-wait-online.service

[Service]
ExecStartPre=/usr/bin/timeout 60 /bin/bash -c 'until /usr/sbin/ip -4 -o address show dev eth0 scope global | /usr/bin/grep -q "inet "; do /usr/bin/sleep 1; done'
```

Apply the configuration:

```bash
sudo systemctl daemon-reload
sudo systemctl enable d1_system.service
sudo systemctl enable d1_bringup.service
sudo systemctl enable d1_command.service
```

Restart the services in dependency order:

```bash
sudo systemctl stop d1_command.service d1_bringup.service d1_system.service
sudo systemctl start d1_system.service
sudo systemctl start d1_bringup.service
sudo systemctl start d1_command.service
```

## Development Computer Configuration

Add the following to the end of `/home/example/.bashrc` on the development computer:

```bash
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=69
export ROS_LOCALHOST_ONLY=0
export RMW_IMPLEMENTATION=rmw_fastrtps_cpp
```

Apply and verify the configuration:

```bash
source ~/.bashrc
echo "$ROS_DOMAIN_ID"
echo "$ROS_LOCALHOST_ONLY"
echo "$RMW_IMPLEMENTATION"
```

Expected output:

```text
69
0
rmw_fastrtps_cpp
```

## Refresh the ROS 2 Daemon

If the robot's topics are still missing after changing the environment, stop the old daemon and start it again:

```bash
ros2 daemon stop
ros2 daemon start
ros2 topic list
```

You can also bypass the daemon to check DDS discovery directly:

```bash
ros2 topic list --no-daemon
```

When discovery is working, you should see topics with the robot's namespace, for example:

```text
/d15039751/joint_states
/d15039751/robot_description
/d15039751/command/cmd_twist
/d15039751/system_status_broadcaster/diagnostic
/tf
/tf_static
```

## Status Checks

Check the services on the robot:

```bash
systemctl is-enabled d1_system.service d1_bringup.service d1_command.service
systemctl is-active d1_system.service d1_bringup.service d1_command.service
```

View logs from the current boot:

```bash
journalctl -b -u d1_system.service \
  -u d1_bringup.service \
  -u d1_command.service --no-pager
```

Check the network interface and controllers:

```bash
ip -4 -br address show dev eth0
source /opt/d1_ros2/env.sh
ros2 control list_controllers -c /d15039751/controller_manager
ros2 control list_controllers -c /d15039751/command_manager
```

## Troubleshooting

### Only `/parameter_events` and `/rosout` Are Visible

This usually means the ROS 2 daemon is using the wrong RMW implementation. Check the daemon:

```bash
pgrep -af ros2-daemon
```

On the robot, the output should include:

```text
--ros-domain-id 69 --rmw-implementation rmw_cyclonedds_cpp
```

Reload the environment and refresh the daemon:

```bash
source /opt/d1_ros2/env.sh
ros2 daemon stop
ros2 daemon start
```

### The Development Computer Cannot See the Robot's Topics

Check the environment in the current terminal first, rather than only checking the `.bashrc` file:

```bash
echo "$ROS_DOMAIN_ID"
```

If the output is `42`, the current terminal still has the old environment. Run:

```bash
source ~/.bashrc
ros2 daemon stop
ros2 daemon start
```

### `eth0: does not match an available interface`

This error means that `eth0` did not exist or had not obtained an IPv4 address when the service started. Confirm that all three systemd drop-in files are installed, then run:

```bash
sudo systemctl daemon-reload
sudo systemctl restart d1_system.service
sudo systemctl restart d1_bringup.service
sudo systemctl restart d1_command.service
```
