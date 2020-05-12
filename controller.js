// const path = require("path");
// const fs = require("fs");
const xlsx = require("xlsx");
// const _ = require("lodash");
class FileProcessor {
  static getWs(fileName) {
    let workBook = xlsx.readFile(fileName, { cellDates: true });
    let firstSheetName = workBook.SheetNames[0];
    let workSheet = workBook.Sheets[firstSheetName];
    return workSheet;
  }
  static getJson(ws) {
    let wsJson = xlsx.utils.sheet_to_json(ws);
    return wsJson;
  }
  static exec(supplierName) {
    let erp = this.getJson(this.getWs("erp.xlsx"));
    const supplier = this.getJson(this.getWs(supplierName));
    erp = erp.map((rec) => {
      let descriptionArr = rec.description.split(" ");
      let matchedSupplier = supplier.find((sup) => {
        let supl = descriptionArr.find((word) => {
          // console.log("SUp", sup);
          // console.log("Code", sup["__EMPTY"]);
          return sup["supplier codeς"] === word || sup["__EMPTY"] === word;
        });
        return supl ? true : false;
      });
      // console.log(matchedSupplier);
      if (matchedSupplier) {
        let price =
          0.6 * matchedSupplier["retail price"] ||
          0.6 * matchedSupplier["__EMPTY_3"];
        let supplierCode =
          matchedSupplier["supplier code"] || matchedSupplier["__EMPTY"];
        return { ...rec, ["supplier code"]: supplierCode, price };
      } else {
        return rec;
      }
    });
    //creating a new ws from the result json
    const resultsWs = xlsx.utils.json_to_sheet(erp);
    resultsWs["!margins"] = this.getWs("erp.xlsx")["!margins"];
    // resultsWs["!formatRows"] = false;
    //creating a new wb
    const resultsWb = xlsx.utils.book_new();
    // adding ws to wb
    xlsx.utils.book_append_sheet(resultsWb, resultsWs, "result");
    //writing the wb to file
    xlsx.writeFile(resultsWb, "dremel_pricelist.xlsx");
  }
  static columnDetails() {
    let erpWs = this.getWs("erp.xlsx");
    console.log(erpWs["!cols"]);
  }
}

FileProcessor.exec("dremel.xlsm");
