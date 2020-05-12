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
  static formatErp() {
    let erp = this.getJson(this.getWs("erp.xlsx"));
    erp = erp.map((rec) => {
      let code = /(\w\d{7})\w+/.exec(rec.description);

      rec["supplier code"] = code ? code[0] : "";
      return rec;
    });
    let erpWs = xlsx.utils.json_to_sheet(erp);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, erpWs, "erp-codes");
    xlsx.writeFile(wb, "erp-codes.xlsx");
  }
  static dremel(filePath) {
    let erp = this.getJson(this.getWs("erp.xlsx"));
    const supplier = this.getJson(this.getWs(filePath));
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
        return {
          ...rec,
          ["supplier code"]: supplierCode,
          price,
          ["EAN Code"]:
            matchedSupplier["EAN Code"] || matchedSupplier["__EMPTY_1"],
        };
      } else {
        let code = /[\w|\d]{10}|(\w\d{7})\w+/.exec(rec.description);
        return {
          ...rec,
          ["supplier code"]: code ? code[0] : "",
        };
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
    //new filenme
    const priceFileName = "priceLists/dremel/" + Date.now() + ".xlsx";
    //writing the wb to file
    xlsx.writeFile(resultsWb, priceFileName);
    return priceFileName;
  }
  static columnDetails() {
    let erpWs = this.getWs("erp.xlsx");
    console.log(erpWs["!cols"]);
  }
}

module.exports = FileProcessor;
