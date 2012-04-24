var Git = require("git-fs");
var express = require('express');

var app = express.createServer();
var port = 8080;

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
	    return (Date.parse(a.props.date)) - (Date.parse(b.props.date));
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

	Git.getHead(function(err, sha) {
		Git.readDir(sha, ".", function(err, results) {
            results.files.forEach(function onFile(filename) {
                Git.readFile(sha, filename, function(err, buffer) {
                    var text = buffer.toString();

                    var parsed = parseArticle(text);
                    parsed.id = filename;
                    articles.push(parsed);

                    if (articles.length == results.files.length) {
                       callback(processArticles(articles, id));
                    }
                });
            });
	    });
	});
}

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

app.configure("production", function(){
    port = 80;
});

Git("articles");

app.listen(port);
