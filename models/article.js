//define and initialize article model
'use strict';
const Sequelize = require('sequelize');
// require the moment npm package, to format & display dates
const moment = require('moment');

module.exports = (sequelize) => {
  class Article extends Sequelize.Model {
    // custom instance to display 'publishedAt' date
    // the publishedAt method can now be accessed in views
    publishedAt() {
      // store formatted date; set it to moment method. Pass the createdAt attribute...
      // ... as the value to format
      // format the timestamp using the moment library's format method
      const date = moment(this.createdAt).format('MMMM D, YYYY, h:mma');
      return date;
    }
    // custom instance to display short description
    shortDescription() {
      // variable to hold the short description
      // if it's longer than 200 chars, only use the first 200. Otherwise use it all
      const shortDesc = this.body.length > 200 ? this.body.substring(0, 200) + '...' : this.body;
      return shortDesc;
    }
  }
  Article.init({
    title: {
      type: Sequelize.STRING,
      // When title is invalid, the custom message "Title" is required will...
      // ... display to the user.
      validate: {
        notEmpty: {
          msg: '"Title" is required'
        }
      }
    },
    author: Sequelize.STRING,
    body: Sequelize.TEXT
  }, { sequelize });

  return Article;
};