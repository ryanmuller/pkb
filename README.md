# pkb

your personal knowledge base on the web

## Usage

Check out the demo on [pkb.herokuapp.com](http://pkb.herokuapp.com). It
currently saves data to your browser's local storage.

To setup locally, `git clone https://github.com/ryanmuller/pkb.git` then
in the `pkb` directory:

1. Install requirements: `pip install -r requirements.txt`
2. Run the server: `python app.py 8080`
3. Navigate to http://localhost:8080

## Roadmap

**Flexible storage.** By default, we store in flat files with a metadata
format similar to Jekyll's [front
matter](http://jekyllrb.com/docs/frontmatter/). This allows easy
individual setup, cross-product syncing, and flexible file editing.
Eventually we may want to allow database storage for cloud hosting.

**Modular UI components.** Our approach (inspired by [Smallest Federated
Wiki](https://github.com/WardCunningham/Smallest-Federated-Wiki)) is to
interpret page data as a sequence of components. The most basic
component is an editable text block, while others could be interactive
widgets. Using a brand new type of component is as easy as downloading a
js file to your app and specifying the correct metadata.

**Replication over reference.** Unfortunately URLs and API formats are
unreliable. We favor locally replicating data whenever possible.
Combined with flat file storage, this allows full or partial pkbs to be
replicated regardless of platform or online connectivity.

**Ubiquitous import.** We provide a web and PDF scraping API for turning
any site on the web into a set of text block components. Scraping is
fast and captures media. Importing features are extensible, allowing end
users to write custom scrapers for structured data, such as Wikipedia
pages.

**Powerful collaboration.** Any pkb page can be copied with the web
scraping tools. But we enable stronger collaborate with other pkb
instances via identical replication of components. We can achieve this
either with an API or by adding data attributes to the DOM.

**Smart, eager assistance.** The interface creates opportunities for
searching, organizating, and forming connections by using natural
language intelligence and UI affordances. (Example: automatically
suggesting related pages and allowing components to be dragged into any
of them.)
