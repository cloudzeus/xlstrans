
`Frontend`
1. should get supplier file and supplier filename
2. send file and supplier name to /api/operation
3. display errors from backend if any
4. display products file to user if no errors occured

`backend`
    -if supplier is not found return an error { error : "supplier not found, make sure to use a correct spelling" }
    -if file format is different to supplier's format return { error :"invalid file format" }
    -if there's any error, unlink the uploaded file from the filesystem
    -if file format is valid. create an updated pricelist document, save it to db, create a xls, and return to user
`Filesystem`
    Supplier Files
    suppliers/--{supplierName}/date-filename.xls
    PriceFile
    prices/date.xls



`Models`
  Pricelist
    -supplierName:String
    -createdAt : String
    -items: [{erpCode :Number, description:String, qty:Number,supplierCode:Number}]


