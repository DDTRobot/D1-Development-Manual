# Environment & network

This page covers network configuration and the build environment. For your first connection, complete [Quick Start](Quick_Start.md), then use the settings on this page as needed.

## Environment dependencies

### System environment

Ubuntu 22.04 with ROS 2 Humble is recommended for development and debugging. You can develop on D1's onboard computer or on an external computer connected to D1.

### Network environment

Connect your own USB Type-C cable to the Type-C port closest to the Ethernet port, then log in to the robot:

```bash
ssh robot@192.168.42.1
```

The password is `ddt`. For details, see the product manual. The network adapter connecting your computer to D1 receives an address in the `192.168.42.xxx` subnet automatically; no manual IP configuration is required.

```{warning}
1. If Windows does not recognize the USB network adapter after connecting the USB Type-C cable, install the missing driver. See the [USB network driver instructions](https://milkv.io/zh/docs/duo/getting-started/setup#).
2. Do not use the flashing cable for debugging. Doing so may accidentally put the system into flashing mode and prevent normal startup.
```

#### Wi-Fi connection

To download ROS packages and other dependencies, connect the robot to the internet:

1. Open the Wi-Fi configuration file:

   ```bash
   sudo vim /etc/wpa_supplicant/wpa_supplicant-nl80211-wlan0.conf
   ```

2. Set `ssid="WIFI name"` and `psk="PassWord"` as shown in the example.
3. Restart the system after saving the changes.

![Wi-Fi configuration example](../_static/flash8.jpeg)

#### Wi-Fi AP hotspot mode

See [Wi-Fi hotspot](TITA-wifi_app.md) for details.

### Ethernet port configuration

Use this configuration to exchange data between D1 and an external computer over Ethernet.

```bash
sudo apt update
sudo apt install network-manager
```

Download the configuration files. Install Git first if it is not already installed:

```bash
sudo apt-get install git
git clone https://github.com/DDTRobot/TowerNetworkManager.git
```

Install the configuration and remove the old Wi-Fi configuration file to avoid conflicts:

```bash
cd TowerNetworkManager/
chmod 777 install.sh
sudo ./install.sh
sudo rm -rf /etc/wpa_supplicant/wpa_supplicant-nl80211-wlan0.conf
```

For subsequent Wi-Fi connections, use `sudo nmcli device wifi connect "example" password "1111111"`.

After setup, `ifconfig` should show the automatically assigned address `192.168.19.97` on `eth0`. External devices receive addresses in the `192.168.19.xx` subnet automatically.

### Install build tools

Install the tools for `colcon build` on D1's onboard system:

```bash
sudo apt update
sudo apt-get install python3-colcon-common-extensions
```

If `python3-colcon-common-extensions` cannot be installed, create or edit this configuration file:

```bash
sudo vim /etc/apt/apt.conf.d/99insecure
```

Add the following settings:

```text
Acquire::AllowInsecureRepositories "true";
Acquire::AllowDowngradeToInsecureRepositories "true";
```

Then run `sudo apt update` again.
