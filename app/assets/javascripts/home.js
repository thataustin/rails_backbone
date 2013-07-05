$(function() {
    var Post = Backbone.Model.extend({
        initialize: function() {
            this.bind('invalid', function(model, error) {
                $('.error').html(error).slideDown(600);
            });
            this.bind('change', function () {
                $('.success').html("Post saved!").slideDown(600).delay(3000).slideUp();
            });
        },
        validate: function (attr) {
            if(!attr.name) {
                return "Must enter a Name";
            } else if (!attr.title) {
                return "Must enter a title";
            } else if (!attr.content) {
                return "Must enter some content";
            } else if (attr.content.length < 6) {
                return "Content must be more than 6 characters";
            } else {
                $('.error').slideUp(600);
                return false;
            }
            return false;
        }
    });

    var PostList = Backbone.Collection.extend({
        model: Post,
        url: '/posts'
    });

    var Posts = new PostList;

    var PostView = Backbone.View.extend({
        tagname: 'div',
        template: _.template($('#post-template').html()),
        events: {
            'dblclick [contenteditable="false"]' : 'edit',
            'click button.destroy' : 'clear',
            'keypress [contenteditable]' : 'updateOnEnter',
            'blur [contenteditable="true"]' : 'close'
        },
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove); // remove is provided by backbone
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.input = this.$('.name');
            return this;
        },
        edit: function() {
            this.$('[contenteditable]').attr('contenteditable', 'true');
        },
        close: function() {
            var data = {
                name: this.$('.name').html(),
                title: this.$('.title').html(),
                content: this.$('.content').html() 
            };
            if (!data.name || !data.title || !data.content) {
                this.clear();
            } else {
                this.model.save(data);
                this.$('[contenteditable]').attr('contenteditable', 'false');
            }
        },
        updateOnEnter: function(e) {
            if(e.keyCode ==13) this.close();
        },
        clear: function() {
            this.model.destroy();
        }
    });

    var AppView = Backbone.View.extend({
        el: $('#postapp'),
        events: {
            'keypress #new-content' : "createOnEnter"
        },
        initialize: function () {
            this.listenTo(Posts, 'add', this.addOne);
            this.listenTo(Posts, 'reset', this.addAll);
            this.listenTo(Posts, 'all', this.render);

            Posts.fetch();
        },
        addOne: function(post) {
            var view = new PostView({model: post});
            this.$('#post-list').append(view.render().el);
        },
        addAll: function () {
            Posts.each(this.addOne, this);
        },
        createOnEnter: function(e) {
            if(e.keyCode == '13') { 
                var data = {
                    name: this.$('#new-name').val(),
                    title: this.$('#new-title').val(),
                    content: this.$('#new-content').val()
                };
                var newModel = Posts.create(data, {wait: true});
                if(!newModel.validationError) {
                    this.$('#new-name').val('');
                    this.$('#new-title').val('');
                    this.$('#new-content').val('');
                }
            }
        }
    });

    var App = new AppView;
});
