# Wi-Fi 热点应用

## 安装部署

```bash
sudo apt install network-manager
git clone https://github.com/DDTRobot/config_of_documents.git
cd config_of_documents
sudo chmod +x install.sh
sudo ./install.sh
```

安装完成后，断电重启。

```{note}
AP 热点信息：

- Wi-Fi 名称：`TITAxxxxxxx`
- 密码：`12345678`
- IP 地址：`10.42.0.1`
```

## 使用指令

### 开启 AP 热点模式

```bash
sudo wifi-app -ap_on
```

![开启 AP 热点模式](../_static/wif-app_ap_on.png)

### 连接 Wi-Fi

```{warning}
连接外部 Wi-Fi 前，若已开启 AP 热点模式，请先执行 `sudo wifi-app -ap_off` 关闭热点。
```

```bash
sudo wifi-app -on
```

![启动 Wi-Fi 连接](../_static/wifi_on.png)

1. 按 `Ctrl+C`，然后按 `Enter`。
2. 输入 Wi-Fi 名称，然后按 `Enter`。
3. 输入密码，然后按 `Enter`。

![输入 Wi-Fi 名称和密码](../_static/wifi_app.png)

### 开机默认开启 AP 热点

```bash
cd config_of_documents
cp wifi-app.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable wifi-app.service
systemctl restart wifi-app.service
```
