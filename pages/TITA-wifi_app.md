# Wi-Fi hotspot

## Installation and deployment

```bash
sudo apt install network-manager
git clone https://github.com/DDTRobot/config_of_documents.git
cd config_of_documents
sudo chmod +x install.sh
sudo ./install.sh
```

Power off and restart after installation.

```{note}
AP hotspot settings:

- Wi-Fi name: `TITAxxxxxxx`
- Password: `12345678`
- IP address: `10.42.0.1`
```

## Commands

### Enable AP hotspot mode

```bash
sudo wifi-app -ap_on
```

![Enable AP hotspot mode](../_static/wif-app_ap_on.png)

### Connect to Wi-Fi

```{warning}
If AP hotspot mode is enabled, run `sudo wifi-app -ap_off` to turn it off before connecting to an external Wi-Fi network.
```

```bash
sudo wifi-app -on
```

![Start the Wi-Fi connection](../_static/wifi_on.png)

1. Press `Ctrl+C`, then `Enter`.
2. Enter the Wi-Fi name, then press `Enter`.
3. Enter the password, then press `Enter`.

![Enter the Wi-Fi name and password](../_static/wifi_app.png)

### Enable AP hotspot mode on boot

```bash
cd config_of_documents
cp wifi-app.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable wifi-app.service
systemctl restart wifi-app.service
```
