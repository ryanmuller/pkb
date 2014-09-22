var pages, imports, visited;

var storePages = function() {
  localStorage["pages"] = JSON.stringify(pages);
};

var convertLinks = function(text) {
  return text.replace(/\[\[([^\]]+)\]\]/g, "[$1](/pages/$1)");
};

var nodeToHTML = function(node) {
  return "<div id="+md5(node)+">"+markdown.toHTML(convertLinks(node))+"</div>";
};

var contentToHTML = function(content) {
  return _.map(content, nodeToHTML).join("");
};

var contentToChunks = function(content) {
  return _.map(content.split("\n\n"), function(par) {
    return "<p>"+par+"</p>";
  }).join("");
};

var updateNthNode = function(n, text) {
  pages[currentPageName()].content[n] = text;
  storePages();
  return pages[currentPageName()].content[n];
};

var insertNode = function(n, text) {
  pages[currentPageName()].content.splice(n, 0, text);
  storePages();
  return pages[currentPageName()].content[n];
};

var displayPage = function(name) {
  $(".pages h1").text(_.capitalize(name.replace(/_/g, " ")));
  $(".page.content").html(contentToHTML(pages[name].content));
};

var goToPage = function(name) {
  if (name === "") return;

  if (name.match(/^search:/) !== null) {
    doSearch(name.replace(/^search:/, ""));
    return;
  } else {
    if (typeof pages[name] === "undefined") {
      pages[name] = { content: ["Write *something* about "+name+"."] };
      //doSearch(name.replace(/_/g, " "));
    }
    displayPage(name);
    history.pushState({}, "", "/page/"+name);
    updateVisited(name);
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

  $("section:not(.pages)").hide();
  $("section.results").show();
  $("section.results").html(res);
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
  return _.last(location.pathname.split("/"));
};

var loadFromLocalStorage = function() {
  if (typeof localStorage["pages"] === "undefined") {
    pages = {
      home: { content: [ "Welcome to my `personal knowledge base`." ] },
      reef: { content: [ "A reef is a rock, sandbar, or other feature lying beneath the surface of the water (80 meters or less beneath low water)." ] },
      australia: { content: [ "Australia, officially the Commonwealth of Australia, is a country comprising the mainland of the Australian continent, the island of Tasmania, and numerous smaller islands. It is the world's sixth-largest country by total area. Neighbouring countries include Indonesia, East Timor and Papua New Guinea to the north; the Solomon Islands and Vanuatu to the north-east; and New Zealand to the south-east." ] },
      fish: { content: [ "A fish is any member of a paraphyletic group of organisms that consist of all gill-bearing aquatic craniate animals that lack limbs with digits." ] }
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
  _.each(imports, function(imported) {
    $title = $("<h2>").text(imported.title);
    $extract = $("<p>").html(imported.extract);
    $source = $("<a>").attr("href",imported.source).text("Source");
    $("<div>").addClass("extract").append($title).append($extract).append($source).appendTo($(".recent .content"));
  });
};

$(document).ready(function() {
  loadFromLocalStorage();
  handleImports();
  showImports();
  $("section:not(.pages,.recent)").hide();

  $("#goImport").on("click", function() {
    $("section:not(.pages)").hide();
    $(".imports").show();
  });

  $("#goRecent").on("click", function() {
    $("section:not(.pages)").hide();
    $(".recent").show();
  });

  $(".recent .content").sortable({
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

  $(".imports .content").sortable({
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

  $(".page.content").sortable({
    forcePlaceholderSize: true,
    placeholder: "ui-state-highlight",
    receive: function (e, ui) {
      var text, title, href;
      ui.sender.data('copied', true);
      if (ui.sender.parent().hasClass("recent")) {
        text = toMarkdown(ui.item.find("p").first().html());
        title = ui.item.find("h2").first().text();
        href = ui.item.find("a").last().attr("href");
      } else if (ui.sender.parent().hasClass("imports")) {
        text = toMarkdown(ui.item.html());
        title = ui.sender.parent().find("h2").first().text();
        href = ui.sender.parent().find("input").first().val();
      }
      insertNode($(".page.content").children().index(ui.item),
                 "["+title+"]("+href+"): "+text);
      displayPage(currentPageName());
    },
    update: function() {
      pages[currentPageName()].content = _.sortBy(pages[currentPageName()].content, function(page) {
        return _.map($(".page.content").children(), function($node) { return $node.id; }).indexOf(md5(page));
      });
      storePages();
      displayPage(currentPageName());
    }
  });

  $(".page.content").on("click", "div", function() {
    var $it = $(this);
    var $textarea = $("<textarea>")
      .attr("rows", 12)
      .css({
        width: "100%"
      });

    var pos = $(".page.content").children().index($it),
        text = pages[currentPageName()].content[pos];

    $it.replaceWith($textarea);

    $textarea
      .focus()
      .val(text);
  });

  $(".page.content").on("blur", "textarea", function() {
    var $it = $(this),
        text = $it.val();
    updateNthNode($(".page.content").children().index($it), text);
    displayPage(currentPageName());
  });

  $("#scraper").on("change", function() {
    $(".imports .meta h2").text("loading...");
    $.get("/scrape/"+$(this).val(), function(data) {
      if ('content' in data) {
        $(".import.content").html(contentToChunks(data.content));
        $(".import.content").prepend($("<p>").append($("<img>").attr("src", data.image)));
        $(".import.content").prepend($("<h2>").text(data.title));
      } else {
        $(".import.content").empty();
        for (var i in data) {
          if (data.hasOwnProperty(i)) {
            var item = data[i];
            $(".import.content").append("<p><a href=\""+item.link+"\">"+item.title+"</a>: "+item.description+"</p>");
          }
        }
      }
    });
  });
  $("#scraper").val("http://en.wikipedia.org/wiki/Great_Barrier_Reef");
  $("#scraper").change();


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
      if ( $(data).filter( function() {
        return this.text.localeCompare(term)===0;
      }).length===0) {
        return {id:term, text:term};
      } else {
        return { id: "search:"+term, text: "search:"+term };
      }
    },
    data: function() { return { results: pageOptions() }}
  });

  $("#searcher").on("change", function() {
    var term = $(this).val().replace(/\s/g, "_");
    goToPage(term);
  });
});
