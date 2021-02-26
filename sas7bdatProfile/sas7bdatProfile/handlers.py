import json
import tornado
from pathlib import Path

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from .profile_sas7bdat import get_config, SAScfg_path, list_configs

class RouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({            
            "data": "This is /sas7bdatProfile/profile endpoint!",
            "SAScfg": SAScfg_path(),
            "current dir": str(Path('.').resolve()),
            "list_configs": list_configs(),
            "saspy_configs": get_config()

        }))

def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "sas7bdatProfile", "profile")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
