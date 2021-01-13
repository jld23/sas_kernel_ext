
import json
from pathlib import Path
from .handlers import setup_handlers
from .convertSAS2nb import sas2nb, convert, autoSplit

from ._version import __version__

HERE = Path(__file__).parent.resolve()

with (HERE / "labextension" / "package.json").open() as fid:
    data = json.load(fid)

def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": data["name"]
    }]

def _jupyter_server_extension_points():
    return [{
        "module": "jl-sas-2-nb"
    }]

def _load_jupyter_server_extension(server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    lab_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    setup_handlers(server_app.web_app)
    server_app.log.info("Registered Convert sas2nb extension at URL path /jl-sas-2-nb")

