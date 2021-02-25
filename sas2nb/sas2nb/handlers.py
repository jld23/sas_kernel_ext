import json
from pathlib import Path
import tornado

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from .convertSAS2nb import convert, get_base_path

class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /sas2nb/convert endpoint!"
        }))

    @tornado.web.authenticated
    def post(self):
        """ post method """
        # input_data is a dictionary with a key "fname" and 'origin'
        input_data = self.get_json_body()
        base_path = get_base_path(input_data["origin"])
        if base_path is None:
            data = {"ERROR:": "Base path for server could not be found"}
            self.finish(json.dumps(data))

        new_file = convert(Path(base_path) / input_data["fpath"])
        data = {"converting": "{0} has been converted from {0} to {1}.".format(
            input_data["fpath"], new_file)}
        # data = input_data
        # data['base_path'] = base_path
        # data['new_file'] = new_file

        self.finish(json.dumps(data))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "sas2nb", "convert")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
