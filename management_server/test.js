// // var findAnagrams = function(s, p) {
// //     if (!p) {
// //         return [];
// //     }
// //     function difference(b, a) {
// //         return a.filter(x => !(b.indexOf(x) !== -1));
// //     };
// //     let result = [];
// //     let left = 0, right = p.length - 1;
// //     let pp = p.split(''), ss = s.split('');
// //     for(; right < ss.length;){
// //         console.log('left:', left);
// //         console.log('right:', right);
// //         let temp = ss.slice(left, right + 1);
// //         let sss = difference(temp, pp);
// //         console.log('sss:', sss);
// //         if(sss.length === 0){
// //             result.push(left);
// //             console.log('result:', result);
// //             left += 1;
// //             right += 1;
// //         } else if(sss.length === pp.length){
// //             left += 3;
// //             right += 3;
// //         } else {
// //             left += 1 ;
// //             right += 1;
// //         }
// //     }
// //     // console.log(result);
// //     return result;
// // };

// // // console.log(findAnagrams('cbaebabacd', 'abc'));
// // // console.log(findAnagrams('abab', 'ab'));
// // console.log(findAnagrams('baa', 'aa'));

// const fs = require("fs");
// const path = require("path");

// // 读取 OCR 结果 JSON 文件
// const ocrOutputPath = path.join(__dirname, "ocr_output.json");
// const ocrData = JSON.parse(fs.readFileSync(ocrOutputPath, "utf-8"));

// // 计算 Polygon 中心点
// function getPolygonCenter(polygon) {
//   const centerX = polygon.reduce((sum, point) => sum + point.X, 0) / polygon.length;
//   const centerY = polygon.reduce((sum, point) => sum + point.Y, 0) / polygon.length;
//   return { X: centerX, Y: centerY };
// }

// // 解析 OCR 结果，生成定位模板
// const template = {};
// ocrData.TableDetections.forEach((table) => {
//   table.Cells.forEach((cell) => {
//     if (cell.Text) {
//       const center = getPolygonCenter(cell.Polygon);
//       template[cell.Text] = center;
//     }
//   });
// });

// // 保存定位模板
// const templatePath = path.join(__dirname, "output", "position_template.json");
// fs.writeFileSync(templatePath, JSON.stringify(template, null, 2), "utf-8");

// console.log(`定位模板已保存至: ${templatePath}`);


const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: 'c496eaaf-cfa4-41d5-944d-c8a5f8655912',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

// Image input:
async function main() {
  const response = await openai.chat.completions.create({
    apiKey: 'c496eaaf-cfa4-41d5-944d-c8a5f8655912',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: '这是哪里？' },
          {
            type: 'image_url',
            image_url: {
              url: 'https://ark-project.tos-cn-beijing.ivolces.com/images/view.jpeg',
            },
          },
        ],
      },
    ],
    model: 'ep-20250316222521-2f4j2',
  });

  console.log(response.choices[0]);
}

main();
