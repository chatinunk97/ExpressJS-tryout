const express = require("express");
const app = express();
const fsa = require("fs/promises");
const fs = require('fs')
const path = require("path");
require("dotenv").config();

const productsPath = path.resolve("resources", "products", "products.json");
const deletedPath = path.resolve("resources", "products", "deleted.json");



const readFile = async (path) => {
  return  fsa.readFile(path, "utf-8").then(JSON.parse);
};
const writeFile =  (path, data) => {
  return  fsa.writeFile(path, data);
};

// Use Query to get page and limit per page
app.get("/products", (req, res) => {
  const _page = +req.query._page || 1;
  const _limit = +req.query._limit || 10;

  const startIndex = (_page - 1) * _limit;
  const endIndex = startIndex + _limit;

  readFile(productsPath).then((rs) => res.send(rs.slice(startIndex, endIndex)));
});


// Use Query to get minimum and maximum pricce from user
app.get("/products/pricerange",(req,res)=>{
  const _low = +req.query._low || 0;
  const _high = +req.query._high || 100;
  readFile(productsPath).then((rs)=>res.send(JSON.stringify(rs.filter((i)=>i.price >= _low && i.price <= _high))))
  
})

//Delete Product by using ID and filter that out of the old one
app.delete("/products/:id", (req, res) => {
  const id = +req.params.id;
  readFile(productsPath).then((product) => {
    //Filter the target id out of the main Array
    writeFile(productsPath, JSON.stringify(product.filter((item) => item.id !== id),null,2));

    // Check whether the file exist or not
    if (!fs.existsSync(deletedPath)) {
      // If does not exist create a file with the Item already in the file
      writeFile(deletedPath, JSON.stringify(product.filter((item) => item.id === id),null,2));
    }
    else{
      readFile(deletedPath).then((deleted)=>{
        const newArr = [...deleted,...product.filter((item) => item.id === id)]
        console.log(newArr)
        writeFile(deletedPath, JSON.stringify(newArr,null,2));
      })
    }
  });
  res.send({msg : `Product Number ${id} has been deleted`})
});

const port = +process.env.PORT;
app.listen(port, () => {
  console.log("Server is Live on Port => ", port);
});
