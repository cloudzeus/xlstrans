const FileProcessor = require("./controller");

const ws = FileProcessor.getWs("./erpFinalFacom.xlsx");
const supplierWs = FileProcessor.getAllWs("./facomfinal.xlsx");
const wsJson = FileProcessor.joinWsJson(supplierWs);
const singleJson = FileProcessor.getJson(ws);

// console.log(wsJson.length);
// console.log(wsJson.length);
console.log(singleJson[1]);
// console.log(wsJson[3]);
