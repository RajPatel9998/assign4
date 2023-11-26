var express  = require('express');
var mongoose = require('mongoose');
var app      = express();
var database = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
 
var port     = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json


mongoose.connect(database.url);

var Employee = require('./models/employee');
 
 
//get all employee data from db
app.get('/api/employees', function(req, res) {
    // use mongoose to get all todos in the database
    Employee.find()
        .then(employees => {
            // return all employees in JSON format
            res.json(employees);
        })
        .catch(err => {
            // if there is an error retrieving, send the error
            res.status(500).send(err);
        });
});

// get an employee with ID
app.get('/api/employees/:employee_id', function(req, res) {
    let id = req.params.employee_id;
    Employee.findById(id)
        .then(employee => {
            if (!employee) {
                return res.status(404).json({ message: 'Employee not found' });
            }
            res.json(employee);
        })
        .catch(err => {
            // if there is an error retrieving, send the error
            res.status(500).send(err);
        });
});

// create an employee and send back all employees after creation
app.post('/api/employees', function(req, res) {
    // create mongoose method to create a new record into the collection
    console.log(req.body);

    Employee.create({
        name: req.body.name,
        salary: req.body.salary,
        age: req.body.age
    })
    .then(employee => {
        // get and return all the employees after the newly created employee record
        return Employee.find();
    })
    .then(employees => {
        res.json(employees);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

app.put('/api/employees/:employee_id', async function(req, res) {
    try {
        // create mongoose method to update an existing record in the collection
        console.log(req.body);

        let id = req.params.employee_id;

        // Check if the required properties are present in the request body
        if (!req.body.name || !req.body.salary || !req.body.age) {
            return res.status(400).json({ error: 'Name, salary, and age are required fields.' });
        }

        var data = {
            name: req.body.name,
            salary: req.body.salary,
            age: req.body.age
        };

        console.log(req.body.name);
        console.log(req.body.salary);
        console.log(req.body);

        // Use async/await to handle the promise returned by findByIdAndUpdate
        const employee = await Employee.findByIdAndUpdate(id, data, { new: true });

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.send('Successfully! Employee updated - ' + employee.name);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



// delete an employee by id
app.delete('/api/employees/:employee_id', function(req, res) {
    console.log(req.params.employee_id);
    let id = req.params.employee_id;
    
    Employee.findByIdAndDelete(id)
        .then(employee => {
            if (!employee) {
                return res.status(404).json({ message: 'Employee not found' });
            }
            res.send('Successfully! Employee has been Deleted.');
        })
        .catch(err => {
            res.status(500).send(err);
        });
});


app.listen(port, () => {
    console.log("App listening on port: " + port);
});