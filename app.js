var fs = require('fs');
var express = require('express');

function parseArticle(text) {
    var props = {};
    var match;

    while(match = text.match(/^([a-z]+):\s*(.*)\s*\n/i)) {
        props[match[1].toLowerCase()] = match[2];
        text = text.substr(match[0].length);
    }

    return { props: props,
             text: text };
}

function sortArticlesByDate(articles) {
	articles.sort(function(a, b) {
	    return Date.parse(a.props.date) - Date.parse(b.props.date);
	});
}

function findArticleById(articles, id) {
    var result = -1;

    articles.forEach(function(article, index) {
        if (article.id == id) {
            result = index;
        }
    });

    return result;
}

function processArticles(articles, id) {
    sortArticlesByDate(articles);

    var index = 0;
    if (id) {
        index = findArticleById(articles, id);
        if (index == -1) {
            return null;
        }
    }

    var article = articles[index];

    if (index > 0) {
        article.previous = articles[index - 1].id;
    }

    if (index < articles.length - 1) {
        article.next = articles[index + 1].id;
    }

    return article;
}

function fetchArticle(id, callback) {
    var articles = [];

	fs.readdir("articles", function(err, files) {
        files.forEach(function(filename) {
            fs.readFile("articles/" + filename, function(err, data) {
                var text = data.toString();

                var parsed = parseArticle(text);
                parsed.id = filename;
                articles.push(parsed);

                if (articles.length == files.length) {
                    callback(processArticles(articles, id));
                }
            });
        });
	});
}

var app = express.createServer();
var port = 8080;

app.get('/article/:id?', function(req, res) {
    fetchArticle(req.params.id, function(article) {
        if (article) {
    	    res.send(article);
    	} else {
    	    res.send("Invalid article", 404);
    	}
    });
});

app.configure(function(){
    app.use(express.static(__dirname + '/public'));
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
