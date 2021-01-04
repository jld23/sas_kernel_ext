import os
import json
import tornado

from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join

class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post, 
    # patch, put, delete, options) to ensure only authorized user can request the 
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /jl-sas-to-nb/convert endpoint!"
        }))
    @tornado.web.authenticated
    def post(self):
        # input_data is a dictionnary with a key "name"
        input_data = self.get_json_body()
        new_file = convertSAS2nb.convert(name) 
        data = {"converting": "{0} has been converted from {0}.sas to {0}.ipynb".format(input_data["name"])}
        self.finish(json.dumps(data))
        //self.finish(new_file)


def setup_handlers(web_app): #, url_path):
    host_pattern = ".*$"
    
    base_url = web_app.settings["base_url"]
    #route_pattern = url_path_join(base_url, "jl-sas-to-nb", "get_example")
    route_pattern = url_path_join(base_url, "jl-sas-to-nb", "convert")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
