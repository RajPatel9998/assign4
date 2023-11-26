var express = require('express');
var mongoose = require('mongoose');
var exphbs = require('express-handlebars');
var moment = require('moment');
var bodyParser = require('body-parser');
var app = express();
var database = require('./config/database');

// Import the Invoice model
var Invoice = require('./models/invoice'); // Replace 'invoice' with the actual filename of your invoice model

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// Setup handlebars
// Assuming you're using express-handlebars
app.engine('hbs', exphbs.engine({ extname: '.hbs',   runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true},helpers: {
    formatDate: function (date) {
        return moment(date).format('YYYY-MM-DD');
    }
} }));

app.set('view engine', 'hbs');

mongoose.connect(database.url);

var Employee = require('./models/employee');

// Show all invoice-info
app.get('/api/invoices', (req, res) => {
    Invoice.find()
        .then(invoices => res.json(invoices))
        .catch(err => res.status(500).send(err));
});


// Show a specific invoice based on the _id or InvoiceID
app.get('/api/invoices/:invoice_id', (req, res) => {
    const id = req.params.invoice_id;
    Invoice.findOne({ $or: [{ _id: id }, { InvoiceID: id }] })
        .then(invoice => {
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            res.json(invoice);
        })
        .catch(err => res.status(500).send(err));
});

// Insert a new invoice
app.post('/api/invoices', (req, res) => {
    const {
        InvoiceID,
        Branch,
        City,
        CustomerType,
        ProductLine,
        Name,
        Image,
        UnitPrice,
        Quantity,
        Tax5,
        Total,
        Date,
        Time,
        Payment,
        COGS,
        GrossIncome,
        Rating,
    } = req.body;

    console.log(req.body);
    Invoice.create({
        InvoiceID,
        Branch,
        City,
        CustomerType,
        ProductLine,
        Name,
        Image,
        UnitPrice,
        Quantity,
        Tax5,
        Total,
        Date,
        Time,
        Payment,
        COGS,
        GrossIncome,
        Rating,
    })
        .then(() => Invoice.find())
        .then(invoices => res.json(invoices))
        .catch(err => res.status(500).send(err));
});

app.put('/api/invoices/:invoice_id', async (req, res) => {
    try {
        const id = req.params.invoice_id;
        const { CustomerType, UnitPrice } = req.body;

        if (!CustomerType || !UnitPrice) {
            return res.status(400).json({ error: 'Customer type and unit price are required fields.' });
        }

        const data = {
            CustomerType,
            UnitPrice,
            Total: UnitPrice * (req.body.Quantity || 1),
        };

        const invoice = await Invoice.findByIdAndUpdate(id, data, { new: true });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoiceID = invoice.InvoiceID || 'Unknown Name';

        res.send('Successfully! Invoice updated - ' + invoiceID);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Delete an existing invoice based on the _id or InvoiceID
app.delete('/api/invoices/:invoice_id', (req, res) => {
    const id = req.params.invoice_id;

    Invoice.findOneAndDelete({ $or: [{ _id: id }, { InvoiceID: id }] })
        .then(invoice => {
            if (!invoice) {
                return res.status(404).json({ message: 'Invoice not found' });
            }
            res.send('Successfully! Invoice has been Deleted.');
        })
        .catch(err => res.status(500).send(err));
});

// Handlebars route to show all invoice-info
app.get('/invoices', (req, res) => {
    Invoice.find()
        .then(invoices => {
            res.render('invoices', { invoices: invoices });
        })
        .catch(err => res.status(500).send(err));
});

// Handlebars route to insert a new invoice
app.get('/invoices/new', (req, res) => {
    res.render('new-invoice');
});

app.post('/invoices', (req, res) => {
    const newInvoice = req.body;

    Invoice.create(newInvoice)
        .then(() => res.redirect('/invoices'))
        .catch(err => res.status(500).send(err));
});



app.get('/invoices/totalRevenue', async (req, res) => {
    try {
        const invoices = await Invoice.find();

        // Calculate statistics
        const totalRevenue = invoices.reduce((total, invoice) => {
            const invoiceTotal = parseFloat(invoice.Total);
            return isNaN(invoiceTotal) ? total : total + invoiceTotal;
        }, 0);

        const totalRating = invoices.reduce((total, invoice) => {
            const invoiceRating = parseFloat(invoice.Rating);
            return isNaN(invoiceRating) ? total : total + invoiceRating;
        }, 0);

        const averageRating = invoices.length > 0 ? totalRating / invoices.length : 0;

        res.render('invoices', { invoices, statistics: { totalRevenue, averageRating } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});




app.listen(port, () => {
    console.log("App listening on port: " + port);
});
