var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");

// Configure the views directory and view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://ABI:05062005@cluster0.0ny3i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var ip = "127.0.0.1";
var port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// SCHEMA SETUP
var employeeSchema = new mongoose.Schema({
    username: String,
    password: String,
    applicant: String,
    email: String
});
var Employee = mongoose.model("Employee", employeeSchema);

var itemSchema = new mongoose.Schema({
    type: String,
    email: String,
    image: String,
    quantity: Number,
    price: String,
    info: String,
    sold: Boolean
});
var Item = mongoose.model("Item", itemSchema);

var paymentSchema = new mongoose.Schema({
    item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    },
    cardHolder: String,
    email: String,
    cardNo: String,
    created: { type: Date, default: Date.now }
});
var Payment = mongoose.model("Payment", paymentSchema);

// ROUTES
app.get("/", function(req, res) {
    res.render("base");
});

app.get("/employees/new", function(req, res) {
    res.render("login");
});

app.get("/myAccount/:id", function(req, res) {
    Employee.findById(req.params.id, function(err, employee) {
        if (err) {
            console.log(err);
        } else {
            if (employee.applicant == "Customer") {
                Item.find({}, function(err, items) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("customer", { employee: employee, items: items });
                    }
                });
            } else {
                Item.find({}, function(err, items) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("admin", { employee: employee, items: items });
                    }
                });
            }
        }
    });
});

app.post("/validate", function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var applicant = req.body.applicant;
    var flag = false;
    Employee.find({}, function(err, employees) {
        if (err) {
            console.log(err);
        } else {
            employees.forEach(function(employee) {
                if (employee.username == username && employee.password == password && employee.applicant == applicant) {
                    if (applicant == "Customer") {
                        Item.find({}, function(err, items) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.render("customer", { employee: employee, items: items });
                            }
                        });
                    } else {
                        Item.find({}, function(err, items) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.render("admin", { employee: employee, items: items });
                            }
                        });
                    }
                    flag = true;
                }
            });
            if (!flag) {
                var error_msg = "User Not Found";
                res.render("error", { error_msg: error_msg });
            }
        }
    });
});

app.get("/reg", function(req, res) {
    res.render("registration");
});

app.post("/employees", function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    var applicant = req.body.applicant;
    var email = req.body.email;
    var newEmployee = { username: username, password: password, applicant: applicant, email: email };
    var error_msg = "";
    var add = true;
    Employee.find({}, function(err, employees) {
        if (err) {
            console.log(err);
        } else {
            employees.forEach(function(employee) {
                if (employee.username == newEmployee.username) {
                    error_msg += "Username Already Exists.\n";
                    add = false;
                }
            });
        }
    });

    if (password == confirm_password && username.length >= 8 && password.length >= 8 && add && email.length >= 8) {
        Employee.create(newEmployee, function(err, newEmployee) {
            if (err) {
                console.log(err);
            }
        });
        res.redirect("/");
    } else {
        if (username.length < 8 || password.length < 8) error_msg += "Username/Password should contain at least 8 characters.\n";
        if (password != confirm_password) error_msg += "Password and Confirm-Password are not same.\n";
        res.render("error", { error_msg: error_msg });
    }
});

app.get("/mobiles/:id", function(req, res) {
    Item.find({}, function(err, items) {
        if (err) {
            console.log(err);
        } else {
            Employee.findById(req.params.id, function(err, employee) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("show_mobile", { employee: employee, items: items });
                }
            });
        }
    });
});

app.get("/laptops/:id", function(req, res) {
    Item.find({}, function(err, items) {
        if (err) {
            console.log(err);
        } else {
            Employee.findById(req.params.id, function(err, employee) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("show_laptop", { employee: employee, items: items });
                }
            });
        }
    });
});

app.get("/others/:id", function(req, res) {
    Item.find({}, function(err, items) {
        if (err) {
            console.log(err);
        } else {
            Employee.findById(req.params.id, function(err, employee) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("show_others", { employee: employee, items: items });
                }
            });
        }
    });
});

app.post("/items/:id", function(req, res) {
    var type = req.body.type;
    var email = req.body.email;
    var image = req.body.image;
    var quantity = req.body.quantity;
    var price = req.body.price;
    var info = req.body.info;
    var sold = false;
    var newItem = { type: type, email: email, image: image, quantity: quantity, price: price, info: info, sold: sold };
    Item.create(newItem, function(err, newItem) {
        if (err) {
            console.log(err);
        }
    });
    res.redirect("/items/new/" + req.params.id);
});

app.get("/myItems/:id", function(req, res) {
    Employee.findById(req.params.id, function(err, employee) {
        if (err) {
            console.log(err);
        } else {
            Item.find({}, function(err, items) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("item_list", { employee: employee, items: items });
                }
            });
        }
    });
});

app.post("/updateItem/:id", function(req, res) {
    Item.findByIdAndUpdate(req.params.id, req.body.item, function(err, item) {
        if (err) {
            console.log(err);
        } else {
            Employee.find({}, function(err, employees) {
                if (err) {
                    console.log(err);
                } else {
                    employees.forEach(function(employee) {
                        if (employee.email == item.email) {
                            res.redirect("/myItems/" + employee.id);
                        }
                    });
                }
            });
        }
    });
});

app.get("/payments", function(req, res) {
    Payment.find({}, function(err, payments) {
        if (err) {
            console.log(err);
        } else {
            res.render("show_payment", { payments: payments });
        }
    });
});

app.get("/payments/:id", function(req, res) {
    var id = req.params.id;
    var index = id.indexOf('_');
    var item_id = id.substring(0, index);
    var employee_id = id.substring(index + 1);

    var newPayment = { item_id: item_id, employee_id: employee_id };
    Payment.create(newPayment, function(err, newPayment) {
        if (err) {
            console.log(err);
        } else {
            Item.findByIdAndUpdate(item_id, { sold: true }, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("payment", { newPayment: newPayment });
                }
            });
        }
    });
});

app.post("/payments/:id", function(req, res) {
    var cardHolder = req.body.cardHolder;
    var email = req.body.email;
    var cardNo = req.body.cardNo;
    var id = req.params.id;
    Payment.findByIdAndUpdate(id, { cardHolder: cardHolder, email: email, cardNo: cardNo }, function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/payments");
        }
    });
});

app.get("/items/new/:id", function(req, res) {
    Employee.findById(req.params.id, function(err, employee) {
        if (err) {
            console.log(err);
        } else {
            res.render("new_item", { employee: employee });
        }
    });
});


app.listen(port, ip, function() {
    console.log("Server has started on " + ip + ":" + port);
});