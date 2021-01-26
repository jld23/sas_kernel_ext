import json
import tornado
from pathlib import Path
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from convertSAS2nb import convert, get_base_path



class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /jlab_sas_2_nb/convert endpoint!"
        }))

    @tornado.web.authenticated
    def post(self):
        print("in post request")
        # input_data is a dictionnary with a key "origin" and "fpath"
        input_data = self.get_json_body()
        base_path = get_base_path(input_data["origin"])
        new_file, _ = convert(Path(base_path / input_data["fpath"]))
        data = {"converting": "{0} has been converted from {0}.sas to {1}.ipynb"
        .format(input_data["fpath"], new_file)}
        self.finish(json.dumps(data))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "jlab_sas_2_nb", "convert")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
