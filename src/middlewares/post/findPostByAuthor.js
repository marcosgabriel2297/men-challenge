import errorCodes from '../../constants/errorCodes';
import postService from '../../services/postService';

const { POST_AUTHOR_NOT_FOUND } = errorCodes;

const findPostByAuthor = async (req, res, next) => {
  try {
    const posts = await postService.findByAuthor(req.params.author);
    if (!posts) {
      res.status(404).send({ message: POST_AUTHOR_NOT_FOUND });
      return next();
    }
    res.status(200).send(posts);
    return next();
  } catch (err) {
    return next(err);
  }
};

export default findPostByAuthor;
