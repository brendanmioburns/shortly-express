Shortly.LinkView = Backbone.View.extend({
  className: 'link',

  template: Templates['link'],

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});

  // EXPECTED TO USE 'EJS' (?)
  // EXPECTED TO USE 'HANDLEBARS' (?)