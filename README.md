# cn-area-data

中国行政规划 - 省市区数据

## 功能支持

- ✔ 数据高度压缩
- ✔ 支持名称和 code 数据

## 使用说明

通过压缩算法解决省市区数据文件过大的问题。

### 安装

`pnpm add cn-area-data`

### 使用

```ts
import { getCnAreaData } from 'cn-area-data';
const areaData = getCnAreaData(); // 输出的格式为 省/市/区 数组格式
```

###

原始的数据来源：https://github.com/modood/Administrative-divisions-of-China
