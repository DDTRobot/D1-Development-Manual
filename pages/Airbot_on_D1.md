# Airbot robotic arm on D1

## Environment setup

```bash
git clone https://github.com/DDTRobot/airbot-environment-deployment.git
cd airbot-environment-deployment
bash install.sh
```

## Running the arm

### Start the arm service

An internet connection and login are required the first time you start the service.

```bash
sudo airbot_server -i can1 -p 50000
```

### Keyboard control

```bash
python3 -m airbot_examples.task_kbd_ctrl -p 50000
```

### Remote control

Set `--namespace` to match the namespace shown by `ros2 topic list`.

```bash
cd airbot-environment-deployment
python3 airbot_joy_D1.py --namespace d13042528 --port 50000
```

<img src="../_static/1.png" alt="D1 remote controller channel layout" width="400">

## Remote controller channel mapping

| Channel | Control |
|---------|---------|
| 1 | Right stick, left/right |
| 2 | Right stick, forward/backward |
| 3 | Left stick, forward/backward |
| 4 | Left stick, left/right |
| 5 | Left button |
| 6 | Left three-position switch |
| 7 | Right button |
| 8 | Right three-position switch |

## Button functions

### Left button (Channel 5)

- Pressed: Cartesian velocity mode.
- Released: Joint control mode.

### Left three-position switch (Channel 6)

- Cartesian velocity mode: Selects rotation about the X, Y, or Z axis in combination with Channel 4.
- Joint control mode: Selects joints 1–2, 3–4, or 5–6 in combination with Channels 1 and 2.

### Right button (Channel 7)

- Short press: Toggles the gripper.
- Long press: Returns the arm to the planned position. Maintain a safe clearance.

### Right three-position switch (Channel 8)

Selects one of three speed levels. The top position is the highest speed; use caution.

## Joystick functions

| Control | Cartesian velocity mode | Joint control mode |
|---------|-------------------------|--------------------|
| Right stick, left/right | Linear motion along the Y axis | Joint motion selected by Channel 6 |
| Right stick, forward/backward | Linear motion along the X axis | Joint motion selected by Channel 6 |
| Left stick, forward/backward | Linear motion along the Z axis | No control |
| Left stick, left/right | Rotation about the X, Y, or Z axis, selected by Channel 6 | No control |

## Development documentation

For development examples, see the [Airbot Play Python SDK documentation](https://docs.airbots.online/airbot-play-python-sdk/latest/Python%20SDK/examples.html).
