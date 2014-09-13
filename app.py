from bottle import route, run, static_file
from newspaper import Article

@route('/')
def root():
    return static_file("app.html", root="./static/")

@route('/assets/<filepath:path>')
def asset(filepath):
    return static_file(filepath, root="./static/")

@route('/scrape/<url:path>')
def scrape(url):
    a = Article(url, keep_article_html=True)
    a.download()
    a.parse()
    #a.nlp()

    return { 'url': url,
             'title': a.title,
             'content': a.text,
             'content_html': a.article_html }

@route('/hello')
def hello():
    return "Hello World!"

run(host='localhost', port=8080, debug=True)
