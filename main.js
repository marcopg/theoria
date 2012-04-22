var http = require("http");
var Git = require("git-fs");
var Url = require("url");

function parseHeaders(text) {
    var props = {};
    var match;

    while(match = text.match(/^([a-z]+):\s*(.*)\s*\n/i)) {
        props[match[1]] = match[2];
        text = text.substr(match[0].length);
    }
    
    return props;
}

function sortArticlesByDate(articles) {
	articles.sort(function(a, b) {
	    return (Date.parse(a.headers.date)) - (Date.parse(b.headers.date));
	});
}

function findArticleByName(articles, name) {
    var result = -1;

    articles.forEach(function(article, index) {
        if (article.name == name) {
            result = index;
        }
    });
    
    return result;
}

function fetchArticle(name, callback) {
    var articles = [];

	Git.getHead(function(err, sha) {
		Git.readDir(sha, ".", function(err, results) {
            results.files.forEach(function onFile(filename) {
                Git.readFile(sha, filename, function(err, buffer) {
                    var text = buffer.toString();
                    var headers = parseHeaders(text);
                    var date = Date.parse();
                    
                    articles.push({ name: filename,
                                    headers: headers,
                                    text: text });
                    
                    if (articles.length == results.files.length) {
                        sortArticlesByDate(articles);

                        var index = 0;
                        if (name) {
                            index = findArticleByName(articles, name);
                        }                        

                        var result = { text: articles[index].text };
                        
                        if (index > 0) {
                            result.previous = articles[index - 1].name;
                        }
                        
                        if (index < articles.length - 1) {
                            result.next = articles[index + 1].name;
                        }
                        
                        callback(result);
                    }
                });
            });
	    });
	});
}

http.createServer(function (req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});

    Git("/Users/marcopg/Development/blog");

    var url = Url.parse(req.url);
    var name = url.pathname.substring(1);
    fetchArticle(name, function(result) {
	    res.end(result.text);
    });
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');