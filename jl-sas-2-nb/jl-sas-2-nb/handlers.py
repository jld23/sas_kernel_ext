import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from .convertSAS2nb import sas2nb, convert, autoSplit
import tornado

class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /jl-sas-2-nb/convert endpoint!"
        }))
    @tornado.web.authenticated
    def post(self):
        # input_data is a dictionnary with a key "name"
        input_data = self.get_json_body()
        #new_file = convert(input_data["name"])
        data = {"converting": "{0} has been converted from {0}.sas to {0}.ipynb".format(input_data["name"])}
        self.finish(json.dumps(data))
        #self.finish(new_file)



def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "jl-sas-2-nb", "convert")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
