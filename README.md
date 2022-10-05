## Traceint Helper

- 不支持明日预约
- 支持预设抢课任务 指定图书馆与座位号
- 支持捡漏模式 有座即可
- Cookie等内容以环境变量保存在本地
- 即用即开 用完即关

## 使用说明

```sh
# 将代码克隆到本地
git clone https://github.com/ZiuChen/Traceint-Helper.git
# 安装依赖
pnpm install
# 将.sample.env重命名为.env
mv .sample.env .env
# 自行抓包后 将Cookie等数据填入.env
# 执行脚本 检查控制台输出
node index.js
```

**ReserveTask请填入最小化后的JSON数据**
