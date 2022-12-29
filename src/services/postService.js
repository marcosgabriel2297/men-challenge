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

const findByKeyword = (keyword) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  Post.find({ $or: [{ title: `/${keyword}/i` }, { body: `/${keyword}/i` }] });

const postService = {
  create,
  findAll,
  findById,
  findByAuthor,
  addCommentToPost,
  findByKeyword,
};

export default postService;
