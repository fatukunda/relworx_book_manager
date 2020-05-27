import validate from "mongoose-validator";

export const nameValidator = [
  validate({
    validator: "isAlpha",
    passIfEmpty: false,
    message: "First and Last names should contain only letters",
  }),
];

export const emailValidator = [
  validate({
    validator: "isEmail",
    message: "Invalid Email format",
  }),
];
