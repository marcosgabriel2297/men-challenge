import postService from '../../services/postService';

const addComentToPost = async (req, res, next) => {
  const { author, content } = req.body;

  const { id } = req.params;

  try {
    await postService.addCommentToPost(id, {
      author,
      content,
    });

    res.status(200).send({ idPost: id, authorOfComment: author, content });
    return next();
  } catch (err) {
    return next(err);
  }
};

export default addComentToPost;
