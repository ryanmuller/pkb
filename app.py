#!/usr/bin/env python
# -*- coding: utf-8 -*-
from sys import argv
import os
import os.path
import glob
import bottle
from bottle import route, static_file, request
import requests
from lxml import etree
from newspaper import Article
import urllib2
import shutil
import hashlib
import StringIO
import re
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams

DATA_PATH = "/Users/ryanmuller/Sites/wiki/data"
PAGES_DIR = "pages"
PAGE_EXT = "txt"

@route('/')
def root():
    return static_file("app.html", root="./static/")

@route('/import')
def import_extract():
    return static_file("app.html", root="./static/")

@route('/page/<name>')
def page(name):
    return static_file("app.html", root="./static/")

@route('/data')
def data():
    pages = {}
    for filename in glob.glob(DATA_PATH+"/"+PAGES_DIR+"/*."+PAGE_EXT):
        with open(filename) as f:
            title = os.path.splitext(os.path.basename(filename))[0]
            pagedata = f.read()
            pages[title] = { 'content': [pagedata] }

    return pages

@route('/data/<name>', method='POST')
def write_page(name):
    with open(DATA_PATH+"/"+PAGES_DIR+"/"+name+"."+PAGE_EXT, 'w') as f:
        f.write(request.forms.get('content'))
    return "OK"

@route('/assets/<filepath:path>')
def asset(filepath):
    return static_file(filepath, root="./static/")

@route('/scrape-pdf/<url:path>')
def scrape_pdf(url):
    m = hashlib.md5()
    m.update(url)
    f = "./tmp/{fname}.pdf".format(fname=m.hexdigest())

    if not os.path.isfile(f):
        req = urllib2.urlopen(url)
        with open(f, 'wb') as fp:
            shutil.copyfileobj(req, fp)

    with open(f, 'rb') as fp:
        outfp = StringIO.StringIO()
        rsrcmgr = PDFResourceManager()
        interpreter = PDFPageInterpreter(rsrcmgr, TextConverter(rsrcmgr, outfp, codec="utf-8", laparams=LAParams()))
        for page in PDFPage.get_pages(fp):
            interpreter.process_page(page)
        out = outfp.getvalue()
        outfp.close()
        return { 'url': url,
                 'content': out }

@route('/scrape-rss/<url:path>')
def scrape_rss(url):
    r = requests.get(url)
    rss = etree.fromstring(r.content)
    items = [i for i in rss[0] if i.tag == 'item']
    return { i: { attr.tag: attr.text for attr in item } for i, item in enumerate(items) }

@route('/scrape/<url:path>')
def scrape(url):
    if re.search(r'\.pdf$', url) != None:
        return scrape_pdf(url)

    r = requests.head(url)

    if re.search(r'\bxml\b', r.headers['content-type']) != None:
        return scrape_rss(url)

    a = Article(url, keep_article_html=True)
    a.download()
    a.parse()

    return { 'url': url,
             'title': a.title,
             'image': a.top_image,
             'content': a.text,
             'content_html': a.article_html }


bottle.run(host='0.0.0.0', port=argv[1], server='gunicorn', workers=4, debug=True)
