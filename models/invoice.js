// models/invoice.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvoiceSchema = new Schema({
    InvoiceID: String,
    Branch: String,
    City: String,
    Customertype: String,
    Productline: String,
    name: String,
    image: String,
    Unitprice: Number,
    Quantity: Number,
    Tax5: Number,
    Total: Number,
    Date: String,
    Time: String,
    Payment: String,
    cogs: Number,
    grossincome: Number,
    Rating: Number,
    
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
