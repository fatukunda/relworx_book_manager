import User from "../models/User";
import ResponseUtil from "../utils/responseUtil";

const responseUtil = new ResponseUtil();

export const userRegistration = async (req, res) => {
  const userData = req.body;
  const { firstName, lastName, email, password } = userData;
  if (!firstName || !lastName || !email || !password) {
    responseUtil.setError(400, "All fields are required");
    return responseUtil.send(res);
  }
  const userExists = await User.isUserExist(email);
  if (userExists) {
    responseUtil.setError(400, "User with that email already exists!");
    return responseUtil.send(res);
  }
  const user = new User(userData);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    const responseData = { user, token };
    responseUtil.setSuccess(
      201,
      "User account created successfully!",
      responseData
    );
    return responseUtil.send(res);
  } catch (error) {
    responseUtil.setError(400, error.message);
    return responseUtil.send(res);
  }
};

export const userLogin = async (req, res) => {
  const userData = req.body;
  const { email, password } = userData;
  if (!email || !password) {
    responseUtil.setError(400, "Both email and password are required!");
    return responseUtil.send(res);
  }
  try {
    const user = await User.findByCredentials(email, password);
    if (user.error) {
      responseUtil.setError(401, user.error);
      return responseUtil.send(res);
    }
    const token = await user.generateAuthToken();
    const responseData = { user, token };
    responseUtil.setSuccess(200, "Logged in successfully!", responseData);
    return responseUtil.send(res);
  } catch (error) {
    responseUtil.setError(500, error.message);
    return responseUtil.send(res);
  }
};
