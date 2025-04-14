const tencentcloud = require("tencentcloud-sdk-nodejs");
const path = require("path");
const fs = require("fs");

// 导入 OCR 客户端
const OcrClient = tencentcloud.ocr.v20181119.Client;

// 设置密钥信息（请确保安全存储密钥，不要直接暴露在代码中）
const clientConfig = {
  credential: {
    secretId: "AKIDUxLTfprgKo5CEFA2oZDh0A93l392h8OR",
    secretKey: "tY5UkoiPtAmDVnwwoUxDHAqJYcScaYSG",
  },
  region: "ap-guangzhou", // 设置请求地域
  profile: {
    httpProfile: {
      endpoint: "ocr.tencentcloudapi.com",
    },
  },
};

// 读取图片
const imagePath = path.join(__dirname, "images", "1.jpg");
let imageBase64;
try {
  imageBase64 = fs.readFileSync(imagePath, "base64");
} catch (err) {
  console.error(`读取图片失败: ${err.message}`);
  process.exit(1);
}

// 设置 OCR 请求参数
const params = { ImageBase64: imageBase64 };

// 创建 OCR 客户端
const client = new OcrClient(clientConfig);

// 发送 OCR 请求
client.RecognizeTableOCR(params)
  .then((data) => {
    console.log("OCR 识别成功！");
    
    // 确保输出目录存在
    const outputDir = path.join(__dirname, "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // 定义 JSON 输出路径
    const outputPath = path.join(outputDir, "ocr_output.json");

    // 将 OCR 结果写入 JSON 文件
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`OCR 结果已保存至: ${outputPath}`);
  })
  .catch((err) => {
    console.error(`OCR 识别失败: ${err.message}`);
  });

