const UserModel = require("../models/store_admin");
const { body } = require('express-validator/check');
const Customer = require('../models/customer');

exports.validate = (method) => {
  switch (method) {
    case 'body': {
      return [
        body('name').isLength({ min: 3 }),
      ]
    }
  }
}

exports.create = async (req, res) => {

  const id = req.params.current_user;
  //get current user's id and add a new customer to it
  try {
    UserModel.findOne({ identifier }).catch(err => {  // find user with phone_number identifier
      res.send(err)
    })
        .then(user => {
          if(user.stores.length === 0){
            return res.status(403).json({
              message: "please add a store before adding customers"
            })
          }
          let store_name = req.body.store_name || req.params.store_name;
          let wantedStore = user.stores.find((store) => store.store_name === store_name); // find the necessary store form user.stores

          let customerToReg = { phone_number, email, name }; // customer to register
          let customerExists = wantedStore.customers.find((customer) => customer.phone_number == customerToReg.phone_number); //truthy if customer is registered

          if(!customerExists) { // if customer isn't registered
            wantedStore.customers.push(customerToReg); //push to user.stores
          } else {
            return res.status(409).json({
              sucess: false,
              message: "Customer already registered",
              data: {
                statusCode: 409,
              }
            })
          }

          user.save().then((result) => {

            res.status(201).json({
              success: true,
              message: "Customer registration successful",
              data: {
                statusCode: 201,
                customer: customerToReg
              }
            })
          })
        })
        .catch((error) => {
          req.status(500).json({
            error: error,
          });
        })
  }
  catch (error) {
    req.status(500).json({
      error: error,
    });
  }

  // res.status(201).json({
  //   status: true,
  //   message: "Customer was created",
  //   data: {
  //     statusCode: 201,
  //     customer: user
  //   },
  // });
};

exports.getById = (req, res) => {
  try {
    Customer.findById(req.params.customerId, (error, customer) => {
      if (error) {
        res.status(404).send({
          status: false,
          message: error.message,
          error: {
            code: 404,
            message: error.message
          }
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Customer was found",
          data: {
            customer
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      error: {
        code: 500,
        message: error.message
      }
    });
  }
};

exports.updateById = (req, res) => {
  const customerId = req.params.customerId;
  Customer.findByIdAndUpdate(customerId, req.body)
      .then((updatedCustomer) => {
        console.log(updatedCustomer);
        res.status(200).json({
          status: true,
          message: "Customer was updated",
          data: {
            customer: updatedCustomer,
          }
        })
      })
      .catch((error) => {
        res.status(500).json({
          status: false,
          message: error.message,
          error: {
            code: 500,
            message: error.message
          }
        });
      });
};

exports.deleteById = (req, res) => {
  try {
    Customer.findByIdAndDelete(req.params.customerId, (error, customer) => {
      if (error) {
        res.status(404).json({
          status: false,
          //message: error.message,
        });
      } else if (!customer) {
        res.status(404).json({
          status: false,
          message: "Customer not found",
          error: {
            code: 404,
            message: "Customer not found"
          }
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Customer was deleted",
          data: {
            customer: {
              id: customer._id,
              name: customer.name,
              phone: customer.phone_number,
            }
          },
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      error: {
        code: 500,
        message: error.message
      }
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    let customers = await Customer.find().select("-__v").sort({
      createdAt: -1,
    });
    if (!customers) {
      res.status(404).json({
        status: false,
        message: "Customers not found",
        error: {
          code: 404,
          message: "Customers not found"
        }
      });
    }

    res.status(200).json({
      status: true,
      message: "Customers",
      data: {
        customers: customers
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      error: {
        code: 500,
        message: error.message
      }
    });
  }
};
