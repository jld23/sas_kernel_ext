import json
import os.path as osp

from .handlers import setup_handlers
from ._version import __version__

HERE = osp.abspath(osp.dirname(__file__))

with open(osp.join(HERE, 'labextension', 'package.json')) as fid:
    data = json.load(fid)


def _jupyter_labextension_paths():
    return [{
        'src': 'labextension',
        'dest': data['name']
    }]


def _jupyter_server_extension_paths():
    return [{"module": "jlab_sas_2_nb"}]


def load_jupyter_server_extension(lab_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.
    Parameters
    ----------
    lab_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    url_path = "jlab-sas-2-nb"
    setup_handlers(lab_app.web_app, url_path)
    lab_app.log.info(
        "Registered jlab_sas_2_nb extension at URL path /{}".format(
            url_path)
    )
