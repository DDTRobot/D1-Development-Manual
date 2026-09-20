# Piper robotic arm on D1

Source repository: [piper-environment-deployment](https://github.com/DDTRobot/piper-environment-deployment.git).

## Hardware topology

```text
D1 Orin NX (d1)
    │
    ├── can0 (onboard mttcan) → D1 motor control
    └── can1 (USB-CAN gs_usb) → Piper robotic arm
          └── USB path: 1-2.3:1.0
```

| Interface | Driver | Purpose | CAN ID |
|-----------|--------|---------|--------|
| `can0` | `mttcan` (onboard) | D1 motors | 10C, 10D, 10E, 10F, 118 |
| `can1` | `gs_usb` (USB) | Piper | 12B, 128, 129, 12A, 251-2A8 |

## First-time startup

### 1. Confirm that the USB-CAN adapter is detected

```bash
ip link show type can
```

You should see both `can0` and `can1`. If only `can0` is listed:

```bash
# Check the USB device tree to confirm that the adapter is detected
cat /sys/kernel/debug/usb/devices | head -30

# If no gs_usb device appears, check that the adapter is firmly connected
# Load the driver (usually loaded automatically)
sudo modprobe gs_usb
```

### 2. Activate the CAN interface

`can1` connects to Piper through the USB-CAN adapter.

```bash
sudo ip link set can1 down
sudo ip link set can1 type can bitrate 1000000
sudo ip link set can1 up
```

### 3. Verify that Piper is online

```bash
candump can1
```

You should see CAN frames updating continuously.

## Control examples

### Install dependencies

```bash
pip3 install piper_sdk pynput
```

### Run joint-space control

```bash
cd piper_sdk
python3 piper_ctrl_moveJ_keyboard.py
```

**Key mappings:**

| Key | Joint | Direction | Key | Joint | Direction |
|-----|-------|-----------|-----|-------|-----------|
| Q | J0 | +1° | A | J0 | -1° |
| W | J1 | +1° | S | J1 | -1° |
| E | J2 | +1° | D | J2 | -1° |
| R | J3 | +1° | F | J3 | -1° |
| T | J4 | +1° | G | J4 | -1° |
| Y | J5 | +1° | H | J5 | -1° |
| Z | Gripper | +5mm | X | Gripper | -5mm |

**Function keys:** Space (toggle gripper) / 1 (return to zero) / 2 (Home) / 3 (grasp) / 0 (emergency return to zero) / ESC (exit).

**Press and hold:** Holding a control key for more than 0.3 seconds activates continuous motion at 15Hz. Releasing the key stops the motion immediately.

### SSH remote control when D1 has no keyboard

```bash
python3 piper_ctrl_moveJ_keyboard_ssh.py
```

This version does not require `pynput`; it reads key presses directly from the SSH terminal. The key mappings are the same as above. Holding a key triggers terminal key repeat for continuous motion. Press Ctrl+C to exit.

### D1 remote control

Following the ROS 2 Joy mapping in `DDTRobot/airbot_joy`, you can control Piper with the D1/TITA remote controller:

```bash
cd piper_control
source /opt/ros/humble/setup.bash
source /opt/d1_ros2/namespace.sh
ros2 topic list | grep joy


# Connect to can1 after confirming the axis directions and mode
python3 example/teleop/betafpv_piper_teleop.py
```

Before running the script, set `use-sdk mode` to `true` in the remote controller menu. See `piper_control/CONTROL_README.md` for the complete mode table and parameters, and `piper_control/BETAFPV_PIPER_TEST_README.md` for the staged hardware testing procedure.

### One-command startup

```bash
cd piper_D1_adaption
./start_piper_teleop.sh
```

## Frequently asked questions

**Q: Why does `ip link show type can` list only can0, with no can1?**

A: The USB-CAN adapter may be loose or connected incorrectly. Reconnect it, then use `cat /sys/kernel/debug/usb/devices` to confirm that `gs_usb` appears in the device tree.

**Q: Why does `candump can1` show no Piper frames?**

A: Piper may not be powered on, or the CAN cable may be loose. Check the Piper power supply and CAN terminal connections.

**Q: Why does the keyboard script report `CAN socket can1 does not exist`?**

A: The script has `can0` hardcoded, but Piper is connected to `can1`. Run:

```bash
sed -i 's/"can0"/"can1"/g' piper_sdk/piper_ctrl_moveJ_keyboard.py
```

## Interface quick reference

| Interface | Type | Purpose |
|-----------|------|---------|
| `can0` | Onboard CAN | D1 motor control |
| `can1` | USB-CAN | Piper robotic arm |
