var pages, imports, visited;

var goToPageByPath = function(path) {
  goToPage(_.last(path.split("/")));
}

var goToPage = function(name) {
  if (name === "") return;
  if (typeof pages[name] === "undefined") pages[name] = { content: "" };
  $(".pages h1").text(_.capitalize(name));
  $(".page.content").html(pages[name].content);
  history.pushState({}, "", "/page/"+name);
  updateVisited(name);
};

var showLatest = function() {
  $("#latest").empty();
  _.each(_.last(_.uniq(visited), 5), function(name) {
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

var contentToHTML = function(content) {
  return _.map(content.split("\n\n"), function(par) {
    return "<p>"+par+"</p>";
  }).join("");
};

var updatePage = function(name) {
  var currentPageName = _.last(location.pathname.split("/"))
  pages[currentPageName].content = $(".page.content").html();
  localStorage["pages"] = JSON.stringify(pages);
};

var loadFromLocalStorage = function() {
  if (typeof localStorage["pages"] === "undefined") {
    pages = {
      home: { content: "<p>Welcome to my knowledge base.</p>" },
      reef: { content: "<p>A reef is a rock, sandbar, or other feature lying beneath the surface of the water (80 meters or less beneath low water).</p>" },
      australia: { content: "<p>Australia, officially the Commonwealth of Australia, is a country comprising the mainland of the Australian continent, the island of Tasmania, and numerous smaller islands. It is the world's sixth-largest country by total area. Neighbouring countries include Indonesia, East Timor and Papua New Guinea to the north; the Solomon Islands and Vanuatu to the north-east; and New Zealand to the south-east.</p>" },
      fish: { content: "<p>A fish is any member of a paraphyletic group of organisms that consist of all gill-bearing aquatic craniate animals that lack limbs with digits.</p>" }
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
    $title = $("<h1>").text(imported.title);
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
      if (ui.sender.parent().hasClass("recent")) {
        $inner_p = ui.item.find("p");
        ui.item.empty().append($inner_p);
      }
      ui.sender.data('copied', true);
      updatePage();
    },
    change: updatePage
  });

  $(".page.content").on("click", "> *", function() {
    var $it = $(this);
    var $textarea = $("<textarea>")
      .attr("rows", 12)
      .css({
        width: "100%"
      });

    $it.replaceWith($textarea);

    $textarea
      .focus()
      .val($it.html())
  });

  $(".page.content").on("blur", "textarea", function() {
    var $it = $(this);
    var $p = $("<p>").html($it.val())
    $it.replaceWith($p);
    updatePage();
  });

  $("#scraper").on("change", function() {
    $(".imports .meta h2").text("loading...");
    $.get("/scrape/"+$(this).val(), function(data) {
      $(".import.content").html(contentToHTML(data.content));
      $(".import.content").prepend($("<p>").append($("<img>").attr("src", data.image)));
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
      }
    },
    data: function() { return { results: pageOptions() }}
  });

  $("#searcher").on("change", function() {
    var term = $(this).val();

    if (term === "") return;
    if (term in pages) {
      goToPage(term);
      return;
    }

    var name = "search:"+term;
    var res = _.map(_.filter(_.pairs(pages), function(name_page) {
      return name_page[0].indexOf(":") === -1 && name_page[1].content.indexOf(term) !== -1;
    }), function(name_page) {
      var name = name_page[0],
          page = name_page[1],
          pageRes = _.map(_.filter($(page.content), function(el) {
            return $(el).text().indexOf(term) !== -1;
          }), function(el) {
            return "<p>" + $(el).html() + "</p>";
          });
      return "<p>Results in <a href=\"/page/" + name + "\">" + name + "</a>:</p>" + pageRes;
    }).join("");
    pages[name] = {};
    pages[name].content = res;
    $("section:not(.pages)").hide();
    $("section.results").show();
    $("section.results").html(res);
  });
});
