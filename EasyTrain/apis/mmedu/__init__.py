from flask import Blueprint

mmedu_bp = Blueprint('mmedu', __name__,url_prefix='/mmedu')

from. import mmedu


