var pages = {
  home: { content: "<h1>Home</h1><p>Welcome to my knowledge base.</p>" },
  reef: { content: "<h1>Reef</h1>" },
  australia: { content: "<h1>Australia</h1>" },
  fish: { content: "<h1>Fish</h1>" },
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
};

$(document).ready(function() {
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

  //$(".content p").on("click", function() {
  //  var $it = $(this);
  //  var text = $it.text();
  //  var $textarea = $("<textarea>").attr("val", text);
  //  $it.replaceWith($textarea);
  //  });
  $("#scraper").on("change", function() {
    $.get("/scrape/"+$(this).val(), function(data) {
      $(".imports .meta h2").text(data.title);
      $(".imports .meta p").text(data.url);
      $(".import.content").html(contentToHTML(data.content));
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
    onChange: function(value) {
      if (value === "") return;
      if (typeof pages[value] === "undefined") pages[value] = { content: "" };
      console.log(pages[value].content);
      $(".page.content").html(pages[value].content);
    }
  });
  $("#pager")[0].selectize.setValue("home");

});
