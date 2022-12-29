// import postService from '../../services/postService';

const addComentToPost = async (req, res, next) => {
  try {
    // const user = await postService.create(req.body);
    res.status(200).send('Todo ok!');
    return next();
  } catch (err) {
    return next(err);
  }
};

export default addComentToPost;
