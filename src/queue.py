# Modify from Github xiaodouu/gotolibrary_websockets
from websocket import  create_connection
import websocket
import ssl # resolve ssl verify error
import sys
import time

# get cookie_string from argv
cookie_string = ""
try:
    cookie_string = sys.argv[1]
except:
    print("")

# if cookie_string is empty, read cookie_string from file .env
if cookie_string == '':
    with open("../.env", "r") as f:
        file_values = {}
        for line in f.readlines():
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip("\"'")
                file_values[key] = value
        cookie_string = "wechatSESS_ID" + "=" + file_values["wechatSESS_ID"] + ";" + "Authorization" + "=" + file_values["Authorization"]
        if cookie_string == '':
            print("Error: cookie_string is empty")
            exit()

headers=["Pragma: no-cache",
                "Cache-Control: no-cache",
                "User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x6307001e)",
                "Cookie: " + cookie_string,
                "Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                "Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits",
    ]
ws = websocket.WebSocket()
    # 建立websocket连接，这里传入了 header ，需要注意header的写入方式
ws.connect("wss://wechat.v2.traceint.com/ws?ns=prereserve/queue",
               header=headers, sslopt={"cert_reqs": ssl.CERT_NONE})
if ws.connected:
        # 接收实时数据，并打印出来
        while True:
            ws.send('{"ns":"prereserve/queue","msg":""}')
            try:
                a = ws.recv()
            except:
                print("CANCEL") # 读取结果失败 则连接已关闭 排队结束
                exit()
            if a.find('u6392') != -1: # 排队成功返回的第一个字符
                print("SUCCESS")
                break
            elif a.find('1000') != -1:
                print("ERROR") # 排队出错 code:1000 一般为cookie失效
                break
            elif a.find('u4e0d') != -1:
                print("PENDING") # 不在预约时间段内
                time.sleep(0.5)
            else:
                print(a) # 在队列中 data字段代表前方人数
            sys.stdout.flush() # flush stdout ensure nodejs can get the output
        # 关闭连接
        ws.close()

# if connection is closed, exit
if not ws.connected:
    exit()