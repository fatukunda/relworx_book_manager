import { dataUri } from "../middleware/multer";
import { uploader } from "../config/cloudinary";
import Book from "../models/Book";
import ResponseUtil from "../utils/responseUtil";
import paginate from "express-paginate";

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
    const existingBook = await Book.findOne({ user: user._id, isbn });
    if (existingBook) {
      responseUtil.setError(400, "You already have a book with that ISBN!");
      return responseUtil.send(res);
    }
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
    const [results, itemCount] = await Promise.all([
      Book.find({ user: user._id })
        .limit(req.query.limit)
        .skip(req.skip)
        .lean()
        .exec(),
      Book.countDocuments({ user: user._id }),
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    responseUtil.setSuccess(200, "User books", {
      books: results,
      pageCount,
      itemCount,
      pages: paginate.getArrayPages(req)(100, pageCount, req.query.page),
    });
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
        "Book doesn't exist or you're not authorized to access it.",
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
  const { user, file } = req;
  const { id } = req.params;
  const newBookData = req.body;
  try {
    const book = await Book.findOne({ _id: id, user: user._id });
    if (!book) {
      responseUtil.setError(400, "Book to update was not found!");
      return responseUtil.send(res);
    }
    const acceptedOptions = ["title", "isbn", "author"];
    const receivedOptions = Object.keys(newBookData);
    const isUpdateOption = receivedOptions.every((option) =>
      acceptedOptions.includes(option)
    );
    if (!isUpdateOption) {
      responseUtil.setError(400, "Invalid update options");
      return responseUtil.send(res);
    }
    receivedOptions.forEach((option) => (book[option] = newBookData[option]));

    if (file) {
      const imageFile = dataUri(req).content;
      const result = await uploader.upload(imageFile);
      const bookUrl = result.url;
      book.image = bookUrl;
    }
    await book.save();
    responseUtil.setSuccess(200, "Book updated successfully", book);
    return responseUtil.send(res);
  } catch (error) {
    responseUtil.setError(400, error);
    return responseUtil.send(res);
  }
};

export const deleteBook = async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  try {
    const book = await Book.findOneAndDelete({ _id: id, user: user._id });
    if (!book) {
      responseUtil.setError(
        400,
        "Book not found or not authorized to access it",
      );
      return responseUtil.send(res);
    }
    responseUtil.setSuccess(200, "Book deleted Successfully!");
    responseUtil.send(res);
  } catch (error) {
    responseUtil.setError(400, error.message);
    responseUtil.send(res);
  }
};
