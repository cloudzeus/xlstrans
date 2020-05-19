// const path = require("path");
// const fs = require("fs");
const xlsx = require("xlsx");
// const _ = require("lodash");
class FileProcessor {
  static getWs(fileName) {
    let workBook = xlsx.readFile(fileName, { cellDates: true });
    // console.log("workBook", workBook);
    let firstSheetName = workBook.SheetNames[0];
    let workSheet = workBook.Sheets[firstSheetName];
    return workSheet;
  }
  static getAllWs(fileName) {
    let workBook = xlsx.readFile(fileName, { cellDates: true });
    let workSheets = [];
    workBook.SheetNames.map((wsName) => {
      workSheets.push(workBook.Sheets[wsName]);
    });
    return workSheets;
  }
  static joinWsJson(wsArray) {
    let result = [];
    wsArray.map((ws) => {
      result = result.concat(this.getJson(ws));
    });
    return result;
  }
  static getJson(ws) {
    // console.log("Reaching..");
    let wsJson = xlsx.utils.sheet_to_json(ws);

    return wsJson;
  }
  static bosch(supplierFilePath, erpFilePath) {
    const supplierWs = FileProcessor.getAllWs(supplierFilePath);
    let supplier = this.joinWsJson(supplierWs);
    let erp = this.getJson(this.getWs(erpFilePath));
    console.log("Reaching");
    erp = erp.map((rec, index) => {
      if (index == 0) return {};
      let descriptionArr = rec.__EMPTY.split(" ") || [];
      // // console.log("Supplier",supplier )
      // console.log("descriptionArr ",descriptionArr )
      let matchedSupplier = supplier.find((sup) => {
        let supl = descriptionArr.find((word) => {
          // console.log("SUp", sup);
          // console.log("Code", sup["supplier codeς"]);
          // console.log("Word",word);
          return sup["supplier code"] === word;
        });
        // console.log("SUPL",supl)
        return supl ? true : false;
      });
      // console.log("matchedSupplier",matchedSupplier);

      // console.log("Rec",rec)
      if (matchedSupplier) {
        // console.log("matched", matchedSupplier);
        let price = matchedSupplier.price;
        let supplierCode = matchedSupplier["supplier code"];
        return {
          barcode: rec["Υπόλοιπα ανά ΑΧ"],
          description: rec.__EMPTY,
          supplier: "BOSCH",
          price: price,
          "supplier code": supplierCode,
          "ean code":
            matchedSupplier["EAN Code"] ||
            matchedSupplier["EAN Code 3165140…"] ||
            matchedSupplier["ean code"],
        };
      } else {
        let code = /[\w|\d]{10}|(\w\d{7})\w+|\d{3,}\W\d+/.exec(rec.__EMPTY);
        // console.log("rec", rec);
        return {
          barcode: rec["Υπόλοιπα ανά ΑΧ"],
          description: rec.__EMPTY,
          supplier: "BOSCH",
          price: rec.__EMPTY_5,
          "supplier code": code ? code[0] : "",
          "ean code": rec["ean code"] || rec["EAN-14"],
        };
        // console.log(rec)
      }
    });
    console.log("Updating complete");
    //creating a new ws from the result json
    const resultsWs = xlsx.utils.json_to_sheet(erp);
    // resultsWs["!margins"] = this.getWs("erp.xlsx")["!margins"];
    // resultsWs["!formatRows"] = false;
    //creating a new wb
    const resultsWb = xlsx.utils.book_new();
    // adding ws to wb
    xlsx.utils.book_append_sheet(resultsWb, resultsWs, "result");
    //new filenme
    const priceFileName =
      "priceLists/bosch/" +
      `${new Date().toLocaleDateString().split("/").join("-")}-${Date.now()}` +
      ".xlsx";
    //writing the wb to file
    xlsx.writeFile(resultsWb, priceFileName);
    console.log("writing file complete");
    return priceFileName;
  }
  static dremel(supplierFilePath, erpFilePath) {
    // console.log(supplierFilePath, erpFilePath);
    let erp = this.getJson(this.getWs(erpFilePath));
    console.log("Reaching...");
    const supplier = this.getJson(this.getWs(supplierFilePath));
    console.log("Reading json complete...");
    erp = erp.map((rec, index) => {
      if (index == 0) return {};
      let descriptionArr = rec.__EMPTY.split(" ") || [];
      // // console.log("Supplier",supplier )
      // console.log("descriptionArr ",descriptionArr )
      let matchedSupplier = supplier.find((sup) => {
        let supl = descriptionArr.find((word) => {
          // console.log("SUp", sup);
          // console.log("Code", sup["supplier codeς"]);
          // console.log("Word",word);
          return sup["supplier codeς"] === word;
        });
        // console.log("SUPL",supl)
        return supl ? true : false;
      });
      // console.log("matchedSupplier",matchedSupplier);

      // console.log("Rec",rec)
      if (matchedSupplier) {
        // console.log("matched",matchedSupplier)
        let price =
          matchedSupplier["retail price"] || matchedSupplier["__EMPTY_3"];
        let supplierCode =
          matchedSupplier["supplier codeς"] || matchedSupplier["__EMPTY"];
        return {
          barcode: rec["Υπόλοιπα ανά ΑΧ"],
          description: rec.__EMPTY,
          price: price,
          "supplier code": supplierCode,
          "ean code": matchedSupplier["EAN Code"],
        };
      } else {
        let code = /[\w|\d]{10}|(\w\d{7})\w+/.exec(rec.__EMPTY);
        return {
          barcode: rec["Υπόλοιπα ανά ΑΧ"],
          description: rec.__EMPTY,
          price: rec.__EMPTY_1,
          "supplier code": code ? code[0] : "",
          "ean code": rec["ean code"],
        };
        // console.log(rec)
      }
    });
    console.log("Updating complete");
    //creating a new ws from the result json
    const resultsWs = xlsx.utils.json_to_sheet(erp);
    // resultsWs["!margins"] = this.getWs("erp.xlsx")["!margins"];
    // resultsWs["!formatRows"] = false;
    //creating a new wb
    const resultsWb = xlsx.utils.book_new();
    // adding ws to wb
    xlsx.utils.book_append_sheet(resultsWb, resultsWs, "result");
    //new filenme
    const priceFileName =
      "priceLists/dremel/" +
      `${new Date().toLocaleDateString().split("/").join("-")}-${Date.now()}` +
      ".xlsx";
    //writing the wb to file
    xlsx.writeFile(resultsWb, priceFileName);
    console.log("writing file complete");
    return priceFileName;
  }
  static columnDetails() {
    let erpWs = this.getWs("erp.xlsx");
    console.log(erpWs["!cols"]);
  }
}

module.exports = FileProcessor;
