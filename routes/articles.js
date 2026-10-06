const express = require('express');
const router = express.Router();
// include article model. This requires the index file of the models folder
// We can access each model that we define via a property that gets imported from
// ...the code in the models index.js file.
const Article = require('../models').Article;

/* Handler function to wrap each route. */
// this is a wrapper so we don't need try/catch blocks on each route
// Sequelize is promise-based, so we make async calls to the database
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET articles list. */
router.get('/', asyncHandler(async (req, res) => {
  // use Sequelize's findAll method as we want to display a list of all articles
  // save all instances of 'Article' table to 'articles'
  const articles = await Article.findAll({
    // use findAll's options object to specify we want descending order
    // The order value is an array of arrays because you can order by multiple...
    // ...attributes or columns. Each array includes the attribute you want to ...
    // ...order by and in which order, ascending or descending.
    // We use the attributes created at & updated at, which Sequelize creates for...
    // ..each record automatically
    order: [["createdAt", "DESC"]]
  });
  res.render("articles/index", { articles, title: "Sequelize-It!" });
}));

/* Create a new article form. */
router.get('/new', (req, res) => {
  res.render("articles/new", { article: {}, title: "New Article" });
});

/* POST create article. */
// the requests (req) body property returns an object containing the key/value pairs...
// ...of the data submitted in the request body ie the form data...
// ... As this maps to the article models fields, pass this into create()
router.post('/', asyncHandler(async (req, res) => {
  const article = await Article.create(req.body);
  // redirect to the article, using it's database id property
  res.redirect("/articles/" + article.id);
}));

/* Edit article form. */
router.get("/:id/edit", asyncHandler(async(req, res) => {
  res.render("articles/edit", { article: {}, title: "Edit Article" });
}));

/* GET individual article. */
// this route gets an article from the db & displays it based on :id parameter
router.get("/:id", asyncHandler(async (req, res) => {
  // use Sequelize's findByPK method to find the article using id. 
  // For the id, use the param in the route
  const article = await Article.findByPk(req.params.id);
  // render the article instance returned by findByPk. This will be available to the ...
  // ... view in views/articles/show.pug
  // below, the 'article' variable is shorthand for article: article. We can...
  // ...use this shorthand as the key & value have the same name
  res.render("articles/show", { article, title: article.title }); 
}));

/* Update an article. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  res.redirect("/articles/");
}));

/* Delete article form. */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  res.render("articles/delete", { article: {}, title: "Delete Article" });
}));

/* Delete individual article. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  res.redirect("/articles");
}));

module.exports = router;