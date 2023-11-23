from flask import Blueprint

basenn_bp = Blueprint('basenn', __name__,url_prefix='/basenn')

from. import basenn


