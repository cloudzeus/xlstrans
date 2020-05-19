const FileProcessor = require("./controller");

const ws = FileProcessor.getWs("./BoschListPrice.xlsx");
const supplierWs = FileProcessor.getAllWs("./BoschListPrice.xlsx");
const wsJson = FileProcessor.getJson(ws);

console.log(FileProcessor.getJson(supplierWs[2])[0]);
