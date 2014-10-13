[![Stories in Ready](https://badge.waffle.io/ryanmuller/pkb.png?label=ready&title=Ready)](https://waffle.io/ryanmuller/pkb)
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

### File storage version (experimental!!!)

An experimental branch of pkb can read from and write to a directory of
Markdown-formatted files as the data backend. Be very careful using this
branch because it is not well tested. NOTE: Currently only the first
block in a page saved at all!

1. In the pkb directory checkout the file storage branch: `git checkout file-storage`
2. Modify `DATA_PATH`, `PAGES_DIR`, and `PAGE_EXT` to match your system.
3. Make sure that you server process has permission to write to these
   files. For example, my files are writeable by the `_www` user, so I
   run the app as that user

   ```
   sudo -u _www python app.py 8080
   ```

   Make sure the static files are all readable too (since the owner may now
   be different):

   ```
   sudo chmod -R a+r static/
   ```

## Roadmap

**Flexible storage.** We use [content-addressable
storage](http://en.wikipedia.org/wiki/Content-addressable_storage) to
facilitate import to and distribution of your knowledge base.

**Ubquitous capture.** We provide web capture tools and support import
from other APIs and RSS feeds. We also define a standard format (similar
to Jekyll front-matter) to specify sources.

**Powerful sensemaking and organization.** We offer UI affordances and
automation tools that help with the process of organizing and making
sense of your information.

**Web and mobile publishing.** In addition to running a server on your
CAS, we allow export of static HTML to be easily uploaded to any host.

## Next steps

- "Decks" UX design
- File storage ([vault](https://github.com/greglook/vault/)?)
- Define specification for sourced information
- API & RSS import (Diigo, Instapaper)
- Visual design
- Convert client to React or Om (better code organization and faster
  rendering)
- Convert server to JVM (strong NLP libraries)
- Search indexing
- Page versioning
- Suggested content
- Static site export
