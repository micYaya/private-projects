// const tencentcloud = require("tencentcloud-sdk-nodejs");
// const path = require("path");
// const fs = require("fs");
// const axios = require('axios')

// // 导入 OCR 客户端
// const OcrClient = tencentcloud.ocr.v20181119.Client;

// // 你的密钥信息（请务必保护密钥）
// const clientConfig = {
//   credential: {
//     secretId: "AKIDUxLTfprgKo5CEFA2oZDh0A93l392h8OR",
//     secretKey: "tY5UkoiPtAmDVnwwoUxDHAqJYcScaYSG",
//   },
//   region: "ap-guangzhou",
//   profile: {
//     httpProfile: {
//       endpoint: "ocr.tencentcloudapi.com",
//     },
//   },
// };

// // 随机获取图片
// const imageUrl = 'http://127.0.0.1:5000';
// axios.get(imageUrl, { responseType: 'arraybuffer' })
//   .then(response => {
//     const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');

//     // 设置 OCR 请求参数
//     const params = { ImageBase64: imageBase64 };

//     // 创建 OCR 客户端
//     const client = new OcrClient(clientConfig);

//     // 发送 OCR 请求
//     client.RecognizeTableOCR(params)
//       .then((data) => {
//         console.log("OCR 识别成功！");

//         // 将 OCR 结果保存
//         const outputDir = path.join(__dirname, "output");
//         if (!fs.existsSync(outputDir)) {
//           fs.mkdirSync(outputDir);
//         }

//         // 保存 OCR 结果
//         const outputPath = path.join(outputDir, "new_ocr_output.json");
//         fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
//         console.log(`OCR 结果已保存至: ${outputPath}`);

//         // 处理 OCR 结果，匹配字段
//         matchTemplateWithData(outputPath, path.join(__dirname, "template.json"));
//       })
//       .catch((err) => {
//         console.error(`OCR 识别失败: ${err.message}`);
//       });
//   })
//   .catch(error => {
//     console.error(`获取图片失败: ${error.message}`);
//   });

// // 计算四边形中心点
// function getCenterPoint(polygon) {
//   let sumX = 0, sumY = 0;
//   polygon.forEach(point => {
//     sumX += point.X;
//     sumY += point.Y;
//   });
//   return { X: sumX / polygon.length, Y: sumY / polygon.length };
// }

// // 计算欧几里得距离
// function calculateDistance(p1, p2) {
//   return Math.sqrt(Math.pow(p1.X - p2.X, 2) + Math.pow(p1.Y - p2.Y, 2));
// }

// // 进行匹配
// function matchTemplateWithData(ocrFilePath, templateFilePath) {
//   const ocrData = JSON.parse(fs.readFileSync(ocrFilePath, "utf-8"));
//   const templateData = JSON.parse(fs.readFileSync(templateFilePath, "utf-8"));

//   let matchedData = {};

//   // 遍历模板中的字段
//   for (let field in templateData) {
//     let templatePoint = templateData[field];  // 模板坐标
//     let minDistance = Number.MAX_VALUE;
//     let matchedText = null;
//     ocrData.TableDetections.forEach((table) => {
//         table.Cells.forEach((cell) => {
//             let centerPoint = getCenterPoint(cell.Polygon);
//             let distance = calculateDistance(templatePoint, centerPoint);

//             if (distance < minDistance) {
//                 minDistance = distance;
//                 matchedText = cell.Text;
//             }
//         });
//     });
//     matchedData[field] = matchedText || "未匹配到数据";
//   }

//   // 输出匹配结果
//   const outputPath = path.join(__dirname, "output", "matched_data.json");
//   fs.writeFileSync(outputPath, JSON.stringify(matchedData, null, 2), "utf-8");
//   console.log(`匹配数据已保存至: ${outputPath}`);
// }

// // "res234": { "X": 1494, "Y": 1176 },
// // "res3": { "X": 1887.25, "Y": 1176 },
// // "res4": { "X": 2279, "Y": 1176 }

// // 提示词：第一张图片是模板图片，红色方框是旁边黄色字体字段所对应的数据内容，现在给我第二张图片的所有字段对应的数据

// const tencentcloud = require("tencentcloud-sdk-nodejs");
// const axios = require('axios');
// const path = require("path");
// const fs = require("fs");

// // 导入 OCR 客户端
// const OcrClient = tencentcloud.ocr.v20181119.Client;

// // 你的密钥信息（请务必保护密钥）
// const clientConfig = {
//   credential: {
//     secretId: "AKIDUxLTfprgKo5CEFA2oZDh0A93l392h8OR",
//     secretKey: "tY5UkoiPtAmDVnwwoUxDHAqJYcScaYSG",
//   },
//   region: "ap-guangzhou",
//   profile: {
//     httpProfile: {
//       endpoint: "ocr.tencentcloudapi.com",
//     },
//   },
// };

// // 随机获取图片
// const imageUrl = 'http://127.0.0.1:5000';

// async function performOCR() {
//   try {
//     const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//     const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');

//     // 设置 OCR 请求参数
//     const params = { ImageBase64: imageBase64 };

//     // 创建 OCR 客户端
//     const client = new OcrClient(clientConfig);

//     // 发送 OCR 请求
//     const ocrData = await client.RecognizeTableOCR(params);

//     // 处理 OCR 结果，匹配字段
//     const templateFilePath = path.join(__dirname, "template.json");
//     const templateData = JSON.parse(fs.readFileSync(templateFilePath, "utf-8"));

//     let matchedData = {};

//     // 遍历模板中的字段
//     for (let field in templateData) {
//       let templatePoint = templateData[field];  // 模板坐标
//       let minDistance = Number.MAX_VALUE;
//       let matchedText = null;
//       ocrData.TableDetections.forEach((table) => {
//         table.Cells.forEach((cell) => {
//           let centerPoint = getCenterPoint(cell.Polygon);
//           let distance = calculateDistance(templatePoint, centerPoint);

//           if (distance < minDistance) {
//             minDistance = distance;
//             matchedText = cell.Text;
//           }
//         });
//       });
//       matchedData[field] = matchedText || "未匹配到数据";
//     }

//     return { matchedData, imageUrl };
//   } catch (error) {
//     console.error('OCR 处理失败:', error);
//     throw error;
//   }
// }

// // 计算四边形中心点
// function getCenterPoint(polygon) {
//   let sumX = 0, sumY = 0;
//   polygon.forEach(point => {
//     sumX += point.X;
//     sumY += point.Y;
//   });
//   return { X: sumX / polygon.length, Y: sumY / polygon.length };
// }

// // 计算欧几里得距离
// function calculateDistance(p1, p2) {
//   return Math.sqrt(Math.pow(p1.X - p2.X, 2) + Math.pow(p1.Y - p2.Y, 2));
// }

// module.exports = { performOCR };


const OpenAI = require('openai');

// 替换为你自己的信息
const API_KEY = 'c496eaaf-cfa4-41d5-944d-c8a5f8655912';
const ENDPOINT_ID = 'ep-20250316222521-2f4j2';

// 初始化 OpenAI 客户端
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});
let index = Math.floor((Math.random() * 200) + 1);
// 调用豆包大模型 API
async function callDoubaoAPI() {
    try {
        // 两张图片的 URL
        // const randomImageUrl = 'https://a43c-240e-45d-ce60-9575-d878-c1d5-25cd-aa4f.ngrok-free.app/';
        // const templateImageUrl = 'https://a43c-240e-45d-ce60-9575-d878-c1d5-25cd-aa4f.ngrok-free.app/template_image.jpg';
        const randomImageUrl = `https://images-yayamic.tos-cn-beijing.volces.com/images/${index}.jpg`;
        const templateImageUrl = 'https://images-yayamic.tos-cn-beijing.volces.com/template_image.jpg';
        const data = {
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `第一张图片是模板图片，红色方框是旁边黄色字体字段所对应的数据内容，现在给我第二张图片的所有字段对应的数据，请解析第二张图片， 包含字段：
                            twoP, tanValue, measuredId, temperature, humidity, testDate,
                            fa, fb, fc, da, db, dc, dUa, dUb, dUc,
                            Upta, Uptb, Uptc, Uyba, Uybb, Uybc,
                            rate, res1, res2, res3, res4
                        所返回内容格式如下（注意 testDate 对应的数据里年月日之间需要用英文的“-”隔开）：
                        {
                              twoP: '78.6',
                              tanValue: '-1.2866',
                              measuredId: 55894688,
                              temperature: '20.3',
                              humidity: '80.3',
                              testDate: "2023-11-19",
                              fa: '0.6775',
                              fb: '0.8060',
                              fc: '0.6180',
                              da: '-0.601',
                              db: '-0.401',
                              dc: '-0.207',
                              dUa: '0.6961',
                              dUb: '0.3159',
                              dUc: '0.0470',
                              Upta: '69.555',
                              Uptb: '71.317',
                              Uptc: '40.714',
                              Uyba: '12.283',
                              Uybb: '55.243',
                              Uybc: '1.792',
                              rate: '0.510',
                              res1: '1.792',
                              res2: '1.792',
                              res3: '0.510',
                              res4: '0.510'
                            }`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: templateImageUrl
                            }
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: randomImageUrl
                            }
                        }
                    ]
                }
            ],
            model: ENDPOINT_ID,
        };

        const completion = await openai.chat.completions.create(data);
        const responseContent = completion.choices[0]?.message?.content;
        console.log('大模型回复内容:', responseContent);
        console.log(randomImageUrl);
        return responseContent;

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('无法连接到随机图片服务，请检查服务是否启动。');
        } else {
            console.error('调用豆包大模型失败:', error);
        }
        throw error;
    }
}

module.exports = { callDoubaoAPI };