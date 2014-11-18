[![Stories in Ready](https://badge.waffle.io/ryanmuller/pkb.png?label=ready&title=Ready)](https://waffle.io/ryanmuller/pkb)
# pkb

Our goal, simply stated, is a note system that levels off complexity through always-improving organization.

## Background

**Scientific collaboration.** How can we combine ideas whose complexities are beyond individual comprehension? Science is beginning to develop and apply systems for large-scale collaboration ([Reinventing Discovery](http://michaelnielsen.org/blog/reinventing-discovery/)). We're investigating how this plays out with the individual partipant grappling with the space of ideas. From our perspective, the classic notebook is still the basic metaphor for this task, but we can amplify its presentation, interactive capabilities, and collaboration. Work with the federated wiki (see [Mike Caufield](http://hapgood.us/2014/11/06/federated-education-new-directions-in-digital-collaboration/)) is one inspiration for this digital tool.

**Compressive file systems.** In his [Strange Loop 2014 talk](https://www.youtube.com/watch?v=lKXe3HUG2l4), Joe Armstrong described a *compressive file system* that would reduce the space taken by files with compressive similarity. An easy way to incorporate this principle is to use content-addressable storage for data that we store immutably, such as quote from websites.

For a "compressive note system", we can go further: 1) Compressive similarity can be extended from bytes to *concepts*. 2) Our notion of complexity is not measured in disk space but in *human computation*. For example, a note that is unintelligbly compressed to 50% that must be extracted and read in full is measured differently from one that is compressed to a half-length summary that I can scan instead of reading the full note. (The former has a compression of 0% and the latter ~50%.)

**Sensemaking.** Only an *organized* note system has a chance of leveling off in complexity. While organization can be described as a process leading to an elegant *external* representation of concepts and relations, *sensemaking* is the other side of the same coin: a process leading to an elegant *internal* representation of concepts and relations. One cannot form a valid external representation of concepts and relations with out having made sense of them except by luck. However, it is with an manipulable external representation that internalized is most likely to happen. (What do we take from this? Are we inspired by evolutionary processes or other optimization techniques?)

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

See [waffle.io/ryanmuller/pkb](https://waffle.io/ryanmuller/pkb)
