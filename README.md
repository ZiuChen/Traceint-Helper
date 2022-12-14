## Traceint Helper

**代码仅供学习交流使用 下载后请于24小时内删除**

**严禁修改代码二次分发或将代码用于盈利**

**作者不提供技术支持 不对使用脚本产生的任何后果负责**

- 支持预设任务 指定图书馆与座位号
- 支持捡漏模式 有座自动预约并系统通知
- 支持明日预约 支持自动排队
- Cookie等隐私内容以环境变量保存在本地

## 使用说明

```sh
# 将代码克隆到本地
git clone https://github.com/ZiuChen/Traceint-Helper.git
# 安装依赖
npm install
# 将.sample.env重命名为.env
mv .sample.env .env
# 自行抓包后 将Cookie等数据填入.env
# 运行命令
npm run local
```

## 注意事项

在填写 `.env` 时:

- `ReserveTask` 请填入最小化后的JSON数据
  - `ReserveTask` 中的参数 `libId` 为不同自习室id 可从执行脚本时控制台输出获取
  - `ReserveTask` 中的值均为数字而非字符串, 不要用双引号
- `IgnoreLibIds` 填入的自习室id 将在捡漏模式下被忽略
- `SleepUntil` 填入开始明日预约排队的时间

在初始化入口函数`index.js`时:

函数 `startPrereserve` 或 `startReserve` 的入参 `isMapAll` 默认为 `false`, 如果为其传入了 `true` 那么即使配置了 `ReserveTask`, 也会遍历所有的自习室(即捡漏模式)