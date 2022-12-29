import errorCodes from '../../constants/errorCodes';
import postService from '../../services/postService';

const { POST_NOT_EXISTS } = errorCodes;

const findPostByKeyword = async (req, res, next) => {
  try {
    const posts = await postService.findByKeyword(req.params.keyword);
    if (!posts.length) {
      res.status(404).send({ message: POST_NOT_EXISTS });
      return next();
    }
    res.status(200).send(posts);
    return next();
  } catch (err) {
    return next(err);
  }
};

export default findPostByKeyword;
