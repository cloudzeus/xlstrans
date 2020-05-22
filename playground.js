const FileProcessor = require("./controller");

const ws = FileProcessor.getWs("./facomErp.xlsx");
// const supplierWs = FileProcessor.getAllWs("./BoschListPrice.xlsx");
const wsJson = FileProcessor.getJson(ws);

console.log(wsJson[2]);
// console.log(wsJson[1]);
// console.log(wsJson[3]);
