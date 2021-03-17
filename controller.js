const path = require("path");
// const fs = require("fs");
const xlsx = require("xlsx");
// const _ = require("lodash");
class FileProcessor {
  constructor() {

    this.globalErpFormat = path.join(__dirname, 'globalErpFormat.xlsx');
  }
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
      // result = result.concat(this.getJson(ws));

      //Checking is the item is in the result already, if so, update it's price wit the highest between the 2
      //otherwise just push the object to the results array
      this.getJson(ws).forEach((rec) => {
        const exists = result.find((x) => rec.__EMPTY_2 === x.__EMPTY_2);
        rec;
        if (exists) {
          const index = result.findIndex(
            (obj) => obj.__EMPTY_2 === exists.__EMPTY_2
          );
          result[index].price =
            exists.price > result[index].price
              ? exists.price
              : result[index].price;
        } else {
          result.push(rec);
        }
      });
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
  static generateFile(supplierFilePath, erpFilePath, supplierName) {
    const supplier = this.getJson(this.getWs(supplierFilePath));
    let erp = this.getJson(this.getWs(erpFilePath));


    // let supplierCodeRegex = /[\w|\d]{10}|(\w\d{7})\w+|\d{3,}\W\d+|[\w+|\d+|\\,|\\.|\w+|\d+]{6,}/

    erp = erp.map((rec, index) => {
      if (index == 0) return {};
      // let supplierCodeFromDescription = supplierCodeRegex.exec(rec.__EMPTY_1)
      let matchedSupplier = supplier.find((sup) => {
        const matched = rec.__EMPTY_3 == sup['supplier code']
        return matched
      });

      // let defaultSupplierCode = /[\w|\d]{10}|(\w\d{7})\w+|\d{3,}\W\d+/.exec(rec.__EMPTY_1);


      const defaultRecord = {
        'erp code': rec.__EMPTY,
        description: rec.__EMPTY_1,
        supplier: supplierName,
        "supplier code": rec.__EMPTY_3,
        "ean code": rec.__EMPTY_4,
        price: rec.__EMPTY_5,
      };

      // console.log("Rec",rec)
      if (matchedSupplier) {
        // console.log("matched", matchedSupplier);
        return {
          ...defaultRecord,
          'erp code': rec.__EMPTY,
          description: rec.__EMPTY_1,
          supplier: supplierName,
          price: matchedSupplier.price,
          "supplier code": matchedSupplier["supplier code"],
          "ean code":
            matchedSupplier["ean code"],
        };
      } else {
        return defaultRecord
      }
    });
    console.log("Updating complete");
    //creating a new ws from the result json
    const resultsWs = xlsx.utils.json_to_sheet(erp);
    const resultsWb = xlsx.utils.book_new();
    // adding ws to wb
    xlsx.utils.book_append_sheet(resultsWb, resultsWs, "result");
    //new filenme
    const priceFileName =
      `priceLists/${supplierName}/` +
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
        let supplierCodeRegex = /[\w|\d]{10}|(\w\d{7})\w+|\d{3,}\W\d+|[\w+|\d+|\\,|\\.|\w+|\d+]{6,}/
        return {
          barcode: rec["Υπόλοιπα ανά ΑΧ"],
          description: rec.__EMPTY,
          price: rec.__EMPTY_1,
          "supplier code": rec.__EMPTY ? rec.__EMPTY.split(" ").find(w => supplierCodeRegex.test(w)) : "",
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
  static facom(supplierFilePath, erpFilePath) {
    let erp = this.getJson(this.getWs(erpFilePath));
    const supplier = this.getJson(this.getWs(supplierFilePath));

    erp = erp.map((rec, index) => {
      if (index == 0) return {};
      let matchedSupplier = supplier.find((sup) => {
        let erpSupCode = rec["supplier code"];
        return sup.__EMPTY_2 === erpSupCode;
        // console.log('sup["ean code and barcode"]', sup["ean code and barcode"]);
        // console.log("rec.__EMPTY_4", rec.__EMPTY_4);
        // console.log(
        //   "rec.__EMPTY_4",
        //   rec.__EMPTY_4 === sup["ean code and barcode"]
        // );
        // return rec.__EMPTY_4 === sup["ean code and barcode"];
      });
      if (matchedSupplier) {
        return {
          "erp code": rec["erp code"],
          description: rec["erp description"],
          price: matchedSupplier.__EMPTY_3,
          "supplier code": matchedSupplier.__EMPTY_2,
          barcode: matchedSupplier.__EMPTY_1,
          intrastat: matchedSupplier.__EMPTY_5,
        };
      }
      return {};
    });
    erp = erp.filter((obj) => Object.keys(obj).length > 0);
    // console.log("Updating complete", erp);
    //creating a new ws from the result json
    const resultsWs = xlsx.utils.json_to_sheet(erp);

    console.log("reaching ");

    const resultsWb = xlsx.utils.book_new();
    // adding ws to wb
    xlsx.utils.book_append_sheet(resultsWb, resultsWs, "result");
    //new filenme
    const priceFileName =
      "priceLists/facom/" +
      `${new Date().toLocaleDateString().split("/").join("-")}-${Date.now()}` +
      ".xlsx";
    //writing the wb to file
    xlsx.writeFile(resultsWb, priceFileName);
    console.log("writing file complete");
    return priceFileName;
  }
}

module.exports = FileProcessor;
