# Deploying the Langyi navigation tower (S2 Lite) on D1

This page covers two deployment methods—building from source and installing a deb package—as well as checking service status and uninstalling the package. Choose one deployment method.

## Method 1: Build from source

### Get the source and build

Clone the repository into `D1_langyi_sdk_demo`, then build from that directory:

```bash
git clone https://github.com/DDTRobot/d1_langyi_sdk_demo.git D1_langyi_sdk_demo
cd D1_langyi_sdk_demo
colcon build
```

### Start

After building, run the following from the project root:

```bash
bash start_D1.sh
```

## Method 2: Install the deb package

### Download and install

Download `d1-langyi-sdk_1.0.0_arm64.deb` from the repository root, then run the following on the robot:

```bash
sudo dpkg -i d1-langyi-sdk_1.0.0_arm64.deb
```

Installation places the project files in `/opt/d1_langyi_sdk_demo/`. The service can then be started manually.

### Check service status

```bash
systemctl status d1_langyi.service
```

### Uninstall

```bash
sudo dpkg -r d1-langyi-sdk
```
