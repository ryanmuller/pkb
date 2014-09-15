var pages = {};

// call this instead of goToPage..?
var setPage = function(name) {
  //$("#pager")[0].selectize.setValue(name);
};

var goToPage = function(name) {
  if (name === "") return;
  if (typeof pages[name] === "undefined") pages[name] = { content: "" };
  $(".page.content").html(pages[name].content);
  history.pushState({}, "", "/page/"+name);
};

var pageOptions = function() {
  return _.map(Object.keys(pages), function(pageName) {
    return { text: pageName, value: pageName };
  });
};

var contentToHTML = function(content) {
  return _.map(content.split("\n\n"), function(par) {
    return "<p>"+par+"</p>";
  }).join("");
};

var updatePage = function() {
  var currentPageName = $("#pager").val();
  pages[currentPageName].content = $(".page.content").html();
  localStorage["pages"] = JSON.stringify(pages);
};

var loadFromLocalStorage = function() {
  if (typeof localStorage["pages"] === "undefined") {
    pages = {
      home: { content: "<h1>Home</h1><p>Welcome to my knowledge base.</p>" },
      reef: { content: "<h1>Reef</h1>" },
      australia: { content: "<h1>Australia</h1>" },
      fish: { content: "<h1>Fish</h1>" }
    };
  } else {
    pages = JSON.parse(localStorage["pages"]);
  }
};

$(document).ready(function() {
  loadFromLocalStorage();

  $(".import.content").sortable({
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
      ui.sender.data('copied', true);
      updatePage();
    },
    change: updatePage
  });

  $(".page.content").on("click", "p", function() {
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
      $(".imports .meta h2").text(data.title);
      $(".imports .meta a").text(data.url).attr("href", data.url);
      $(".import.content").html(contentToHTML(data.content));
      $(".import.content").prepend($("<p>").append($("<img>").attr("src", data.image)));
    });
  });
  $("#scraper").val("http://en.wikipedia.org/wiki/Great_Barrier_Reef");
  $("#scraper").change();


  $("#pager").selectize({
    create: true,
    options: pageOptions(),
    load: function(query, callback) {
      callback(pageOptions());
    },
    onChange: goToPage
  });

  if (window.location.pathname.split("/")[1] === "page") {
    goToPage(window.location.pathname.split("/")[2]);
  } else {
    goToPage("home");
  }

  $("#searcher").on("change", function() {
    var term = $(this).val();
    if (term === "") return;
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
    goToPage(name);
  });
});
