
# Hardware Pairing and Connection

```{toctree}
:maxdepth: 1
:glob:
```

------

## Remote Controller Pairing Method 1

Note: For older system versions, install the pairing tool using:

```{note}
sudo apt install crsf-app
```

1. Install crsf-app (skip if already installed):
```bash
sudo dpkg -i crsf-app
# If not installed:
sudo apt update
sudo apt-get install crsf-app
```
2. Run the pairing command:

    ```
    crsf-app -bind
    ```

    ![f9](../_static/flash9.jpg) <br>You should see output similar to the screenshot.

3. Power on the remote controller. Push the right-side button left to enter the menu, then navigate:
    Tools → ExpressLRS → Bind. This starts binding with the receiver.

    ![controller2](../_static/controller2.JPEG)
     ![controller3](../_static/controller3.JPEG) 
     <br>

4. When pairing is successful, the controller will display: **pair success**
  ![controller4](../_static/controller4.jpg) 
---
 <br> <br>

## Remote Control Pairing Method 2
1. Obtain the supplied dual-head USB-C cable or use your own full-featured USB-C to USB-C cable.
![alt text](../_static/image.png)
2. Keep the robot powered on; connect the cable to the USB-C port located next to the Gigabit-Ethernet jack and to the remote controller (see illustration).
![alt text](../_static/image_2.png)
Once the remote controller is linked to the robot, the handset will display a “Select Mode” menu—choose the third option: USB Serial.
![alt text](../_static/image_3.png)
3. Wait until the remote controller’s blue LED begins to blink slowly or stays solid; pairing is then complete.
## Remote Emergency Stop Switch Pairing

1. Remove the robot side panel to expose the emergency-stop receiver and buttons.
  ![remote_switch2](../_static/remote_switch2.png)
  <br>

2. Long‑press the pairing button on the receiver for 5 seconds until the indicator LED stays solid.
  ![remote_switch1](../_static/remote_switch1.png)
  <br>

3. Simultaneously long‑press button 1 and button 2 on the emergency stop remote until its indicator light stays solid.

  ![remote_switch3](../_static/remote_switch3.png)
  <br>

4. Press button 1 again.
  ![remote_switch4](../_static/remote_switch4.png)
  <br>

5. Reboot the robot. Pairing is now complete.