const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailID, passWord } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not Valid");
  } else if (!validator.isEmail(emailID)) {
    throw new Error("Email ID is not Valid");
  } else if (!validator.isStrongPassword(passWord)) {
    throw new Error("Enter a Strong a password");
  }
};

const validateProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "about",
    "age",
    "gender",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field),
  );
  return isEditAllowed;
};


module.exports = {
  validateSignUpData,
  validateProfileData
};
