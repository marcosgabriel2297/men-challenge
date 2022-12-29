import models from '../models';

const { Post } = models;

const create = (post) => Post.create(post);

const findAll = () => Post.find({}, { comments: 0 });

const findById = (id) => Post.findById(id);

const findByAuthor = (authorId) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  Post.find({ author: authorId }, { comments: 0 });

const addCommentToPost = (idPost, comment) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  Post.updateOne({ _id: idPost }, { $push: { comments: comment } });

const postService = {
  create,
  findAll,
  findById,
  findByAuthor,
  addCommentToPost,
};

export default postService;
