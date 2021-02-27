import json
from pathlib import Path
import tornado


from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

import saspy


from .profile_sas7bdat import get_config
from .profile_sas7bdat import get_base_path
from .profile_sas7bdat import SAScfg_path
from .profile_sas7bdat import list_configs
from .profile_sas7bdat import local_cfg
from .profile_sas7bdat import get_config_stdio


class RouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /sas7bdatProfile/profile endpoint!",
            "SAScfg": SAScfg_path(),
            "current_dir": str(Path('.').resolve()),
            "list_configs": list_configs(),
            "local_config": local_cfg(),
            "saspy_configs": get_config()

        }))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        # self.finish(json.dumps(input_data))
        # print(input_data)
        if input_data['local_config']:
            _sas = saspy.SASsession(cfgfile=Path(input_data['current_dir']) / "sascfg_personal.py", cfgname=input_data['cfgname'])
        else:
            _sas = saspy.SASsession(cfgname=input_data['cfgname'])
        base_path = get_base_path(input_data['origin'])
        full_path = Path(base_path) / input_data["fpath"]
        # If local
        if input_data['cfgname'] in set(get_config_stdio()):
            _sas.saslib('_temp', path=str(full_path.parent))
            _data = _sas.sasdata(full_path.stem, libref='_temp')
        # if remote
        else:
            _sas.upload(full_path, str(Path(_sas.workpath) / full_path.name))
            _data = _sas.sasdata(full_path.stem, libref='WORK')
        self.finish(json.dumps({
            'columnInfo': _data.columnInfo().to_json(),
            'info': _data.info().to_json(),
            'describe': _data.describe().to_json(),
            'head': _data.head().to_json()
        }))

def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "sas7bdatProfile", "profile")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
