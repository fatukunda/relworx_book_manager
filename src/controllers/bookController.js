import { dataUri } from "../middleware/multer";
import { uploader } from "../config/cloudinary";
import Book from "../models/Book";
import ResponseUtil from "../utils/responseUtil";
import User from "../models/User";

const responseUtil = new ResponseUtil();

export const createBook = async (req, res) => {
  const { user, body, file } = req;
  const loggedInUser = user;
  const bookData = body;
  const { title, isbn, author } = bookData;
  if (!title || !isbn || !author) {
    responseUtil.setError(400, "All fields are required");
    return responseUtil.send(res);
  }
  try {
    const book = new Book({ ...bookData, user: loggedInUser._id });
    await book.save();
    if (file) {
      const imageFile = dataUri(req).content;
      const result = await uploader.upload(imageFile);
      const bookUrl = result.url;
      book.image = bookUrl;
      await book.save();
    }
    loggedInUser.books.push(book._id);
    await loggedInUser.save();
    responseUtil.setSuccess(200, "Book recorded successfully!", book);
    return responseUtil.send(res);
  } catch (error) {
    responseUtil.setError(400, error.message);
    return responseUtil.send(res);
  }
};

export const imageUpload = async (req, res) => {
  const { id } = req.params;
  if (req.file) {
    const file = dataUri(req).content;
    try {
      const result = await uploader.upload(file);
      const bookUrl = result.url;
      const book = await Book.findOne({ _id: id });
      if (!book) {
        responseUtil.setError(400, "The book does not exist.");
        return responseUtil.send(res);
      }
      book.image = bookUrl;
      await book.save();
      responseUtil.setSuccess(200, "Image uploaded successfully!", {
        imageUrl: book.image,
      });
      return responseUtil.send(res);
    } catch (error) {
      responseUtil.setError(400, error);
      return responseUtil.send(res);
    }
  }
};

export const getAllUserBooks = async (req, res) => {
  const { user } = req;
  try {
    const userBooks = await User.findOne({ _id: user._id }).populate("books");
    // Convert the received data into an object and remove the properties that shouldn't come
    // with the response.
    const userBooksObject = userBooks.toObject();
    delete userBooksObject.firstName;
    delete userBooksObject.lastName;
    delete userBooksObject.email;
    delete userBooksObject.password;
    delete userBooksObject._id;
    responseUtil.setSuccess(200, "User books", userBooksObject);
    return responseUtil.send(res);
  } catch (error) {
    responseUtil.setError(400, error);
    return responseUtil.send(res);
  }
};

export const fetchSingleUserBook = async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  try {
    const book = await Book.findOne({ _id: id, user: user._id });
    if (!book) {
      responseUtil.setError(
        404,
        "Book doesn't exist or you're not authorized to access it."
      );
      return responseUtil.send(res);
    }
    responseUtil.setSuccess(200, "Book retrived successfully!", book);
    return responseUtil.send(res);
  } catch (error) {
    responseUtil.setError(400, error.message);
    return responseUtil.send(res);
  }
};

export const bookUpdate = async (req, res) => {
    
}
