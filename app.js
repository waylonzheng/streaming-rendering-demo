const express = require('express');
const app = express();
const path = require('path');

// 前端页面
app.use(express.static(path.resolve(__dirname, './public')))

/** 
 * @type {Array<{goodsId: number, color?: string, size?: string}>}
 * @description 模拟100条商品主数据（只含有goodsId）
*/
const goods = Array.from({ length: 100 }, (_, i) => ({ goodsId: i }));
// 模拟混入数据
const getData = ({ goodsId }) => new Promise((resolve) => {
  // 随机生成颜色 模拟需要混入的数据
  const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
  const size = Math.random() > 0.5 ? 'L' : 'S';
  setTimeout(() => resolve({ goodsId, color, size }), 100);
});
// 流式处理
app.get('/getGoodsByStream', async (req, res) => {
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain');

  const startTime = Date.now();
  const run = async (i = 0) => {
    const { goodsId } = goods[i];
    return await getData(goodsId);
  };
  for (let i = 0; i < goods.length; i++) {
    const { color, size } = await run(i);
    goods[i].color = color;
    goods[i].size = size;
    res.write(JSON.stringify(goods[i]));
  }
  const endTime = Date.now();

  res.end();
  console.log('流式处理用时:', endTime - startTime);
});
// 一次性处理
app.get('/getGoods', async (req, res) => {
  const startTime = Date.now();
  const run = async (i = 0) => {
    const { goodsId } = goods[i];
    return await getData(goodsId);
  };
  for (let i = 0; i < goods.length; i++) {
    const { color, size } = await run(i);
    goods[i].color = color;
    goods[i].size = size;
  }
  const endTime = Date.now();

  res.json(goods);
  console.log('一次性处理用时:', endTime - startTime);
});
app.listen(3000);