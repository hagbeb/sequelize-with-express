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
      // This forwards the error to the global error handler in app.js
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
  let article;
  try {
    article = await Article.create(req.body);
    res.redirect("/articles/" + article.id);
  } catch (error) {
    // If the error caught by catch is a SequelizeValidationError, re-render the...
    // ... articles/new view ("New Article" form), passing in the errors to display:
    if(error.name === "SequelizeValidationError") { // checking the error
      // use build() (NOT create() ) as we are not saving this version, due to error
      article = await Article.build(req.body);
      // Pass in the errors so we can display them
      res.render("articles/new", { article, errors: error.errors, title: "New Article" })
    } else {
      // throw other types of errors, which will be handled by the catch block...
      // ... in the asyncHandler function
      throw error; // error caught in the asyncHandler's catch block
    }  
  }
}));

/* Edit article form. */
router.get("/:id/edit", asyncHandler(async(req, res) => {
  // find article to update
  const article = await Article.findByPk(req.params.id);
  if (article) {
    // render article using edit view, pass the retrieved article
    res.render("articles/edit", { article, title: "Edit Article" });
  } else {
    // if article doesn't exist, send a 404 status to the client (VS Code terminal)
    res.sendStatus(404);
  }
}));

/* GET individual article. */
// this route gets an article from the db & displays it based on :id parameter
router.get("/:id", asyncHandler(async (req, res) => {
  // use Sequelize's findByPK method to find the article using id. 
  // For the id, use the param in the route
  const article = await Article.findByPk(req.params.id);
  if (article) {
  // render the article instance returned by findByPk. This will be available to the ...
  // ... view in views/articles/show.pug
  // below, the 'article' variable is shorthand for article: article. We can...
  // ...use this shorthand as the key & value have the same name
    res.render("articles/show", { article, title: article.title });
  } else {
    // if article doesn't exist, send a 404 status to the client (VS Code terminal)
    res.sendStatus(404);
  }
}));

/* Update an article. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let article;
  try {
    // find article
    article = await Article.findByPk(req.params.id);
    if(article) {
      // the update method is also asynchronous. Pass in object with key/values to update
      await article.update(req.body);
      // if article exists, redirect to article page
      res.redirect("/articles/" + article.id); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    // If the error caught by catch is a SequelizeValidationError, 
    if(error.name === "SequelizeValidationError") {
      // use build() (NOT create() ) as we are not saving this version, due to error
      article = await Article.build(req.body);
      article.id = req.params.id; // make sure correct article gets updated
      // pass in errors so we can display them
      res.render("articles/edit", { article, errors: error.errors, title: "Edit Article" })
    } else {
      // throw other types of errors, which will be handled by the catch block...
      // ... in the asyncHandler function
      throw error;
    }
  }
}));

  /*
  const article = await Article.findByPk(req.params.id);
  if (article) {
    await article.update(req.body);
    res.redirect("/articles/" + article.id);
  } else {
    res.sendStatus(404);
  }
}));
*/
/* Delete article form. */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  // use Sequelize's findByPK method to find the article using id. 
  // For the id, use the param in the route
  const article = await Article.findByPk(req.params.id);
  if (article) {
    // render delete view, pass in article retrieved for the view to use
    res.render("articles/delete", { article, title: "Delete Article" });
  } else {
    // if article doesn't exist, send a 404 status to the client (VS Code terminal)
    res.sendStatus(404);
  }
}));

/* Delete individual article. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  // use Sequelize's findByPK method to find the article using id. 
  // For the id, use the param in the route
  const article = await Article.findByPk(req.params.id);
  if (article) {
    // use the destroy() sequelize method to delete it. It is also async
    await article.destroy();
    res.redirect("/articles");
  } else {
    // if article doesn't exist, send a 404 status to the client (VS Code terminal)
    res.sendStatus(404);
  }
}));

module.exports = router;