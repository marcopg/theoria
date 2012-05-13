var currentArticle;

function renderReferences(article) {
    var referencesDiv = document.getElementById("references");

    article.props.reference.forEach(function(referenceText) {
        var p = document.createElement("p");
        referencesDiv.appendChild(p);

        var textNode = document.createTextNode(referenceText);
        p.appendChild(textNode);
    });
}

function renderContent(text) {
    var content = document.getElementById("content");

    while (content.firstChild) {
        content.removeChild(content.firstChild);
    }

    paragraphs = text.split("\n\n");
    paragraphs.forEach(function(paragraphText) {
        var p = document.createElement("p");
        content.appendChild(p);

        var textNode = document.createTextNode(paragraphText);
        p.appendChild(textNode);
    });
}

function renderArticle(article) {
    document.title = article.props.title;

    var title = document.getElementById("title");
    var titleText = document.createTextNode(article.props.title);
    title.replaceChild(titleText, title.firstChild);

    renderContent(article.text);
    renderReferences(article);

    currentArticle = article.id;

    if (!window.location.hash) {
        window.location.hash = currentArticle;
    }
}

function fetchArticle() {
    var id = location.hash.substring(1);

    if (currentArticle == id) {
        return;
    }

    function onReadyStateChange() {
        if(this.readyState == this.DONE) {
            renderArticle(JSON.parse(this.responseText));
        }
    }

    var path = "article/";
    if (window.location.hash) {
        path += id;
    }

    var client = new XMLHttpRequest();
    client.onreadystatechange = onReadyStateChange;
    client.open("GET", path);
    client.send();
}

window.onhashchange = function() {
    fetchArticle();
}

window.onload = function() {
    fetchArticle();
}
