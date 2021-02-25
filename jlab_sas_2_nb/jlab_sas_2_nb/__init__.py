import json
from pathlib import Path

from .handlers import setup_handlers
from ._version import __version__

HERE = Path(__file__).parent.resolve()

with (HERE / "labextension" / "package.json").open() as fid:
    data = json.load(fid)


def _jupyter_labextension_paths():
    return [{'src': 'labextension', 'dest': data['name']}]


def _jupyter_server_extension_paths():
    return [{"module": "jlab_sas_2_nb"}]


def _load_jupyter_server_extension(server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.
    Parameters
    ----------
    server_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    setup_handlers(server_app.web_app)
    server_app.log.info("Registered jlab_sas_2_nb extension at URL path /jlab_sas_2_nb")

# For backward compatibility with the classical notebook
load_jupyter_server_extension = _load_jupyter_server_extension
