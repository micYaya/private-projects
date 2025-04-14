// const { callDoubaoAPI } = require('./process.js');

// async function main() {
//     try {
//         const result = await callDoubaoAPI();
//         console.log('大模型返回结果:', result);
//     } catch (error) {
//         console.error('处理过程中出现错误:', error);
//     }
// }

// main();

let a = `{
    "twoP": "0.0",
    "tanValue": "-32.1798",
    "measuredId": 15754509,
    "temperature": "0.8",
    "humidity": "12.6",
    "testDate": "2023-11-04",
    "fa": "0.7748",
    "fb": "0.5926",
    "fc": "0.0452",
    "da": "-0.759",
    "db": "-0.043",
    "dc": "-0.497",
    "dUa": "0.4990",
    "dUb": "0.5611",
    "dUc": "0.9797",
    "Upta": "3.675",
    "Uptb": "88.359",
    "Uptc": "16.857",
    "Uyba": "35.085",
    "Uybb": "93.253",
    "Uybc": "21.011",
    "rate": "0.336",
    "res1": "5.634",
    "res2": "5.625",
    "res3": "9548.3",
    "res4": "3.882"
}`
console.log(JSON.parse(a));