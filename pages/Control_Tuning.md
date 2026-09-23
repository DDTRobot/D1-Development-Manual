# Policy & parameter tuning

This page collects the policy replacement, LQR parameter, and pose-control configuration material from the original Quick Start for developers who have completed the basic connection steps.

```{admonition} Before making changes
:class: warning
Parameters and policies depend on the robot configuration and delivered software version. Back up the existing configuration before making changes, and follow the product safety instructions when testing on hardware. These examples are retained from the original manual and do not necessarily apply to every device.
```

(policy-replacement)=
## Policy replacement

1. Copy your policy into the appropriate directory. For example, place `test.onnx` in:

   - Biped: `/opt/d1_ros2/share/rl_controller/config/d1h`
   - Quadruped: `/opt/d1_ros2/share/rl_controller/config/d1`

2. Edit the configuration file.

For biped-wheeled mode, open `/opt/d1_ros2/share/rl_controller/config/d1h/controller.yaml` with `vim`. Add your policy name, such as `test_policy`, to `rl_policy_names`, then add the corresponding configuration below it. Alternatively, modify an existing policy, such as `rl_climb` in biped mode.

```yaml
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

Restart the service with `systemctl restart d1_bringup`, then use `journalctl -u d1_bringup` to check that the policy was loaded and assigned to the expected control:

```text
[×××_d1-5] [INFO] [2026-01-30 18:27:10] [d1h_rl_controller]: Get policy: /opt/d1_ros2/share/rl_controller/config/d1h/test.onnx in "rl_1" fsm
```

**3. Replace a quadruped policy**

Open `/opt/d1_ros2/share/rl_controller/config/d1/controller.yaml` with `vim`. Add your policy name, such as `rl_flat_lab2`, to `rl_policy_names`, then add the corresponding configuration:

```yaml
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

To replace an existing policy, update the corresponding field:

```yaml
    loco:
        policy_name: "rl_flat_lab2"
```

Restart the service with `systemctl restart d1_bringup`, then check the policy assignment with `journalctl -u d1_bringup`.

```{note}
1. Quadruped flat-ground mode uses reinforcement learning by default. `policy_loco_name` must be nonempty, and its policy must appear in `rl_policy_names`. `policy_jump_name` and `policy_recovery_name` also use reinforcement learning. To use them, register the corresponding policies in `rl_policy_names` and specify their names in these fields. If no name is specified, the built-in default is used when available.
2. Policies already assigned through the dedicated jump and recovery fields are not mapped to the `rl_*` controls. The remaining policies are mapped to `rl_*` in list order.
3. In biped mode, `policy_loco_name` uses the non-RL LQR controller by default.
```

```yaml
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
## LQR parameter tuning
In biped-wheeled mode, edit lqr_controller in /opt/d1_ros2/share/rl_controller/config/d1h/controllers.yaml with vim.

| Setting | Parameter | Default |
| --- | --- | --- |
| Maximum forward velocity | forward_velocity_max | 2.1 |
| Maximum rotation velocity | otate_velocity_max | 3.0 |
| Maximum forward acceleration | forward_acceleration_max | 3.0 |
| Maximum rotation acceleration | rotate_acceleration_max | 6.0 |
| Maximum transform velocity | transform_velocity_max | 0.2 |
| Center-of-mass parameters | x_mass1(x_mass2)<br>z_mass(z_mass2) | -0.002<br>0.0 |

x_mass1 applies to the front unit and x_mass2 to the rear unit. x_mass and z_mass are the X and Z coordinates in base_frame, in meters. For example, x_mass1: -0.01 places the center of mass slightly behind the base center along X.

If the robot moves backward while standing after a payload is added, its center of mass is too far back. Increase x_mass in the positive direction. Adjust the front and rear units as appropriate. The rear unit can retain its defaults; the front-unit example is:

```yaml
x_mass1: -0.01
z_mass1: 0.0
x_mass2: -0.01
z_mass2: 0.0
```

Restart to apply the changes. -->

(controller-tuning)=
## Controller parameter tuning

For quadruped mode, use `/opt/d1_ros2/share/rl_controller/config/d1/controllers.yaml`:

- `transform_up`: Folded pose → intermediate `fold_jpos` pose → final `stand_jpos` standing pose.
- `transform_down`: Standing pose → directly to the folded `fold_jpos` pose.

```yaml
transform_up:
  policy_name: "" # Empty selects PD position control; a name loads an RL policy
  fold_jpos: [-0.05, 1.0, -2.4, 0.0, 0.05, 1.0, -2.4, 0.0, -0.05, 1.4, -2.4, 0.0, 0.05, 1.4, -2.4, 0.0]
  stand_jpos: [-0.05, 0.8, -1.4, 0.0, 0.05, 0.8, -1.4, 0.0, -0.05, 0.8, -1.5, 0.0, 0.05, 0.8, -1.5, 0.0]
  fold_timer: 0.5    # Folded to intermediate pose (s)
  stand_timer: 1.0   # Intermediate to final standing pose (s)
  ff_torque: [-0.0, 0.0, 5.0, 0.0, 0.0, 0.0, 5.0, 0.0, -0.0, 0.0, 5.0, 0.0, 0.0, 0.0, 5.0, 0.0] # Feed-forward torque
  joint_kp: [400.0, 150.0, 300.0, 5.0, 400.0, 150.0, 300.0, 5.0, 400.0, 150.0, 300.0, 5.0, 400.0, 150.0, 300.0, 5.0]
  joint_kd: [8.0, 8.0, 8.0, 0.5, 8.0, 8.0, 8.0, 0.5, 8.0, 8.0, 8.0, 0.5, 8.0, 8.0, 8.0, 0.5]

transform_down:
  fold_jpos: [0.3, 1.30, -2.7, 0.0, -0.3, 1.3, -2.7, 0.0, 0.3, 1.3, -2.7, 0.0, -0.3, 1.3, -2.7, 0.0]
  fold_timer: 1.5    # Standing to fully folded pose (s)
  joint_kp: [300.0, 150.0, 300.0, 5.0, 300.0, 150.0, 300.0, 5.0, 300.0, 150.0, 300.0, 5.0, 300.0, 150.0, 300.0, 5.0]
  joint_kd: [4.0, 8.0, 8.0, 0.2, 4.0, 8.0, 8.0, 0.2, 4.0, 8.0, 8.0, 0.2, 4.0, 8.0, 8.0, 0.2]
```

**Field reference: the two-stage `transform_up` sequence**

1. `fold_jpos`: Intermediate joint angles during standing up, in radians.

   - `leg0`: `[-0.05, 1.0, -2.4, 0.0]`
   - `leg1`: `[0.05, 1.0, -2.4, 0.0]`
   - `leg2`: `[-0.05, 1.4, -2.4, 0.0]`
   - `leg3`: `[0.05, 1.4, -2.4, 0.0]`

   The rear legs (`leg2/3`) use 1.4 rad at the second joint rather than the front legs' 1.0 rad. This lifts the rear legs higher to avoid scraping the ground while standing up.

2. `stand_jpos`: Joint angles for the final stable standing pose.

   - `leg0`: `[-0.05, 0.8, -1.4, 0.0]`
   - `leg1`: `[0.05, 0.8, -1.4, 0.0]`
   - `leg2`: `[-0.05, 0.8, -1.5, 0.0]`
   - `leg3`: `[0.05, 0.8, -1.5, 0.0]`

   The third joint uses -1.5 rad for the rear legs and -1.4 rad for the front legs. This small difference matches the body's center of mass.

3. `fold_timer`: 0.5 s from the folded pose to the intermediate pose.
4. `stand_timer`: 1.0 s from the intermediate pose to the final standing pose. Total standing-up time: 0.5 + 1.0 = 1.5 s.
5. `ff_torque`: Applies +5 N·m of feed-forward torque to the third joint of each leg, usually the knee. This offsets body weight, reduces the PD controller's load, and prevents sagging while standing up. Other joints use zero feed-forward torque.
6. `joint_kp` / `joint_kd`: PD gains during standing up.

   - `kp` reaches 400, giving higher stiffness than the folding phase. Higher `kd` suppresses impact and oscillation.
   - The fourth joint (foot) uses `kp=5` and `kd=0.5` to remain compliant.
