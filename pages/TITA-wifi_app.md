# WIFI Portable Application
```{toctree}
:maxdepth: 1
:glob:
```
------

## Installation and Deployment
```
sudo apt install network-manager
git clone https://github.com/DDTRobot/config_of_documents.git
cd config_of_documents
sudo chmod +x install.sh
sudo ./install.sh
#Power off and restart
```
```{note}
AP hotspot mode
SSID: TITAxxxxxxx
Password: 12345678  
IP Address: 10.42.0.1
```

## Commands

1、Enable AP hotspot mode:

```
 sudo wifi-app -ap_on
```
![wifi_ap_of](../_static/wif-app_ap_on.png)

2、Connect to WiFi, If AP mode is active, disable it first:

```{warning}
sudo wifi-app -ap_off
```
Then:

```
sudo wifi-app -on
```
![wifi_on](../_static/wifi_on.png)
(1) ctrl+c #enter
(2) Enter WiFi name   #enter
(3) password  #enter
![wifi_app](../_static/wifi_app.png)

3、Enable AP mode on boot:

```
cd config_of_documents
cp wifi-app.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable wifi-app.service
systemctl restart wifi-app.service
```
