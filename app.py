#!/usr/bin/env python
# -*- coding: utf-8 -*-
from sys import argv
import os
import os.path
import bottle
from bottle import route, static_file
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

@route('/')
def root():
    return static_file("app.html", root="./static/")

@route('/page/<name>')
def page(name):
    return static_file("app.html", root="./static/")

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

@route('/scrape/<url:path>')
def scrape(url):
    pdf_pattern = re.compile('\.pdf$')
    if pdf_pattern.search(url):
        return scrape_pdf(url)

    a = Article(url, keep_article_html=True)
    a.download()
    a.parse()

    return { 'url': url,
             'title': a.title,
             'image': a.top_image,
             'content': a.text,
             'content_html': a.article_html }

bottle.run(host='0.0.0.0', port=argv[1])
