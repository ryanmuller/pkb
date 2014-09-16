function getHTMLOfSelection () {
  var range;
  if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    return range.htmlText;
  }
  else if (window.getSelection) {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      var clonedSelection = range.cloneContents();
      var div = document.createElement('div');
      div.appendChild(clonedSelection);
      return div.innerHTML;
    }
    else {
      return '';
    }
  }
  else {
    return '';
  }
}

var title = encodeURIComponent(document.title.substring(0,64)),
    pages = encodeURIComponent(prompt("Add to pages")),
    source = encodeURIComponent(location.href),
    extract = encodeURIComponent(getHTMLOfSelection());

location.href = "http://localhost:8080/import?title="+title+"&pages="+pages+"&source="+source+"&extract="+extract;
