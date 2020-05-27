import jwt from "jsonwebtoken";
import User from "../models/User";
import ResponseUtil from "../utils/responseUtil";

const responseUtil = new ResponseUtil();

const auth = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  jwt.verify(token, process.env.JWT_KEY, async (error, decoded) => {
    if (error) {
      if (error.name === "JsonWebTokenError") {
        responseUtil.setError(401, "Invalid authentication token!");
        return responseUtil.send(res);
      } else if (error.name === "TokenExpiredError") {
        responseUtil.setError(401, "Authentication token expired!");
        return responseUtil.send(res);
      }
    } else {
      const { _id, email } = decoded;
      const user = await User.findOne({ _id, email });
      if (!user) {
        responseUtil.setError(401, "Not authorized to access this resource!");
        return responseUtil.send(res);
      }
      req.user = user;
      req.token = token;
      next();
    }
  });
};

export default auth;
