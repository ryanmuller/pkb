var pages, imports, visited;

var storePages = function() {
  localStorage["pages"] = JSON.stringify(pages);
};

var convertLinks = function(text) {
  return text.replace(/\[\[([^\]#]+)(#([^\]]+))?\]\]/g, function(_, page, _, match) {
    if (typeof match !== "undefined") {
      return "["+match+"](/pages/"+page+"#"+titlefy(match)+")";
      //return "["+match+" ("+page+")](/pages/"+page+"#"+arrToHex(smaz.compress(match.substring(0,32)))+")";
    } else {
      return "["+page+"](/pages/"+page+")";
    }
  });
  return text.replace(/\[\[([^\]]+)\]\]/g, "[$1](/pages/$1)");
};

var nodeToHTML = function(node) {
  return marked(convertLinks(node));
};

var contentToHTML = function(content) {
  return nodeToHTML(content);
};

var contentToChunks = function(content) {
  return _.map(content.split("\n\n"), function(par) {
    return "<p>"+par+"</p>";
  }).join("");
};

var updateNode = function(text) {
  pages[currentPageName()].content = text;
  storePages();
  return text;
};

var insertNode = function(n, text) {
  var ps = pages[currentPageName()].content.split("\n\n");
  ps.splice(n, 0, text);
  pages[currentPageName()].content = ps.join("\n\n");
  storePages();
  return pages[currentPageName()].content;
};

var titlefy = function(title) {
  return title.toLowerCase().replace(/\W/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
};

var displayPage = function(name) {
  $("#page h1").text(_.capitalize(name.replace(/_/g, " ")));
  $("#page .content").html(contentToHTML(pages[name].content));
  $("#page #toc").html('<ul>'+_.map($("#page .content h2"), function(h2) {
    var $it = $(h2),
        title = $it.text(),
        id = titlefy(title);

    $it.attr("id", id);
    return '<li><a href="#'+id+'">'+title+'</a>';
  }).join('')+'</ul>');
};

var goToPage = function(name) {
  if (name === "") return;

  var page = name.split("#")[0],
      anchor = name.split("#")[1];

  if (page.match(/^search:/) !== null) {
    doSearch(page.replace(/^search:/, ""));
    return;
  } else {
    if (typeof pages[page] === "undefined") {
      pages[page] = { content: "Write *something* about "+name+"." };
      //doSearch(name.replace(/_/g, " "));
    }
    displayPage(page);
    location.href = "#"+anchor;
    history.pushState({}, "", "/page/"+name);
    updateVisited(page);
  }
};

var goToPageByPath = function(path) {
  goToPage(_.last(path.split("/")));
};


var doSearch = function(term) {
  var pagesRes = _.map(_.filter(_.pairs(pages), function(name_page) {
    return name_page[0].indexOf(":") === -1 && name_page[1].content.indexOf(term) !== -1;
  }), function(name_page) {
    var name = name_page[0],
        page = name_page[1],
        pageRes = _.map(_.filter($(page.content), function(el) {
          return $(el).text().indexOf(term) !== -1;
        }), function(el) {
          return "<p>" + $(el).html() + "</p>";
        });
    return "<h2>Results in <a href=\"/page/" + name + "\">" + name + "</a>:</h2>" + pageRes;
  }).join("");

  var importsRes = _.map(_.filter(imports, function(imp) {
    return imp.title.indexOf(term) !== -1 || imp.extract.indexOf(term) !== -1;
  }), function(imp) {
    return "<h2>Results from <a href=\"" + imp.source + "\">" + imp.title + "</a>:</h2>" + imp.extract;
  }).join("");

  var res = pagesRes + importsRes;

  $("#cards").html(res);
};

var showLatest = function() {
  $("#latest").empty();
  _.each(_.first(_.uniq(visited), 5), function(name) {
    $link = $("<a>").attr("href", "/page/"+name).text(name);
    $("#latest").append($link);
  });
}

var updateVisited = function(name) {
  if (typeof localStorage["visited"] === "undefined") {
    visited = [];
  } else {
    visited = JSON.parse(localStorage["visited"]);
  }
  visited.unshift(name);
  localStorage["visited"] = JSON.stringify(visited);
  showLatest();
}

var pageOptions = function() {
  return _.map(Object.keys(pages), function(pageName) {
    return { text: pageName, id: pageName };
  });
};

var currentPageName = function() {
  return _.last(location.pathname.split("/")).split("#")[0];
};

var loadFromLocalStorage = function() {
  if (typeof localStorage["pages"] === "undefined") {
    pages = {
      home: { content: "Welcome to my `personal knowledge base`." },
      reef: { content: "A reef is a rock, sandbar, or other feature lying beneath the surface of the water (80 meters or less beneath low water)." },
      australia: { content: "Australia, officially the Commonwealth of Australia, is a country comprising the mainland of the Australian continent, the island of Tasmania, and numerous smaller islands. It is the world's sixth-largest country by total area. Neighbouring countries include Indonesia, East Timor and Papua New Guinea to the north; the Solomon Islands and Vanuatu to the north-east; and New Zealand to the south-east." },
      fish: { content: "A fish is any member of a paraphyletic group of organisms that consist of all gill-bearing aquatic craniate animals that lack limbs with digits." }
    };
  } else {
    pages = JSON.parse(localStorage["pages"]);
  }

  if (typeof localStorage["imports"] === "undefined") {
    imports = [];
  } else {
    imports = JSON.parse(localStorage["imports"]);
  }
};

function getQueryParams() {
  var query = location.search.substr(1);
  var result = {};
  _.each(query.split("&"), function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

var handleImports = function() {
  if (location.pathname.split("/")[1] !== "import") return;
  var params = getQueryParams(),
      source = params["source"],
      title = params["title"],
      pages = params["pages"].split(/\W/),
      extract = params["extract"];
  imports.unshift({
    title: title,
    source: source,
    extract: extract
  });

  localStorage["imports"] = JSON.stringify(imports);

  _.each(pages, function(page) {
    // TODO add to selected pages
  });
};

var showImports = function() {
  $("#cards .content").empty();
  $("#cards > h1").text("Recent imports");
  _.each(imports, function(imported) {
    $title = $("<h2>").text(imported.title);
    $extract = $("<p>").html(imported.extract);
    $source = $("<a>").attr("href",imported.source).text("Source");
    $("<div>").addClass("extract").append($title).append($extract).append($source).appendTo($("#cards .content"));
  });
};

$(document).ready(function() {
  loadFromLocalStorage();
  handleImports();

  $("#goImport").on("click", function() {
    $("#cards > h1").text("Import website");
    $("#cards .options").html('<input type="text" id="scraper" class="x100">');
    $("#cards .content").empty();
  });

  $("#goRecent").on("click", function() {
    $("#cards > h1").text("Recent imports");
    $("#cards .options").empty();
    $("#cards .content").empty();
    showImports();
  });
  $("#goRecent").click();

  $("#cards .content").sortable({
    forcePlaceholderSize: true,
    placeholder: "ui-state-highlight",
    connectWith: ".content",
    helper: function (e, li) {
      this.copyHelper = li.clone().insertAfter(li);
      $(this).data("copied", false);
      return li.clone();
    },
    stop: function () {
      var copied = $(this).data("copied");
      if (!copied) {
        this.copyHelper.remove();
      }
      this.copyHelper = null;
    }
  });

  $("#page .content").sortable({
    cancel: "*",
    receive: function (e, ui) {
      var text, title, href;
      ui.sender.data('copied', true);

      if ($("#cards > h1").text() === "Recent imports") {
        text = toMarkdown(ui.item.find("p").first().html());
        title = ui.item.find("h2").first().text();
        href = ui.item.find("a").last().attr("href");
      } else if ($("#cards > h1").text() === "Import website") {
        text = toMarkdown(ui.item.html());
        title = $("#cards > .content > h2").text();
        href = $("#cards > .options > input").val();
      }

      insertNode($("#page .content").children().index(ui.item),
                 "["+title+"]("+href+"): "+text);
      displayPage(currentPageName());
    }
  });

  $("#page").on("dblclick", ".content", function() {
    $(this).html(
      $("<textarea></textarea>")
      .css({ height: "100%", width: "100%" })
      .focus()
      .val(pages[currentPageName()].content));
  });

  $("#page").on("focusout", "textarea", function() {
    updateNode($(this).val());
    displayPage(currentPageName());
    //$(this).replaceWith(
    //  $("<div></div>")
    //  .addClass("content")
    //  .html(markdown.toHTML($(this).val())));
  });

  $(document).on("change", "#scraper", function() {
    $.get("/scrape/"+$(this).val(), function(data) {
      if ('content' in data) {
        $("#cards .content").html(contentToChunks(data.content));
        $("#cards .content").prepend($("<p>").append($("<img>").attr("src", data.image)));
        $("#cards .content").prepend($("<h2>").text(data.title));
      } else {
        $("#cards .content").empty();
        for (var i in data) {
          if (data.hasOwnProperty(i)) {
            var item = data[i];
            $("#cards .content").append("<p><a href=\""+item.link+"\">"+item.title+"</a>: "+item.description+"</p>");
          }
        }
      }
    });
  });

  if (window.location.pathname.split("/")[1] === "page") {
    goToPageByPath(window.location.pathname);
  } else {
    goToPage("home");
  }

  $(document).on("click", "a[href^='/']", function(e) {
    e.preventDefault();
    goToPageByPath($(this).attr("href"));
  });

  $("#searcher").select2({
    createSearchChoice: function(term, data) {
      return { id: term, text: "Create "+term };
    },
    data: function() { return { results: pageOptions() }}
  });

  $("#searcher").on("change", function() {
    var term = $(this).val().replace(/\s/g, "_");
    goToPage(term);
  });
});
